const EMAILJS_SERVICE_ID = "service_mc2ytxu";
const EMAILJS_TEMPLATE_ID = "template_bbyl4kk";
const EMAILJS_PUBLIC_KEY = "OjvQgapFyjPdambv6";

document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.querySelector(".progress-bar");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const mobileLinks = Array.from(document.querySelectorAll(".mobile-nav-link"));
  const allScrollLinks = Array.from(document.querySelectorAll("[data-target]"));
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const form = document.querySelector(".contact-form");
  const statusEl = form?.querySelector(".form-status");

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  function closeMobileMenu() {
    if (menuToggle && mobileMenu) {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    }
  }

  function openMobileMenu() {
    if (menuToggle && mobileMenu) {
      menuToggle.setAttribute("aria-expanded", "true");
      mobileMenu.hidden = false;
    }
  }

  function toggleMobileMenu() {
    if (!menuToggle || !mobileMenu) return;
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function updateProgressBar() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(
      Math.max(progress, 0),
      1
    )})`;
  }

  function setActiveLink(targetId) {
    const lowerId = targetId.toLowerCase();
    navLinks.forEach((link) => {
      const match = link.dataset.target?.toLowerCase() === lowerId;
      link.classList.toggle("active", match);
    });
    mobileLinks.forEach((link) => {
      const match = link.dataset.target?.toLowerCase() === lowerId;
      link.classList.toggle("active", match);
    });
  }

  function detectActiveSection() {
    const scrollPos = window.scrollY + 220;
    let currentSection = sections[0]?.id ?? "home";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos <= bottom) {
        currentSection = section.id;
      }
    });

    setActiveLink(currentSection);
  }

  function smoothScrollTo(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMobileMenu();
  }

  function handleScroll() {
    updateProgressBar();
    detectActiveSection();
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Ensure the mobile menu starts closed on load
  closeMobileMenu();

  document.addEventListener("click", (event) => {
    if (
      mobileMenu &&
      menuToggle &&
      !mobileMenu.hidden &&
      !mobileMenu.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMobileMenu();
    }
  });

  allScrollLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.dataset.target;
      if (target) {
        smoothScrollTo(target);
      }
    });
  });

  // Intersection observer for scroll animations
  const animatedElements = Array.from(
    document.querySelectorAll(".animate-on-scroll")
  );

  if ("IntersectionObserver" in window && animatedElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay
              ? parseInt(entry.target.dataset.delay, 10)
              : 0;
            if (!Number.isNaN(delay)) {
              entry.target.style.transitionDelay = `${delay}ms`;
            }
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -100px 0px",
        threshold: 0.1,
      }
    );

    animatedElements.forEach((el) => observer.observe(el));
  } else {
    animatedElements.forEach((el) => el.classList.add("is-visible"));
  }

  function clearFormErrors() {
    const errorEls = form?.querySelectorAll(".field-error") ?? [];
    errorEls.forEach((el) => {
      el.textContent = "";
    });
  }

  function setFieldError(name, message) {
    const errorEl = form?.querySelector(
      `[data-error-for="${CSS.escape(name)}"]`
    );
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function showStatus(type, message) {
    if (!statusEl) return;
    statusEl.classList.remove("success", "error", "pending");
    statusEl.textContent = message;
    if (type) {
      statusEl.classList.add(type);
      statusEl.style.display = "flex";
    } else {
      statusEl.style.display = "none";
    }

    if (type === "success") {
      setTimeout(() => {
        statusEl.style.display = "none";
        statusEl.textContent = "";
        statusEl.classList.remove("success", "error", "pending");
      }, 5000);
    }
  }

  function validateForm(data) {
    let isValid = true;
    clearFormErrors();

    if (!data.name.trim()) {
      setFieldError("name", "Name is required");
      isValid = false;
    }

    if (!data.email.trim()) {
      setFieldError("email", "Email is required");
      isValid = false;
    } else if (!emailRegex.test(data.email)) {
      setFieldError("email", "Invalid email address");
      isValid = false;
    }

    if (!data.message.trim()) {
      setFieldError("message", "Message is required");
      isValid = false;
    } else if (data.message.trim().length < 10) {
      setFieldError("message", "Message must be at least 10 characters");
      isValid = false;
    }

    return isValid;
  }

  if (form) {
    if (window.emailjs) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
      console.warn("EmailJS SDK not available");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const data = {
        name: formData.get("name")?.toString() ?? "",
        email: formData.get("email")?.toString() ?? "",
        message: formData.get("message")?.toString() ?? "",
      };

      if (!validateForm(data)) {
        showStatus("error", "Please fix the errors above and try again.");
        return;
      }

      showStatus("pending", "Sending message...");

      if (!window.emailjs) {
        console.error("EmailJS SDK missing.");
        showStatus(
          "error",
          "Unable to send right now. Please try again later."
        );
        return;
      }

      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name: data.name,
          email: data.email,
          message: data.message,
        })
        .then(() => {
          showStatus("success", "Message sent successfully!");
          form.reset();
        })
        .catch((err) => {
          console.error("EmailJS send failed:", err);
          showStatus(
            "error",
            "Failed to send message. Please try again in a moment."
          );
        });
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });

  handleScroll(); // initialize on load
  detectActiveSection();
});

const roles = [
  "Frontend Dev ⚛️",
  "Crafting Interfaces with React 📲",
  "Building Smart UIs with AI 🤖",
  "Forever Curious 🧠",
];



let index = 0;
let charIndex = 0;
const typingSpeed = 80; // ms per character
const erasingSpeed = 50; // ms per character
const delayBetweenRoles = 1500; // pause before erasing

const typingText = document.getElementById("typing-text");

function typeRole() {
  if (charIndex < roles[index].length) {
    typingText.textContent += roles[index].charAt(charIndex);
    charIndex++;
    setTimeout(typeRole, typingSpeed);
  } else {
    setTimeout(eraseRole, delayBetweenRoles);
  }
}

function eraseRole() {
  if (charIndex > 0) {
    typingText.textContent = roles[index].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseRole, erasingSpeed);
  } else {
    index = (index + 1) % roles.length;
    setTimeout(typeRole, typingSpeed);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  typeRole();
});
