import * as THREE from "three";

export function createScene(container, motion) {
  const mobile = matchMedia("(max-width: 560px)").matches;
  const lowPower = mobile || (navigator.hardwareConcurrency || 8) <= 4;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !lowPower,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return createFallback(container, motion);
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.4 : 1.8));
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.z = 10;
  const group = new THREE.Group();
  scene.add(group);
  const geometry = new THREE.BufferGeometry();
  const rows = lowPower ? 80 : 125;
  const cols = lowPower ? 230 : 340;
  const positions = new Float32Array(rows * cols * 3);
  const colors = new Float32Array(rows * cols * 3);
  const seeds = new Float32Array(rows * cols);
  const color = new THREE.Color();
  let index = 0;
  for (let r = 0; r < rows; r++) {
    const v = (r / (rows - 1) - 0.5) * 2;
    for (let c = 0; c < cols; c++) {
      const u = (c / cols) * Math.PI * 2;
      const radius =
        1.55 + 0.64 * v * Math.cos(u * 1.5) + 0.12 * Math.sin(u * 3);
      positions[index * 3] = Math.cos(u) * radius;
      positions[index * 3 + 1] = Math.sin(u) * radius * 1.16;
      positions[index * 3 + 2] =
        0.9 * v * Math.sin(u * 1.5) + 0.27 * Math.cos(u * 2);
      const warmth = (Math.cos(u - 0.6) + 1) / 2;
      color.setRGB(
        0.39 + warmth * 0.42,
        0.57 + warmth * 0.09,
        0.69 - warmth * 0.26,
      );
      color.multiplyScalar(0.62 + 0.38 * Math.pow(Math.abs(v), 0.5));
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      seeds[index] = Math.sin(index * 127.1) * 0.5 + 0.5;
      index++;
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uIntro: { value: motion.reduced ? 1 : 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aSeed;
      uniform float uTime; uniform float uProgress; uniform float uIntro; uniform float uPixelRatio;
      varying vec3 vColor; varying float vAlpha;
      void main(){
        vec3 p = position;
        float wave = sin(p.y * 2.4 + uTime * 0.45) * cos(p.x * 2.0 - uTime * 0.23);
        p.z += wave * 0.08;
        p.x += sin(p.y * 3.0 + aSeed * 5.0) * (1.0-uIntro) * 0.8;
        p.y += cos(aSeed * 25.0) * (1.0-uIntro) * 0.65;
        p.x += sin(p.y * 2.0) * uProgress * 0.4;
        p.z += sin(p.x * 4.0) * uProgress * 0.5;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp((16.0 / -mvPosition.z) * uPixelRatio, 1.0, 3.5);
        vColor = color;
        vAlpha = (0.32 + aSeed * 0.5) * (0.25 + 0.75 * uIntro);
      }`,
    fragmentShader: `varying vec3 vColor; varying float vAlpha;
      void main(){float d = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }`,
  });
  group.add(new THREE.Points(geometry, material));
  const threadPositions = [];
  for (let r = 0; r < rows; r += 8) {
    for (let c = 0; c < cols - 1; c++) {
      const a = (r * cols + c) * 3;
      const b = a + 3;
      threadPositions.push(
        ...positions.slice(a, a + 3),
        ...positions.slice(b, b + 3),
      );
    }
  }
  const threadGeometry = new THREE.BufferGeometry();
  threadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(threadPositions, 3),
  );
  const threadMaterial = new THREE.LineBasicMaterial({
    color: "#9aabae",
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  group.add(new THREE.LineSegments(threadGeometry, threadMaterial));
  const pointer = { x: 0, y: 0 };
  const state = { progress: 0, intro: motion.reduced ? 1 : 0 };
  let frame = 0;
  let visible = true;
  let elapsed = 0;
  let previous = 0;
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    const narrow = width < 560;
    const worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(18)) * 10;
    const worldWidth = worldHeight * camera.aspect;
    group.position.set(
      narrow ? 0.1 : worldWidth * 0.245,
      narrow ? -1.5 : 0.05,
      0,
    );
    group.scale.setScalar(narrow ? 0.6 : width < 900 ? 0.9 : 1.08);
    draw();
  }
  function draw() {
    uniforms.uTime.value = elapsed;
    uniforms.uIntro.value = state.intro;
    uniforms.uProgress.value = state.progress;
    group.rotation.set(
      0.12 + pointer.y * 0.08,
      -0.35 + pointer.x * 0.12 + state.progress * 0.35,
      -0.42 + Math.sin(elapsed * 0.12) * 0.04,
    );
    renderer.render(scene, camera);
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) return;
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    if (!motion.paused && !motion.reduced) elapsed += delta;
    draw();
    if (!motion.paused && !motion.reduced) frame = requestAnimationFrame(tick);
  }
  function resume() {
    previous = 0;
    if (!frame && visible && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function onPointer(event) {
    if (motion.reduced || motion.paused) return;
    pointer.x = (event.clientX / innerWidth) * 2 - 1;
    pointer.y = (event.clientY / innerHeight) * 2 - 1;
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) resume();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(container);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", resume);
  const lost = (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    renderer.domElement.style.display = "none";
    createFallback(container, motion);
  };
  renderer.domElement.addEventListener("webglcontextlost", lost, {
    once: true,
  });
  resize();
  resume();
  return {
    state,
    render: draw,
    resume,
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", resume);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometry.dispose();
      material.dispose();
      threadGeometry.dispose();
      threadMaterial.dispose();
      renderer.dispose();
    },
  };
}

function createFallback(container) {
  const canvas = document.createElement("canvas");
  container.append(canvas);
  const state = { progress: 0, intro: 1 };
  function render() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width * 1.5;
    canvas.height = height * 1.5;
    const ctx = canvas.getContext("2d");
    ctx.scale(1.5, 1.5);
    const narrow = width < 560;
    const scale = narrow ? width * 0.3 : Math.min(width * 0.2, height * 0.28);
    ctx.translate(
      width * (narrow ? 0.54 : 0.74),
      height * (narrow ? 0.73 : 0.5),
    );
    ctx.rotate(-0.4);
    for (let row = 0; row < 75; row++) {
      const v = (row / 74) * 2 - 1;
      ctx.beginPath();
      for (let step = 0; step <= 300; step++) {
        const u = (step / 300) * Math.PI * 2;
        const r = 1 + v * 0.38 * Math.cos(u * 1.5);
        const x = Math.cos(u) * r * scale;
        const y = Math.sin(u) * r * scale * 1.15;
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = row % 3 ? "#a5bcc437" : "#c9a66b65";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }
  const observer = new ResizeObserver(render);
  observer.observe(container);
  render();
  return {
    state,
    render,
    resume: render,
    destroy: () => observer.disconnect(),
  };
}
