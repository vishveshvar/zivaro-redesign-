import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "../css/styles.css";
import { createScene } from "./scene.js";
import { setupAnimations, createSupportingArt } from "./animations.js";

const reducedPreference = matchMedia("(prefers-reduced-motion: reduce)");
const motion = { reduced: reducedPreference.matches, paused: false };
const scene = createScene(
  document.getElementById("intelligence-scene"),
  motion,
);
const art = createSupportingArt(motion);
const cleanAnimations = setupAnimations(scene, motion);
const motionButton = document.getElementById("motion-toggle");
function updateMotionButton() {
  motionButton.setAttribute(
    "aria-pressed",
    String(motion.paused || motion.reduced),
  );
  motionButton.textContent = motion.reduced
    ? "Reduced motion"
    : motion.paused
      ? "Resume motion"
      : "Pause motion";
  motionButton.disabled = motion.reduced;
}
motionButton.addEventListener("click", () => {
  motion.paused = !motion.paused;
  updateMotionButton();
  scene.resume();
  art.resume();
});
reducedPreference.addEventListener("change", (event) => {
  motion.reduced = event.matches;
  scene.state.intro = 1;
  updateMotionButton();
  scene.resume();
  art.resume();
});
updateMotionButton();
const menuButton = document.querySelector(".menu-toggle");
const menu = document.getElementById("mobile-menu");
const menuBackground = document.querySelectorAll(
  "main, footer, .header .wordmark, .header-contact, .skip-link",
);
function closeMenu() {
  menu.classList.remove("is-open");
  menu.inert = true;
  menuBackground.forEach((element) => {
    element.inert = false;
  });
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("modal-open");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  if (open) closeMenu();
  else {
    menu.inert = false;
    menuBackground.forEach((element) => {
      element.inert = true;
    });
    menu.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation");
    document.body.classList.add("modal-open");
  }
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
  if (event.key === "Tab" && menu.classList.contains("is-open")) {
    const last = menu.querySelector("button");
    const first = menu.querySelector("a");
    if (!event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      menuButton.focus();
    }
  }
});
matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
const enquiry = document.getElementById("enquiry-dialog");
const domain = document.getElementById("domain-dialog");
function openEnquiry() {
  closeMenu();
  if (domain.open) domain.close();
  enquiry.showModal();
  document.body.classList.add("modal-open");
}
document
  .querySelectorAll("[data-contact]")
  .forEach((button) => button.addEventListener("click", openEnquiry));
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]"))
      document.body.classList.remove("modal-open");
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
});
const domains = {
  health: {
    label: "THE HUMAN PERSPECTIVE",
    title: "Healthcare & Life Sciences",
    description:
      "Put human understanding at the heart of healthcare decisions. Explore the experiences, needs and choices that shape care.",
    topics: [
      "Patient journeys and unmet needs",
      "Healthcare professional perspectives",
      "Treatment and market landscapes",
      "Stakeholder and access research",
    ],
  },
  business: {
    label: "THE MARKET PERSPECTIVE",
    title: "B2B Market Intelligence",
    description:
      "Understand your market as a connected system. Explore the buyers, competitors and forces shaping your next opportunity.",
    topics: [
      "Market landscapes and demand",
      "Business buyer decision journeys",
      "Competitive positioning",
      "Opportunity and growth assessment",
    ],
  },
};
document.querySelectorAll("[data-domain]").forEach((button) =>
  button.addEventListener("click", () => {
    const data = domains[button.dataset.domain];
    document.getElementById("domain-label").textContent = data.label;
    document.getElementById("domain-title").textContent = data.title;
    document.getElementById("domain-description").textContent =
      data.description;
    document.getElementById("domain-topics").replaceChildren(
      ...data.topics.map((topic) => {
        const li = document.createElement("li");
        li.textContent = topic;
        return li;
      }),
    );
    enquiry.querySelector("select").value = data.title;
    domain.showModal();
    document.body.classList.add("modal-open");
  }),
);
document
  .getElementById("domain-enquiry")
  .addEventListener("click", openEnquiry);
document.querySelectorAll(".capabilities details").forEach((details) =>
  details.addEventListener("toggle", () => {
    if (details.open)
      document.querySelectorAll(".capabilities details").forEach((other) => {
        if (other !== details) other.open = false;
      });
  }),
);
document.getElementById("enquiry-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const brief = `ZIVARO GLOBAL RESEARCH\nEnquiry brief — prepared locally\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nInterest: ${data.get("interest")}\n\nResearch question\n${data.get("question")}\n\nThis brief has not been submitted.\n`;
  const url = URL.createObjectURL(
    new Blob([brief], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "zivaro-enquiry-brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById("form-status").textContent =
    "Your brief is ready. Check your downloads. It has not been submitted.";
});
document.getElementById("year").textContent = new Date().getFullYear();
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) {
    scene.destroy();
    art.destroy();
    cleanAnimations();
  }
});
