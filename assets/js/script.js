document.addEventListener("DOMContentLoaded", function () {
  // ── Redirect empty / placeholder links to 404 page ──────────────────────
  (function redirectEmptyLinks() {
    const isSubpage = window.location.pathname.includes("/pages/");
    const notFoundPath = isSubpage ? "404.html" : "pages/404.html";

    document.addEventListener("click", function (e) {
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      // Intercept: href is exactly "#", empty, or missing
      if (!href || href.trim() === "#") {
        // Do not redirect if it is a toggle trigger (like bootstrap dropdown or tab)
        if (
          anchor.hasAttribute("data-bs-toggle") ||
          anchor.getAttribute("role") === "button" ||
          anchor.classList.contains("prevent-redirect")
        ) {
          return;
        }
        e.preventDefault();
        window.location.href = notFoundPath;
      }
    });
  })();
  // ─────────────────────────────────────────────────────────────────────────

  // Determine if we are on a subpage (inside the /pages/ directory)
  const isSubpage = window.location.pathname.includes("/pages/");
  const basePath = isSubpage ? "../" : "";
  const componentsPath = isSubpage ? "components/" : "pages/components/";

  // Load Header and Footer
  loadHeader();
  loadFooterWithScrollTop();

  // Load Header Component
  function loadHeader() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (!headerPlaceholder) return;

    fetch(`${componentsPath}header.html`)
      .then((response) => {
        if (!response.ok) throw new Error("CORS or File Loading Error");
        return response.text();
      })
      .then((data) => {
        // Adjust links for subpages if loaded dynamically
        headerPlaceholder.innerHTML = adjustPaths(data, isSubpage);
        initializeHeaderEvents();
      })
      .catch((error) => {
        console.warn(
          "Fallback header loaded due to CORS filesystem policy:",
          error,
        );
        headerPlaceholder.innerHTML = getFallbackHeader(isSubpage);
        initializeHeaderEvents();
      });
  }

  // Adjust relative paths inside header/footer based on page location
  function adjustPaths(html, isSubpage) {
    if (!isSubpage) return html;
    // Subpages are inside /pages/, so strip the "pages/" prefix from all hrefs
    let adjusted = html.replaceAll('href="pages/', 'href="');
    adjusted = adjusted.replaceAll('href="index.html"', 'href="../index.html"');
    adjusted = adjusted.replaceAll('src="assets/', 'src="../assets/');
    return adjusted;
  }

  // Header Interactions & Fixed Sticky Effect
  function initializeHeaderEvents() {
    const header = document.querySelector(".header");
    if (header) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
          header.classList.add("shadow", "py-2");
          header.classList.remove("py-3");
        } else {
          header.classList.remove("shadow", "py-2");
          header.classList.add("py-3");
        }
      });
    }
  }

  // Scroll To Top Button
  function initScrollToTop() {
    const btn = document.getElementById("scrollToTopBtn");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.style.opacity = window.scrollY > 300 ? "1" : "0";
      btn.style.pointerEvents = window.scrollY > 300 ? "auto" : "none";
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Init scroll-to-top after footer loads
  function loadFooterWithScrollTop() {
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (!footerPlaceholder) return;
    fetch(`${componentsPath}footer.html`)
      .then((response) => {
        if (!response.ok) throw new Error("CORS or File Loading Error");
        return response.text();
      })
      .then((data) => {
        footerPlaceholder.innerHTML = adjustPaths(data, isSubpage);
        initScrollToTop();
      })
      .catch((error) => {
        console.warn(
          "Fallback footer loaded due to CORS filesystem policy:",
          error,
        );
        footerPlaceholder.innerHTML = getFallbackFooter(isSubpage);
        initScrollToTop();
      });
  }

  // Initialize custom countdown and product finder
  initCountdown();
  initProductFinder();

  // Initialize Swiper Carousels (Only if Swiper is loaded in index.html)
  if (typeof Swiper !== "undefined") {
    // 1. Hero Slider
    new Swiper(".swiper-hero", {
      loop: true,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination-hero",
        clickable: true,
      },
      navigation: {
        nextEl: ".hero-nav-next",
        prevEl: ".hero-nav-prev",
      },
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      speed: 800,
    });

    // 2. Categories Slider
    new Swiper(".swiper-categories", {
      slidesPerView: 2,
      spaceBetween: 15,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      breakpoints: {
        480: { slidesPerView: 3 },
        768: { slidesPerView: 5 },
        1024: { slidesPerView: 7 },
        1200: { slidesPerView: 9 },
      },
    });

    // 3. Products Tabs Slider
    const productSwiperConfig = {
      slidesPerView: 1,
      spaceBetween: 20,
      observer: true,
      observeParents: true,
      breakpoints: {
        576: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        992: { slidesPerView: 4 },
        1200: { slidesPerView: 5 },
      },
    };
    const featuredSwiper = new Swiper(
      ".swiper-products-featured",
      productSwiperConfig,
    );
    const bestsellerSwiper = new Swiper(
      ".swiper-products-bestseller",
      productSwiperConfig,
    );
    const mostviewedSwiper = new Swiper(
      ".swiper-products-mostviewed",
      productSwiperConfig,
    );

    // Dynamic Navigation controller for Product Tabs Swipers
    const tabPrevBtn = document.querySelector(".swiper-button-prev-products");
    const tabNextBtn = document.querySelector(".swiper-button-next-products");
    if (tabPrevBtn && tabNextBtn) {
      tabPrevBtn.addEventListener("click", function () {
        const activeSwiperEl = document.querySelector(
          "#productTabsContent .tab-pane.active .swiper",
        );
        if (activeSwiperEl && activeSwiperEl.swiper) {
          activeSwiperEl.swiper.slidePrev();
        }
      });
      tabNextBtn.addEventListener("click", function () {
        const activeSwiperEl = document.querySelector(
          "#productTabsContent .tab-pane.active .swiper",
        );
        if (activeSwiperEl && activeSwiperEl.swiper) {
          activeSwiperEl.swiper.slideNext();
        }
      });
    }

    // Force full layout update on shown tab event to fix hidden-pane init issue
    const tabElList = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElList.forEach((tabEl) => {
      tabEl.addEventListener("shown.bs.tab", function () {
        const activeSwiperEl = document.querySelector(
          "#productTabsContent .tab-pane.active .swiper",
        );
        if (activeSwiperEl && activeSwiperEl.swiper) {
          activeSwiperEl.swiper.update();
        }
      });
    });

    // Trending products swiper (scoped navigation)
    new Swiper(".swiper-products-trending", {
      ...productSwiperConfig,
      navigation: {
        nextEl: ".swiper-button-next-trending",
        prevEl: ".swiper-button-prev-trending",
      },
    });

    // 4. Sidebar Bestsellers Swiper
    new Swiper(".swiper-best-seller-sidebar", {
      slidesPerView: 1,
      spaceBetween: 10,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: ".swiper-button-next-bestseller",
        prevEl: ".swiper-button-prev-bestseller",
      },
    });

    // 5. News / Blog Swiper
    new Swiper(".swiper-news", {
      slidesPerView: 1,
      spaceBetween: 20,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next-news",
        prevEl: ".swiper-button-prev-news",
      },
      breakpoints: {
        576: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 4 },
      },
    });

    // 6. Flash Deals Swiper
    new Swiper(".swiper-products-deals", {
      slidesPerView: 1,
      spaceBetween: 20,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: ".swiper-button-next-deals",
        prevEl: ".swiper-button-prev-deals",
      },
      breakpoints: {
        576: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 4 },
      },
    });

    // 7. Testimonials Swiper
    new Swiper(".swiper-testimonials", {
      slidesPerView: 1,
      spaceBetween: 25,
      loop: true,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
      },
    });

    // 8. Top Vendors Swiper
    new Swiper(".swiper-vendors", {
      slidesPerView: 1,
      spaceBetween: 20,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next-vendors",
        prevEl: ".swiper-button-prev-vendors",
      },
      breakpoints: {
        576: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        992: { slidesPerView: 4 },
        1200: { slidesPerView: 5 },
      },
    });
  }

  // Pre-compiled Fallback Templates for local file:// view
  function getFallbackHeader(isSubpage) {
    const indexLink = isSubpage ? "../index.html" : "index.html";
    const shopLink = isSubpage ? "shop.html" : "pages/shop.html";
    const vendorsLink = isSubpage ? "vendors.html" : "pages/vendors.html";
    const contactLink = isSubpage ? "contact.html" : "pages/contact.html";
    const aboutLink = isSubpage ? "about.html" : "pages/about.html";
    const careerLink = isSubpage ? "career.html" : "pages/career.html";
    const loginLink = isSubpage ? "login.html" : "pages/login.html";
    const registerLink = isSubpage ? "register.html" : "pages/register.html";
    const logoPath = isSubpage
      ? "../assets/images/logoStackly.webp"
      : "assets/images/logoStackly.webp";

    return `
    <div class="topbar bg-dark py-2 border-bottom border-secondary text-light">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div class="menu-topbar-left mb-2 mb-md-0">
          <ul class="nav-small list-inline m-0">
            <li class="list-inline-item"><a class="font-xs text-light text-decoration-none" href="${aboutLink}">About Us</a></li>
            <li class="list-inline-item ms-3"><a class="font-xs text-light text-decoration-none" href="${careerLink}">Careers</a></li>
            <li class="list-inline-item ms-3"><a class="font-xs text-light text-decoration-none" href="${aboutLink}">Open a shop</a></li>
          </ul>
        </div>
        <div class="info-topbar text-center mb-2 mb-md-0 d-none d-lg-block">
          <span class="font-xs text-muted">Free shipping for all orders over </span><span class="font-sm-bold text-warning">$75.00</span>
        </div>
        <div class="menu-topbar-right d-flex align-items-center">
          <span class="font-xs text-muted me-2">Call Us:</span><span class="font-sm-bold text-success me-3">+ 1800 900</span>
          <span class="font-xs text-light"><i class="fa-solid fa-globe me-1"></i> English / USD</span>
        </div>
      </div>
    </div>
    <header class="header bg-blur py-3 shadow-sm border-bottom border-light">
      <div class="container">
        <div class="row align-items-center g-3">
          <div class="col-6 col-lg-2">
            <a href="${indexLink}" class="logo-link d-flex align-items-center text-decoration-none">
              <img src="${logoPath}" alt="Stackly Logo" class="logo-img" style="height: 38px; width: auto; object-fit: contain;" />
            </a>
          </div>
          <div class="col-12 col-lg-5 order-3 order-lg-2">
            <div class="input-group">
              <input class="form-control bg-light border-0" type="text" placeholder="Search for items...">
              <button class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i></button>
            </div>
          </div>
          <div class="col-6 col-lg-5 order-2 order-lg-3 d-flex justify-content-end align-items-center gap-3">
            <a class="header-action-btn text-decoration-none text-muted" href="#"><i class="fa-solid fa-code-compare fa-lg"></i></a>
            <a class="header-action-btn text-decoration-none text-muted position-relative" href="#"><i class="fa-regular fa-heart fa-lg"></i><span class="badge rounded-pill bg-primary position-absolute top-0 start-100 translate-middle font-xxs">5</span></a>
            <a class="header-action-btn text-decoration-none text-muted position-relative" href="#"><i class="fa-solid fa-cart-shopping fa-lg"></i><span class="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle font-xxs">2</span></a>
            <div class="d-none d-sm-flex align-items-center gap-2 ms-2">
              <a href="${loginLink}" class="btn btn-sm btn-outline-primary font-xs-bold px-3 py-2 rounded-3 text-decoration-none" style="transition: all 0.3s ease;">Log In</a>
              <a href="${registerLink}" class="btn btn-sm btn-primary font-xs-bold px-3 py-2 rounded-3 text-decoration-none text-white" style="transition: all 0.3s ease;">Register</a>
            </div>
          </div>
        </div>
      </div>
      <div class="header-bottom bg-light border-top border-light mt-3 py-2 d-none d-xl-block">
        <div class="container d-flex justify-content-between align-items-center">
          <div class="nav-links d-flex gap-4">
            <a class="text-dark font-sm-bold text-decoration-none" href="${indexLink}">Home</a>
            <a class="text-dark font-sm-bold text-decoration-none" href="${shopLink}">Electronics</a>
            <a class="text-dark font-sm-bold text-decoration-none" href="${shopLink}">Appliances</a>
            <a class="text-dark font-sm-bold text-decoration-none" href="${shopLink}">New Arrivals</a>
            <a class="text-dark font-sm-bold text-decoration-none" href="${vendorsLink}">Vendors</a>
            <a class="text-dark font-sm-bold text-decoration-none" href="${contactLink}">Contact</a>
          </div>
          <div class="special-offer-badge bg-gradient-orange text-white font-sm-bold px-3 py-2 rounded shadow-sm">
            <i class="fa-solid fa-fire me-1"></i> SPECIAL OFFER
          </div>
        </div>
      </div>
    </header>
    `;
  }

  function getFallbackFooter(isSubpage) {
    const aboutLink = isSubpage ? "about.html" : "pages/about.html";
    const careerLink = isSubpage ? "career.html" : "pages/career.html";
    const contactLink = isSubpage ? "contact.html" : "pages/contact.html";
    const logoPath = isSubpage
      ? "../assets/images/logoStackly.webp"
      : "assets/images/logoStackly.webp";

    return `
    <footer class="footer bg-dark text-light pt-5 pb-4 border-top border-secondary">
      <div class="container">
        <div class="row g-4 mb-4">
          <div class="col-lg-4 col-md-6 text-start">
            <a href="${isSubpage ? "../index.html" : "index.html"}" class="d-flex align-items-center text-decoration-none mb-3">
              <img src="${logoPath}" alt="Stackly Logo" class="logo-img" style="height: 38px; width: auto; object-fit: contain;" />
            </a>
            <p class="font-xs text-muted">Your premier multi-vendor marketplace theme styled beautifully with Bootstrap 5. Fast, responsive, and gorgeous.</p>
            <div class="font-xs text-muted">
              <div><strong>Address:</strong> 502 New Design Str,Melbourne, CA 94110</div>
              <div><strong>Phone:</strong> (+01) 123-456-789</div>
            </div>
          </div>
          <div class="col-lg-2 col-md-6">
            <h6 class="text-white mb-3 text-uppercase">Make Money</h6>
            <ul class="list-unstyled font-xs footer-menu">
              <li><a href="${aboutLink}" class="text-muted text-decoration-none">Mission & Vision</a></li>
              <li><a href="${careerLink}" class="text-muted text-decoration-none">Careers</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-md-6">
            <h6 class="text-white mb-3 text-uppercase">Company</h6>
            <ul class="list-unstyled font-xs footer-menu">
              <li><a href="${aboutLink}" class="text-muted text-decoration-none">Our Team</a></li>
              <li><a href="${contactLink}" class="text-muted text-decoration-none">Contact Us</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-6">
            <h6 class="text-white mb-3 text-uppercase">Subscribed newsletter</h6>
            <p class="font-xs text-muted">Get updates about our latest arrivals.</p>
            <div class="input-group">
              <input type="text" class="form-control form-control-sm border-0 bg-secondary text-white" placeholder="Your email...">
              <button class="btn btn-primary btn-sm">Subscribe</button>
            </div>
          </div>
        </div>
        <hr class="border-secondary">
        <div class="text-center font-xs text-muted pt-2">
          Copyright &copy; 2026 Stackly Market. All rights reserved.
        </div>
      </div>
    </footer>
    `;
  }

  // 6. Countdown Timer for Flash Deals
  function initCountdown() {
    const hoursEl = document.getElementById("countdown-hours");
    const minsEl = document.getElementById("countdown-minutes");
    const secsEl = document.getElementById("countdown-seconds");
    if (!hoursEl || !minsEl || !secsEl) return;

    // Set countdown to 14 hours from now safely
    let targetTime = null;
    try {
      targetTime = localStorage.getItem("flash_deal_target");
    } catch (e) {
      console.warn(
        "localStorage is not accessible, using temporary memory:",
        e,
      );
    }
    const now = new Date().getTime();

    if (!targetTime || parseInt(targetTime) < now) {
      targetTime = now + 14 * 60 * 60 * 1000; // 14 hours in milliseconds
      try {
        localStorage.setItem("flash_deal_target", targetTime);
      } catch (e) {}
    } else {
      targetTime = parseInt(targetTime);
    }

    function updateTimer() {
      const currentTime = new Date().getTime();
      const difference = targetTime - currentTime;

      if (difference <= 0) {
        try {
          localStorage.removeItem("flash_deal_target");
        } catch (e) {}
        initCountdown();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      hoursEl.textContent = String(hours).padStart(2, "0");
      minsEl.textContent = String(minutes).padStart(2, "0");
      secsEl.textContent = String(seconds).padStart(2, "0");

      requestAnimationFrame(updateTimer);
    }
    updateTimer();
  }

  // 7. Interactive Product Finder Filtering
  function initProductFinder() {
    const tabs = document.querySelectorAll(".finder-tab-btn");
    const items = document.querySelectorAll(".finder-product-item");
    if (!tabs.length || !items.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        const category = this.getAttribute("data-category");

        items.forEach((item) => {
          const itemCategory = item.getAttribute("data-category");
          if (category === "all" || itemCategory === category) {
            item.style.display = "block";
            item.style.animation = "none";
            item.offsetHeight; /* trigger reflow */
            item.style.animation = null;
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }
});
