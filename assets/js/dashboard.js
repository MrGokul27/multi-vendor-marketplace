document.addEventListener("DOMContentLoaded", function () {
  // ── Authentication & Session Checking ────────────────────────
  let userData = JSON.parse(sessionStorage.getItem("stackly_user"));

  // Preview Mode: If user directly opens dashboard.html, default to vendor for review purposes
  if (!userData) {
    console.warn(
      "No user found in sessionStorage. Initializing preview mode (Vendor).",
    );
    userData = {
      role: "vendor",
      email: "partner.apex@stackly.com",
      remember: false,
    };
    sessionStorage.setItem("stackly_user", JSON.stringify(userData));
  }

  const role = userData.role || "buyer";
  const email = userData.email || "guest@example.com";

  // Format name from email (e.g. partner.apex@stackly.com -> Partner Apex)
  function getNameFromEmail(emailAddress) {
    const prefix = emailAddress.split("@")[0];
    return prefix
      .split(/[\._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const userName = getNameFromEmail(email);
  const userInitials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2);

  // ── Update Header Profile & Chip ─────────────────────────────
  const avatarEl = document.getElementById("dashUserAvatar");
  const nameEl = document.getElementById("dashUserName");
  const roleEl = document.getElementById("dashUserRole");

  if (avatarEl) avatarEl.textContent = userInitials;
  if (nameEl) nameEl.textContent = userName;
  if (roleEl) {
    const rolesFormatted = {
      buyer: "Buyer Account",
      vendor: "Store Merchant",
      admin: "System Administrator",
    };
    roleEl.textContent = rolesFormatted[role] || "User";
  }

  // ── Update Sidebar Role Badge ────────────────────────────────
  const roleBadgeEl = document.getElementById("sidebarRoleBadge");
  if (roleBadgeEl) {
    let badgeHTML = "";
    if (role === "buyer") {
      badgeHTML = `
        <div class="role-icon"><i class="fa-solid fa-cart-shopping"></i></div>
        <div class="role-info">
          <div class="role-label">Account Type</div>
          <div class="role-name">Buyer</div>
        </div>
      `;
    } else if (role === "vendor") {
      badgeHTML = `
        <div class="role-icon"><i class="fa-solid fa-store"></i></div>
        <div class="role-info">
          <div class="role-label">Portal Access</div>
          <div class="role-name">Vendor</div>
        </div>
      `;
    } else if (role === "admin") {
      badgeHTML = `
        <div class="role-icon"><i class="fa-solid fa-user-shield"></i></div>
        <div class="role-info">
          <div class="role-label">Authorization</div>
          <div class="role-name">System Admin</div>
        </div>
      `;
    }
    roleBadgeEl.innerHTML = badgeHTML;
  }

  // ── Sidebar Navigation Configuration ─────────────────────────
  const navContainer = document.getElementById("dashNav");

  const navMenus = {
    buyer: [
      { id: "overview", label: "Dashboard", icon: "fa-solid fa-gauge" },
      { id: "orders", label: "My Orders", icon: "fa-solid fa-box", badge: "2" },
      { id: "wishlist", label: "My Wishlist", icon: "fa-solid fa-heart" },
      { id: "settings", label: "Account Settings", icon: "fa-solid fa-gears" },
    ],
    vendor: [
      {
        id: "overview",
        label: "Store Overview",
        icon: "fa-solid fa-chart-line",
      },
      {
        id: "products",
        label: "Products List",
        icon: "fa-solid fa-boxes-stacked",
      },
      {
        id: "orders",
        label: "Vendor Orders",
        icon: "fa-solid fa-truck-ramp-box",
        badge: "5",
      },
      { id: "profile", label: "Store Profile", icon: "fa-solid fa-shop" },
    ],
    admin: [
      {
        id: "overview",
        label: "System Overview",
        icon: "fa-solid fa-gauge-high",
      },
      { id: "users", label: "User Accounts", icon: "fa-solid fa-users" },
      {
        id: "approvals",
        label: "Product Approvals",
        icon: "fa-solid fa-clipboard-check",
        badge: "4",
      },
      { id: "system", label: "System Settings", icon: "fa-solid fa-sliders" },
    ],
  };

  const currentNavItems = navMenus[role] || navMenus.buyer;

  function renderSidebarNav(activeId) {
    if (!navContainer) return;

    let html = `<div class="dash-nav-section-label">Main Menu</div>`;
    currentNavItems.forEach((item) => {
      const activeClass = item.id === activeId ? "active" : "";
      const badgeHTML = item.badge
        ? `<span class="dash-nav-badge">${item.badge}</span>`
        : "";
      html += `
        <button class="dash-nav-item ${activeClass}" data-section="${item.id}">
          <i class="${item.icon}"></i>
          <span>${item.label}</span>
          ${badgeHTML}
        </button>
      `;
    });
    navContainer.innerHTML = html;

    // Attach click listeners
    navContainer.querySelectorAll(".dash-nav-item").forEach((button) => {
      button.addEventListener("click", function () {
        const sectionId = this.getAttribute("data-section");
        switchSection(sectionId);

        // Mobile auto-close drawer after clicking menu item
        const sidebar = document.getElementById("dashSidebar");
        const overlay = document.getElementById("dashOverlay");
        if (sidebar && sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
          overlay.classList.remove("show");
        }
      });
    });
  }

  // ── Sign Out Operation ───────────────────────────────────────
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("stackly_user");
      window.location.href = "login.html";
    });
  }

  // ── Mobile Sidebar Drawer Slide Events ────────────────────────
  const menuToggle = document.getElementById("menuToggle");
  const sidebarClose = document.getElementById("sidebarClose");
  const sidebarOverlay = document.getElementById("dashOverlay");
  const sidebar = document.getElementById("dashSidebar");

  if (menuToggle && sidebar && sidebarOverlay) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.add("open");
      sidebarOverlay.classList.add("show");
    });
  }

  if (sidebarClose && sidebar && sidebarOverlay) {
    sidebarClose.addEventListener("click", function () {
      sidebar.classList.remove("open");
      sidebarOverlay.classList.remove("show");
    });
  }

  if (sidebarOverlay && sidebar) {
    sidebarOverlay.addEventListener("click", function () {
      sidebar.classList.remove("open");
      sidebarOverlay.classList.remove("show");
    });
  }

  // ── Dynamic Memory Stores (State Variables) ──────────────────

  // Buyer Orders
  let buyerOrders = [
    {
      id: "ORD-8942",
      item: "Premium Leather Wallet",
      date: "July 14, 2026",
      price: 39.0,
      qty: 1,
      shipping: 4.99,
      status: "delivered",
      courier: "DHL Express",
      tracking: "DHL-9842881",
      address: "742 Evergreen Terrace, Springfield",
      timeline: [
        "Placed (Jul 14)",
        "Processed (Jul 14)",
        "Shipped (Jul 15)",
        "Delivered (Jul 16)",
      ],
    },
    {
      id: "ORD-8812",
      item: "Ergonomic Mechanical Keyboard",
      date: "July 10, 2026",
      price: 120.0,
      qty: 1,
      shipping: 0.0,
      status: "processing",
      courier: "FedEx Priority",
      tracking: "FDX-1120894",
      address: "742 Evergreen Terrace, Springfield",
      timeline: ["Placed (Jul 10)", "Processed (Jul 11)", "Awaiting Pickup"],
    },
    {
      id: "ORD-8703",
      item: "Noise-Cancelling Headphones",
      date: "June 28, 2026",
      price: 189.0,
      qty: 1,
      shipping: 8.5,
      status: "delivered",
      courier: "UPS Ground",
      tracking: "UPS-0089241",
      address: "742 Evergreen Terrace, Springfield",
      timeline: [
        "Placed (Jun 28)",
        "Processed (Jun 29)",
        "Shipped (Jun 30)",
        "Delivered (Jul 02)",
      ],
    },
    {
      id: "ORD-8611",
      item: "Smart Security Camera Node",
      date: "June 15, 2026",
      price: 79.0,
      qty: 2,
      shipping: 0.0,
      status: "cancelled",
      courier: "N/A",
      tracking: "N/A",
      address: "742 Evergreen Terrace, Springfield",
      timeline: ["Placed (Jun 15)", "Cancelled by customer (Jun 15)"],
    },
  ];

  // Buyer Wishlist
  let buyerWishlist = [
    {
      id: 201,
      name: "Sony WH-1000XM4 Headphones",
      price: 248.0,
      category: "Electronics",
      image: "fa-solid fa-headphones",
      rating: 4.8,
      stock: "In Stock",
    },
    {
      id: 202,
      name: "Kindle Paperwhite 16GB Slate",
      price: 139.0,
      category: "Electronics",
      image: "fa-solid fa-book-open",
      rating: 4.7,
      stock: "In Stock",
    },
    {
      id: 203,
      name: "Nike Air Max 270 Comfort",
      price: 150.0,
      category: "Apparel",
      image: "fa-solid fa-shoe-prints",
      rating: 4.5,
      stock: "Low Stock (2 left)",
    },
    {
      id: 204,
      name: "Solid Oak Floating Shelves",
      price: 65.0,
      category: "Furniture",
      image: "fa-solid fa-folder-open",
      rating: 4.6,
      stock: "In Stock",
    },
    {
      id: 205,
      name: "Cold Brew Glass Coffee Maker",
      price: 34.99,
      category: "Kitchen & Dining",
      image: "fa-solid fa-mug-hot",
      rating: 4.9,
      stock: "Out of Stock",
    },
  ];

  // Buyer profile
  let buyerProfile = {
    name: userName,
    email: email,
    phone: "+1 (555) 902-8833",
    address: "742 Evergreen Terrace, Springfield",
    billingAddress: "Same as shipping address",
    paymentMethod: "Visa ending in 8841",
  };

  // Vendor Products
  let vendorProducts = [
    {
      id: 101,
      sku: "WL-LTH-PRM",
      name: "Premium Leather Wallet",
      category: "Accessories",
      price: 39.0,
      stock: 12,
      sales: 48,
      status: "Active",
    },
    {
      id: 102,
      sku: "KB-MCH-ERG",
      name: "Ergonomic Mechanical Keyboard",
      category: "Electronics",
      price: 120.0,
      stock: 0,
      sales: 110,
      status: "Out of Stock",
    },
    {
      id: 103,
      sku: "CH-OFC-ERG",
      name: "Ergonomic Office Chair",
      category: "Furniture",
      price: 249.0,
      stock: 5,
      sales: 14,
      status: "Active",
    },
    {
      id: 104,
      sku: "HP-ANC-NOI",
      name: "Noise-Cancelling Headphones",
      category: "Electronics",
      price: 189.0,
      stock: 15,
      sales: 82,
      status: "Active",
    },
    {
      id: 105,
      sku: "DK-WOD-FLT",
      name: "Floating Oak Corner Desk",
      category: "Furniture",
      price: 320.0,
      stock: 3,
      sales: 6,
      status: "Pending Review",
    },
  ];

  // Vendor orders
  let vendorOrders = [
    {
      id: "ORD-9021",
      customer: "mary.johnson@example.com",
      date: "July 16, 2026",
      product: "Premium Leather Wallet",
      price: 39.0,
      qty: 1,
      status: "pending",
    },
    {
      id: "ORD-8942",
      customer: "buyer.john@example.com",
      date: "July 14, 2026",
      product: "Premium Leather Wallet",
      price: 39.0,
      qty: 1,
      status: "processing",
    },
    {
      id: "ORD-8812",
      customer: "buyer.john@example.com",
      date: "July 10, 2026",
      product: "Ergonomic Mechanical Keyboard",
      price: 120.0,
      qty: 1,
      status: "processing",
    },
    {
      id: "ORD-8703",
      customer: "buyer.dave@example.com",
      date: "June 28, 2026",
      product: "Noise-Cancelling Headphones",
      price: 189.0,
      qty: 1,
      status: "delivered",
    },
    {
      id: "ORD-8650",
      customer: "sarah.connor@example.com",
      date: "June 20, 2026",
      product: "Ergonomic Office Chair",
      price: 249.0,
      qty: 1,
      status: "delivered",
    },
  ];

  // Vendor Storefront settings
  let storeSettings = {
    name: "Apex Electronics & Goods",
    desc: "Premium consumer goods, ergonomics, and office accessories directly to your doorstep.",
    email: "partner.apex@stackly.com",
    phone: "+1 (555) 438-9241",
    address: "Bldg 4, Tech Park East, Boston, MA",
    shippingRate: 4.99,
    freeThreshold: 150.0,
    refundPolicy:
      "30-day money-back guarantee. Customer pays return shipping unless defective.",
    commissionTier: "Premium Partner Tier (8%)",
  };

  // Vendor store reviews
  let storeReviews = [
    {
      customer: "John D.",
      rating: 5,
      comment:
        "The mechanical keyboard exceeds expectations. Keys feel superb and ergonomic angle is perfect.",
      date: "July 15, 2026",
    },
    {
      customer: "Mary J.",
      rating: 4,
      comment:
        "Leather wallet smells nice and fits all cards. Shipping took 4 days.",
      date: "July 12, 2026",
    },
    {
      customer: "Dave K.",
      rating: 5,
      comment:
        "Outstanding service. The office chair arrived pre-assembled. Saved me hours!",
      date: "July 05, 2026",
    },
  ];

  // Admin users list
  let adminUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "buyer.john@example.com",
      role: "buyer",
      status: "Active",
      joined: "Jan 12, 2026",
    },
    {
      id: 2,
      name: "Apex Electronics & Goods",
      email: "partner.apex@stackly.com",
      role: "vendor",
      status: "Active",
      joined: "Feb 14, 2026",
    },
    {
      id: 3,
      name: "Mary Smith",
      email: "buyer.mary@example.com",
      role: "buyer",
      status: "Active",
      joined: "Mar 10, 2026",
    },
    {
      id: 4,
      name: "Zen Office Furniture",
      email: "vendor.zen@example.com",
      role: "vendor",
      status: "Suspended",
      joined: "Apr 22, 2026",
    },
    {
      id: 5,
      name: "Sarah Connor",
      email: "buyer.sarah@example.com",
      role: "buyer",
      status: "Active",
      joined: "May 05, 2026",
    },
    {
      id: 6,
      name: "Horizon Clothing Outlet",
      email: "vendor.horizon@example.com",
      role: "vendor",
      status: "Active",
      joined: "Jun 11, 2026",
    },
  ];

  // Admin Product Approval queue
  let adminApprovals = [
    {
      id: 301,
      vendor: "Horizon Clothing",
      product: "Organic Cotton Summer Dress",
      category: "Apparel",
      price: 65.0,
      sku: "AP-DRS-SUM",
      date: "July 16, 2026",
      desc: "Eco-friendly, breathable cotton wrap dress.",
    },
    {
      id: 302,
      vendor: "Horizon Clothing",
      product: "Relaxed Fit Denim Jacket",
      category: "Apparel",
      price: 95.0,
      sku: "AP-JKT-DNM",
      date: "July 16, 2026",
      desc: "Distressed denim button-up with sherpa lining.",
    },
    {
      id: 303,
      vendor: "Matrix Gadgets",
      product: "Ultra Slim Wireless Charger",
      category: "Electronics",
      price: 29.99,
      sku: "EL-CHG-WRL",
      date: "July 15, 2026",
      desc: "15W fast charge, Qi compatible magnetic base.",
    },
    {
      id: 304,
      vendor: "Green Life Farms",
      product: "Premium Matcha Powder 200g",
      category: "Food & Groceries",
      price: 34.5,
      sku: "FD-MTC-PRM",
      date: "July 14, 2026",
      desc: "Ceremonial grade pure Japanese Uji matcha.",
    },
  ];

  // Admin Audit Log entries
  let adminAuditLogs = [
    {
      time: "15:42",
      category: "Auth",
      text: "User buyer.john@example.com logged in successfully from IP 192.168.1.48",
    },
    {
      time: "15:20",
      category: "Catalog",
      text: "Vendor Horizon Clothing submitted a new product review request (SUM-DRS)",
    },
    {
      time: "14:55",
      category: "System",
      text: "Database connection pools optimized. Average response latency dropped to 1.4ms",
    },
    {
      time: "13:10",
      category: "Payouts",
      text: "Automated payouts scheduled: $14,240 transferred to merchant Apex Goods",
    },
    {
      time: "11:05",
      category: "Security",
      text: "Account vendor.zen@example.com suspended due to unpaid platform commission invoice",
    },
  ];

  // Admin platform variables
  let systemSettings = {
    commissionFee: 8.5,
    maintenanceMode: false,
    registrationMode: "auto-approve-buyer-verify-vendor",
    smtpStatus: "Connected",
    ipBlocklist: "45.120.21.14, 185.22.41.9",
    vendorAutoPayout: true,
  };

  // ── Switch Main Content (SPA Router) ──────────────────────────
  function switchSection(sectionId) {
    const pageTitleEl = document.getElementById("dashPageTitle");
    const contentEl = document.getElementById("dashContent");
    if (!contentEl) return;

    // Redraw active state in sidebar
    renderSidebarNav(sectionId);

    // Update Page Header Title
    const activeMenuItem = currentNavItems.find((i) => i.id === sectionId);
    if (pageTitleEl && activeMenuItem) {
      pageTitleEl.textContent = activeMenuItem.label;
    }

    // Render Role Submenus
    if (role === "buyer") {
      switchBuyerSection(sectionId, contentEl);
    } else if (role === "vendor") {
      switchVendorSection(sectionId, contentEl);
    } else if (role === "admin") {
      switchAdminSection(sectionId, contentEl);
    }
  }

  // ── BUYER CONTROLLERS ────────────────────────────────────────
  function switchBuyerSection(sectionId, container) {
    if (sectionId === "overview") {
      container.innerHTML = `
        <!-- Welcome Banner -->
        <div class="dash-welcome-banner">
          <div class="dash-welcome-text">
            <h2>Welcome back, <span>${userName}</span>!</h2>
            <p>Your transactions, order shipping updates, and wishlisted products are loaded. Discover brand new releases on Stackly today!</p>
          </div>
          <div class="dash-welcome-actions">
            <button class="btn-theme-primary" id="btnBrowseShop"><i class="fa-solid fa-magnifying-glass"></i> Shop Marketplace</button>
            <button class="btn-theme-outline" id="btnEditSettings"><i class="fa-solid fa-user-pen"></i> Settings</button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-green"><i class="fa-solid fa-truck"></i></div>
              <div class="stat-value">${buyerOrders.length}</div>
              <div class="stat-label">Orders Placed</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +2 this month</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-orange"><i class="fa-solid fa-credit-card"></i></div>
              <div class="stat-value">$${buyerOrders.reduce((sum, o) => sum + o.price * o.qty, 0).toFixed(2)}</div>
              <div class="stat-label">Total Expended</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +12% vs May</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-purple"><i class="fa-solid fa-heart"></i></div>
              <div class="stat-value">${buyerWishlist.length}</div>
              <div class="stat-label">Wishlist Items</div>
              <span class="stat-trend trend-flat"><i class="fa-solid fa-minus"></i> Stable</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-blue"><i class="fa-solid fa-award"></i></div>
              <div class="stat-value">350</div>
              <div class="stat-label">Loyalty Points</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +50 pts</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Recent Orders Card -->
          <div class="col-12 col-lg-8">
            <div class="dash-section-card h-100">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-history"></i> Recent Transactions</h5>
                <button class="btn-theme-link" id="btnViewAllOrders">View All <i class="fa-solid fa-arrow-right"></i></button>
              </div>
              <div class="dash-section-card-body p-0">
                <div class="table-responsive">
                  <table class="dash-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Item Description</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${buyerOrders
                        .map(
                          (o) => `
                        <tr>
                          <td class="fw-bold text-dark">${o.id}</td>
                          <td>${o.item}</td>
                          <td>${o.date}</td>
                          <td class="fw-bold">$${(o.price * o.qty).toFixed(2)}</td>
                          <td>
                            <span class="status-badge status-${o.status}">
                              ${o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Promos -->
          <div class="col-12 col-lg-4">
            <div class="dash-section-card h-100">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-ticket text-danger"></i> Exclusive Promos</h5>
              </div>
              <div class="dash-section-card-body">
                <div class="p-3 rounded border border-warning mb-3 bg-light" style="border-style: dashed !important;">
                  <span class="font-xs-bold d-block text-dark mb-1">Coupon Vouchers</span>
                  <span class="display-6 text-primary fw-bold font-md d-block">STACKLY20</span>
                  <span class="font-xs text-muted d-block mt-1">Get 20% off from verified vendors at checkout! Valid till Jul 31.</span>
                </div>
                <div class="dash-activity-list">
                  <h6 class="font-xs-bold text-dark mb-2 mt-2">Recommended Vendors</h6>
                  <li class="dash-activity-item py-2">
                    <div class="dash-activity-icon bg-light text-primary" style="border: 1px solid var(--border-color)">
                      <i class="fa-solid fa-laptop-code"></i>
                    </div>
                    <div class="dash-activity-text">
                      <strong>Apex Electronics & Goods</strong>
                      <span>High-grade ergonomics & gadgets</span>
                    </div>
                    <div class="dash-activity-time">
                      <button class="btn btn-outline-primary btn-sm rounded-pill font-xxs px-2 border-0" onclick="window.location.href='404.html'">Visit</button>
                    </div>
                  </li>
                  <li class="dash-activity-item py-2">
                    <div class="dash-activity-icon bg-light text-success" style="border: 1px solid var(--border-color)">
                      <i class="fa-solid fa-shirt"></i>
                    </div>
                    <div class="dash-activity-text">
                      <strong>Horizon Clothing Outlet</strong>
                      <span>Premium organic cotton apparel</span>
                    </div>
                    <div class="dash-activity-time">
                      <button class="btn btn-outline-primary btn-sm rounded-pill font-xxs px-2 border-0" onclick="window.location.href='404.html'">Visit</button>
                    </div>
                  </li>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Links
      document.getElementById("btnBrowseShop").addEventListener("click", () => {
        window.location.href = "404.html";
      });
      document
        .getElementById("btnEditSettings")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
      document
        .getElementById("btnViewAllOrders")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
    } else if (sectionId === "orders") {
      container.innerHTML = `
        <div class="row g-4">
          <div class="col-12 col-lg-7">
            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-box-open text-primary"></i> Order List</h5>
              </div>
              <div class="dash-section-card-body p-0">
                <div class="table-responsive">
                  <table class="dash-table" id="tblBuyerOrdersList">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product Title</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Fulfillment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${buyerOrders
                        .map(
                          (o) => `
                        <tr>
                          <td class="fw-bold">${o.id}</td>
                          <td>${o.item}</td>
                          <td>${o.date}</td>
                          <td class="fw-bold">$${(o.price * o.qty).toFixed(2)}</td>
                          <td>
                            <span class="status-badge status-${o.status}">
                              ${o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button class="btn btn-theme-success py-1 px-3" onclick="window.viewBuyerOrderDetails('${o.id}')">Details</button>
                          </td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-5" id="buyerOrderDetailsCard">
            <!-- Details loaded dynamically here -->
            <div class="dash-section-card text-center py-5">
              <div class="dash-section-card-body">
                <div class="display-6 text-muted mb-3"><i class="fa-solid fa-receipt"></i></div>
                <h6 class="fw-bold text-dark">No Order Selected</h6>
                <p class="font-xs text-muted">Click the "Details" button in the order table to review real-time shipping logs, tracking codes, and billing information.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Helper function to view specific order details
      window.viewBuyerOrderDetails = function (orderId) {
        const order = buyerOrders.find((o) => o.id === orderId);
        const card = document.getElementById("buyerOrderDetailsCard");
        if (!order || !card) return;

        let statusText = order.status.toUpperCase();
        let trackerHTML = "";

        if (order.status === "cancelled") {
          trackerHTML = `
            <div class="p-3 mb-3 bg-light border rounded text-danger text-center">
              <i class="fa-solid fa-circle-xmark me-2"></i> This transaction has been cancelled. Refund has been posted.
            </div>
          `;
        } else {
          // Render progress stepper
          trackerHTML = `
            <div class="mb-4">
              <h6 class="font-xs-bold text-dark mb-3"><i class="fa-solid fa-location-dot"></i> Live Shipping Tracker</h6>
              <div class="d-flex justify-content-between align-items-center position-relative">
                <div class="text-center font-xxs">
                  <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto" style="width:24px; height:24px;"><i class="fa-solid fa-check text-white"></i></div>
                  <span class="d-block mt-1 fw-bold">Placed</span>
                </div>
                <div class="text-center font-xxs">
                  <div class="rounded-circle ${order.status !== "pending" ? "bg-success text-white" : "bg-secondary text-white"} d-flex align-items-center justify-content-center mx-auto" style="width:24px; height:24px;">
                    ${order.status !== "pending" ? '<i class="fa-solid fa-check text-white"></i>' : '<i class="fa-solid fa-clock"></i>'}
                  </div>
                  <span class="d-block mt-1">Processed</span>
                </div>
                <div class="text-center font-xxs">
                  <div class="rounded-circle ${order.status === "delivered" ? "bg-success text-white" : "bg-secondary text-white"} d-flex align-items-center justify-content-center mx-auto" style="width:24px; height:24px;">
                    ${order.status === "delivered" ? '<i class="fa-solid fa-check text-white"></i>' : '<i class="fa-solid fa-truck"></i>'}
                  </div>
                  <span class="d-block mt-1">Shipped</span>
                </div>
              </div>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="dash-section-card">
            <div class="dash-section-card-header bg-light">
              <h5 class="m-0"><i class="fa-solid fa-receipt text-primary"></i> Receipt: ${order.id}</h5>
            </div>
            <div class="dash-section-card-body">
              <div class="mb-3 d-flex justify-content-between">
                <span class="font-xs-bold text-dark">Status:</span>
                <span class="status-badge status-${order.status}">${statusText}</span>
              </div>
              <div class="mb-3">
                <span class="font-xs-bold text-dark d-block mb-1">Product Details:</span>
                <span class="font-sm text-secondary">${order.qty}x ${order.item}</span>
              </div>
              <div class="row g-2 mb-3 bg-light p-2 rounded">
                <div class="col-6 font-xs text-muted">Item Subtotal:</div>
                <div class="col-6 text-end font-xs-bold text-dark">$${(order.price * order.qty).toFixed(2)}</div>
                <div class="col-6 font-xs text-muted">Shipping Fee:</div>
                <div class="col-6 text-end font-xs-bold text-dark">$${order.shipping.toFixed(2)}</div>
                <div class="col-6 font-xs text-muted">Total Paid:</div>
                <div class="col-6 text-end font-sm-bold text-primary">$${(order.price * order.qty + order.shipping).toFixed(2)}</div>
              </div>
              <div class="mb-3">
                <span class="font-xs-bold text-dark d-block">Courier Logistics:</span>
                <span class="font-xs text-secondary d-block">Partner: <strong>${order.courier}</strong></span>
                <span class="font-xs text-secondary d-block">Tracking ID: <code>${order.tracking}</code></span>
              </div>
              <div class="mb-3">
                <span class="font-xs-bold text-dark d-block">Destination Address:</span>
                <span class="font-xs text-secondary">${order.address}</span>
              </div>
              <hr class="my-3">
              ${trackerHTML}
            </div>
          </div>
        `;
      };
    } else if (sectionId === "wishlist") {
      container.innerHTML = `
        <div class="dash-section-card mb-4">
          <div class="dash-section-card-header">
            <h5><i class="fa-solid fa-heart text-danger"></i> Favorited items</h5>
          </div>
          <div class="dash-section-card-body">
            <p class="font-xs text-muted mb-4">Manage products that you bookmarked. You can immediately push them to checkout cart or remove from list.</p>
            <div class="row g-4" id="wishlistGrid">
              ${buyerWishlist
                .map(
                  (w) => `
                <div class="col-12 col-md-6 col-lg-4" id="wish-item-${w.id}">
                  <div class="dash-section-card border h-100">
                    <div class="dash-section-card-body text-center py-4 d-flex flex-column justify-content-between h-100">
                      <div>
                        <div class="display-6 text-primary mb-3"><i class="${w.image}"></i></div>
                        <h6 class="fw-bold text-dark">${w.name}</h6>
                        <span class="badge bg-light text-primary border font-xxs px-2 py-1 mb-2">${w.category}</span>
                        <p class="text-primary fw-bold font-sm mb-2">$${w.price.toFixed(2)}</p>
                        <p class="text-muted font-xs">Rating: ⭐ ${w.rating}</p>
                      </div>
                      <div class="mt-3">
                        <div class="d-flex justify-content-center gap-2">
                          <button class="btn btn-theme-primary" onclick="window.location.href='404.html'">
                            <i class="fa-solid fa-cart-plus me-1"></i> Add to Cart
                          </button>
                          <button class="btn btn-theme-danger" onclick="document.getElementById('wish-item-${w.id}').remove();">
                            <i class="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
    } else if (sectionId === "settings") {
      container.innerHTML = `
        <div class="row g-4">
          <div class="col-12 col-md-8">
            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-user-gear"></i> Update Profile Credentials</h5>
              </div>
              <div class="dash-section-card-body">
                <form id="buyerProfileForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Full Name</label>
                      <input type="text" class="form-control" value="${buyerProfile.name}" id="profName" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Email Address</label>
                      <input type="email" class="form-control" value="${buyerProfile.email}" id="profEmail" readonly>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Phone Number</label>
                      <input type="text" class="form-control" value="${buyerProfile.phone}" id="profPhone">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Default Delivery Address</label>
                      <input type="text" class="form-control" value="${buyerProfile.address}" id="profAddress" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Billing Address</label>
                      <input type="text" class="form-control" value="${buyerProfile.billingAddress}" id="profBilling">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Preferred Payment Method</label>
                      <input type="text" class="form-control" value="${buyerProfile.paymentMethod}" id="profPayment">
                    </div>
                  </div>
                  <button class="btn btn-theme-primary mt-4" onclick="window.location.href='404.html'">Save Profile Configuration</button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="dash-section-card mb-4">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-lock"></i> Security Credentials</h5>
              </div>
              <div class="dash-section-card-body text-center py-4">
                <div class="display-6 text-warning mb-2"><i class="fa-solid fa-shield-halved"></i></div>
                <h6 class="fw-bold">Password Reset</h6>
                <p class="font-xs text-muted">We strongly recommend updating security passwords regularly to prevent account hijack.</p>
                <button class="btn btn-theme-warning w-100 mt-2" onclick="window.location.href='404.html'">
                  Configure Password
                </button>
              </div>
            </div>

            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-circle-info"></i> Loyalty Tier</h5>
              </div>
              <div class="dash-section-card-body p-3 text-center">
                <span class="badge bg-success font-xxs px-3 py-1 mb-2">Stackly Silver VIP</span>
                <p class="font-xs text-muted m-0">You get access to a flat 5% off shipping on all orders over $75 from any store merchant.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Profile save logic
      document
        .getElementById("buyerProfileForm")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          buyerProfile.name = document.getElementById("profName").value;
          buyerProfile.phone = document.getElementById("profPhone").value;
          buyerProfile.address = document.getElementById("profAddress").value;
          buyerProfile.billingAddress =
            document.getElementById("profBilling").value;
          buyerProfile.paymentMethod =
            document.getElementById("profPayment").value;

          // Sync visual name
          if (nameEl) nameEl.textContent = buyerProfile.name;
        });
    }
  }

  // ── VENDOR CONTROLLERS ───────────────────────────────────────
  function switchVendorSection(sectionId, container) {
    if (sectionId === "overview") {
      container.innerHTML = `
        <!-- Welcome Banner -->
        <div class="dash-welcome-banner">
          <div class="dash-welcome-text">
            <h2>Welcome to your Merchant Portal, <span>${storeSettings.name}</span>!</h2>
            <p>Your storefront analytics are loaded. Platform payouts are ready for execution, and your stock levels are synchronized.</p>
          </div>
          <div class="dash-welcome-actions">
            <button class="btn-theme-primary" id="btnQuickAdd"><i class="fa-solid fa-plus"></i> Add Product</button>
            <button class="btn-theme-outline" id="btnStoreConfig"><i class="fa-solid fa-store"></i> Edit Shop Details</button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-green"><i class="fa-solid fa-piggy-bank"></i></div>
              <div class="stat-value">$${vendorProducts.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div class="stat-label">Inventory Asset Value</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +4.5% vs last week</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-orange"><i class="fa-solid fa-truck-ramp-box"></i></div>
              <div class="stat-value">${vendorOrders.filter((o) => o.status === "processing").length}</div>
              <div class="stat-label">Pending Shipments</div>
              <span class="stat-trend trend-down"><i class="fa-solid fa-circle-exclamation text-warning"></i> Action Required</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-blue"><i class="fa-solid fa-boxes-packing"></i></div>
              <div class="stat-value">${vendorProducts.length}</div>
              <div class="stat-label">Active Catalogs</div>
              <span class="stat-trend trend-flat"><i class="fa-solid fa-minus"></i> Stable listings</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-purple"><i class="fa-solid fa-star"></i></div>
              <div class="stat-value">4.9 / 5.0</div>
              <div class="stat-label">Merchant Store Rating</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> Excellent</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Recent Orders for Vendor -->
          <div class="col-12 col-lg-8">
            <div class="dash-section-card h-100">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-truck"></i> Incoming Shop Orders</h5>
                <button class="btn-theme-link" id="btnManageOrders">Fulfillment Centre <i class="fa-solid fa-arrow-right"></i></button>
              </div>
              <div class="dash-section-card-body p-0">
                <div class="table-responsive">
                  <table class="dash-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Buyer Account</th>
                        <th>Product Item</th>
                        <th>Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${vendorOrders
                        .slice(0, 3)
                        .map(
                          (o) => `
                        <tr>
                          <td class="fw-bold">${o.id}</td>
                          <td>${o.customer}</td>
                          <td>1x ${o.product}</td>
                          <td class="fw-bold">$${o.price.toFixed(2)}</td>
                          <td><span class="status-badge status-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stock Alert Panel -->
          <div class="col-12 col-lg-4">
            <div class="dash-section-card h-100">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-star text-warning"></i> Customer Feedback</h5>
              </div>
              <div class="dash-section-card-body">
                <div class="dash-activity-list">
                  ${storeReviews
                    .map(
                      (r) => `
                    <li class="dash-activity-item py-2">
                      <div class="dash-activity-icon bg-light text-warning" style="border: 1px solid var(--border-color)">
                        <i class="fa-solid fa-star"></i>
                      </div>
                      <div class="dash-activity-text">
                        <strong>${r.customer} — ${"⭐".repeat(r.rating)}</strong>
                        <span class="font-xs">"${r.comment}"</span>
                      </div>
                      <div class="dash-activity-time">${r.date.split(",")[0]}</div>
                    </li>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Links
      document.getElementById("btnQuickAdd").addEventListener("click", () => {
        window.location.href = "404.html";
      });
      document
        .getElementById("btnStoreConfig")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
      document
        .getElementById("btnManageOrders")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
    } else if (sectionId === "products") {
      container.innerHTML = `
        <div class="dash-section-card mb-4">
          <div class="dash-section-card-header">
            <h5><i class="fa-solid fa-boxes-stacked"></i> Store Inventory Catalog</h5>
            <button class="btn btn-theme-primary" id="btnToggleAddProductForm">
              <i class="fa-solid fa-plus me-1"></i> Register Product
            </button>
          </div>
          <div class="dash-section-card-body">
            <!-- Add Product Sub-form (Interactive Drawer) -->
            <div id="addProductContainer" class="p-3 mb-4 rounded-3 border bg-light" style="display: none;">
              <h6 class="fw-bold mb-3"><i class="fa-solid fa-circle-plus text-primary"></i> Register New Listing</h6>
              <form id="frmVendorAddProduct">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label font-xs-bold">Product Name</label>
                    <input type="text" class="form-control form-control-sm" id="newProdName" required placeholder="e.g. Ergonomic Footrest">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label font-xs-bold">SKU Code</label>
                    <input type="text" class="form-control form-control-sm" id="newProdSKU" required placeholder="EL-FTR-ERG">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label font-xs-bold">Category</label>
                    <select class="form-select form-select-sm" id="newProdCat" required>
                      <option value="Electronics">Electronics</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Apparel">Apparel</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label font-xs-bold">Unit Price ($)</label>
                    <input type="number" step="0.01" class="form-control form-control-sm" id="newProdPrice" required placeholder="59.99">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label font-xs-bold">Stock Qty</label>
                    <input type="number" class="form-control form-control-sm" id="newProdStock" required placeholder="10">
                  </div>
                </div>
                <div class="mt-3">
                  <button type="submit" class="btn btn-theme-primary me-2">Save Listing</button>
                  <button type="button" class="btn btn-theme-secondary" id="btnCancelAdd">Cancel</button>
                </div>
              </form>
            </div>

            <!-- Product Table -->
            <div class="table-responsive">
              <table class="dash-table" id="tblVendorProducts">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sales</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderVendorProductsTableRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Toggle Add Product form drawer
      const addContainer = document.getElementById("addProductContainer");
      document
        .getElementById("btnToggleAddProductForm")
        .addEventListener("click", () => {
          addContainer.style.display =
            addContainer.style.display === "none" ? "block" : "none";
        });
      document.getElementById("btnCancelAdd").addEventListener("click", () => {
        addContainer.style.display = "none";
      });

      // Submit new product
      document
        .getElementById("frmVendorAddProduct")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          const newProduct = {
            id: vendorProducts.length + 101,
            sku: document.getElementById("newProdSKU").value.toUpperCase(),
            name: document.getElementById("newProdName").value,
            category: document.getElementById("newProdCat").value,
            price: parseFloat(document.getElementById("newProdPrice").value),
            stock: parseInt(document.getElementById("newProdStock").value),
            sales: 0,
            status:
              parseInt(document.getElementById("newProdStock").value) > 0
                ? "Active"
                : "Out of Stock",
          };
          vendorProducts.push(newProduct);

          // Redraw
          document.querySelector("#tblVendorProducts tbody").innerHTML =
            renderVendorProductsTableRows();
          addContainer.style.display = "none";
          this.reset();
        });

      // Delete handler hook
      window.deleteVendorProduct = function (id) {
        window.location.href = "404.html";
      };
    } else if (sectionId === "orders") {
      container.innerHTML = `
        <div class="dash-section-card">
          <div class="dash-section-card-header">
            <h5><i class="fa-solid fa-truck-loading"></i> Order Fulfillment Centre</h5>
          </div>
          <div class="dash-section-card-body p-0">
            <div class="table-responsive">
              <table class="dash-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer Account</th>
                    <th>Date</th>
                    <th>Product Title</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${vendorOrders
                    .map((o) => {
                      let actionButtonHTML = "";
                      if (o.status === "pending") {
                        actionButtonHTML = `
                        <button class="btn btn-theme-success" onclick="window.processVendorOrder('${o.id}', 'processing')">
                          Accept
                        </button>
                        <button class="btn btn-theme-danger" onclick="window.processVendorOrder('${o.id}', 'cancelled')">
                          Cancel
                        </button>
                      `;
                      } else if (o.status === "processing") {
                        actionButtonHTML = `
                        <button class="btn btn-theme-primary" onclick="window.processVendorOrder('${o.id}', 'delivered')">
                          <i class="fa-solid fa-truck me-1"></i> Dispatched
                        </button>
                      `;
                      } else {
                        actionButtonHTML = `<span class="text-success font-xs"><i class="fa-solid fa-circle-check"></i> Complete</span>`;
                      }

                      return `
                      <tr>
                        <td class="fw-bold">${o.id}</td>
                        <td>${o.customer}</td>
                        <td>${o.date}</td>
                        <td>1x ${o.product}</td>
                        <td class="fw-bold">$${o.price.toFixed(2)}</td>
                        <td><span class="status-badge status-${o.status}" id="ven-status-${o.id}">${o.status.toUpperCase()}</span></td>
                        <td id="ven-action-${o.id}">${actionButtonHTML}</td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Order action processing
      window.processVendorOrder = function (id, nextState) {
        const order = vendorOrders.find((o) => o.id === id);
        if (!order) return;

        order.status = nextState;
        switchSection("orders");
      };
    } else if (sectionId === "profile") {
      container.innerHTML = `
        <div class="row g-4">
          <div class="col-12 col-md-8">
            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-shop"></i> Storefront Details</h5>
              </div>
              <div class="dash-section-card-body">
                <form id="frmVendorProfile">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Store Brand Name</label>
                      <input type="text" class="form-control" id="storeName" value="${storeSettings.name}" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Vendor Support Email</label>
                      <input type="email" class="form-control" id="storeEmail" value="${storeSettings.email}" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Store Phone Line</label>
                      <input type="text" class="form-control" id="storePhone" value="${storeSettings.phone}">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Physical Warehouse Address</label>
                      <input type="text" class="form-control" id="storeAddr" value="${storeSettings.address}">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Flat Shipping Fee Rate ($)</label>
                      <input type="number" step="0.01" class="form-control" id="storeShipping" value="${storeSettings.shippingRate}" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Free Shipping Threshold ($)</label>
                      <input type="number" step="0.01" class="form-control" id="storeFreeThresh" value="${storeSettings.freeThreshold}" required>
                    </div>
                    <div class="col-12">
                      <label class="form-label font-xs-bold">Refund Policy Statement</label>
                      <textarea class="form-control" id="storeRefund" rows="2">${storeSettings.refundPolicy}</textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label font-xs-bold">Shop Description Tagline</label>
                      <textarea class="form-control" id="storeDesc" rows="3">${storeSettings.desc}</textarea>
                    </div>
                  </div>
                  <button class="btn btn-theme-primary mt-3" onclick="window.location.href='404.html'">Save Store details</button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-shield"></i> Payout Configuration</h5>
              </div>
              <div class="dash-section-card-body text-center py-4">
                <div class="display-6 text-success mb-2"><i class="fa-solid fa-money-bill-transfer"></i></div>
                <h6 class="fw-bold">Automatic payouts</h6>
                <p class="font-xs text-muted mb-1">Commission Tier: <strong>${storeSettings.commissionTier}</strong></p>
                <p class="font-xs text-muted">Weekly earnings are deposited to your linked bank account every Monday at 00:00 UTC.</p>
                <button class="btn btn-theme-success w-100 mt-2" onclick="window.location.href='404.html'">
                  Manage Bank Details
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Save storefront settings
      document
        .getElementById("frmVendorProfile")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          storeSettings.name = document.getElementById("storeName").value;
          storeSettings.email = document.getElementById("storeEmail").value;
          storeSettings.phone = document.getElementById("storePhone").value;
          storeSettings.address = document.getElementById("storeAddr").value;
          storeSettings.shippingRate = parseFloat(
            document.getElementById("storeShipping").value,
          );
          storeSettings.freeThreshold = parseFloat(
            document.getElementById("storeFreeThresh").value,
          );
          storeSettings.refundPolicy =
            document.getElementById("storeRefund").value;
          storeSettings.desc = document.getElementById("storeDesc").value;

          // Sync header name
          if (nameEl) nameEl.textContent = storeSettings.name;
        });
    }
  }

  // Vendor product rows builder
  function renderVendorProductsTableRows() {
    return vendorProducts
      .map((p) => {
        let statusBadgeClass = "status-active";
        if (p.status === "Out of Stock") statusBadgeClass = "status-cancelled";
        else if (p.status === "Pending Review")
          statusBadgeClass = "status-review";

        return `
        <tr>
          <td>${p.id}</td>
          <td><code>${p.sku}</code></td>
          <td class="fw-bold text-dark">${p.name}</td>
          <td>${p.category}</td>
          <td class="fw-bold">$${p.price.toFixed(2)}</td>
          <td>${p.stock} units</td>
          <td>${p.sales} sales</td>
          <td><span class="status-badge ${statusBadgeClass}">${p.status}</span></td>
          <td>
            <button class="btn btn-theme-danger" onclick="window.deleteVendorProduct(${p.id})">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  // ── ADMINISTRATOR CONTROLLERS ────────────────────────────────
  function switchAdminSection(sectionId, container) {
    if (sectionId === "overview") {
      container.innerHTML = `
        <!-- Welcome Banner -->
        <div class="dash-welcome-banner">
          <div class="dash-welcome-text">
            <h2>Welcome back, <span>Administrator</span>!</h2>
            <p>System engines running nominal. Platform traffic is up 4% today, with zero server warnings flagged.</p>
          </div>
          <div class="dash-welcome-actions">
            <button class="btn-theme-primary" id="btnAdminApprovals"><i class="fa-solid fa-clipboard-check"></i> Review Requests</button>
            <button class="btn-theme-outline" id="btnAdminSettings"><i class="fa-solid fa-sliders"></i> Platform Settings</button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-orange"><i class="fa-solid fa-hand-holding-dollar"></i></div>
              <div class="stat-value">$${(98450).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div class="stat-label">Total Platform Revenue</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +8.4% this month</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-green"><i class="fa-solid fa-users-gear"></i></div>
              <div class="stat-value">${adminUsers.filter((u) => u.role === "vendor").length}</div>
              <div class="stat-label">Active Vendor Accounts</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +3 this week</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-blue"><i class="fa-solid fa-users"></i></div>
              <div class="stat-value">${adminUsers.filter((u) => u.role === "buyer").length}</div>
              <div class="stat-label">Registered Buyers</div>
              <span class="stat-trend trend-up"><i class="fa-solid fa-arrow-up"></i> +12 today</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="dash-stat-card">
              <div class="stat-icon stat-icon-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <div class="stat-value" id="countPendingReviews">${adminApprovals.length}</div>
              <div class="stat-label">Approvals Pending</div>
              <span class="stat-trend trend-down"><i class="fa-solid fa-arrow-down"></i> Attention Required</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Pending Approvals Snippet -->
          <div class="col-12 col-lg-7">
            <div class="dash-section-card h-100">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-hourglass-start"></i> Pending Product Approvals</h5>
                <button class="btn-theme-link" id="btnLinkApprovals">Review Queue <i class="fa-solid fa-arrow-right"></i></button>
              </div>
              <div class="dash-section-card-body p-0">
                <div class="table-responsive">
                  <table class="dash-table" id="tblAdminOverviewApprovals">
                    <thead>
                      <tr>
                        <th>Vendor Partner</th>
                        <th>Product Proposed</th>
                        <th>Price</th>
                        <th>Submitted</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${renderAdminApprovalsRows(true)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Server Health Stats -->
          <div class="col-12 col-lg-5">
            <div class="dash-section-card h-100">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-circle-nodes text-success"></i> System Health Logs</h5>
              </div>
              <div class="dash-section-card-body">
                <div class="dash-progress-item">
                  <div class="dash-progress-label">
                    <span>CPU Core Utilization</span>
                    <span>38%</span>
                  </div>
                  <div class="dash-progress-track">
                    <div class="dash-progress-fill" style="width: 38%"></div>
                  </div>
                </div>
                <div class="dash-progress-item">
                  <div class="dash-progress-label">
                    <span>Database Memory Allocated</span>
                    <span>54%</span>
                  </div>
                  <div class="dash-progress-track">
                    <div class="dash-progress-fill" style="width: 54%"></div>
                  </div>
                </div>
                <div class="dash-progress-item">
                  <div class="dash-progress-label">
                    <span>API Server Response Latency</span>
                    <span>12ms</span>
                  </div>
                  <div class="dash-progress-track">
                    <div class="dash-progress-fill" style="width: 12%"></div>
                  </div>
                </div>

                <div class="mt-4 p-3 bg-light rounded border text-center">
                  <span class="font-xs-bold d-block text-dark mb-1">Commission Platform Profit Rate</span>
                  <span class="display-6 text-primary fw-bold font-md">${systemSettings.commissionFee}% per checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event handlers
      document
        .getElementById("btnAdminApprovals")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
      document
        .getElementById("btnAdminSettings")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
      document
        .getElementById("btnLinkApprovals")
        .addEventListener("click", () => {
          window.location.href = "404.html";
        });
    } else if (sectionId === "users") {
      container.innerHTML = `
        <div class="dash-section-card">
          <div class="dash-section-card-header">
            <h5><i class="fa-solid fa-users"></i> Platform User Database</h5>
          </div>
          <div class="dash-section-card-body p-0">
            <div class="table-responsive">
              <table class="dash-table" id="tblAdminUsers">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Account Identifier / Name</th>
                    <th>Primary Email</th>
                    <th>Access Role</th>
                    <th>Joined Date</th>
                    <th>Activity Status</th>
                    <th>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderAdminUsersRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Active status toggling
      window.toggleAdminUserStatus = function (id) {
        const u = adminUsers.find((user) => user.id === id);
        if (u) {
          u.status = u.status === "Active" ? "Suspended" : "Active";
          document.querySelector("#tblAdminUsers tbody").innerHTML =
            renderAdminUsersRows();
        }
      };
    } else if (sectionId === "approvals") {
      container.innerHTML = `
        <div class="dash-section-card">
          <div class="dash-section-card-header">
            <h5><i class="fa-solid fa-check-double text-primary"></i> Product Inspection Queue</h5>
          </div>
          <div class="dash-section-card-body p-0">
            <div class="table-responsive">
              <table class="dash-table" id="tblAdminApprovalsFull">
                <thead>
                  <tr>
                    <th>Proposed Vendor</th>
                    <th>SKU</th>
                    <th>Listing Title</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Submitted Date</th>
                    <th>Review Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderAdminApprovalsRows(false)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (sectionId === "system") {
      container.innerHTML = `
        <div class="row g-4">
          <div class="col-12 col-md-8">
            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-gears"></i> Engine Configurations</h5>
              </div>
              <div class="dash-section-card-body">
                <form id="frmAdminSystem">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Platform Transaction Fee (%)</label>
                      <input type="number" step="0.1" class="form-control" id="sysCommission" value="${systemSettings.commissionFee}" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label font-xs-bold">Registration Approval Mode</label>
                      <select class="form-select" id="sysRegMode" required>
                        <option value="auto-approve-buyer-verify-vendor" ${systemSettings.registrationMode === "auto-approve-buyer-verify-vendor" ? "selected" : ""}>Auto-Approve Buyers / Verify Vendors</option>
                        <option value="all-manual" ${systemSettings.registrationMode === "all-manual" ? "selected" : ""}>Manual Review for All Registrations</option>
                        <option value="auto-approve-all" ${systemSettings.registrationMode === "auto-approve-all" ? "selected" : ""}>Auto-Approve All</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <label class="form-label font-xs-bold">Blacklisted IP Address Range</label>
                      <input type="text" class="form-control" id="sysIPBlock" value="${systemSettings.ipBlocklist}">
                    </div>
                    <div class="col-12 mt-3">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="sysMaintenance" ${systemSettings.maintenanceMode ? "checked" : ""}>
                        <label class="form-check-label font-xs-bold text-danger" for="sysMaintenance">Enable Site-Wide Maintenance Mode</label>
                        <span class="d-block font-xs text-muted">Forces a placeholder page for all buyers & vendors during system updates.</span>
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-theme-primary mt-4" onclick="window.location.href='404.html'">Save Platform Configurations</button>
                </form>
              </div>
            </div>

            <!-- System Logs Panel -->
            <div class="dash-section-card mt-4">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-list-check"></i> Platform Audit Trail</h5>
              </div>
              <div class="dash-section-card-body">
                <div class="dash-activity-list">
                  ${adminAuditLogs
                    .map(
                      (l) => `
                    <li class="dash-activity-item py-2">
                      <div class="dash-activity-icon bg-light text-secondary" style="border: 1px solid var(--border-color)">
                        <i class="fa-solid fa-shield-halved"></i>
                      </div>
                      <div class="dash-activity-text">
                        <strong>[${l.category}]</strong>
                        <span class="font-xs">${l.text}</span>
                      </div>
                      <div class="dash-activity-time text-primary fw-bold">${l.time}</div>
                    </li>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="dash-section-card">
              <div class="dash-section-card-header">
                <h5><i class="fa-solid fa-server"></i> Server Node Status</h5>
              </div>
              <div class="dash-section-card-body text-center py-4">
                <div class="display-6 text-success mb-2"><i class="fa-solid fa-circle-check"></i></div>
                <h6 class="fw-bold">Connected Nodes</h6>
                <p class="font-xs text-muted mb-1">SMTP Server: <strong>${systemSettings.smtpStatus}</strong></p>
                <p class="font-xs text-muted">Database Server Status: Operational (Ping: 1.4ms)</p>
                <button class="btn btn-theme-danger w-100 mt-2" onclick="window.location.href='404.html'">
                  Reboot Nodes
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Save system settings
      document
        .getElementById("frmAdminSystem")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          systemSettings.commissionFee = parseFloat(
            document.getElementById("sysCommission").value,
          );
          systemSettings.registrationMode =
            document.getElementById("sysRegMode").value;
          systemSettings.ipBlocklist =
            document.getElementById("sysIPBlock").value;
          systemSettings.maintenanceMode =
            document.getElementById("sysMaintenance").checked;
        });
    }
  }

  // Admin users rows builder
  function renderAdminUsersRows() {
    return adminUsers
      .map((u) => {
        const statusClass =
          u.status === "Active" ? "status-active" : "status-inactive";
        const actionTxt = u.status === "Active" ? "Suspend" : "Activate";
        const actionBtnClass =
          u.status === "Active" ? "btn-theme-danger" : "btn-theme-success";
        return `
        <tr>
          <td>#USR-00${u.id}</td>
          <td class="fw-bold text-dark">${u.name}</td>
          <td>${u.email}</td>
          <td class="text-capitalize font-xs">${u.role}</td>
          <td>${u.joined}</td>
          <td><span class="status-badge ${statusClass}">${u.status}</span></td>
          <td>
            <button class="btn ${actionBtnClass} py-1 px-3" onclick="window.toggleAdminUserStatus(${u.id})">
              ${actionTxt}
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  // Admin approvals rows builder
  function renderAdminApprovalsRows(isOverview = false) {
    const list = isOverview ? adminApprovals.slice(0, 3) : adminApprovals;

    if (list.length === 0) {
      return `<tr><td colspan="${isOverview ? 5 : 7}" class="text-center text-muted py-4">No reviews pending. System clean!</td></tr>`;
    }

    return list
      .map((a) => {
        return `
        <tr id="review-row-${a.id}">
          <td class="fw-bold text-dark">${a.vendor}</td>
          ${!isOverview ? `<td><code>${a.sku}</code></td>` : ""}
          <td>${a.product}</td>
          ${!isOverview ? `<td>${a.category}</td>` : ""}
          <td class="fw-bold">$${a.price.toFixed(2)}</td>
          <td>${a.date}</td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-theme-success py-1 px-3" onclick="window.processAdminApproval(${a.id}, true)">
                Approve
              </button>
              <button class="btn btn-theme-danger py-1 px-3" onclick="window.processAdminApproval(${a.id}, false)">
                Reject
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  // Approval action logic
  window.processAdminApproval = function (id, isApproved) {
    const actionText = isApproved ? "Approved" : "Rejected";

    // Remove from array
    adminApprovals = adminApprovals.filter((a) => a.id !== id);

    // Refresh view
    const currentSection = document
      .querySelector(".dash-nav-item.active")
      .getAttribute("data-section");
    if (currentSection === "overview") {
      const listEl = document.querySelector("#tblAdminOverviewApprovals tbody");
      if (listEl) listEl.innerHTML = renderAdminApprovalsRows(true);
      const badgeCountEl = document.getElementById("countPendingReviews");
      if (badgeCountEl) badgeCountEl.textContent = adminApprovals.length;
    } else if (currentSection === "approvals") {
      const listEl = document.querySelector("#tblAdminApprovalsFull tbody");
      if (listEl) listEl.innerHTML = renderAdminApprovalsRows(false);
    }

    // Update navigation counts
    const badgeEl = navContainer.querySelector(
      "[data-section='approvals'] .dash-nav-badge",
    );
    if (badgeEl) {
      if (adminApprovals.length > 0) {
        badgeEl.textContent = adminApprovals.length;
      } else {
        badgeEl.remove();
      }
    }
  };

  // ── Redirect empty/hash links & placeholder button clicks to 404 ───────────────────
  document.addEventListener("click", function (e) {
    const target = e.target.closest("a, button");
    if (!target) return;

    // Intercept empty/hash links
    if (target.tagName === "A") {
      const href = target.getAttribute("href");
      if (!href || href === "#" || href.trim() === "") {
        e.preventDefault();
        window.location.href = "404.html";
        return;
      }
    }

    // Intercept non-functional placeholder buttons (like notification bell)
    if (target.tagName === "BUTTON") {
      if (
        target.classList.contains("dash-icon-btn") &&
        target.querySelector(".fa-bell")
      ) {
        e.preventDefault();
        window.location.href = "404.html";
        return;
      }
    }
  });

  // ── Initial Render Run ───────────────────────────────────────
  switchSection("overview");
});
