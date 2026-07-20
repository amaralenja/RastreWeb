/**
 * RastreWeb Tracker Loader (rrweb client-side snippet)
 * Version: 1.0.0
 * Lightweight multi-tenant session & heatmap recorder script.
 */
(function () {
  'use strict';

  // 1. Locate current script tag and extract configuration
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].getAttribute('data-site')) return scripts[i];
    }
    return null;
  })();

  if (!currentScript) {
    console.warn('[RastreWeb] Script tag com attribute data-site não encontrado.');
    return;
  }

  var siteKey = currentScript.getAttribute('data-site');
  var endpoint = currentScript.getAttribute('data-endpoint') || (window.location.origin + '/api/ingest-session');

  if (!siteKey) {
    console.warn('[RastreWeb] site_key ausente. O rastreamento está desativado.');
    return;
  }

  // 2. Manage Session ID (per tab session)
  var SESSION_KEY = '_rw_session_id';
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // 3. User agent & Device info helpers
  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowserName() {
    var ua = navigator.userAgent;
    if (ua.indexOf("Firefox") > -1) return "Firefox";
    if (ua.indexOf("SamsungBrowser") > -1) return "Samsung Internet";
    if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
    if (ua.indexOf("Trident") > -1) return "Internet Explorer";
    if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) return "Edge";
    if (ua.indexOf("Chrome") > -1) return "Chrome";
    if (ua.indexOf("Safari") > -1) return "Safari";
    return "Unknown";
  }

  // 4. Rage Click Detection
  var clickHistory = [];
  var hasRageClick = false;

  document.addEventListener('click', function (e) {
    var now = Date.now();
    var target = e.target;
    
    // Filter last 1000ms clicks on the same element
    clickHistory = clickHistory.filter(function (c) { return now - c.time < 1000; });
    clickHistory.push({ time: now, target: target });

    var sameTargetClicks = clickHistory.filter(function (c) { return c.target === target; });
    if (sameTargetClicks.length >= 3) {
      hasRageClick = true;
    }

    // Heatmap event payload tracking
    var scrollX = window.scrollX || window.pageXOffset || 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var totalWidth = document.documentElement.scrollWidth || window.innerWidth;
    var totalHeight = document.documentElement.scrollHeight || window.innerHeight;

    var clickX = e.pageX || (e.clientX + scrollX);
    var clickY = e.pageY || (e.clientY + scrollY);

    var xPercent = totalWidth > 0 ? Number(((clickX / totalWidth) * 100).toFixed(2)) : 0;
    var yPercent = totalHeight > 0 ? Number(((clickY / totalHeight) * 100).toFixed(2)) : 0;

    heatmapEvents.push({
      page_path: window.location.pathname,
      event_type: 'click',
      x_percent: xPercent,
      y_percent: yPercent,
      viewport_width: window.innerWidth,
      session_id: sessionId
    });
  }, true);

  // 5. Event Buffer & Ingestion Logic
  var eventBuffer = [];
  var heatmapEvents = [];
  var isFlushing = false;
  var startTime = Date.now();

  function flushEvents() {
    if ((eventBuffer.length === 0 && heatmapEvents.length === 0) || isFlushing) return;

    var eventsToSend = eventBuffer.splice(0, eventBuffer.length);
    var heatmapsToSend = heatmapEvents.splice(0, heatmapEvents.length);
    isFlushing = true;

    var payload = {
      site_key: siteKey,
      session_id: sessionId,
      page_entry: window.location.href,
      device: getDeviceType(),
      browser: getBrowserName(),
      started_at: new Date(startTime).toISOString(),
      duration_seconds: Math.floor((Date.now() - startTime) / 1000),
      rage_click: hasRageClick,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      events: eventsToSend,
      heatmap_events: heatmapsToSend
    };

    var bodyText = JSON.stringify(payload);

    // Try Beacon API for page unload, fallback to fetch
    if (navigator.sendBeacon) {
      var blob = new Blob([bodyText], { type: 'application/json' });
      var success = navigator.sendBeacon(endpoint, blob);
      if (success) {
        isFlushing = false;
        return;
      }
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
      keepalive: true
    }).catch(function (err) {
      console.warn('[RastreWeb] Erro ao enviar lote de eventos:', err);
    }).finally(function () {
      isFlushing = false;
    });
  }

  // Flush every 5 seconds
  setInterval(flushEvents, 5000);

  // Flush on page unload / hide
  window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });

  window.addEventListener('beforeunload', flushEvents);

  // 6. Dynamically Load rrweb library
  function loadScript(src, callback) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = callback;
    s.onerror = function () {
      console.error('[RastreWeb] Falha ao carregar a biblioteca rrweb.');
    };
    document.head.appendChild(s);
  }

  loadScript('https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js', function () {
    if (typeof rrweb === 'undefined') {
      console.error('[RastreWeb] rrweb não está definido.');
      return;
    }

    rrweb.record({
      emit: function (event) {
        eventBuffer.push(event);
        if (eventBuffer.length >= 50) {
          flushEvents();
        }
      },
      maskAllInputs: true,
      blockClass: 'rw-block',
      ignoreClass: 'rw-ignore',
      sampling: {
        mousemove: false, // Disables high-frequency mousemove for reduced payload
        scroll: 150,      // Throttle scroll events (150ms)
        input: 'last'     // Record only last input value
      }
    });

    console.log('[RastreWeb] Gravador ativado com sucesso para site_key:', siteKey);
  });
})();
