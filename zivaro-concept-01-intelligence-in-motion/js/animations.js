import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function setupAnimations(scene, motion) {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
    opening
      .from(
        ".hero-copy .line",
        { y: 35, opacity: 0, duration: 1.15, stagger: 0.09 },
        0.05,
      )
      .from(".hero-description", { opacity: 0, y: 12, duration: 0.8 }, 0.4)
      .to(scene.state, { intro: 1, duration: 2.2, onUpdate: scene.render }, 0);
    gsap.to(scene.state, {
      progress: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
      onUpdate: scene.render,
    });
    gsap.to(".sculpture-caption", {
      y: -70,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
    gsap.from(".about h2", {
      clipPath: "inset(0 100% 0 0)",
      duration: 1.4,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".about", start: "top 75%" },
    });
    gsap.from(".world-health .world-content", {
      x: -28,
      opacity: 0.3,
      duration: 1,
      scrollTrigger: { trigger: ".world-grid", start: "top 65%" },
    });
    gsap.from(".world-business .world-content", {
      x: 28,
      opacity: 0.3,
      duration: 1,
      scrollTrigger: { trigger: ".world-grid", start: "top 65%" },
    });
    gsap.to(".research-symbol", {
      rotation: 140,
      ease: "none",
      scrollTrigger: {
        trigger: ".research",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
    document.querySelectorAll(".region-arcs path").forEach((path, index) => {
      const length = path.getTotalLength();
      gsap.fromTo(
        path,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: index * 0.07,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ".region-visual", start: "top 80%" },
        },
      );
    });
    gsap.from(".contact-section h2", {
      letterSpacing: "-0.1em",
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: ".contact-section", start: "top 70%" },
    });
  });
  return () => media.revert();
}

export function createSupportingArt(motion) {
  const canvases = ["clarity", "health", "business"].map((name) => ({
    name,
    canvas: document.getElementById(`${name}-canvas`),
    visible: false,
  }));
  let frame;
  let time = 0;
  let last = 0;
  function paint({ canvas, name }, t) {
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio, 1.5);
    if (
      canvas.width !== Math.round(width * ratio) ||
      canvas.height !== Math.round(height * ratio)
    ) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (name === "clarity") {
      for (let row = 0; row < 19; row++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const progress = x / width;
          const scatter = (1 - progress) ** 2;
          const y =
            height * 0.42 +
            (row - 9) * 3.7 +
            Math.sin(x * 0.028 + row * 2.4 + t * 0.3) * scatter * 42;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = row % 3 ? "#81735c55" : "#384d6377";
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
    } else if (name === "health") {
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-0.3);
      for (let row = 0; row < 56; row++) {
        const v = row / 55;
        ctx.beginPath();
        for (let step = 0; step <= 150; step++) {
          const u = (step / 150) * Math.PI * 2;
          const radius = 58 + v * 35 + 20 * Math.sin(u * 3 + v * 2 + t * 0.15);
          const x = Math.cos(u) * radius * 1.55;
          const y = Math.sin(u) * radius;
          if (!step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(157,183,184,${0.12 + v * 0.22})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    } else {
      ctx.translate(width / 2, height / 2 - 8);
      for (let row = 0; row < 30; row++) {
        const y = row * 4 - 60;
        const turn = Math.sin(row * 0.09 + t * 0.12) * 20;
        ctx.beginPath();
        ctx.moveTo(-130 + turn, y);
        ctx.lineTo(-15 + turn, y - 50);
        ctx.lineTo(130 - turn, y + 5);
        ctx.lineTo(15 - turn, y + 55);
        ctx.closePath();
        ctx.strokeStyle = `rgba(198,165,115,${0.13 + row / 100})`;
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
    }
  }
  function tick(now) {
    frame = null;
    if (document.hidden) return;
    const delta = last ? Math.min(now - last, 50) / 1000 : 0;
    last = now;
    if (!motion.paused && !motion.reduced) time += delta;
    canvases
      .filter((item) => item.visible)
      .forEach((item) => paint(item, time));
    if (
      !motion.paused &&
      !motion.reduced &&
      canvases.some((item) => item.visible)
    )
      frame = requestAnimationFrame(tick);
  }
  function resume() {
    last = 0;
    if (!frame) frame = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      canvases.find((item) => item.canvas === entry.target).visible =
        entry.isIntersecting;
    });
    resume();
  });
  const resizeObserver = new ResizeObserver(() => {
    canvases.forEach((item) => paint(item, time));
  });
  canvases.forEach((item) => {
    observer.observe(item.canvas);
    resizeObserver.observe(item.canvas);
  });
  document.addEventListener("visibilitychange", resume);
  return {
    resume,
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", resume);
    },
  };
}
