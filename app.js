/**
 * AI-Based EV Charging Demand Prediction - Full Stack Frontend Application Logic
 * Author: Ramprasath (Final Year Project)
 * Real-Time Node.js Backend & MySQL Database Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  const isHttpPage = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const isLiveServerPage = window.location.hostname === 'localhost'
    && ['5501', '5502'].includes(window.location.port);
  let BACKEND_URL = window.__API_BASE_URL || (
    isLiveServerPage
      ? 'http://localhost:5500'
      : (isHttpPage ? window.location.origin : 'http://localhost:5500')
  );
  const apiUrl = path => `${BACKEND_URL}${path}`;

  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // State Management
  const AppState = {
    currentTab: 'home',
    selectedEvCapacity: 40.5, // kWh
    currentBattery: 20, // %
    targetBattery: 85, // %
    selectedChargerPower: 150, // kW
    unreadNotifCount: 4,
    savedFavoritesCount: 4,
    activeTimeframe: '24h',
    mapInstance: null,
    mapMarkers: [],
    routeLayer: null,
    routeTarget: null,
    routeSourceMarker: null,
    routeDestinationMarker: null,
    routeSource: null,
    routeDestination: null,
    routeMode: 'driving',
    userLocation: {
      lat: 11.0168,
      lng: 76.9558,
      accuracy: 25,
      isLive: false,
      hasGps: false,
      watchId: null
    },
    userMarker: null,
    accuracyCircle: null,
    isLiveTracking: false,
    demandChartInstance: null,
    simulationChartInstance: null,
    weeklyChartInstance: null,
    energyMixChartInstance: null,
    darkMode: false,
    selectedStationForBooking: {
      id: 1,
      name: 'Study World College EV Hub',
      speed: '150 kW DC Fast (CCS2)',
      rate: '₹14.50 / kWh'
    }
  };

  // Station Data State (Hydrated from MySQL Backend)
  let STATIONS_DATA = [
    {
      id: 1,
      name: 'Study World College EV Hub',
      address: 'Study World College, Coimbatore',
      lat: 11.0168,
      lng: 76.9558,
      totalSlots: 8,
      availSlots: 6,
      speedKw: 150,
      speedCategory: 'ultra',
      type: 'CCS2 • Type 2',
      price: 14.50,
      solar: true,
      status: 'green',
      isFavorite: true
    },
    {
      id: 2,
      name: 'Gandhipuram Central EV Hub',
      address: 'Gandhipuram, Coimbatore',
      lat: 11.0183,
      lng: 76.9725,
      totalSlots: 6,
      availSlots: 4,
      speedKw: 60,
      speedCategory: 'fast',
      type: 'CCS2 • CHAdeMO',
      price: 12.80,
      solar: false,
      status: 'green',
      isFavorite: false
    },
    {
      id: 3,
      name: 'Peelamedu Airport EV Hub',
      address: 'Peelamedu, Coimbatore',
      lat: 11.0302,
      lng: 77.0430,
      totalSlots: 10,
      availSlots: 2,
      speedKw: 150,
      speedCategory: 'ultra',
      type: 'CCS2 • Type 2',
      price: 15.00,
      solar: false,
      status: 'amber',
      isFavorite: true
    },
    {
      id: 4,
      name: 'Saravanampatti Tech Park Charge',
      address: 'Saravanampatti, Coimbatore',
      lat: 11.0780,
      lng: 76.9950,
      totalSlots: 8,
      availSlots: 8,
      speedKw: 180,
      speedCategory: 'ultra',
      type: 'CCS2 All Models',
      price: 16.00,
      solar: true,
      status: 'green',
      isFavorite: true
    },
    {
      id: 5,
      name: 'RS Puram Green Charge',
      address: 'RS Puram, Coimbatore',
      lat: 11.0065,
      lng: 76.9537,
      totalSlots: 4,
      availSlots: 0,
      speedKw: 50,
      speedCategory: 'fast',
      type: 'CCS2',
      price: 13.00,
      solar: false,
      status: 'red',
      isFavorite: false
    },
    {
      id: 6,
      name: 'Saibaba Colony EV Station',
      address: 'Saibaba Colony, Coimbatore',
      lat: 11.0227,
      lng: 76.9360,
      totalSlots: 8,
      availSlots: 5,
      speedKw: 120,
      speedCategory: 'ultra',
      type: 'CCS2 • Type 2',
      price: 14.00,
      solar: true,
      status: 'green',
      isFavorite: true
    },
    {
      id: 7, name: 'Singanallur Transit EV Hub', address: 'Singanallur, Coimbatore',
      lat: 10.9925, lng: 77.0290, totalSlots: 10, availSlots: 7, speedKw: 120,
      speedCategory: 'ultra', type: 'CCS2 • Type 2', price: 13.80, solar: true,
      status: 'green', isFavorite: false
    },
    {
      id: 8, name: 'Ukkadam Bus Stand EV Point', address: 'Ukkadam, Coimbatore',
      lat: 10.9920, lng: 76.9610, totalSlots: 8, availSlots: 3, speedKw: 60,
      speedCategory: 'fast', type: 'CCS2 • CHAdeMO', price: 12.60, solar: false,
      status: 'amber', isFavorite: false
    },
    {
      id: 9, name: 'Kovaipudur Hillside EV Plaza', address: 'Kovaipudur, Coimbatore',
      lat: 10.9400, lng: 76.9100, totalSlots: 6, availSlots: 5, speedKw: 150,
      speedCategory: 'ultra', type: 'CCS2', price: 14.20, solar: true,
      status: 'green', isFavorite: false
    },
    {
      id: 10, name: 'Thudiyalur Highway Fast Charge', address: 'Thudiyalur, Coimbatore',
      lat: 11.0800, lng: 76.9400, totalSlots: 8, availSlots: 1, speedKw: 180,
      speedCategory: 'ultra', type: 'CCS2 All Models', price: 15.40, solar: false,
      status: 'amber', isFavorite: false
    },
    {
      id: 11, name: 'Kuniyamuthur Solar EV Stop', address: 'Kuniyamuthur, Coimbatore',
      lat: 10.9480, lng: 76.9470, totalSlots: 5, availSlots: 0, speedKw: 50,
      speedCategory: 'fast', type: 'CCS2', price: 11.90, solar: true,
      status: 'red', isFavorite: false
    },
    {
      id: 12, name: 'Avinashi Road Charging Hub', address: 'Avinashi Road, Coimbatore',
      lat: 11.0150, lng: 77.0100, totalSlots: 6, availSlots: 4, speedKw: 60,
      speedCategory: 'fast', type: 'CCS2 • Type 2', price: 12.40, solar: false,
      status: 'green', isFavorite: false
    },
    {
      id: 13, name: 'Palathurai EV Charging Station', address: 'Palathurai, Coimbatore',
      lat: 10.8965, lng: 76.9405, totalSlots: 6, availSlots: 4, speedKw: 60,
      speedCategory: 'fast', type: 'CCS2 • Type 2', price: 12.50, solar: false,
      status: 'green', isFavorite: false
    }
  ];

  /* ==========================================================================
     1. Real-Time WebSockets (Socket.IO) & Backend Integration
     ========================================================================== */
  const socket = typeof io !== 'undefined' ? io(BACKEND_URL) : null;

  if (socket) {
    socket.on('connect', () => {
      console.log('[Socket.IO] 🔌 Connected to Real-Time Node.js Backend (id:', socket.id, ')');
      updateBackendStatus(true, 'Node.js + MySQL Live');
    });

    socket.on('disconnect', () => {
      console.warn('[Socket.IO] ⚠️ Disconnected from Real-Time Server');
      updateBackendStatus(false, 'Connecting...');
    });

    socket.on('system:ready', (data) => {
      if (data && data.db) {
        const engine = data.db.engine || 'MySQL 8.0';
        updateBackendStatus(true, `${engine} Connected`);
      }
    });

    // Real-Time Grid Telemetry Stream
    socket.on('demand:live', (telemetry) => {
      updateLiveDemandUI(telemetry);
    });

    // Real-Time Station Slot Occupancy Updates
    socket.on('station:update', (data) => {
      handleStationLiveUpdate(data);
    });

    // Real-Time New Reservation Sync
    socket.on('reservation:created', (data) => {
      console.log('[Real-Time Reservation]', data);
    });

    // Real-Time Notification Broadcast
    socket.on('notification:new', (notif) => {
      AppState.unreadNotifCount += 1;
      updateNotificationBadges();
      showToast(`🔔 ${notif.title}: ${notif.message}`, notif.severity || 'info');
    });
  }

  function updateBackendStatus(isOnline, labelText) {
    const statusTag = document.getElementById('backend-status-tag');
    const statusLabel = document.getElementById('backend-status-label');

    if (statusTag) {
      if (isOnline) {
        statusTag.classList.remove('offline');
      } else {
        statusTag.classList.add('offline');
      }
    }
    if (statusLabel) {
      statusLabel.textContent = labelText;
    }
  }

  function updateLiveDemandUI(telemetry) {
    if (!telemetry) return;

    // 1. Update Load Value kW
    const loadValElem = document.getElementById('grid-active-power-val');
    if (loadValElem) {
      loadValElem.textContent = Math.round(telemetry.active_power_kw).toLocaleString();
    }

    // 2. Update Capacity Percentage
    const capPctElem = document.getElementById('grid-capacity-pct');
    if (capPctElem) {
      capPctElem.textContent = `${Math.round(telemetry.grid_load_pct)}%`;
    }

    // 3. Update Circular Progress Ring
    const progRing = document.getElementById('grid-gauge-ring');
    if (progRing) {
      const radius = 52;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (telemetry.grid_load_pct / 100) * circumference;
      progRing.style.strokeDashoffset = offset;
    }

    // 4. Update Grid Stress Level Pill
    const stressPill = document.getElementById('grid-stress-pill');
    if (stressPill) {
      stressPill.textContent = telemetry.grid_stress_level || 'Optimal';
      stressPill.className = `badge-status badge-${
        telemetry.grid_stress_level === 'Critical' ? 'danger' :
        (telemetry.grid_stress_level === 'High' ? 'warning' : 'success')
      }`;
    }

    // 5. Update Port Availability counts
    const availPortsElem = document.getElementById('available-ports-count');
    if (availPortsElem && telemetry.available_ports_count !== undefined) {
      availPortsElem.textContent = telemetry.available_ports_count;
    }
    const occupiedPortsElem = document.getElementById('occupied-ports-count');
    if (occupiedPortsElem && telemetry.occupied_ports_count !== undefined) {
      occupiedPortsElem.textContent = telemetry.occupied_ports_count;
    }

    const activePowerElem = document.getElementById('active-power-load-val');
    if (activePowerElem) {
      activePowerElem.innerHTML = `${Math.round(telemetry.active_power_kw).toLocaleString()} <small>kW</small>`;
    }
    const demandPercentElem = document.getElementById('demand-percent-val');
    if (demandPercentElem) demandPercentElem.textContent = `${Math.round(telemetry.grid_load_pct)}%`;
    const demandGaugeElem = document.getElementById('demand-gauge-fill');
    if (demandGaugeElem) demandGaugeElem.style.strokeDashoffset = 314 - (314 * telemetry.grid_load_pct / 100);
    const stressLabel = document.getElementById('grid-stress-label');
    if (stressLabel) stressLabel.textContent = telemetry.grid_stress_level || 'Optimal';
    const loadProgress = document.getElementById('grid-load-progress');
    if (loadProgress) loadProgress.style.width = `${Math.min(100, telemetry.grid_load_pct)}%`;

    const shareStatus = document.getElementById('power-share-status');
    if (shareStatus) {
      shareStatus.textContent = telemetry.balancing_status || 'Optimal';
      shareStatus.className = `badge-status ${
        telemetry.balancing_status === 'Load reduced' ? 'badge-warning' :
        (telemetry.balancing_status === 'Power shared' ? 'badge-info' : 'badge-success')
      }`;
    }
    const sharePerSession = document.getElementById('power-share-per-session');
    if (sharePerSession) sharePerSession.innerHTML = `${Number(telemetry.shared_power_per_session_kw || 0).toFixed(1)} <small>kW</small>`;
    const shareHeadroom = document.getElementById('power-share-headroom');
    if (shareHeadroom) shareHeadroom.innerHTML = `${Math.round(telemetry.balancing_headroom_kw || 0).toLocaleString()} <small>kW</small>`;
    const shareSessions = document.getElementById('power-share-sessions');
    if (shareSessions) shareSessions.textContent = telemetry.occupied_ports_count || 0;
    const shareProgress = document.getElementById('power-share-progress');
    if (shareProgress) {
      const safeLimit = telemetry.safe_grid_limit_kw || telemetry.grid_capacity_kw || 1;
      shareProgress.style.width = `${Math.min(100, Math.round((telemetry.active_power_kw / safeLimit) * 100))}%`;
    }
    const shareUpdated = document.getElementById('power-share-updated');
    if (shareUpdated) shareUpdated.textContent = `Updated ${new Date(telemetry.timestamp).toLocaleTimeString()}`;
  }

  function updateAuthenticatedUser(user) {
    if (!user) return;
    const email = user.email || 'Signed-in Google account';
    const displayName = user.displayName || email.split('@')[0];
    const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const userName = document.getElementById('profile-user-name');
    const userEmail = document.getElementById('profile-user-email');
    const drawerName = document.getElementById('drawer-user-name');
    const profileInitials = document.getElementById('profile-user-initials');
    const drawerInitials = document.getElementById('drawer-user-initials');
    if (userName) userName.textContent = displayName;
    if (userEmail) userEmail.textContent = email;
    if (drawerName) drawerName.textContent = `${displayName} (Student)`;
    if (profileInitials) profileInitials.textContent = initials;
    if (drawerInitials) drawerInitials.textContent = initials;
  }

  function handleStationLiveUpdate(data) {
    const st = STATIONS_DATA.find(s => s.id === data.stationId);
    if (!st) return;

    st.availSlots = data.availableSlots;
    st.totalSlots = data.totalSlots || st.totalSlots;
    st.reservedSlots = Math.max(0, st.totalSlots - st.availSlots);
    st.lastUpdated = data.updatedAt || new Date().toISOString();
    st.status     = data.status;

    // Try surgical in-place update first (avoids full re-render flicker)
    const card = document.getElementById(`ev-card-${st.id}`);
    if (card) {
      // Update status border class
      card.className = card.className.replace(/status-(green|amber|red)/, `status-${st.status}`);

      // Update slot badge
      const slotBadge = card.querySelector('.ev-slot-badge');
      if (slotBadge) {
        const slotClass = st.status === 'green' ? 'slot-green' : (st.status === 'amber' ? 'slot-amber' : 'slot-red');
        slotBadge.className = `ev-slot-badge ${slotClass}`;
        const freeLabel = slotBadge.querySelector('.slot-free-count');
        const reservedLabel = slotBadge.querySelector('.slot-reserved-count');
        if (freeLabel && reservedLabel) {
          freeLabel.textContent = `${st.availSlots} Free`;
          reservedLabel.textContent = `${st.reservedSlots} Reserved`;
        }
      }

      // Update each charger icon so free slots stay green and reserved slots turn red.
      const chargerIcons = card.querySelectorAll('.ev-charger-icon');
      chargerIcons.forEach((icon, index) => {
        const isFree = index < st.availSlots;
        icon.classList.toggle('charger-free', isFree);
        icon.classList.toggle('charger-reserved', !isFree);
        icon.setAttribute('title', isFree ? 'Free charger' : 'Reserved charger');
      });

      // Update Reserve button state
      const reserveBtn = card.querySelector('.ev-btn-reserve');
      if (reserveBtn) {
        if (st.availSlots === 0) {
          reserveBtn.classList.add('btn-full');
          reserveBtn.disabled = true;
          reserveBtn.innerHTML = '<i data-lucide="ban"></i> Station Full';
        } else {
          reserveBtn.classList.remove('btn-full');
          reserveBtn.disabled = false;
          reserveBtn.innerHTML = '<i data-lucide="calendar"></i> Reserve Slot';
        }
        if (window.lucide) lucide.createIcons();
      }

      // Flash animation
      card.classList.add('slot-changed');
      setTimeout(() => card.classList.remove('slot-changed'), 900);

      // Update live counter
      updateNearbyLiveCounter();
    } else {
      // Card not in current filter view — re-render
      const activeFilter = document.querySelector('.nf-tab.active');
      renderNearbyStationsList(activeFilter ? activeFilter.dataset.filter : 'all');
    }

    renderMapMarkers('all');
  }

  /* ==========================================================================
     2. Live Clock & Status Initialization
     ========================================================================== */
  function initLiveClock() {
    const clockElem = document.getElementById('live-clock');
    function update() {
      const now = new Date();
      if (clockElem) {
        clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    update();
    setInterval(update, 1000);
  }

  /* ==========================================================================
     3. Tab Navigation System (Bottom Nav & Drawer Nav)
     ========================================================================== */
  function switchTab(tabId) {
    AppState.currentTab = tabId;

    // Update top-left navigation active state
    document.querySelectorAll('.top-nav-tab').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update drawer nav active state
    document.querySelectorAll('.drawer-nav .nav-item[data-nav]').forEach(item => {
      if (item.dataset.nav === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update view visibility
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Scroll to top
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    // Tab-specific initializations
    if (tabId === 'map') {
      setTimeout(() => {
        initLeafletMap();
      }, 100);
    } else if (tabId === 'analytics') {
      setTimeout(() => {
        initAnalyticsCharts();
        renderHourlyHeatmap();
      }, 100);
    } else if (tabId === 'predict') {
      setTimeout(() => {
        initSimulationChart();
        fetchForecastData(AppState.activeTimeframe);
      }, 100);
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Setup top-left navigation clicks
  document.querySelectorAll('.top-nav-tab').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const tab = btn.dataset.tab;
      if (tab) {
        switchTab(tab);
      }
    });
  });

  // Setup Brand Logo Click to go Home
  const brandHomeTrigger = document.getElementById('brand-home-trigger');
  if (brandHomeTrigger) {
    brandHomeTrigger.addEventListener('click', () => switchTab('home'));
  }

  // "View on Map" & "View All" buttons on Home
  const openMapFilterBtn = document.getElementById('open-map-filter-btn');
  if (openMapFilterBtn) {
    openMapFilterBtn.addEventListener('click', () => switchTab('map'));
  }

  const seeAllStationsBtn = document.getElementById('see-all-stations-btn');
  if (seeAllStationsBtn) {
    seeAllStationsBtn.addEventListener('click', () => switchTab('map'));
  }

  /* ==========================================================================
     4. Hamburger Drawer Navigation
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  function openDrawer() {
    sideDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
  }

  function closeDrawer() {
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Drawer Nav Items handling
  document.querySelectorAll('.drawer-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();

      const targetNav = item.dataset.nav;
      const targetAction = item.dataset.action;

      if (targetNav) {
        switchTab(targetNav);
      } else if (targetAction) {
        handleDrawerAction(targetAction);
      }
    });
  });

  function handleDrawerAction(action) {
    switch (action) {
      case 'open-notifications':
        openNotifPanel();
        break;
      case 'about-project-modal':
        openModal('about-project-modal');
        break;
      case 'settings-modal':
        openModal('settings-modal');
        break;
      case 'favorite-stations-modal':
        showToast('Favorite Stations Filter Active (4 Saved Hubs)', 'info');
        switchTab('map');
        break;
      case 'smart-charge-modal':
        switchTab('home');
        setTimeout(() => {
          const smartCard = document.getElementById('smart-recommendation-card');
          if (smartCard) {
            smartCard.scrollIntoView({ behavior: 'smooth' });
          }
        }, 200);
        break;
      case 'logout-toast':
        window.dispatchEvent(new CustomEvent('ev-charge-signout'));
        break;
    }
  }

  /* ==========================================================================
     5. Notification Bell & Panel (Hydrated from MySQL)
     ========================================================================== */
  const notificationBtn = document.getElementById('notification-btn');
  const notifOverlay = document.getElementById('notif-overlay');
  const closeNotifBtn = document.getElementById('close-notif-btn');
  const markAllReadBtn = document.getElementById('mark-all-read-btn');
  const notifBadge = document.querySelector('.notif-badge');
  const notifCountPill = document.getElementById('notif-count-pill');

  function openNotifPanel() {
    notifOverlay.classList.add('active');
    fetchNotifications();
  }

  function closeNotifPanel() {
    notifOverlay.classList.remove('active');
  }

  if (notificationBtn) notificationBtn.addEventListener('click', openNotifPanel);
  if (closeNotifBtn) closeNotifBtn.addEventListener('click', closeNotifPanel);
  if (notifOverlay) {
    notifOverlay.addEventListener('click', (e) => {
      if (e.target === notifOverlay) closeNotifPanel();
    });
  }

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async () => {
      try {
        await fetch(apiUrl('/api/notifications/read/all'), { method: 'POST' });
      } catch (e) {
        console.warn('Notification sync offline', e);
      }
      document.querySelectorAll('.notif-card').forEach(card => card.classList.remove('unread'));
      AppState.unreadNotifCount = 0;
      updateNotificationBadges();
      showToast('All notifications marked as read', 'success');
    });
  }

  function updateNotificationBadges() {
    if (notifBadge) {
      if (AppState.unreadNotifCount > 0) {
        notifBadge.style.display = 'flex';
        notifBadge.textContent = AppState.unreadNotifCount;
      } else {
        notifBadge.style.display = 'none';
      }
    }
    if (notifCountPill) {
      notifCountPill.textContent = `${AppState.unreadNotifCount} Alerts`;
    }
  }

  async function fetchNotifications() {
    try {
      const res = await fetch(apiUrl('/api/notifications'));
      const data = await res.json();
      if (data && data.success) {
        AppState.unreadNotifCount = data.unread_count;
        updateNotificationBadges();
      }
    } catch (e) {
      console.warn('Notifications fetch fallback:', e.message);
    }
  }

  /* ==========================================================================
     6. Generic Modal System
     ========================================================================== */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      if (modalId) closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  /* ==========================================================================
     7. Reservation Modal & Real-Time Booking to MySQL Database
     ========================================================================== */
  function openReservationModal(stationName, chargerSpeed, stationId = 1) {
    AppState.selectedStationForBooking = {
      id: stationId,
      name: stationName || 'Study World College EV Hub',
      speed: chargerSpeed || '150 kW DC Fast (CCS2)',
      rate: '₹14.50 / kWh'
    };

    const stNameElem = document.getElementById('res-modal-station-name');
    const stSpeedElem = document.getElementById('res-modal-charger-speed');

    if (stNameElem) stNameElem.textContent = AppState.selectedStationForBooking.name;
    if (stSpeedElem) stSpeedElem.textContent = AppState.selectedStationForBooking.speed;

    openModal('reservation-modal');
  }

  const confirmReservationBtn = document.getElementById('confirm-reservation-btn');
  if (confirmReservationBtn) {
    const loadPaytmCheckout = (mid, environment) => new Promise((resolve, reject) => {
      if (window.Paytm?.CheckoutJS) return resolve(window.Paytm.CheckoutJS);
      const script = document.createElement('script');
      const gateway = environment === 'production' ? 'securegw.paytm.in' : 'securegw-stage.paytm.in';
      script.src = `https://${gateway}/merchantpgpui/checkoutjs/merchants/${encodeURIComponent(mid)}.js`;
      script.onload = () => window.Paytm?.CheckoutJS
        ? resolve(window.Paytm.CheckoutJS)
        : reject(new Error('Paytm CheckoutJS did not load.'));
      script.onerror = () => reject(new Error('Unable to load Paytm Checkout. Check your network connection.'));
      document.head.appendChild(script);
    });

    const createPaytmPayment = async () => {
      const paymentResponse = await fetch(apiUrl('/api/payments/paytm/initiate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: AppState.selectedStationForBooking.id,
          duration_mins: 45,
          user_email: document.getElementById('profile-user-email')?.textContent || ''
        })
      });
      const payment = await paymentResponse.json();
      if (!paymentResponse.ok || !payment.success) {
        throw new Error(payment.message || 'Paytm payment could not be started.');
      }

      if (payment.data.demo) {
        await new Promise((resolve, reject) => {
          const demoModal = document.getElementById('paytm-demo-modal');
          const amount = document.getElementById('paytm-demo-amount');
          const order = document.getElementById('paytm-demo-order');
          const payButton = document.getElementById('paytm-demo-pay');
          const cancelButton = document.getElementById('paytm-demo-cancel');
          if (!demoModal || !payButton || !cancelButton) return reject(new Error('Paytm demo checkout is unavailable.'));
          amount.textContent = `₹${payment.data.amount.toFixed(2)}`;
          order.textContent = `Order ID: ${payment.data.orderId}`;
          demoModal.classList.add('active');
          const finish = error => {
            demoModal.classList.remove('active');
            payButton.removeEventListener('click', approve);
            cancelButton.removeEventListener('click', cancel);
            error ? reject(error) : resolve();
          };
          const approve = () => finish();
          const cancel = () => finish(new Error('Demo payment cancelled.'));
          payButton.addEventListener('click', approve, { once: true });
          cancelButton.addEventListener('click', cancel, { once: true });
        });
      } else {
        const checkout = await loadPaytmCheckout(payment.data.mid, payment.data.environment);
        await new Promise((resolve, reject) => {
        checkout.init({
          root: '',
          flow: 'DEFAULT',
          data: {
            orderId: payment.data.orderId,
            token: payment.data.txnToken,
            tokenType: 'TXN_TOKEN',
            amount: payment.data.amount.toFixed(2)
          },
          merchant: { mid: payment.data.mid },
          handler: {
            transactionStatus: response => {
              if (response?.STATUS === 'TXN_SUCCESS') resolve();
              else reject(new Error(response?.RESPMSG || 'Paytm payment was not successful.'));
            },
            notifyMerchant: () => {}
          }
        }).then(() => checkout.invoke()).catch(reject);
        });
      }

      const statusResponse = await fetch(apiUrl('/api/payments/paytm/status'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: payment.data.orderId })
      });
      const status = await statusResponse.json();
      if (!statusResponse.ok || !status.success) {
        throw new Error(status.message || 'Paytm payment was not successful.');
      }
      return payment.data;
    };

    confirmReservationBtn.addEventListener('click', async () => {
      confirmReservationBtn.disabled = true;
      confirmReservationBtn.textContent = 'Opening Paytm...';

      try {
        await createPaytmPayment();
        confirmReservationBtn.textContent = 'Securing Slot...';
        const res = await fetch(apiUrl('/api/reservations'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            station_id: AppState.selectedStationForBooking.id,
            user_name: 'Ramprasath',
            user_phone: '+91 98765 43210',
            vehicle_model: 'Tata Nexon EV Max',
            plug_type: AppState.selectedStationForBooking.speed,
            duration_mins: 45
          })
        });
        const result = await res.json();
        closeModal('reservation-modal');

        if (result && result.success) {
          showToast(`⚡ ${result.message} Pass #${result.data.reservation_code} recorded in MySQL.`, 'success');
          // Refresh stations from DB
          fetchStations();
        } else {
          throw new Error(result.message || 'Reservation could not be created after payment.');
        }
      } catch (err) {
        closeModal('reservation-modal');
        showToast(err.message || 'Payment or reservation failed. No booking was created.', 'warning');
      } finally {
        confirmReservationBtn.disabled = false;
        confirmReservationBtn.innerHTML = '<i data-lucide="credit-card"></i> Pay with Paytm & Reserve';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Bind Reserve & Real-Time Navigation buttons in Nearby List & Map Preview
  function bindActionButtons() {
    document.querySelectorAll('[data-action="reserve-slot"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const station = btn.dataset.station;
        const speed = btn.dataset.speed;
        const matched = STATIONS_DATA.find(s => s.name === station);
        const stId = matched ? matched.id : 1;
        openReservationModal(station, `${speed} Fast DC`, stId);
      };
    });

    document.querySelectorAll('[data-action="navigate-station"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const stationName = btn.dataset.station;
        launchNavigation(stationName);
      };
    });
  }

  function launchNavigation(stationParam) {
    let station = null;
    if (typeof stationParam === 'object' && stationParam !== null) {
      station = stationParam;
    } else if (typeof stationParam === 'string' && stationParam.trim()) {
      station = STATIONS_DATA.find(s => s.name.toLowerCase().includes(stationParam.toLowerCase())) || STATIONS_DATA[0];
    } else if (AppState.selectedMapStation) {
      station = AppState.selectedMapStation;
    } else {
      station = STATIONS_DATA[0];
    }

    const destLat = station.lat;
    const destLng = station.lng;
    
    AppState.selectedMapStation = station;
    AppState.routeTarget = station;
    switchTab('map');

    const focusStation = () => {
      if (!AppState.mapInstance) {
        initLeafletMap();
      }

      if (AppState.mapInstance) {
        AppState.mapInstance.setView([destLat, destLng], 15, { animate: true });
        showFloatingMapPreview(station);
        // Refresh the user's live position while keeping the selected station in focus.
        requestUserLocation(false);
        drawRouteToStation(station);
        showToast(`🗺️ Showing ${station.name} on the Coimbatore map.`, 'success');
      } else {
        showToast('Map is still loading. Please try Navigate again.', 'warning');
      }
    };

    // The map tab initializes after becoming visible so Leaflet can measure it.
    setTimeout(focusStation, 150);
  }

  const ovBookBtn = document.getElementById('ov-book-btn');
  if (ovBookBtn) {
    ovBookBtn.addEventListener('click', () => {
      const name = document.getElementById('ov-name').textContent;
      const speed = document.getElementById('ov-speed').textContent;
      const matched = STATIONS_DATA.find(s => s.name === name);
      openReservationModal(name, speed, matched ? matched.id : 1);
    });
  }

  const ovNavBtn = document.getElementById('ov-nav-btn');
  if (ovNavBtn) {
    ovNavBtn.addEventListener('click', () => {
      if (AppState.selectedMapStation) {
        launchNavigation(AppState.selectedMapStation);
      } else {
        const name = document.getElementById('ov-name').textContent;
        launchNavigation(name);
      }
    });
  }

  // Favorite Heart Toggle with Database Persistence
  function bindFavoriteButtons() {
    // Support both old .favorite-heart-btn and new .ev-fav-btn classes
    document.querySelectorAll('.favorite-heart-btn, .ev-fav-btn').forEach(btn => {
      btn.onclick = async () => {
        btn.classList.toggle('active');
        const isFav = btn.classList.contains('active');
        const stationCard = btn.closest('[data-station-id]');
        const stationId = stationCard ? stationCard.dataset.stationId : (btn.dataset.stationId || 1);

        // Update in-memory state
        const st = STATIONS_DATA.find(s => s.id === parseInt(stationId, 10));
        if (st) st.isFavorite = isFav;

        try {
          await fetch(apiUrl(`/api/stations/${stationId}/favorite`), { method: 'POST' });
        } catch (e) {
          console.warn('Favorite sync offline', e);
        }

        showToast(isFav ? '❤️ Added to Favorite Stations' : 'Removed from Favorites', isFav ? 'success' : 'info');
        const count = document.querySelectorAll('.favorite-heart-btn.active, .ev-fav-btn.active').length;
        const favCountElem = document.getElementById('drawer-fav-count');
        if (favCountElem) favCountElem.textContent = `${count} Saved`;
      };
    });
  }

  // Filter tab clicks for Nearby Stations
  document.querySelectorAll('.nf-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nf-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderNearbyStationsList(tab.dataset.filter || 'all');
    });
  });

  // Smart Charging Action Buttons
  const scheduleNowBtn = document.getElementById('schedule-now-btn');
  if (scheduleNowBtn) {
    scheduleNowBtn.addEventListener('click', () => {
      showToast('Smart Charging Scheduled for 11:30 PM (Est. Savings: ₹165 recorded)', 'success');
    });
  }

  const customScheduleBtn = document.getElementById('custom-schedule-btn');
  if (customScheduleBtn) {
    customScheduleBtn.addEventListener('click', () => {
      openModal('settings-modal');
    });
  }

  /* ==========================================================================
     8. AI Demand Forecast Chart (Chart.js + REST API)
     ========================================================================== */
  async function fetchForecastData(timeframe = '24h') {
    try {
      const res = await fetch(apiUrl(`/api/demand/forecast?timeframe=${timeframe}`));
      const data = await res.json();
      if (data && data.success) {
        renderForecastChart(data);
        return;
      }
    } catch (err) {
      console.warn('Forecast API fallback', err);
    }
    renderForecastChartFallback(timeframe);
  }

  function renderForecastChart(data) {
    const ctx = document.getElementById('demandForecastChart');
    if (!ctx) return;

    if (AppState.demandChartInstance) {
      AppState.demandChartInstance.destroy();
    }

    AppState.demandChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Actual Load (kW)',
            data: data.actual,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2.5,
            pointBackgroundColor: '#2563EB',
            pointRadius: 4,
            tension: 0.35,
            fill: false
          },
          {
            label: 'AI Predicted Demand (kW)',
            data: data.predicted,
            borderColor: '#10B981',
            borderDash: [5, 4],
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 2.5,
            pointBackgroundColor: '#10B981',
            pointRadius: 4,
            tension: 0.35,
            fill: false
          },
          {
            label: 'Confidence Upper (95%)',
            data: data.confidence_upper,
            borderColor: 'transparent',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            pointRadius: 0,
            tension: 0.35,
            fill: '+1'
          },
          {
            label: 'Confidence Lower (95%)',
            data: data.confidence_lower,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0,
            tension: 0.35,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
              filter: item => !item.text.includes('Confidence Lower')
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataset.label.includes('Confidence Lower')) return null;
                return `${context.dataset.label}: ${context.raw ? context.raw.toLocaleString() : 'N/A'} kW`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: val => `${val} kW` },
            grid: { color: 'rgba(226, 232, 240, 0.6)' }
          }
        }
      }
    });
  }

  function renderForecastChartFallback(timeframe) {
    const fallbackData = {
      '24h': {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'],
        actual: [520, 380, 490, 1420, 1180, 980, 1540, null, null],
        predicted: [510, 360, 480, 1450, 1200, 990, 1580, 1340, 680],
        confidence_upper: [600, 450, 580, 1580, 1320, 1100, 1720, 1480, 800],
        confidence_lower: [420, 270, 380, 1320, 1080, 880, 1440, 1200, 560]
      },
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        actual: [1420, 1480, 1390, 1520, 1680, null, null],
        predicted: [1400, 1460, 1410, 1500, 1710, 1320, 1150],
        confidence_upper: [1550, 1600, 1540, 1650, 1850, 1460, 1280],
        confidence_lower: [1250, 1320, 1280, 1350, 1570, 1180, 1020]
      },
      '30d': {
        labels: ['W1', 'W2', 'W3', 'W4'],
        actual: [9400, 9850, null, null],
        predicted: [9300, 9700, 10200, 9600],
        confidence_upper: [10200, 10600, 11100, 10500],
        confidence_lower: [8400, 8800, 9300, 8700]
      }
    };
    renderForecastChart(fallbackData[timeframe] || fallbackData['24h']);
  }

  // Forecast Timeframe Pill Switching
  const timeframeSelectorEl = document.getElementById('timeframe-selector');
  if (timeframeSelectorEl) {
    timeframeSelectorEl.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        timeframeSelectorEl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.activeTimeframe = btn.dataset.time;
        fetchForecastData(AppState.activeTimeframe);
      });
    });
  }

  /* ==========================================================================
     9. Nearby Stations Rendering & Leaflet Map
     ========================================================================== */
  async function fetchStations() {
    try {
      const res = await fetch(apiUrl('/api/stations'));
      const data = await res.json();
      if (data && data.success && data.data.length > 0) {
        STATIONS_DATA = data.data.map(st => ({
          id: st.id,
          name: st.name,
          address: st.address,
          lat: parseFloat(st.latitude),
          lng: parseFloat(st.longitude),
          totalSlots: st.total_slots,
          availSlots: st.available_slots,
          reservedSlots: Math.max(0, st.total_slots - st.available_slots),
          lastUpdated: st.updated_at || new Date().toISOString(),
          speedKw: st.speed_kw,
          speedCategory: st.speed_category,
          type: st.plug_types,
          price: parseFloat(st.price_kwh),
          solar: Boolean(st.is_solar),
          status: st.status,
          isFavorite: Boolean(st.is_favorite)
        }));
      }
    } catch (err) {
      console.warn('Stations API fallback:', err);
    }
    renderNearbyStationsList();
    renderMapMarkers('all');
  }

  function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  function updateAllStationDistances(userLat, userLng) {
    STATIONS_DATA.forEach(st => {
      const dist = calculateHaversineDistance(userLat, userLng, st.lat, st.lng);
      st.calculatedDistance = dist;
      const distText = dist < 1.0 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
      const baseAddr = st.address.split('•')[0].trim();
      st.address = `${baseAddr} • ${distText}`;
    });

    renderNearbyStationsList();
  }

  function renderNearbyStationsList(filterType = 'all') {
    const listContainer = document.getElementById('nearby-stations-container');
    if (!listContainer) return;

    // Amenity icon mapping per station
    const amenitiesMap = {
      1: [{ icon: 'coffee', label: 'Cafe' }, { icon: 'wifi', label: '5G WiFi' }, { icon: 'shield-check', label: '24/7 Security' }],
      2: [{ icon: 'utensils', label: 'Food Court' }, { icon: 'car', label: 'Valet' }, { icon: 'clock', label: 'Open 24/7' }],
      3: [{ icon: 'train', label: 'Metro Connect' }, { icon: 'wifi', label: 'Free WiFi' }],
      4: [{ icon: 'utensils', label: 'Restaurant' }, { icon: 'sun', label: 'Solar Canopy' }, { icon: 'battery-charging', label: 'Battery Swap' }],
      5: [{ icon: 'clock', label: 'Closed Now' }],
      6: [{ icon: 'leaf', label: 'Eco Zone' }, { icon: 'shield-check', label: 'Security' }]
    };

    // Apply filter
    let filtered = STATIONS_DATA;
    if (filterType === 'ultra')     filtered = STATIONS_DATA.filter(s => s.speedKw >= 150);
    else if (filterType === 'fast') filtered = STATIONS_DATA.filter(s => s.speedKw >= 50 && s.speedKw < 150);
    else if (filterType === 'available') filtered = STATIONS_DATA.filter(s => s.availSlots > 0);
    else if (filterType === 'solar') filtered = STATIONS_DATA.filter(s => s.solar);

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="no-stations-msg">
          <i data-lucide="map-pin-off"></i>
          No stations match this filter. Try a different category.
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    listContainer.innerHTML = filtered.map(st => {
      const slotClass   = st.status === 'green' ? 'slot-green' : (st.status === 'amber' ? 'slot-amber' : 'slot-red');
      const reservedSlots = Math.max(0, st.totalSlots - st.availSlots);
      const speedLabel  = st.speedKw >= 150 ? `${st.speedKw} kW Ultra-Fast` : `${st.speedKw} kW DC Fast`;
      const amenities   = (amenitiesMap[st.id] || []).map(a =>
        `<span class="ev-amenity"><i data-lucide="${a.icon}"></i> ${a.label}</span>`).join('');
      const isFull      = st.availSlots === 0;
      const chargerIcons = Array.from({ length: st.totalSlots }, (_, index) => {
        const isFree = index < st.availSlots;
        return `
          <span class="ev-charger-icon ${isFree ? 'charger-free' : 'charger-reserved'}" title="${isFree ? 'Free charger' : 'Reserved charger'}" role="img" aria-label="${isFree ? 'Free charger' : 'Reserved charger'}">
            <span class="charger-screen"></span>
            <span class="charger-bolt"></span>
            <span class="charger-plug"></span>
          </span>`;
      }).join('');

      return `
        <div class="ev-station-card status-${st.status} realtime-active" id="ev-card-${st.id}" data-station-id="${st.id}">
          <div class="ev-live-update-badge" id="ev-badge-${st.id}">LIVE</div>
          <div class="ev-card-body">
            <div class="ev-card-top">
              <div class="ev-card-name-block">
                <div class="ev-card-name">${st.name}</div>
                <div class="ev-card-addr">
                  <i data-lucide="navigation"></i>
                  ${st.address}
                </div>
              </div>
              <button class="ev-fav-btn ${st.isFavorite ? 'active' : ''}" 
                data-station-id="${st.id}" aria-label="Favorite Station" title="Save to Favorites">
                <i data-lucide="heart"></i>
              </button>
            </div>

            <div class="ev-charger-status" aria-label="Charger availability">
              <span class="ev-charger-status-label"><i data-lucide="plug-zap"></i> Chargers</span>
              <div class="ev-charger-icons">${chargerIcons}</div>
              <span class="ev-charger-legend"><span class="legend-free-dot"></span> Free <span class="legend-reserved-dot"></span> Reserved</span>
            </div>

            <div class="ev-slot-row">
              <span class="ev-slot-badge ${slotClass}">
                <span class="slot-live-dot"></span>
                <span class="slot-free-count">${st.availSlots} Free</span>
                <span class="slot-reserved-count">${reservedSlots} Reserved</span>
              </span>
            </div>

            <div class="ev-chips-row">
              <span class="ev-chip chip-speed"><i data-lucide="zap"></i> ${speedLabel}</span>
              <span class="ev-chip"><i data-lucide="plug"></i> ${st.type}</span>
              <span class="ev-chip chip-price">₹${st.price.toFixed(2)}/kWh</span>
              ${st.solar ? '<span class="ev-chip chip-solar"><i data-lucide="sun"></i> Solar</span>' : ''}
            </div>

            ${amenities ? `<div class="ev-amenities-row">${amenities}</div>` : ''}

            <div class="ev-card-actions">
              <button class="ev-btn-reserve ${isFull ? 'btn-full' : ''}" 
                data-action="reserve-slot" data-station="${st.name}" data-speed="${st.speedKw} kW"
                ${isFull ? 'disabled title="Station Full"' : ''}>
                <i data-lucide="${isFull ? 'ban' : 'calendar'}"></i>
                ${isFull ? 'Station Full' : 'Reserve Slot'}
              </button>
              <button class="ev-btn-navigate" data-action="navigate-station" data-station="${st.name}">
                <i data-lucide="navigation"></i>
                Navigate
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    // Update the live counter in the header
    updateNearbyLiveCounter();

    if (window.lucide) lucide.createIcons();
    bindActionButtons();
    bindFavoriteButtons();
  }

  // Updates the "X Free" counter badge in the section header
  function updateNearbyLiveCounter() {
    const totalFree = STATIONS_DATA.reduce((sum, s) => sum + s.availSlots, 0);
    const availEl   = document.getElementById('nearby-total-avail');
    if (availEl) availEl.textContent = `${totalFree} Slots Free`;
  }

  function initLeafletMap() {
    const mapElem = document.getElementById('leaflet-map-element');
    if (!mapElem) return;

    if (!AppState.mapInstance) {
      AppState.mapInstance = L.map('leaflet-map-element', {
        zoomControl: false
      }).setView([20, 0], 2);

      L.control.zoom({ position: 'topright' }).addTo(AppState.mapInstance);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(AppState.mapInstance);

    } else {
      AppState.mapInstance.invalidateSize();
    }
  }

  function setupLocationSearch(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    if (!input || !suggestions) return;

    let searchTimer;
    input.addEventListener('input', () => {
      delete input.dataset.lat;
      delete input.dataset.lng;
      clearTimeout(searchTimer);
      const query = input.value.trim();
      suggestions.replaceChildren();
      if (query.length < 3) return;

      searchTimer = setTimeout(async () => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`, {
            headers: { 'Accept-Language': navigator.language || 'en' }
          });
          if (!response.ok) throw new Error(`Geocoding service returned ${response.status}`);
          const places = await response.json();
          suggestions.replaceChildren();
          places.forEach(place => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'route-suggestion';
            option.setAttribute('role', 'option');
            option.textContent = place.display_name;
            option.addEventListener('click', () => {
              input.value = place.display_name;
              input.dataset.lat = place.lat;
              input.dataset.lng = place.lon;
              suggestions.replaceChildren();
              const validation = document.getElementById('route-validation-message');
              if (validation) validation.textContent = '';
            });
            suggestions.appendChild(option);
          });
        } catch (error) {
          console.warn('Location lookup failed:', error.message);
          suggestions.replaceChildren();
        }
      }, 350);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => suggestions.replaceChildren(), 150);
    });
  }

  function getSelectedRouteLocation(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.dataset.lat || !input.dataset.lng || !input.value.trim()) return null;
    return {
      name: input.value.trim(),
      lat: Number(input.dataset.lat),
      lng: Number(input.dataset.lng)
    };
  }

  function createRouteMarker(location, kind) {
    const isSource = kind === 'source';
    const icon = L.divIcon({
      className: 'route-marker-icon',
      html: `<div class="route-map-marker ${isSource ? 'route-map-marker-source' : 'route-map-marker-destination'}"><span>${isSource ? 'A' : 'B'}</span></div>`,
      iconSize: [40, 48],
      iconAnchor: [20, 44]
    });
    return L.marker([location.lat, location.lng], { icon, zIndexOffset: isSource ? 1100 : 1101 }).addTo(AppState.mapInstance);
  }

  function formatRouteDuration(seconds) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`;
  }

  function formatInstruction(step) {
    const text = step.maneuver && step.maneuver.instruction
      ? step.maneuver.instruction
      : `${step.name || 'Continue'} for ${(step.distance / 1000).toFixed(1)} km`;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async function drawSelectedRoute() {
    const validation = document.getElementById('route-validation-message');
    const source = getSelectedRouteLocation('route-source-input');
    const destination = getSelectedRouteLocation('route-destination-input');

    if (!source || !destination) {
      if (validation) validation.textContent = 'Select one source and one destination to build your route.';
      return;
    }
    if (source.lat === destination.lat && source.lng === destination.lng) {
      if (validation) validation.textContent = 'Choose two different locations for your route.';
      return;
    }

    if (validation) validation.textContent = '';
    AppState.routeSource = source;
    AppState.routeDestination = destination;
    AppState.routeTarget = null;

    if (!AppState.mapInstance) initLeafletMap();
    if (!AppState.mapInstance) return;

    const mode = AppState.routeMode === 'walking' ? 'walking' : 'driving';
    const routerBase = mode === 'walking'
      ? 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/'
      : 'https://router.project-osrm.org/route/v1/driving/';
    const routeUrl = `${routerBase}${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
    const navigateButton = document.getElementById('navigate-route-btn');
    if (navigateButton) {
      navigateButton.disabled = true;
      navigateButton.classList.add('is-loading');
    }

    try {
      const response = await fetch(routeUrl);
      if (!response.ok) throw new Error(`Route service returned ${response.status}`);
      const routeData = await response.json();
      const route = routeData.routes && routeData.routes[0];
      if (!route || !route.geometry) throw new Error('No route found');

      if (AppState.routeLayer) AppState.mapInstance.removeLayer(AppState.routeLayer);
      if (AppState.routeSourceMarker) AppState.mapInstance.removeLayer(AppState.routeSourceMarker);
      if (AppState.routeDestinationMarker) AppState.mapInstance.removeLayer(AppState.routeDestinationMarker);

      AppState.routeLayer = L.geoJSON(route.geometry, {
        style: { color: '#0f766e', weight: 9, opacity: 0.16 },
        interactive: false
      }).addTo(AppState.mapInstance);
      L.geoJSON(route.geometry, {
        style: { color: '#0d9488', weight: 4, opacity: 1 },
        interactive: false
      }).addTo(AppState.routeLayer);
      AppState.routeSourceMarker = createRouteMarker(source, 'source');
      AppState.routeDestinationMarker = createRouteMarker(destination, 'destination');
      AppState.mapInstance.fitBounds(L.geoJSON(route.geometry).getBounds(), { padding: [56, 56], maxZoom: 15 });

      const results = document.getElementById('route-results');
      const distance = document.getElementById('route-distance');
      const duration = document.getElementById('route-duration');
      const stepCount = document.getElementById('route-step-count');
      const title = document.getElementById('route-results-title');
      const modeBadge = document.getElementById('route-mode-badge');
      const directions = document.getElementById('route-directions');
      if (results) results.hidden = false;
      if (distance) distance.textContent = `${(route.distance / 1000).toFixed(1)} km`;
      if (duration) duration.textContent = formatRouteDuration(route.duration);
      if (stepCount) stepCount.textContent = `${route.legs.reduce((count, leg) => count + leg.steps.length, 0)} steps`;
      if (title) title.textContent = `${source.name} to ${destination.name}`;
      if (modeBadge) modeBadge.textContent = mode === 'walking' ? 'Walking' : 'Driving';
      if (directions) {
        const steps = route.legs.flatMap(leg => leg.steps).slice(0, 8);
        directions.innerHTML = steps.map(step =>
          `<li><span class="direction-icon"><i data-lucide="${step.maneuver.type === 'arrive' ? 'flag' : 'corner-up-right'}"></i></span><span>${formatInstruction(step)}</span><small>${(step.distance / 1000).toFixed(1)} km</small></li>`
        ).join('');
      }
      if (window.lucide) lucide.createIcons();
      showToast(`Route ready: ${(route.distance / 1000).toFixed(1)} km, about ${formatRouteDuration(route.duration)}.`, 'success');
    } catch (error) {
      console.warn('Route lookup failed:', error.message);
      if (validation) validation.textContent = 'We could not load this route. Please try again.';
      showToast('Could not load the route. Check your internet connection.', 'warning');
    } finally {
      if (navigateButton) {
        navigateButton.disabled = false;
        navigateButton.classList.remove('is-loading');
      }
    }
  }

  function renderMapMarkers(filterType = 'all') {
    if (!AppState.mapInstance) return;

    AppState.mapMarkers.forEach(m => AppState.mapInstance.removeLayer(m));
    AppState.mapMarkers = [];

    const filtered = STATIONS_DATA.filter(st => {
      if (filterType === 'fast') return st.speedKw >= 50;
      if (filterType === 'ultra') return st.speedKw >= 150;
      if (filterType === 'available') return st.availSlots > 0;
      if (filterType === 'solar') return st.solar === true;
      return true;
    });

    filtered.forEach(st => {
      const pinClass = st.status === 'green' ? 'pin-green' : (st.status === 'amber' ? 'pin-amber' : 'pin-red');
      const reservedSlots = Math.max(0, st.totalSlots - st.availSlots);
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="station-marker-wrap">
          <div class="station-slot-badge"><span class="slot-free">${st.availSlots} Free</span><span class="slot-reserved">${reservedSlots} Reserved</span></div>
          <div class="custom-station-pin ${pinClass}"><i data-lucide="zap" style="width:16px;height:16px;"></i></div>
        </div>`,
        iconSize: [142, 58],
        iconAnchor: [71, 45]
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(AppState.mapInstance);

      marker.on('click', () => {
        showFloatingMapPreview(st);
      });

      AppState.mapMarkers.push(marker);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function updateUserLocationMarker(lat, lng, accuracy = 20, centerMap = false) {
    AppState.userLocation.lat = lat;
    AppState.userLocation.lng = lng;
    AppState.userLocation.accuracy = accuracy;
    AppState.userLocation.hasGps = true;

    updateAllStationDistances(lat, lng);

    const coordsDisp = document.getElementById('gps-coords-display');
    const statusText = document.getElementById('gps-status-text');
    const beacon = document.getElementById('gps-pulse-beacon');
    if (coordsDisp) {
      coordsDisp.textContent = `Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}° (±${Math.round(accuracy)}m)`;
    }
    if (statusText) {
      statusText.textContent = AppState.isLiveTracking ? 'Real-Time GPS: Continuous Tracking Active' : 'Real-Time GPS: Position Fixed';
    }
    if (beacon) {
      beacon.className = 'gps-pulse-beacon active-stream';
    }

    if (!AppState.mapInstance) return;

    const userIcon = L.divIcon({
      className: 'user-gps-leaflet-icon',
      html: `
        <div class="user-gps-container">
          <div class="user-gps-radar"></div>
          <div class="user-gps-core"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    if (AppState.userMarker) {
      AppState.userMarker.setLatLng([lat, lng]);
    } else {
      AppState.userMarker = L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(AppState.mapInstance);
      AppState.userMarker.bindTooltip('<b>📍 Your Live Location</b>', { permanent: false, direction: 'top' });
    }

    if (AppState.accuracyCircle) {
      AppState.accuracyCircle.setLatLng([lat, lng]);
      AppState.accuracyCircle.setRadius(Math.min(accuracy, 200));
    } else {
      AppState.accuracyCircle = L.circle([lat, lng], {
        radius: Math.min(accuracy, 200),
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 3'
      }).addTo(AppState.mapInstance);
    }

    if (centerMap) {
      AppState.mapInstance.setView([lat, lng], 14, { animate: true });
    }

    if (AppState.routeTarget) {
      drawRouteToStation(AppState.routeTarget);
    }
  }

  async function drawRouteToStation(station) {
    if (!AppState.mapInstance || !station) return;

    const sourceLat = AppState.userLocation.lat || 11.0168;
    const sourceLng = AppState.userLocation.lng || 76.9558;
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${sourceLng},${sourceLat};${station.lng},${station.lat}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(routeUrl);
      if (!response.ok) throw new Error(`Route service returned ${response.status}`);
      const routeData = await response.json();
      const route = routeData.routes && routeData.routes[0];
      if (!route || !route.geometry) throw new Error('No driving route found');

      if (AppState.routeLayer) {
        AppState.mapInstance.removeLayer(AppState.routeLayer);
      }

      AppState.routeLayer = L.geoJSON(route.geometry, {
        style: { color: '#2563EB', weight: 5, opacity: 0.85 }
      }).addTo(AppState.mapInstance);

      const bounds = AppState.routeLayer.getBounds();
      AppState.mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });

      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMins = Math.max(1, Math.round(route.duration / 60));
      showToast(`Route: ${distanceKm} km, about ${durationMins} min to ${station.name}.`, 'success');
    } catch (error) {
      console.warn('Route lookup failed:', error.message);
      showToast('Could not load the road route. Check your internet connection.', 'warning');
    }
  }

  function requestUserLocation(centerMap = true) {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported on this browser. Using standard location.', 'warning');
      updateUserLocationMarker(11.0168, 76.9558, 25, centerMap);
      return;
    }

    const statusText = document.getElementById('gps-status-text');
    if (statusText) statusText.textContent = 'Acquiring high-accuracy GPS...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateUserLocationMarker(latitude, longitude, accuracy, centerMap);
        showToast(`📍 Live GPS Locked! Accuracy: ±${Math.round(accuracy)}m`, 'success');
      },
      (error) => {
        console.warn('GPS Error:', error.message);
        showToast('Location fixed to Study World College, Coimbatore.', 'info');
        updateUserLocationMarker(11.0168, 76.9558, 30, centerMap);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function toggleLiveTracking() {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser', 'warning');
      return;
    }

    if (AppState.isLiveTracking) {
      if (AppState.userLocation.watchId !== null) {
        navigator.geolocation.clearWatch(AppState.userLocation.watchId);
        AppState.userLocation.watchId = null;
      }
      AppState.isLiveTracking = false;
      const liveBtn = document.getElementById('btn-toggle-live-gps');
      const liveLabel = document.getElementById('live-tracking-label');
      if (liveBtn) liveBtn.classList.remove('active-state');
      if (liveLabel) liveLabel.textContent = 'Live Stream';
      const statusText = document.getElementById('gps-status-text');
      if (statusText) statusText.textContent = 'Real-Time GPS: Position Fixed';
      showToast('Live GPS stream paused', 'info');
    } else {
      AppState.isLiveTracking = true;
      const liveBtn = document.getElementById('btn-toggle-live-gps');
      const liveLabel = document.getElementById('live-tracking-label');
      if (liveBtn) liveBtn.classList.add('active-state');
      if (liveLabel) liveLabel.textContent = 'Tracking ON';

      AppState.userLocation.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          updateUserLocationMarker(latitude, longitude, accuracy, false);
        },
        (error) => console.warn('WatchPosition error:', error),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
      showToast('⚡ Live GPS Streaming Active: Auto-updating position', 'success');
    }
  }

  function sortStationsByNearest() {
    const userLat = AppState.userLocation.lat || 11.0168;
    const userLng = AppState.userLocation.lng || 76.9558;

    STATIONS_DATA.sort((a, b) => {
      const distA = a.calculatedDistance || calculateHaversineDistance(userLat, userLng, a.lat, a.lng);
      const distB = b.calculatedDistance || calculateHaversineDistance(userLat, userLng, b.lat, b.lng);
      return distA - distB;
    });

    renderNearbyStationsList();
    renderMapMarkers('all');
    showToast(`Stations sorted by distance (${STATIONS_DATA[0].name} is closest)`, 'success');
  }

  function showFloatingMapPreview(st) {
    const previewBox = document.getElementById('map-station-preview');
    if (!previewBox) return;

    AppState.selectedMapStation = st;

    const userLat = (AppState.userLocation && AppState.userLocation.lat) ? AppState.userLocation.lat : 11.0168;
    const userLng = (AppState.userLocation && AppState.userLocation.lng) ? AppState.userLocation.lng : 76.9558;
    const dist = calculateHaversineDistance(userLat, userLng, st.lat, st.lng);
    const distText = dist < 1.0 ? `${Math.round(dist * 1000)} m away` : `${dist.toFixed(1)} km away`;

    const ovName = document.getElementById('ov-name');
    const ovAddress = document.getElementById('ov-address');
    const ovStatus = document.getElementById('ov-status');
    const ovSpeed = document.getElementById('ov-speed');
    const ovPrice = document.getElementById('ov-price');
    const ovDistVal = document.getElementById('ov-dist-val');

    if (ovName) ovName.textContent = st.name;
    if (ovAddress) ovAddress.textContent = `${st.address.split('•')[0].trim()} • ${distText}`;
    if (ovStatus) ovStatus.textContent = `${st.availSlots} Free / ${Math.max(0, st.totalSlots - st.availSlots)} Reserved`;
    if (ovSpeed) ovSpeed.textContent = `${st.speedKw} kW Fast DC`;
    if (ovPrice) ovPrice.textContent = `₹${st.price.toFixed(2)} / kWh`;
    if (ovDistVal) ovDistVal.textContent = distText;

    previewBox.style.display = 'flex';

    if (AppState.mapInstance) {
      AppState.mapInstance.panTo([st.lat, st.lng], { animate: true });
    }
  }

  const closeMapPreviewBtn = document.getElementById('close-map-preview');
  if (closeMapPreviewBtn) {
    closeMapPreviewBtn.addEventListener('click', () => {
      const previewBox = document.getElementById('map-station-preview');
      if (previewBox) previewBox.style.display = 'none';
    });
  }

  // Map Filter Chips
  document.querySelectorAll('.map-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.map-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      renderMapMarkers(filter);
    });
  });

  // Map Search Bar
  const mapSearchInput = document.getElementById('map-search-input');
  if (mapSearchInput) {
    mapSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderMapMarkers('all');
        return;
      }
      AppState.mapMarkers.forEach(m => AppState.mapInstance.removeLayer(m));
      AppState.mapMarkers = [];

      const matched = STATIONS_DATA.filter(s => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query));
      matched.forEach(st => {
        const pinClass = st.status === 'green' ? 'pin-green' : (st.status === 'amber' ? 'pin-amber' : 'pin-red');
        const reservedSlots = Math.max(0, st.totalSlots - st.availSlots);
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="station-marker-wrap">
            <div class="station-slot-badge"><span class="slot-free">${st.availSlots} Free</span><span class="slot-reserved">${reservedSlots} Reserved</span></div>
            <div class="custom-station-pin ${pinClass}"><i data-lucide="zap" style="width:16px;height:16px;"></i></div>
          </div>`,
          iconSize: [142, 58],
          iconAnchor: [71, 45]
        });
        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(AppState.mapInstance);
        marker.on('click', () => showFloatingMapPreview(st));
        AppState.mapMarkers.push(marker);
      });

      if (window.lucide) lucide.createIcons();
    });
  }

  const mapLocateBtn = document.getElementById('map-locate-me-btn');
  if (mapLocateBtn) mapLocateBtn.addEventListener('click', () => requestUserLocation(true));

  const routeValidation = document.getElementById('route-validation-message');
  setupLocationSearch('route-source-input', 'route-source-suggestions');
  setupLocationSearch('route-destination-input', 'route-destination-suggestions');

  const navigateRouteBtn = document.getElementById('navigate-route-btn');
  if (navigateRouteBtn) navigateRouteBtn.addEventListener('click', drawSelectedRoute);

  document.querySelectorAll('.travel-mode-btn:not([disabled])').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.travel-mode-btn').forEach(modeButton => modeButton.classList.remove('active'));
      button.classList.add('active');
      AppState.routeMode = button.dataset.mode || 'driving';
      if (AppState.routeSource && AppState.routeDestination) drawSelectedRoute();
    });
  });

  const routeSwapBtn = document.getElementById('route-swap-btn');
  if (routeSwapBtn) {
    routeSwapBtn.addEventListener('click', () => {
      const sourceInput = document.getElementById('route-source-input');
      const destinationInput = document.getElementById('route-destination-input');
      if (!sourceInput || !destinationInput) return;
      const sourceValue = {
        value: sourceInput.value,
        lat: sourceInput.dataset.lat,
        lng: sourceInput.dataset.lng
      };
      sourceInput.value = destinationInput.value;
      sourceInput.dataset.lat = destinationInput.dataset.lat || '';
      sourceInput.dataset.lng = destinationInput.dataset.lng || '';
      destinationInput.value = sourceValue.value;
      destinationInput.dataset.lat = sourceValue.lat || '';
      destinationInput.dataset.lng = sourceValue.lng || '';
      if (routeValidation) routeValidation.textContent = '';
    });
  }

  const toggleLiveGpsBtn = document.getElementById('btn-toggle-live-gps');
  if (toggleLiveGpsBtn) toggleLiveGpsBtn.addEventListener('click', toggleLiveTracking);

  const sortNearestBtn = document.getElementById('btn-sort-nearest');
  if (sortNearestBtn) sortNearestBtn.addEventListener('click', sortStationsByNearest);

  const nearbyGpsSyncBtn = document.getElementById('nearby-gps-sync-btn');
  if (nearbyGpsSyncBtn) {
    nearbyGpsSyncBtn.addEventListener('click', () => {
      requestUserLocation(false);
      sortStationsByNearest();
    });
  }

  /* ==========================================================================
     10. Analytics Charts & Hourly Heatmap (Analytics Tab)
     ========================================================================== */
  function initAnalyticsCharts() {
    const weeklyCtx = document.getElementById('weeklyLoadChart');
    if (weeklyCtx && !AppState.weeklyChartInstance) {
      AppState.weeklyChartInstance = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Peak Load (kW)',
              data: [1420, 1490, 1380, 1510, 1720, 1310, 1180],
              backgroundColor: '#2563EB',
              borderRadius: 6
            },
            {
              label: 'Off-Peak Load (kW)',
              data: [420, 450, 410, 480, 560, 680, 620],
              backgroundColor: '#10B981',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { family: 'Plus Jakarta Sans', size: 11 } }
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: { ticks: { callback: v => `${v} kW` } }
          }
        }
      });
    }

    const energyMixCtx = document.getElementById('energyMixChart');
    if (energyMixCtx && !AppState.energyMixChartInstance) {
      AppState.energyMixChartInstance = new Chart(energyMixCtx, {
        type: 'doughnut',
        data: {
          labels: ['Solar PV (42%)', 'Wind Energy (22%)', 'Hydro Power (14%)', 'Thermal Grid (22%)'],
          datasets: [{
            data: [42, 22, 14, 22],
            backgroundColor: ['#10B981', '#06B6D4', '#3B82F6', '#94A3B8'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { family: 'Plus Jakarta Sans', size: 10 } }
            }
          }
        }
      });
    }
  }

  function renderHourlyHeatmap() {
    const heatmapContainer = document.getElementById('congestion-heatmap');
    if (!heatmapContainer || heatmapContainer.children.length > 0) return;

    const hourlyLoads = [
      { hour: '00', load: 18 }, { hour: '02', load: 12 }, { hour: '04', load: 15 },
      { hour: '06', load: 38 }, { hour: '08', load: 88 }, { hour: '10', load: 76 },
      { hour: '12', load: 52 }, { hour: '14', load: 45 }, { hour: '16', load: 68 },
      { hour: '18', load: 94 }, { hour: '20', load: 91 }, { hour: '22', load: 42 }
    ];

    hourlyLoads.forEach(item => {
      let heatClass = 'heat-low';
      if (item.load > 85) heatClass = 'heat-crit';
      else if (item.load > 70) heatClass = 'heat-high';
      else if (item.load > 40) heatClass = 'heat-med';

      const cell = document.createElement('div');
      cell.className = 'heat-cell';
      cell.innerHTML = `
        <span class="heat-hour">${item.hour}:00</span>
        <div class="heat-bar ${heatClass}">${item.load}%</div>
      `;
      heatmapContainer.appendChild(cell);
    });
  }

  /* ==========================================================================
     11. AI Demand Prediction Studio Simulation & "Clear Sandbox"
     ========================================================================== */
  function initSimulationChart() {
    const simCtx = document.getElementById('simulationChart');
    if (!simCtx) return;

    const defaultHours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const defaultData = [420, 310, 540, 1450, 990, 1150, 1720, 1390];

    if (AppState.simulationChartInstance) {
      AppState.simulationChartInstance.destroy();
    }

    AppState.simulationChartInstance = new Chart(simCtx, {
      type: 'line',
      data: {
        labels: defaultHours,
        datasets: [{
          label: 'Simulated AI Load (kW)',
          data: defaultData,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.38,
          pointBackgroundColor: '#8B5CF6',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => `Simulated Load: ${c.raw} kW (${Math.round((c.raw/2000)*100)}% capacity)`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { ticks: { callback: v => `${v} kW` } }
        }
      }
    });

    // Bind Run Simulation Button
    const runInferenceBtn = document.getElementById('run-ai-inference-btn');
    if (runInferenceBtn) {
      runInferenceBtn.onclick = runSimulationInference;
    }

    // Bind Clear Sandbox Button
    const clearSandboxBtn = document.getElementById('clear-sandbox-btn');
    if (clearSandboxBtn) {
      clearSandboxBtn.onclick = clearSimulationSandbox;
    }
  }

  async function runSimulationInference() {
    const day = document.getElementById('sim-day').value;
    const weather = document.getElementById('sim-weather').value;
    const zone = document.getElementById('sim-zone').value;
    const event = document.getElementById('sim-event').value;

    const statusBadge = document.getElementById('sim-model-status');
    const subtitle = document.getElementById('sim-result-subtitle');
    const insightText = document.getElementById('sim-ai-insight-text');

    if (statusBadge) statusBadge.textContent = 'Computing Bi-LSTM Inference...';

    try {
      const res = await fetch(apiUrl('/api/simulations/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, weather, zone, event })
      });
      const response = await res.json();

      if (response && response.success) {
        const sim = response.data;
        if (AppState.simulationChartInstance) {
          AppState.simulationChartInstance.data.labels = sim.chart_data.labels;
          AppState.simulationChartInstance.data.datasets[0].data = sim.chart_data.predicted;
          AppState.simulationChartInstance.update();
        }

        if (statusBadge) statusBadge.textContent = 'Inference Computed (MySQL Saved)';
        if (subtitle) subtitle.textContent = `Forecast: ${sim.scenario.toUpperCase()}`;
        if (insightText) insightText.innerHTML = sim.ai_recommendation;

        showToast('⚡ Bi-LSTM Simulation computed and saved to database', 'success');
        return;
      }
    } catch (err) {
      console.warn('Simulation API error:', err);
    }

    // Fallback Client-side Simulation
    const baseCurve = [420, 310, 540, 1450, 990, 1150, 1720, 1390];
    let mult = 1.0;
    if (day === 'friday') mult *= 1.15;
    if (day === 'weekend') mult *= 0.85;
    if (weather === 'heatwave') mult *= 1.25;
    if (event === 'stadium') mult *= 1.35;

    const newSimData = baseCurve.map(val => Math.round(val * mult));
    if (AppState.simulationChartInstance) {
      AppState.simulationChartInstance.data.datasets[0].data = newSimData;
      AppState.simulationChartInstance.update();
    }
    if (statusBadge) statusBadge.textContent = 'Inference Computed';
    showToast('AI Simulation completed', 'success');
  }

  async function clearSimulationSandbox() {
    const statusBadge = document.getElementById('sim-model-status');
    const subtitle = document.getElementById('sim-result-subtitle');
    const insightText = document.getElementById('sim-ai-insight-text');

    // 1. Reset all dropdown selects to clean default values
    const simDay = document.getElementById('sim-day');
    const simWeather = document.getElementById('sim-weather');
    const simZone = document.getElementById('sim-zone');
    const simEvent = document.getElementById('sim-event');

    if (simDay) simDay.value = 'weekday';
    if (simWeather) simWeather.value = 'clear';
    if (simZone) simZone.value = 'it_corridor';
    if (simEvent) simEvent.value = 'none';

    // 2. Call backend clear endpoint
    try {
      const res = await fetch(apiUrl('/api/simulations/clear'), { method: 'POST' });
      const response = await res.json();
      if (response && response.success) {
        const base = response.data;
        if (AppState.simulationChartInstance) {
          AppState.simulationChartInstance.data.labels = base.chart_data.labels;
          AppState.simulationChartInstance.data.datasets[0].data = base.chart_data.predicted;
          AppState.simulationChartInstance.update();
        }
        if (statusBadge) statusBadge.textContent = 'Sandbox Cleared (Baseline)';
        if (subtitle) subtitle.textContent = 'Showing default baseline profile for Weekday • Clear Weather';
        if (insightText) insightText.innerHTML = base.ai_recommendation;

        showToast('🧹 Simulation Sandbox Cleared! Default baseline restored.', 'success');
        return;
      }
    } catch (error) {
      console.error('Simulation sandbox clear failed:', error);
      if (statusBadge) statusBadge.textContent = 'Live service unavailable';
      if (subtitle) subtitle.textContent = 'Connect to the live server to clear this sandbox.';
      showToast('Unable to clear the simulation sandbox. Live server connection is required.', 'warning');
    }
  }

  /* ==========================================================================
     12. Energy & Cost Estimation Calculator (Home Tab)
     ========================================================================== */
  function initEstimationCalculator() {
    const currentBatSlider = document.getElementById('curr-battery-slider');
    const targetBatSlider = document.getElementById('target-battery-slider');
    const evModelSelect = document.getElementById('ev-model-select');

    const currentBatVal = document.getElementById('curr-battery-disp');
    const targetBatVal = document.getElementById('target-battery-disp');
    const estKwhElem = document.getElementById('res-energy-kwh');
    const estTimeElem = document.getElementById('res-charge-time');
    const estCostElem = document.getElementById('res-charge-cost');
    const estSavedElem = document.getElementById('res-saved-cost');
    const estCo2Elem = document.getElementById('res-co2-saved');
    const chargerLabelElem = document.getElementById('res-charger-label');

    // Battery status card (in predict view)
    const battCurrentDisp = document.getElementById('batt-current-pct');
    const battTargetDisp = document.getElementById('batt-target-pct');

    function getSelectedChargerPower() {
      const activeBtn = document.querySelector('#calc-charger-speed .seg-btn.active');
      return activeBtn ? parseInt(activeBtn.dataset.speed, 10) : 150;
    }

    function calculate() {
      const curBat = parseInt(currentBatSlider ? currentBatSlider.value : 20, 10);
      const tarBat = parseInt(targetBatSlider ? targetBatSlider.value : 85, 10);
      const batCap = parseFloat(evModelSelect ? evModelSelect.value : 40.5);
      const chargerKw = getSelectedChargerPower();

      if (currentBatVal) currentBatVal.textContent = `${curBat}%`;
      if (targetBatVal) targetBatVal.textContent = `${tarBat}%`;

      // Update battery status card in predict view
      if (battCurrentDisp) battCurrentDisp.textContent = `${curBat}%`;
      if (battTargetDisp) battTargetDisp.textContent = `${tarBat}%`;
      const battCurrentBar = document.getElementById('batt-current-bar');
      const battTargetBar = document.getElementById('batt-target-bar');
      if (battCurrentBar) battCurrentBar.style.width = `${curBat}%`;
      if (battTargetBar) battTargetBar.style.width = `${tarBat}%`;
      // Color current bar based on level
      if (battCurrentBar) {
        if (curBat <= 20) battCurrentBar.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
        else if (curBat <= 50) battCurrentBar.style.background = 'linear-gradient(90deg, #f59e0b, #eab308)';
        else battCurrentBar.style.background = 'linear-gradient(90deg, #10b981, #3b82f6)';
      }

      AppState.currentBattery = curBat;
      AppState.targetBattery = tarBat;

      const deltaPct = Math.max(0, tarBat - curBat);
      const energyNeededKwh = (batCap * (deltaPct / 100));
      
      // Charging time considering DC fast charge taper curve (avg efficiency 88%)
      const effectiveKw = Math.min(chargerKw, 120);
      const chargeTimeHours = energyNeededKwh / (effectiveKw * 0.88);
      const chargeTimeMinutes = Math.round(chargeTimeHours * 60);

      // Tariff average ₹14.50/kWh (Smart off-peak gives 38% discount)
      const baseCost = energyNeededKwh * 14.50;
      const offPeakCost = energyNeededKwh * 8.50;
      const savings = Math.max(0, baseCost - offPeakCost);

      // CO2 Saved vs Petrol Car (approx 0.72 kg CO2 saved per kWh)
      const co2SavedKg = energyNeededKwh * 0.72;

      // Range added (approx 7 km per kWh)
      const rangeKm = Math.round(energyNeededKwh * 7);

      if (estKwhElem) estKwhElem.innerHTML = `${energyNeededKwh.toFixed(1)} <small>kWh</small>`;
      if (estTimeElem) estTimeElem.innerHTML = `${chargeTimeMinutes} <small>mins</small>`;
      if (estCostElem) estCostElem.textContent = `₹${offPeakCost.toFixed(2)}`;
      if (estSavedElem) estSavedElem.textContent = `₹${savings.toFixed(2)}`;
      if (estCo2Elem) estCo2Elem.innerHTML = `${co2SavedKg.toFixed(1)} <small>kg</small>`;
      if (chargerLabelElem) chargerLabelElem.textContent = `On ${chargerKw} kW ${chargerKw >= 100 ? 'DC Ultra-Fast' : chargerKw >= 50 ? 'DC Fast' : 'AC Level 2'}`;

      // Update tile sub for range
      const rangeSub = document.querySelector('#res-energy-kwh')?.closest('.calc-result-tile')?.querySelector('.tile-sub');
      if (rangeSub) rangeSub.textContent = `+${rangeKm} km Range Added`;
    }

    if (currentBatSlider) currentBatSlider.addEventListener('input', calculate);
    if (targetBatSlider) targetBatSlider.addEventListener('input', calculate);
    if (evModelSelect) evModelSelect.addEventListener('change', calculate);

    // Charger speed pill buttons
    const chargerSpeedGroup = document.getElementById('calc-charger-speed');
    if (chargerSpeedGroup) {
      chargerSpeedGroup.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chargerSpeedGroup.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          AppState.selectedChargerPower = parseInt(btn.dataset.speed, 10);
          calculate();
        });
      });
    }

    calculate();
  }

  /* ==========================================================================
     13. Settings & Dark Mode Toggle
     ========================================================================== */
  const themeToggleCheck = document.getElementById('theme-toggle-check');
  if (themeToggleCheck) {
    themeToggleCheck.addEventListener('change', () => {
      AppState.darkMode = themeToggleCheck.checked;
      if (AppState.darkMode) {
        document.body.classList.add('dark-mode');
        showToast('Cyber Dark Mode Enabled', 'info');
      } else {
        document.body.classList.remove('dark-mode');
        showToast('Clean Light Mode Enabled', 'info');
      }
    });
  }

  /* ==========================================================================
     14. Toast Notification Utility
     ========================================================================== */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    if (window.lucide) {
      lucide.createIcons();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function setupEmailPasswordAuth() {
    const loginScreen = document.getElementById('login-screen');
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitButton = document.getElementById('auth-submit-btn');
    const googleButton = document.getElementById('google-auth-btn');
    const modeButton = document.getElementById('auth-mode-btn');
    const status = document.getElementById('login-status');
    const copy = document.getElementById('login-copy');
    const title = document.getElementById('login-title');
    let firebaseAuth = null;
    let createUserWithEmailAndPasswordFn = null;
    let signInWithEmailAndPasswordFn = null;
    let GoogleAuthProviderFn = null;
    let signInWithPopupFn = null;
    let signInWithRedirectFn = null;
    let signOutFn = null;
    let isSignUpMode = false;

    const createGoogleProvider = () => {
      const provider = new GoogleAuthProviderFn();
      provider.setCustomParameters({ prompt: 'select_account' });
      return provider;
    };

    if (!loginScreen || !authForm) return;

    const setStatus = (message, isError = true) => {
      status.textContent = message;
      status.style.color = isError ? '#b45309' : '#159a62';
    };

    if (window.location.protocol === 'file:') {
      setStatus('Open this app with "npm start" at http://localhost:5500 to use live authentication and telemetry.');
      return;
    }

    const firebaseErrorMessage = error => {
      const messages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/missing-password': 'Please enter a password.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/email-already-in-use': 'An account already exists for this email. Log in instead.',
        'auth/invalid-credential': 'The email or password is incorrect.',
        'auth/user-not-found': 'The email or password is incorrect.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication.',
        'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/unauthorized-domain': 'This website is not authorized in Firebase. Add localhost in Firebase Authentication settings.',
        'auth/account-exists-with-different-credential': 'An account already exists with another sign-in method.'
      };
      console.error('[Firebase Auth]', error.code || 'unknown-error', error);
      return messages[error.code] || 'We could not complete authentication. Please try again.';
    };

    const readJsonResponse = async (response, requestPath) => {
      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();
      if (!contentType.toLowerCase().includes('application/json')) {
        console.error('[API Response]', requestPath, response.status, contentType, responseText.slice(0, 200));
        throw new Error(`The authentication server returned a non-JSON response for ${requestPath}. Start this project with "npm start" and open http://localhost:5500.`);
      }
      let payload;
      try {
        payload = JSON.parse(responseText);
      } catch (error) {
        console.error('[API JSON Parse]', requestPath, error, responseText.slice(0, 200));
        throw new Error(`The authentication server returned invalid JSON for ${requestPath}.`);
      }
      if (!response.ok) {
        throw new Error(payload.message || `Authentication request failed with status ${response.status}.`);
      }
      return payload;
    };

    const loadFirebaseAuth = async () => {
      if (firebaseAuth) return firebaseAuth;
      const backendCandidates = [BACKEND_URL];
      if (window.location.hostname === 'localhost') {
        for (const candidate of ['http://localhost:5500', 'http://localhost:3001', 'http://localhost:3000']) {
          if (!backendCandidates.includes(candidate)) backendCandidates.push(candidate);
        }
      }

      let payload;
      let lastError;
      for (const candidate of backendCandidates) {
        try {
          const response = await fetch(`${candidate}/api/config/firebase`);
          payload = await readJsonResponse(response, '/api/config/firebase');
          BACKEND_URL = candidate;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!payload) throw lastError || new Error('Unable to reach the authentication server.');
      if (!payload.configured) {
        throw new Error('Firebase Authentication is not configured on this server. Add the Firebase web values to .env.');
      }

      const [{ initializeApp }, { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged }] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js')
      ]);
      if (!firebaseAuth) {
        const firebaseApp = initializeApp(payload.config);
        firebaseAuth = getAuth(firebaseApp);
        createUserWithEmailAndPasswordFn = createUserWithEmailAndPassword;
        signInWithEmailAndPasswordFn = signInWithEmailAndPassword;
        GoogleAuthProviderFn = GoogleAuthProvider;
        signInWithPopupFn = signInWithPopup;
        signInWithRedirectFn = signInWithRedirect;
        signOutFn = signOut;
        try {
          await getRedirectResult(firebaseAuth);
        } catch (error) {
          setStatus(firebaseErrorMessage(error));
        }
        onAuthStateChanged(firebaseAuth, user => {
          loginScreen.classList.toggle('is-hidden', Boolean(user));
          if (user) {
            updateAuthenticatedUser(user);
            fetchStations();
          }
        });
      }
      return firebaseAuth;
    };

    window.addEventListener('ev-charge-signout', async () => {
      try {
        if (firebaseAuth && signOutFn) await signOutFn(firebaseAuth);
        await fetch(apiUrl('/api/auth/logout'), { method: 'POST' });
        window.location.reload();
      } catch {
        setStatus('Unable to end the session right now.');
      }
    });

    const authenticate = async () => {
      submitButton.disabled = true;
      setStatus(isSignUpMode ? 'Creating your account...' : 'Signing you in...', false);
      try {
        const auth = await loadFirebaseAuth();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (isSignUpMode) {
          await createUserWithEmailAndPasswordFn(auth, email, password);
        } else {
          await signInWithEmailAndPasswordFn(auth, email, password);
        }
        loginScreen.classList.add('is-hidden');
        setStatus('', false);
        fetchStations();
      } catch (error) {
        setStatus(error.code ? firebaseErrorMessage(error) : error.message);
      } finally {
        submitButton.disabled = false;
      }
    };

    authForm.addEventListener('submit', async event => {
      event.preventDefault();
      await authenticate();
    });

    googleButton.addEventListener('click', async () => {
      googleButton.disabled = true;
      setStatus('Connecting to Google...', false);
      try {
        const auth = await loadFirebaseAuth();
        await signInWithPopupFn(auth, createGoogleProvider());
        loginScreen.classList.add('is-hidden');
        setStatus('', false);
        fetchStations();
      } catch (error) {
        if (error.code === 'auth/popup-blocked') {
          try {
            const auth = await loadFirebaseAuth();
            await signInWithRedirectFn(auth, createGoogleProvider());
          } catch (redirectError) {
            setStatus(redirectError.code ? firebaseErrorMessage(redirectError) : redirectError.message);
          }
          return;
        }
        setStatus(error.code ? firebaseErrorMessage(error) : error.message);
      } finally {
        googleButton.disabled = false;
      }
    });

    loadFirebaseAuth().catch(error => {
      console.error('Firebase unavailable; live authentication is required.', error);
      updateBackendStatus(false, 'Live services unavailable');
      setStatus(error.message || 'Live authentication is unavailable. Start the server and try again.');
    });

    modeButton.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      submitButton.textContent = isSignUpMode ? 'Sign up' : 'Log in';
      modeButton.textContent = isSignUpMode ? 'Already have an account? Log in' : 'Need an account? Sign up';
      title.textContent = isSignUpMode ? 'Create your account' : 'Welcome back';
      passwordInput.autocomplete = isSignUpMode ? 'new-password' : 'current-password';
      copy.textContent = isSignUpMode
        ? 'Create an account to see live charging availability across Tamil Nadu.'
        : 'Sign in with your email to see live charging availability across Tamil Nadu.';
      setStatus('', false);
      emailInput.focus();
    });

  }

  /* ==========================================================================
     15. Master App Initialization
     ========================================================================== */
    setupEmailPasswordAuth();
  initLiveClock();
  fetchForecastData('24h');
  initEstimationCalculator();

  console.log('⚡ EV Charge AI - Real-time Node.js & MySQL Integration Active');
});
