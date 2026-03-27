import React, { useRef, useEffect } from 'react';

// Desktop: 7-layer deep network. Mobile: 5-layer, simpler for performance.
const LAYER_SIZES_DESKTOP = [4, 7, 10, 12, 10, 7, 4];
const LAYER_SIZES_MOBILE  = [3, 5,  7,  5,  3];

// Brand colors as [R, G, B]
const CYAN   = [44, 255, 248];
const PURPLE = [167, 139, 250];

function lerp(a, b, t) { return a + (b - a) * t; }

export default function ParticleNeural({ className = '' }) {
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const speedRef    = useRef(1);
  const stateRef    = useRef(null);
  const visibleRef  = useRef(true);   // paused when scrolled off-screen
  const touchTimer  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Init / re-init (called on mount + resize) ─────────────────────────────
    function init() {
      const isMobile    = window.innerWidth < 768;
      const LAYER_SIZES = isMobile ? LAYER_SIZES_MOBILE : LAYER_SIZES_DESKTOP;
      const SIGNAL_COUNT = isMobile ? 15 : 50;
      // Cap DPR at 1 on mobile to halve pixel count
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nLayers = LAYER_SIZES.length;
      const padX = W * 0.08;
      const padY = H * 0.14;
      const usableW = W - 2 * padX;
      const usableH = H - 2 * padY;

      const layerStarts = LAYER_SIZES.map((_, i) =>
        LAYER_SIZES.slice(0, i).reduce((a, b) => a + b, 0)
      );

      const nodes = [];
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

      const connections = [];
      for (let l = 0; l < nLayers - 1; l++) {
        const sA = layerStarts[l], sB = layerStarts[l + 1];
        for (let a = 0; a < LAYER_SIZES[l]; a++)
          for (let b = 0; b < LAYER_SIZES[l + 1]; b++)
            connections.push({ from: sA + a, to: sB + b });
      }

      const fromMap = {};
      connections.forEach((c, ci) => {
        (fromMap[c.from] ??= []).push(ci);
      });

      const inputConns = connections
        .map((_, ci) => ci)
        .filter(ci => nodes[connections[ci].from].layer === 0);

      const signals = Array.from({ length: SIGNAL_COUNT }, () => ({
        ci   : inputConns[Math.floor(Math.random() * inputConns.length)],
        t    : Math.random(),
        speed: 0.004 + Math.random() * 0.007,
        color: Math.random() > 0.5 ? CYAN : PURPLE,
      }));

      stateRef.current = { W, H, nodes, connections, fromMap, inputConns, signals, nLayers, isMobile };
    }

    init();

    // ── Animation loop ────────────────────────────────────────────────────────
    let lastTime = 0;

    function frame(ts) {
      rafRef.current = requestAnimationFrame(frame);

      // Skip rendering entirely when canvas is off-screen
      if (!visibleRef.current) return;

      const dt    = Math.min((ts - lastTime) / 16, 3);
      lastTime    = ts;
      const sp    = speedRef.current * dt;
      const state = stateRef.current;
      if (!state) return;

      const { W, H, nodes, connections, fromMap, inputConns, signals, nLayers, isMobile } = state;

      // Trailing fade
      ctx.fillStyle = 'rgba(8,6,18,0.18)';
      ctx.fillRect(0, 0, W, H);

      // ── Connections ───────────────────────────────────────────────────────
      connections.forEach(({ from, to }) => {
        const a = nodes[from], b = nodes[to];
        const alpha = (a.act + b.act) * 0.06;
        if (alpha < 0.005) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // ── Node activations ─────────────────────────────────────────────────
      nodes.forEach(n => {
        n.act += (n.actTarget - n.act) * 0.025 * sp;
        if (Math.abs(n.actTarget - n.act) < 0.02) n.actTarget = 0.1 + Math.random() * 0.9;
      });

      // ── Signals ───────────────────────────────────────────────────────────
      signals.forEach(sig => {
        sig.t += sig.speed * sp;
        if (sig.t >= 1) {
          sig.t -= 1;
          const nextList = fromMap[connections[sig.ci].to];
          sig.ci = (nextList?.length > 0)
            ? nextList[Math.floor(Math.random() * nextList.length)]
            : inputConns[Math.floor(Math.random() * inputConns.length)];
          sig.speed = 0.004 + Math.random() * 0.007;
          sig.color = Math.random() > 0.5 ? CYAN : PURPLE;
        }

        const { from, to } = connections[sig.ci];
        const px = lerp(nodes[from].x, nodes[to].x, sig.t);
        const py = lerp(nodes[from].y, nodes[to].y, sig.t);
        const [r, g, b] = sig.color;
        const ca = 1 - Math.abs(sig.t * 2 - 1);

        // Outer glow — skipped on mobile (expensive radialGradient per signal)
        if (!isMobile) {
          const grd = ctx.createRadialGradient(px, py, 0, px, py, 9);
          grd.addColorStop(0, `rgba(${r},${g},${b},${ca * 0.55})`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${ca})`;
        ctx.beginPath();
        ctx.arc(px, py, isMobile ? 2 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Nodes ─────────────────────────────────────────────────────────────
      nodes.forEach(n => {
        const frac = n.layer / (nLayers - 1);
        const R    = Math.round(lerp(PURPLE[0], CYAN[0], frac));
        const G    = Math.round(lerp(PURPLE[1], CYAN[1], frac));
        const B    = Math.round(lerp(PURPLE[2], CYAN[2], frac));
        const sz   = 2.5 + n.act * 3;

        // Outer glow halo — skip on mobile
        if (!isMobile) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, sz * 6);
          grd.addColorStop(0, `rgba(${R},${G},${B},${n.act * 0.35})`);
          grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(n.x, n.y, sz * 6, 0, Math.PI * 2);
          ctx.fill();
        }

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

        // Bright centre — skip on mobile
        if (!isMobile) {
          ctx.fillStyle = `rgba(255,255,255,${n.act * 0.6})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, sz * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    rafRef.current = requestAnimationFrame(frame);

    // ── ResizeObserver (more accurate than window resize) ─────────────────────
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 120);
    });
    ro.observe(canvas);

    // ── IntersectionObserver — pause loop body when off-screen ───────────────
    const io = new IntersectionObserver(
      ([e]) => { visibleRef.current = e.isIntersecting; },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      clearTimeout(touchTimer.current);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', transform: 'translateZ(0)' }}
      onMouseEnter={() => { speedRef.current = 5; }}
      onMouseLeave={() => { speedRef.current = 1; }}
      onTouchStart={() => {
        speedRef.current = 3;
        clearTimeout(touchTimer.current);
        touchTimer.current = setTimeout(() => { speedRef.current = 1; }, 2000);
      }}
      onTouchEnd={() => {
        clearTimeout(touchTimer.current);
        touchTimer.current = setTimeout(() => { speedRef.current = 1; }, 500);
      }}
    />
  );
}
