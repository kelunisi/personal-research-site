/* ============================================================
 * 智脑 · 个人研究站 —— 渲染与交互
 * 内容来自 content.js 的 window.SITE_CONTENT，本文件负责
 * 把内容渲染到页面，并实现 Canvas 节点动画、滚动进度、
 * 滚动显现、卡片悬浮倾斜、移动菜单等交互。
 * ============================================================ */
(function () {
  "use strict";

  var C = window.SITE_CONTENT;
  if (!C) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /* ---------------- 导航 ---------------- */
  function renderNav() {
    var nav = $("#navLinks");
    if (!nav) return;
    clear(nav);
    C.nav.forEach(function (item) {
      var a = el("a", null, item.label);
      a.href = "#" + item.id;
      a.dataset.navId = item.id;
      nav.appendChild(a);
    });

    var toggle = $("#navToggle");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    function closeMenu() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开菜单");
    }
  }

  /* ---------------- 品牌 / 页脚 ---------------- */
  function renderMeta() {
    document.title = C.meta.brand;
    document.querySelectorAll("[data-brand]").forEach(function (n) {
      n.textContent = C.meta.brand;
    });
    var note = $("[data-footer-note]");
    if (note) note.textContent = C.meta.footerNote;
  }

  /* ---------------- 首屏 ---------------- */
  function renderHero() {
    $("[data-hero-eyebrow]").textContent = C.hero.eyebrow;
    // 主标题允许 content.js 使用 <br> 与 .accent 控制换行与强调
    $("[data-hero-title]").innerHTML = C.hero.title;
    $("[data-hero-intro]").textContent = C.hero.intro;
    $("[data-cta-primary]").textContent = C.hero.primaryCta.label;
    $("[data-cta-primary]").setAttribute("href", C.hero.primaryCta.href);
    $("[data-cta-secondary]").textContent = C.hero.secondaryCta.label;
    $("[data-cta-secondary]").setAttribute("href", C.hero.secondaryCta.href);

    var stats = $("[data-hero-stats]");
    clear(stats);
    C.hero.stats.forEach(function (s) {
      var wrap = el("div", "stat");
      wrap.appendChild(el("dt", "stat-label", s.label));
      var value = el("dd", "stat-value");
      value.appendChild(document.createTextNode(String(s.value)));
      value.appendChild(el("em", null, s.suffix));
      wrap.appendChild(value);
      stats.appendChild(wrap);
    });
  }

  /* ---------------- 研究成果 ---------------- */
  var ARROW_SVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M7 17 17 7M8 7h9v9"/></svg>';

  function renderResearch() {
    var grid = $("[data-research-cards]");
    clear(grid);
    C.research.real.forEach(function (item, i) {
      var card = el("article", "card reveal");
      card.appendChild(el("p", "card-type", item.type));
      card.appendChild(el("h3", null, item.title));
      card.appendChild(el("p", "card-summary", item.summary));

      var tags = el("div", "tag-row");
      item.tags.forEach(function (t) {
        tags.appendChild(el("span", "tag", t));
      });
      card.appendChild(tags);

      var foot = el("div", "card-foot");
      foot.appendChild(el("span", "card-status", item.status));
      var link = el("a", "card-link");
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", item.title + " —— " + item.linkLabel);
      link.appendChild(document.createTextNode(item.linkLabel + " "));
      link.insertAdjacentHTML("beforeend", ARROW_SVG);
      foot.appendChild(link);
      card.appendChild(foot);

      card.style.transitionDelay = i * 90 + "ms";
      grid.appendChild(card);
    });

    var reservedGrid = $("[data-research-reserved]");
    clear(reservedGrid);
    C.research.reserved.forEach(function (item, i) {
      var card = el("article", "card card-reserved reveal");
      card.appendChild(el("p", "card-type", item.note));
      card.appendChild(el("h3", null, item.title));
      card.appendChild(el("p", "card-summary", item.description));
      card.style.transitionDelay = i * 90 + "ms";
      reservedGrid.appendChild(card);
    });
  }

  /* ---------------- 研究框架 ---------------- */
  var FLOW_ICONS = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.4-3.4 4-5 7-5s5.6 1.6 7 5"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13M7 12l5 5 5-5M4 21h16"/></svg>',
  ];

  function renderFramework() {
    var flow = $("[data-framework-flow]");
    clear(flow);
    var hints = C.framework.hints || [];
    C.framework.stages.forEach(function (stage, i) {
      var node = el("div", "flow-node");
      var icon = el("div", "flow-icon");
      icon.innerHTML = FLOW_ICONS[i % FLOW_ICONS.length];
      node.appendChild(icon);
      node.appendChild(el("h3", null, stage));
      node.appendChild(el("p", null, hints[i % hints.length] || ""));
      flow.appendChild(node);
    });

    var grid = $("[data-framework-principles]");
    clear(grid);
    C.framework.principles.forEach(function (p, i) {
      var box = el("div", "principle reveal");
      box.appendChild(el("h3", null, p.title));
      box.appendChild(el("p", null, p.text));
      box.style.transitionDelay = i * 70 + "ms";
      grid.appendChild(box);
    });
  }

  /* ---------------- 未来实验 ---------------- */
  function renderRoadmap() {
    var grid = $("[data-roadmap]");
    clear(grid);
    C.roadmap.forEach(function (item, i) {
      var box = el("div", "roadmap-item reveal");
      box.appendChild(el("span", "roadmap-phase", item.phase));
      box.appendChild(el("h3", null, item.title));
      box.appendChild(el("p", null, item.text));
      box.style.transitionDelay = i * 80 + "ms";
      grid.appendChild(box);
    });
  }

  /* ---------------- 更新动态 ---------------- */
  function renderTimeline() {
    var list = $("[data-timeline]");
    clear(list);
    C.timeline.forEach(function (item) {
      var li = el("li", "reveal");
      li.appendChild(el("p", "timeline-date", item.date));
      li.appendChild(el("h3", null, item.title));
      li.appendChild(el("p", null, item.text));
      list.appendChild(li);
    });
  }

  /* ---------------- 关于我 ---------------- */
  function renderAbout() {
    var box = $("[data-about]");
    clear(box);
    C.about.paragraphs.forEach(function (text) {
      var p = el("p");
      // 支持用 **文本** 标记加粗
      var parts = text.split(/\*\*([^*]+)\*\*/);
      parts.forEach(function (part, i) {
        if (i % 2 === 1) {
          p.appendChild(el("strong", null, part));
        } else if (part) {
          p.appendChild(document.createTextNode(part));
        }
      });
      box.appendChild(p);
    });
  }

  /* ---------------- 支持我 ---------------- */
  var QR_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/>' +
    '<rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' +
    '<path d="M14 14h3v3h-3zM20 14v1M17 20h1M20 17v3M14 20v1"/></svg>';

  function renderSupport() {
    $("[data-support-intro]").textContent = C.support.intro;
    var tabsBox = $("[data-support-tabs]");
    var body = $("[data-support-body]");
    clear(tabsBox);
    clear(body);

    // 单一稳定面板：所有 tab 的 aria-controls 都指向它，
    // 选中变化时只更新内容与 aria-labelledby。
    body.id = "support-panel";
    body.setAttribute("role", "tabpanel");
    body.setAttribute("aria-labelledby", "support-tab-" + C.support.tabs[0].key);

    C.support.tabs.forEach(function (tab, i) {
      var btn = el("button", "support-tab", tab.label);
      btn.type = "button";
      btn.id = "support-tab-" + tab.key;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", "support-panel");
      btn.tabIndex = i === 0 ? 0 : -1;
      btn.addEventListener("click", function () {
        selectTab(i, false);
      });
      tabsBox.appendChild(btn);
    });

    // WAI-ARIA tabs 键盘模式：左右方向键切换并聚焦，Home/End 跳首尾
    tabsBox.addEventListener("keydown", function (e) {
      var count = C.support.tabs.length;
      var current = 0;
      tabsBox.querySelectorAll(".support-tab").forEach(function (btn, i) {
        if (btn.getAttribute("aria-selected") === "true") current = i;
      });
      var next = null;
      if (e.key === "ArrowRight") next = (current + 1) % count;
      else if (e.key === "ArrowLeft") next = (current - 1 + count) % count;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = count - 1;
      if (next !== null) {
        e.preventDefault();
        selectTab(next, true);
      }
    });

    function selectTab(index, focus) {
      var tabs = tabsBox.querySelectorAll(".support-tab");
      tabs.forEach(function (btn, i) {
        btn.setAttribute("aria-selected", i === index ? "true" : "false");
        btn.tabIndex = i === index ? 0 : -1;
      });
      if (focus && tabs[index]) tabs[index].focus();
      var tab = C.support.tabs[index];
      body.setAttribute("aria-labelledby", "support-tab-" + tab.key);
      clear(body);
      if (tab.qrPath) {
        var frame = el("div", "qr-frame");
        var img = document.createElement("img");
        img.src = tab.qrPath;
        img.alt = tab.qrAlt;
        img.loading = "lazy";
        frame.appendChild(img);
        body.appendChild(frame);
      } else {
        var ph = el("div", "qr-placeholder");
        ph.innerHTML = QR_ICON;
        ph.appendChild(el("strong", null, C.support.placeholderTitle));
        ph.appendChild(el("span", null, C.support.placeholderText));
        body.appendChild(ph);
      }
    }
    selectTab(0, false);
  }

  /* ---------------- 滚动进度与导航状态 ---------------- */
  function initScrollUI() {
    var bar = $("#scrollProgress");
    var nav = $("#siteNav");
    var ticking = false;

    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.width = (ratio * 100).toFixed(2) + "%";
      nav.classList.toggle("scrolled", window.scrollY > 8);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();

    // 高亮当前章节对应的导航项
    var links = {};
    document.querySelectorAll("[data-nav-id]").forEach(function (a) {
      links[a.dataset.navId] = a;
    });
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var link = links[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            Object.keys(links).forEach(function (k) {
              links[k].classList.toggle("active", k === entry.target.id);
            });
          }
        });
      }, { rootMargin: "-40% 0px -55% 0px" });
      C.nav.forEach(function (item) {
        var section = document.getElementById(item.id);
        if (section) spy.observe(section);
      });
    }
  }

  /* ---------------- 滚动显现 ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- 卡片轻微倾斜（仅鼠标设备） ---------------- */
  function initTilt() {
    if (reduceMotion.matches || !finePointer.matches) return;
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest ? e.target.closest(".card") : null;
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        "translateY(-4px) perspective(900px) rotateX(" + (-py * 3.2).toFixed(2) +
        "deg) rotateY(" + (px * 3.2).toFixed(2) + "deg)";
    });
    document.addEventListener("pointerout", function (e) {
      var card = e.target.closest ? e.target.closest(".card") : null;
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  }

  /* ---------------- 首屏 Canvas 节点网络 ---------------- */
  function initCanvas() {
    var canvas = $("#starCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var nodes = [];
    var count = 0;
    var width = 0, height = 0, dpr = 1;
    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    var running = false;
    var rafId = 0;
    var t0 = performance.now();

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var area = width * height;
      count = Math.max(26, Math.min(72, Math.round(area / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          purple: Math.random() < 0.3
        });
      }
    }

    function drawFrame(time, animate) {
      ctx.clearRect(0, 0, width, height);
      var dt = animate ? Math.min(32, time - t0) / 16.7 : 0;
      t0 = time;

      var ox = animate ? mouseX * 14 : 0;
      var oy = animate ? mouseY * 10 : 0;

      // 少量连线：距离阈值内才连接
      var maxDist = Math.min(170, Math.max(110, width / 8));
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            var alpha = (1 - Math.sqrt(d2) / maxDist) * 0.22;
            ctx.strokeStyle = "rgba(53, 224, 200," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x + ox * a.r * 0.4, a.y + oy * a.r * 0.4);
            ctx.lineTo(b.x + ox * b.r * 0.4, b.y + oy * b.r * 0.4);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        if (animate) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          if (n.x < -8) n.x = width + 8; else if (n.x > width + 8) n.x = -8;
          if (n.y < -8) n.y = height + 8; else if (n.y > height + 8) n.y = -8;
        }
        var nx = n.x + ox * n.r * 0.4;
        var ny = n.y + oy * n.r * 0.4;
        ctx.beginPath();
        ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.purple ? "rgba(167, 139, 250, 0.85)" : "rgba(53, 224, 200, 0.85)";
        ctx.fill();
      }
    }

    function loop(time) {
      if (!running) return;
      // 鼠标视差缓动
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      drawFrame(time, true);
      rafId = window.requestAnimationFrame(loop);
    }

    function start() {
      if (reduceMotion.matches || running) return;
      running = true;
      t0 = performance.now();
      rafId = window.requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion.matches) {
      // 降低动效：绘制一帧静态星座，不循环
      drawFrame(performance.now(), false);
      return;
    }

    if (finePointer.matches) {
      var hero = canvas.parentElement;
      hero.addEventListener("pointermove", function (e) {
        var rect = hero.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / rect.width - 0.5;
        targetY = (e.clientY - rect.top) / rect.height - 0.5;
      });
      hero.addEventListener("pointerleave", function () {
        targetX = 0;
        targetY = 0;
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  /* ---------------- 启动 ---------------- */
  renderMeta();
  renderNav();
  renderHero();
  renderResearch();
  renderFramework();
  renderRoadmap();
  renderTimeline();
  renderAbout();
  renderSupport();
  initScrollUI();
  initReveal();
  initTilt();
  initCanvas();
})();
