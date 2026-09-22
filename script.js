(function () {
  "use strict";

  const UNIT_PRICE = 299;

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");

  function closeNav() {
    navLinks.classList.remove("is-open");
    hamburgerBtn.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  }

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    hamburgerBtn.classList.toggle("is-open", isOpen);
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     BACK TO TOP
     ========================================================= */
  const backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    backToTop.hidden = window.scrollY < 500;
  });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* =========================================================
     GENERIC ACCORDION HELPER (storage + FAQ)
     ========================================================= */
  function wireAccordion(trigger, panel) {
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  wireAccordion(
    document.querySelector("#storageAccordion .accordion-trigger"),
    document.getElementById("storagePanel")
  );

  document.querySelectorAll(".faq-item").forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-panel");
    wireAccordion(trigger, panel);
  });

  /* Ingredient "more" toggles */
  document.querySelectorAll(".ingredient-toggle").forEach((btn) => {
    const detail = btn.nextElementSibling;
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      detail.hidden = isOpen;
      btn.textContent = isOpen ? btn.textContent.replace("Less", "More") : btn.textContent.replace("More", "Less");
    });
  });

  /* =========================================================
     QUANTITY CONTROLS
     ========================================================= */
  let productQty = 1;
  let buyQty = 1;

  const productQtyValue = document.getElementById("productQtyValue");
  const buyQtyValue = document.getElementById("buyQtyValue");
  const summaryTotal = document.getElementById("summaryTotal");

  function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function updateBuyTotal() {
    summaryTotal.textContent = formatPrice(UNIT_PRICE * buyQty);
  }

  function wireQtyControl(container, get, set, onChange) {
    container.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let value = get();
        if (btn.dataset.action === "increase") value = Math.min(value + 1, 20);
        if (btn.dataset.action === "decrease") value = Math.max(value - 1, 1);
        set(value);
        onChange(value);
      });
    });
  }

  wireQtyControl(
    document.getElementById("productQty"),
    () => productQty,
    (v) => (productQty = v),
    (v) => (productQtyValue.textContent = v)
  );

  wireQtyControl(
    document.getElementById("buyQty"),
    () => buyQty,
    (v) => (buyQty = v),
    (v) => {
      buyQtyValue.textContent = v;
      updateBuyTotal();
    }
  );

  document.getElementById("productBuyBtn").addEventListener("click", () => {
    buyQty = productQty;
    buyQtyValue.textContent = buyQty;
    updateBuyTotal();
  });

  updateBuyTotal();

  /* =========================================================
     FORM VALIDATION HELPERS
     ========================================================= */
  function setFieldError(input, errorEl, message) {
    const field = input.closest(".form-field");
    if (message) {
      field.classList.add("has-error");
      errorEl.textContent = message;
    } else {
      field.classList.remove("has-error");
      errorEl.textContent = "";
    }
  }

  function validateRequired(input, errorEl, label) {
    const value = input.value.trim();
    if (!value) {
      setFieldError(input, errorEl, `${label} is required.`);
      return false;
    }
    setFieldError(input, errorEl, "");
    return true;
  }

  function validateEmail(input, errorEl) {
    const value = input.value.trim();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setFieldError(input, errorEl, "Email is required.");
      return false;
    }
    if (!pattern.test(value)) {
      setFieldError(input, errorEl, "Enter a valid email address.");
      return false;
    }
    setFieldError(input, errorEl, "");
    return true;
  }

  function validatePhone(input, errorEl) {
    const value = input.value.trim();
    const pattern = /^[0-9+\-\s()]{7,15}$/;
    if (!value) {
      setFieldError(input, errorEl, "Phone number is required.");
      return false;
    }
    if (!pattern.test(value)) {
      setFieldError(input, errorEl, "Enter a valid phone number.");
      return false;
    }
    setFieldError(input, errorEl, "");
    return true;
  }

  /* =========================================================
     CHECKOUT FORM
     ========================================================= */
  const checkoutForm = document.getElementById("checkoutForm");
  const orderName = document.getElementById("orderName");
  const orderEmail = document.getElementById("orderEmail");
  const orderPhone = document.getElementById("orderPhone");
  const orderAddress = document.getElementById("orderAddress");

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const validName = validateRequired(orderName, document.getElementById("orderNameError"), "Name");
    const validEmail = validateEmail(orderEmail, document.getElementById("orderEmailError"));
    const validPhone = validatePhone(orderPhone, document.getElementById("orderPhoneError"));
    const validAddress = validateRequired(orderAddress, document.getElementById("orderAddressError"), "Address");

    if (!(validName && validEmail && validPhone && validAddress)) {
      return;
    }

    const delivery = checkoutForm.querySelector('input[name="delivery"]:checked').value;
    const total = UNIT_PRICE * buyQty;
    const orderId =
      "VB-2026-" + String(Math.floor(1000 + Math.random() * 9000));

    document.getElementById("receiptQty").textContent = buyQty;
    document.getElementById("receiptTotal").textContent = formatPrice(total);
    document.getElementById("receiptDelivery").textContent = delivery;
    document.getElementById("receiptOrderId").textContent = orderId;

    openModal(orderModal);
    checkoutForm.reset();
    buyQty = 1;
    buyQtyValue.textContent = 1;
    updateBuyTotal();
  });

  /* =========================================================
     CONTACT FORM
     ========================================================= */
  const contactForm = document.getElementById("contactForm");
  const contactSuccess = document.getElementById("contactSuccess");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const validName = validateRequired(
      document.getElementById("contactName"),
      document.getElementById("contactNameError"),
      "Name"
    );
    const validEmail = validateEmail(
      document.getElementById("contactEmail"),
      document.getElementById("contactEmailError")
    );
    const validSubject = validateRequired(
      document.getElementById("contactSubject"),
      document.getElementById("contactSubjectError"),
      "Subject"
    );
    const validMessage = validateRequired(
      document.getElementById("contactMessage"),
      document.getElementById("contactMessageError"),
      "Message"
    );

    if (!(validName && validEmail && validSubject && validMessage)) {
      contactSuccess.hidden = true;
      return;
    }

    contactForm.reset();
    contactSuccess.hidden = false;
  });

  /* =========================================================
     MODAL HELPERS
     ========================================================= */
  const orderModal = document.getElementById("orderModal");
  const feedbackModal = document.getElementById("feedbackModal");
  let lastFocusedEl = null;

  function openModal(modal) {
    lastFocusedEl = document.activeElement;
    modal.hidden = false;
    const focusable = modal.querySelector("button, input, textarea");
    if (focusable) focusable.focus();
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  [orderModal, feedbackModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!orderModal.hidden) closeModal(orderModal);
      if (!feedbackModal.hidden) closeModal(feedbackModal);
    }
  });

  /* Trap Tab/Shift+Tab focus inside whichever modal is currently open */
  function getFocusableEls(container) {
    return Array.from(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const activeModal = [orderModal, feedbackModal].find((m) => !m.hidden);
    if (!activeModal) return;

    const focusables = getFocusableEls(activeModal);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.getElementById("orderModalClose").addEventListener("click", () => closeModal(orderModal));
  document.getElementById("continueBrowsingBtn").addEventListener("click", () => closeModal(orderModal));
  document.getElementById("feedbackModalClose").addEventListener("click", () => closeModal(feedbackModal));

  /* =========================================================
     FEEDBACK MODAL + STAR RATING + LOCALSTORAGE
     ========================================================= */
  const openFeedbackBtn = document.getElementById("openFeedbackBtn");
  const feedbackForm = document.getElementById("feedbackForm");
  const starPicker = document.getElementById("starPicker");
  const starButtons = starPicker.querySelectorAll(".star-btn");
  let selectedRating = 0;

  openFeedbackBtn.addEventListener("click", () => openModal(feedbackModal));

  function setStars(rating) {
    starButtons.forEach((btn) => {
      const value = Number(btn.dataset.value);
      const active = value <= rating;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", String(value === rating));
    });
  }

  starButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.value);
      setStars(selectedRating);
      setFieldError(starPicker, document.getElementById("feedbackRatingError"), "");
    });
    btn.addEventListener("mouseenter", () => {
      const value = Number(btn.dataset.value);
      starButtons.forEach((b) => b.classList.toggle("is-hover", Number(b.dataset.value) <= value));
    });
    btn.addEventListener("mouseleave", () => {
      starButtons.forEach((b) => b.classList.remove("is-hover"));
    });
  });

  const FEEDBACK_KEY = "vedabloom_demo_feedback";

  function loadStoredFeedback() {
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveStoredFeedback(list) {
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
    } catch (err) {
      /* localStorage unavailable — demo feedback simply won't persist */
    }
  }

  function renderStoredFeedback() {
    const list = loadStoredFeedback();
    const grid = document.getElementById("reviewGrid");
    list.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "review-card";
      const stars = "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating);
      card.innerHTML = `
        <span class="demo-tag">Demo Feedback</span>
        <div class="stars" aria-label="${entry.rating} out of 5 stars">${stars}</div>
        <p class="review-comment">"${escapeHtml(entry.comment)}"</p>
        <p class="review-meta">${escapeHtml(entry.name)} · Submitted in this demo</p>
      `;
      grid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  renderStoredFeedback();

  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("feedbackName");
    const commentInput = document.getElementById("feedbackComment");

    const validName = validateRequired(nameInput, document.getElementById("feedbackNameError"), "Name");
    const validComment = validateRequired(commentInput, document.getElementById("feedbackCommentError"), "Comment");

    let validRating = true;
    if (selectedRating === 0) {
      validRating = false;
      document.getElementById("feedbackRatingError").textContent = "Please select a rating.";
    } else {
      document.getElementById("feedbackRatingError").textContent = "";
    }

    if (!(validName && validComment && validRating)) return;

    const entry = {
      name: nameInput.value.trim(),
      rating: selectedRating,
      comment: commentInput.value.trim(),
    };

    const list = loadStoredFeedback();
    list.push(entry);
    saveStoredFeedback(list);

    const grid = document.getElementById("reviewGrid");
    const card = document.createElement("article");
    card.className = "review-card";
    const stars = "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating);
    card.innerHTML = `
      <span class="demo-tag">Demo Feedback</span>
      <div class="stars" aria-label="${entry.rating} out of 5 stars">${stars}</div>
      <p class="review-comment">"${escapeHtml(entry.comment)}"</p>
      <p class="review-meta">${escapeHtml(entry.name)} · Submitted in this demo</p>
    `;
    grid.appendChild(card);

    feedbackForm.reset();
    selectedRating = 0;
    setStars(0);
    closeModal(feedbackModal);
  });
})();
