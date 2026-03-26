import React, { useRef, useEffect } from 'react';

// Neural network layer node counts (input → hidden → output shape)
const LAYER_SIZES = [4, 7, 10, 12, 10, 7, 4];
const SIGNAL_COUNT = 50;

// Brand colors as [R, G, B]
const CYAN   = [44, 255, 248];
const PURPLE = [167, 139, 250];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function ParticleNeural({ className = '' }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const speedRef  = useRef(1);      // 1 = normal, boosted on hover
  const stateRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Initialise / re-initialise (also called on resize) ────────────────────
    function init() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W   = canvas.offsetWidth;
      const H   = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);

      const nLayers = LAYER_SIZES.length;
      const padX = W * 0.10;
      const padY = H * 0.14;
      const usableW = W - 2 * padX;
      const usableH = H - 2 * padY;

      // Build nodes
      const nodes = [];
      const layerStarts = LAYER_SIZES.map((_, i) =>
        LAYER_SIZES.slice(0, i).reduce((a, b) => a + b, 0)
      );

      LAYER_SIZES.forEach((count, li) => {
        for (let j = 0; j < count; j++) {
          nodes.push({
            x        : padX + (li / (nLayers - 1)) * usableW,
            y        : padY + ((j + 0.5) / count) * usableH,
            layer    : li,
            act      : Math.random(),
            actTarget: Math.random(),
          });
        }
      });

      // Build connections (adjacent layers, fully connected)
      const connections = [];
      for (let l = 0; l < nLayers - 1; l++) {
        const startA = layerStarts[l];
        const startB = layerStarts[l + 1];
        for (let a = 0; a < LAYER_SIZES[l]; a++) {
          for (let b = 0; b < LAYER_SIZES[l + 1]; b++) {
            connections.push({ from: startA + a, to: startB + b });
          }
        }
      }

      // Build fromMap: nodeId → [connectionIndex, ...]
      const fromMap = {};
      connections.forEach((c, ci) => {
        if (!fromMap[c.from]) fromMap[c.from] = [];
        fromMap[c.from].push(ci);
      });

      // Input-layer connection indices (to restart signals)
      const inputConns = connections
        .map((_, ci) => ci)
        .filter(ci => nodes[connections[ci].from].layer === 0);

      // Signals
      const signals = Array.from({ length: SIGNAL_COUNT }, () => {
        const ci = inputConns[Math.floor(Math.random() * inputConns.length)];
        return {
          ci,
          t    : Math.random(),
          speed: 0.004 + Math.random() * 0.007,
          color: Math.random() > 0.5 ? CYAN : PURPLE,
        };
      });

      stateRef.current = { W, H, nodes, connections, fromMap, inputConns, signals };
    }

    init();

    // ── Animation frame ────────────────────────────────────────────────────────
    let lastTime = 0;

    function frame(time) {
      const dt    = Math.min((time - lastTime) / 16, 3);
      lastTime    = time;
      const sp    = speedRef.current * dt;
      const state = stateRef.current;
      if (!state) { rafRef.current = requestAnimationFrame(frame); return; }

      const { W, H, nodes, connections, fromMap, inputConns, signals } = state;

      // Trailing fade (dark, semi-transparent fill = motion blur effect)
      ctx.fillStyle = 'rgba(8,6,18,0.18)';
      ctx.fillRect(0, 0, W, H);

      // ── Update node activations ───────────────────────────────────────────
      nodes.forEach(n => {
        n.act += (n.actTarget - n.act) * 0.025 * sp;
        if (Math.abs(n.actTarget - n.act) < 0.02) n.actTarget = 0.1 + Math.random() * 0.9;
      });

      // ── Draw connections ──────────────────────────────────────────────────
      connections.forEach(({ from, to }) => {
        const a = nodes[from];
        const b = nodes[to];
        const alpha = (a.act + b.act) * 0.06;
        if (alpha < 0.005) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // ── Draw & advance signals ────────────────────────────────────────────
      signals.forEach(sig => {
        sig.t += sig.speed * sp;

        if (sig.t >= 1) {
          sig.t -= 1;
          const curConn  = connections[sig.ci];
          const nextList = fromMap[curConn.to];
          if (nextList && nextList.length > 0) {
            sig.ci = nextList[Math.floor(Math.random() * nextList.length)];
          } else {
            sig.ci = inputConns[Math.floor(Math.random() * inputConns.length)];
          }
          sig.speed = 0.004 + Math.random() * 0.007;
          sig.color = Math.random() > 0.5 ? CYAN : PURPLE;
        }

        const { from, to } = connections[sig.ci];
        const ax = nodes[from].x, ay = nodes[from].y;
        const bx = nodes[to].x,   by = nodes[to].y;
        const px = lerp(ax, bx, sig.t);
        const py = lerp(ay, by, sig.t);
        const [r, g, b] = sig.color;

        // Fade in & out along the connection
        const ca = 1 - Math.abs(sig.t * 2 - 1);

        // Outer glow
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 9);
        grd.addColorStop(0, `rgba(${r},${g},${b},${ca * 0.55})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${r},${g},${b},${ca})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Draw nodes ────────────────────────────────────────────────────────
      nodes.forEach(n => {
        const frac = n.layer / (LAYER_SIZES.length - 1);
        const R    = Math.round(lerp(PURPLE[0], CYAN[0], frac));
        const G    = Math.round(lerp(PURPLE[1], CYAN[1], frac));
        const B    = Math.round(lerp(PURPLE[2], CYAN[2], frac));
        const sz   = 2.5 + n.act * 3;

        // Outer glow halo
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, sz * 6);
        grd.addColorStop(0, `rgba(${R},${G},${B},${n.act * 0.35})`);
        grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, sz * 6, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, sz + 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${R},${G},${B},${n.act * 0.5 + 0.1})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Core
        ctx.fillStyle = `rgba(${R},${G},${B},${n.act * 0.85 + 0.15})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, sz, 0, Math.PI * 2);
        ctx.fill();

        // Bright centre
        ctx.fillStyle = `rgba(255,255,255,${n.act * 0.6})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, sz * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    // ── Resize handler ────────────────────────────────────────────────────────
    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
      onMouseEnter={() => { speedRef.current = 5; }}
      onMouseLeave={() => { speedRef.current = 1; }}
    />
  );
}
