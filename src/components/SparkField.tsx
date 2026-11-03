import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * WebGL spark field: ~2,000 embers drifting upward like heat. The cursor is a
 * heat source; nearby sparks brighten toward Flare and lift faster.
 * Rendered in clip space, so it costs one draw call and no scene graph.
 */

const vertex = /* glsl */ `
  attribute vec4 aSeed; // x: speed, y: phase, z: size, w: depth
  uniform float uTime;
  uniform float uAspect;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uHeatAmt;
  varying float vHeat;
  varying float vAlpha;

  void main() {
    float speed = aSeed.x;
    float phase = aSeed.y;
    float depth = aSeed.w;

    float y = mod(position.y + 1.1 + uTime * speed, 2.3) - 1.15;
    float x = position.x
      + sin(uTime * 0.45 + phase) * 0.018 * depth
      + sin(uTime * 0.11 + phase * 3.1) * 0.035;

    vec2 d = vec2((x - uMouse.x) * uAspect, y - uMouse.y);
    float dist = length(d);
    float heat = smoothstep(0.42, 0.0, dist) * uHeatAmt;

    // Heat lifts sparks and pushes them gently outward.
    y += heat * 0.09;
    x += sign(d.x) * heat * 0.025;

    vHeat = heat;
    float edge = smoothstep(-1.15, -0.7, y) * smoothstep(1.15, 0.55, y);
    float twinkle = 0.65 + 0.35 * sin(uTime * (1.5 + speed * 20.0) + phase * 7.0);
    vAlpha = edge * twinkle * (0.5 + depth * 0.8);

    gl_Position = vec4(x, y, 0.0, 1.0);
    gl_PointSize = aSeed.z * uPixelRatio * (0.6 + depth) * (1.0 + heat * 1.8);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uEmber;
  uniform vec3 uFlare;
  varying float vHeat;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float core = smoothstep(0.5, 0.0, r);
    core *= core;
    vec3 col = mix(uEmber, uFlare, clamp(vHeat * 1.4, 0.0, 1.0));
    col += vec3(1.0, 0.9, 0.75) * smoothstep(0.18, 0.0, r) * vHeat * 0.6;
    float a = core * vAlpha * (0.55 + vHeat * 0.9);
    if (a < 0.003) discard;
    gl_FragColor = vec4(col * a, a);
  }
`;

function Sparks({ count, pointer }: { count: number; pointer: React.MutableRefObject<PointerState> }) {
  const { gl, size } = useThree();
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 2.2 - 1.1;
      pos[i * 3 + 1] = Math.random() * 2.3 - 1.15;
      pos[i * 3 + 2] = 0;
      const depth = Math.pow(Math.random(), 2.2);
      seed[i * 4] = 0.02 + Math.random() * 0.05 + depth * 0.05; // speed
      seed[i * 4 + 1] = Math.random() * Math.PI * 2; // phase
      seed[i * 4 + 2] = 1.2 + Math.random() * 2.2; // size
      seed[i * 4 + 3] = depth;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uHeatAmt: { value: 0 },
      uEmber: { value: new THREE.Color('#FF5A1F') },
      uFlare: { value: new THREE.Color('#FFB547') },
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, dt) => {
    const u = uniforms;
    u.uTime.value += Math.min(dt, 0.05);
    u.uAspect.value = size.width / Math.max(1, size.height);
    u.uPixelRatio.value = gl.getPixelRatio();
    const p = pointer.current;
    // Eased follow so the heat source trails the cursor slightly.
    u.uMouse.value.x += (p.x - u.uMouse.value.x) * 0.12;
    u.uMouse.value.y += (p.y - u.uMouse.value.y) * 0.12;
    u.uHeatAmt.value += ((p.inside ? 1 : 0) - u.uHeatAmt.value) * 0.06;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.CustomBlending}
        blendSrc={THREE.OneFactor}
        blendDst={THREE.OneFactor}
      />
    </points>
  );
}

type PointerState = { x: number; y: number; inside: boolean };

export default function SparkField({ count }: { count: number }) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 10, y: 10, inside: false });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = host.current!;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.current.inside = inside && e.pointerType === 'mouse';
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => (pointer.current.inside = false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    // Stop rendering entirely when the hero is off screen.
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={host} className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Sparks count={count} pointer={pointer} />
      </Canvas>
    </div>
  );
}
