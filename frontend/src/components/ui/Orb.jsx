import { useEffect, useRef } from "react";
import { Renderer, Program, Color, Mesh, Triangle } from "ogl";

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHue;
  uniform float uHoverIntensity;
  uniform float uRotateOnHover;
  uniform vec2 uHover;
  uniform vec2 uResolution;
  varying vec2 vUv;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(
      abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
      0.0, 1.0
    );
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  // Simplex-like 2D noise
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + K2;
    vec2 c2 = a - 1.0 + 2.0 * K2;
    vec3 h2 = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c2, c2)), 0.0);
    h2 = h2 * h2 * h2 * h2;
    vec3 n = h2 * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c2, hash(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5);
    float dist = length(uv - center);

    // Orb shape
    float orb = smoothstep(0.45, 0.0, dist);

    // Noise-based distortion
    float n = noise(uv * 3.0 + uTime * 0.15);
    float n2 = noise(uv * 5.0 - uTime * 0.2);

    // Hover effect
    float hover = length(uHover - uv) * uHoverIntensity;
    float rotateEffect = uRotateOnHover * (uHover.x - 0.5) * 0.3;

    // Hue shift with noise
    float hue = uHue / 360.0 + n * 0.08 + rotateEffect;
    float sat = 0.7 + n2 * 0.15;
    float lit = 0.45 + orb * 0.35 + hover * 0.1;

    vec3 color = hsl2rgb(vec3(hue, sat, lit));

    // Glow
    float glow = smoothstep(0.5, 0.0, dist) * 0.6;
    color += glow * hsl2rgb(vec3(hue + 0.05, 0.8, 0.6));

    // Edge fade
    float alpha = smoothstep(0.5, 0.15, dist);

    // Inner shimmer
    float shimmer = noise(uv * 8.0 + uTime * 0.3) * 0.1;
    color += shimmer * orb;

    gl_FragColor = vec4(color * alpha, alpha * orb);
  }
`;

export default function Orb({
  hue = 0,
  hoverIntensity = 0.3,
  rotateOnHover = true,
  forceHoverState = false,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uHue: { value: hue },
        uHoverIntensity: { value: hoverIntensity },
        uRotateOnHover: { value: rotateOnHover ? 1.0 : 0.0 },
        uHover: { value: [0.5, 0.5] },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    }
    resize();
    window.addEventListener("resize", resize);

    let hoverTarget = forceHoverState ? [0.5, 0.5] : [0.5, 0.5];

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      hoverTarget = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    }
    container.addEventListener("mousemove", onMouseMove);

    let animId;
    let startTime = performance.now();
    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      program.uniforms.uTime.value = elapsed;

      // Smooth lerp hover
      const cur = program.uniforms.uHover.value;
      cur[0] += (hoverTarget[0] - cur[0]) * 0.05;
      cur[1] += (hoverTarget[1] - cur[1]) * 0.05;

      renderer.render({ scene: mesh });
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMouseMove);
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}
