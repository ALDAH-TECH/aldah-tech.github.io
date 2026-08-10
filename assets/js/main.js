/* === DETECTION TACTILE / HOVER === */
const isTouch = window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0;
if (!isTouch) document.body.classList.add('has-hover');
const isSmallScreen = () => window.innerWidth < 768;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* === PARTICLES (allégé sur mobile / désactivé si reduced motion) === */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas && ctx && !prefersReducedMotion) {
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  function sizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  const particles = [];
  const PARTICLE_COUNT = isSmallScreen() ? 30 : 80;
  const LINK_DIST = isSmallScreen() ? 100 : 150;
  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
      if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(77, 159, 255, 0.5)';
      ctx.fill();
    }
  }
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(77, 159, 255, ${0.2 * (1 - d / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  let raf;
  let heroVisible = true;
  (function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (heroVisible) {
      particles.forEach(p => { p.update(); p.draw(); });
      connectParticles();
    }
    raf = requestAnimationFrame(animate);
  })();
  window.addEventListener('resize', () => { sizeCanvas(); });
  const heroEl = document.getElementById('home');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { heroVisible = e.isIntersecting; });
    }, { threshold: 0 }).observe(heroEl);
  }
}

/* === SCROLL PROGRESS === */
window.addEventListener('scroll', () => {
  const sp = document.getElementById('scrollProgress');
  if (sp) sp.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100 + '%';

  const backBtn = document.getElementById('backToTop');
  if (backBtn) backBtn.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

/* === CURSOR GLOW (desktop uniquement) === */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && !isTouch) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX - 20 + 'px';
    cursorGlow.style.top = e.clientY - 20 + 'px';
  });
}

/* === REVEAL === */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* === BARS === */
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.style.width = entry.target.getAttribute('data-width') + '%';
  });
}, { threshold: 0.3 });
document.querySelectorAll('.bar__fill, .lang__fill, .soc__fill').forEach(b => barObs.observe(b));

/* === COUNTERS === */
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseFloat(entry.target.getAttribute('data-count'));
      const suffix = entry.target.getAttribute('data-suffix') || '';
      let current = 0;
      const inc = target / 50;
      (function upd() {
        if (current < target) {
          current += inc;
          entry.target.textContent = Math.ceil(current) + suffix;
          requestAnimationFrame(upd);
        } else {
          entry.target.textContent = target + suffix;
        }
      })();
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(c => counterObs.observe(c));

/* === CLOCK NOC === */
setInterval(() => {
  const clock = document.getElementById('socClock');
  if (clock) clock.textContent = new Date().toLocaleTimeString('fr-FR');
}, 1000);

/* === NAV MOBILE + OVERLAY === */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');
function closeMobileMenu() {
  if (!navMenu) return;
  navMenu.classList.remove('active');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
function openMobileMenu() {
  navMenu.classList.add('active');
  navToggle.classList.add('active');
  navToggle.setAttribute('aria-expanded', 'true');
  navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
  });
}
if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

/* === DROPDOWNS === */
const navDropdowns = document.querySelectorAll('.nav__dropdown');
navDropdowns.forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav__dropdown-toggle');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = dropdown.classList.contains('active');
    navDropdowns.forEach(d => {
      d.classList.remove('active');
      d.querySelector('.nav__dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
    if (!isActive) {
      dropdown.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });
});
document.addEventListener('click', () => {
  navDropdowns.forEach(d => {
    d.classList.remove('active');
    d.querySelector('.nav__dropdown-toggle').setAttribute('aria-expanded', 'false');
  });
});
document.querySelectorAll('.nav__link, .nav__dropdown-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

/* === SCROLLSPY : lien de nav actif selon la section visible === */
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav__link[href^="#"], .nav__dropdown-link[href^="#"]');
if ('IntersectionObserver' in window && sections.length) {
  const spyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => spyObs.observe(s));
}

/* === TERMINAL === */
const shellForm = document.getElementById('shellForm');
const shellInput = document.getElementById('shellInput');
const shellBody = document.getElementById('shellBody');
const commands = {
  help: 'Commandes : <strong>help</strong>, <strong>profil</strong>, <strong>competences</strong>, <strong>experience</strong>, <strong>ftth</strong>, <strong>5g</strong>, <strong>contact</strong>, <strong>clear</strong>',
  profil: 'Ingénieur Support FAI chez ALTEN Sénégal, spécialisé en FTTH, QoS et supervision NOC.',
  competences: 'FTTH/GPON, QoS, CPE, MPLS/OSPF/BGP, ACL, 5G SA (Open5GS), Suricata, NOC, NMS, CnMaestro, GNS3/EVE-NG.',
  experience: 'ALTEN (fév 2026-), T.M.C Niger / Airtel B2B (2023-2024), RAINBOW Sarl (2022).',
  ftth: 'Architecture FTTH : NRO → OLT → PM → Splitter 1:32 → PBO → PTO → CPE. Supervision QoS 24/7.',
  '5g': 'Cœur 5G SA (Open5GS) : AMF, SMF, UPF, UDM, AUSF, NSSF. Détection d\'attaques via Suricata + blocage SDN.',
  contact: 'Email : abdoul.ali.etu@esmt.sn | Tél : +221 78 715 09 11 | Dakar, Sénégal',
  clear: 'CLEAR'
};
function runShellCommand(cmd) {
  cmd = cmd.trim().toLowerCase();
  if (!cmd) return;
  const line = document.createElement('p');
  line.className = 't-line';
  line.innerHTML = `<span class="t-prompt">visitor@portfolio:~$</span> <span class="t-typed">${cmd}</span>`;
  shellBody.insertBefore(line, shellBody.lastElementChild);
  if (cmd === 'clear') {
    shellBody.innerHTML = '<p class="t-line t-blink"><span class="t-prompt">visitor@portfolio:~$</span> <span class="t-cursor">▋</span></p>';
  } else {
    const out = document.createElement('p');
    out.className = 't-out t-out--block';
    out.innerHTML = commands[cmd] || 'Commande inconnue. Tapez <strong>help</strong>.';
    shellBody.insertBefore(out, shellBody.lastElementChild);
  }
  shellBody.scrollTop = shellBody.scrollHeight;
}
if (shellForm) {
  shellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runShellCommand(shellInput.value);
    shellInput.value = '';
  });
}
document.querySelectorAll('#shellQuick button').forEach(btn => {
  btn.addEventListener('click', () => runShellCommand(btn.getAttribute('data-cmd')));
});

/* === YEAR === */
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* === SMOOTH SCROLL (offset nav fixe) === */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId.length < 2) return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navH = document.querySelector('.nav').offsetHeight;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navH - 10, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });
});

/* === BACK TO TOP === */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* === TOAST + COPIER DANS LE PRESSE-PAPIER === */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast('Copié : ' + text)).catch(() => showToast(text));
  } else {
    showToast(text);
  }
}
document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    copyText(el.getAttribute('data-copy'));
  });
});

/* === TILT (désactivé sur tactile) === */
if (!isTouch) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const rx = (e.clientY - r.top - r.height / 2) / 15;
      const ry = (r.width / 2 - (e.clientX - r.left)) / 15;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

/* === RADAR 6 AXES (redessiné au redimensionnement) === */
const radarCanvas = document.getElementById('radarChart');
const radarLabels = ['FTTH & Fibre', 'Cœur 5G & Mobile', 'Supervision & QoS', 'Réseaux & Sécurité', 'Systèmes & Admin', 'Outils & Labs'];
const radarValues = [0.90, 0.78, 0.88, 0.88, 0.82, 0.90];
const radarColors = ['#ff5252', '#4d9fff', '#ff8a5c', '#ffd166', '#3ddc97', '#b388ff'];
function drawRadar(highlightIdx) {
  if (!radarCanvas) return;
  const rctx = radarCanvas.getContext('2d');
  const W = radarCanvas.width, H = radarCanvas.height;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 60;

  rctx.clearRect(0, 0, W, H);
  for (let i = 1; i <= 5; i++) {
    rctx.beginPath();
    rctx.strokeStyle = 'rgba(168,178,209,0.15)';
    rctx.lineWidth = 1;
    for (let j = 0; j < radarLabels.length; j++) {
      const angle = (Math.PI * 2 * j / radarLabels.length) - Math.PI / 2;
      const r = R * i / 5;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      j === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
    }
    rctx.closePath();
    rctx.stroke();
  }
  radarLabels.forEach((label, j) => {
    const angle = (Math.PI * 2 * j / radarLabels.length) - Math.PI / 2;
    rctx.beginPath();
    rctx.strokeStyle = 'rgba(168,178,209,0.2)';
    rctx.moveTo(cx, cy);
    rctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    rctx.stroke();
    rctx.fillStyle = (highlightIdx === j) ? '#ffffff' : '#a8b2d1';
    rctx.font = (highlightIdx === j ? '700 ' : '') + '13px Inter';
    rctx.textAlign = 'center';
    rctx.fillText(label, cx + (R + 30) * Math.cos(angle), cy + (R + 30) * Math.sin(angle) + 4);
  });
  rctx.beginPath();
  rctx.fillStyle = 'rgba(77,159,255,0.25)';
  rctx.strokeStyle = '#4d9fff';
  rctx.lineWidth = 2;
  radarValues.forEach((v, j) => {
    const angle = (Math.PI * 2 * j / radarLabels.length) - Math.PI / 2;
    const x = cx + R * v * Math.cos(angle);
    const y = cy + R * v * Math.sin(angle);
    j === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
  });
  rctx.closePath();
  rctx.fill();
  rctx.stroke();
  radarValues.forEach((v, j) => {
    const angle = (Math.PI * 2 * j / radarLabels.length) - Math.PI / 2;
    rctx.beginPath();
    rctx.fillStyle = radarColors[j];
    rctx.arc(cx + R * v * Math.cos(angle), cy + R * v * Math.sin(angle), highlightIdx === j ? 7 : 5, 0, Math.PI * 2);
    rctx.fill();
  });
}
if (radarCanvas) {
  drawRadar(-1);
  document.querySelectorAll('#radarLegend li').forEach(li => {
    const idx = parseInt(li.getAttribute('data-idx'), 10);
    li.addEventListener('mouseenter', () => { li.classList.add('legend--hi'); drawRadar(idx); });
    li.addEventListener('mouseleave', () => { li.classList.remove('legend--hi'); drawRadar(-1); });
    li.addEventListener('click', () => {
      const already = li.classList.contains('legend--hi');
      document.querySelectorAll('#radarLegend li').forEach(x => x.classList.remove('legend--hi'));
      if (!already) { li.classList.add('legend--hi'); drawRadar(idx); } else { drawRadar(-1); }
    });
  });
}

/* === SIMULATEUR FTTH === */
const archDeploy = document.getElementById('archDeploy');
const archLog = document.getElementById('archLog');
if (archDeploy) {
  const steps = [
    '[NRO] OLT Huawei MA5800 — port GPON 0/1/0 ✓',
    '[Distribution] Splitter 1:32, perte optique 17.2 dB ✓',
    '[PBO] Boîtier étanche, 8 sorties activées ✓',
    '[PTO] Prise murale, réflectométrie OTDR -18.5 dBm ✓',
    '[CPE] ONT Huawei HG8245H provisionné, WiFi 6 actif ✓',
    '[NMS] Supervision active — SLA 99.9% ✓'
  ];
  archDeploy.addEventListener('click', () => {
    archLog.innerHTML = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) { clearInterval(interval); return; }
      const line = document.createElement('p');
      line.className = 'arch__log-line';
      line.textContent = steps[i];
      archLog.appendChild(line);
      archLog.scrollTop = archLog.scrollHeight;
      i++;
    }, 500);
  });
}

/* === NŒUDS ARCHITECTURE FTTH : tap pour "épingler" l'état actif (mobile) === */
document.querySelectorAll('#archDiagram .arch__node').forEach(node => {
  node.addEventListener('click', () => {
    document.querySelectorAll('#archDiagram .arch__node').forEach(n => { if (n !== node) n.classList.remove('is-tapped'); });
    node.classList.toggle('is-tapped');
  });
});

/* === TOOLTIP ARCHITECTURE 5G (hover desktop + tap mobile) === */
const nm5g = document.getElementById('netmap5g');
if (nm5g) {
  const tip5g = nm5g.querySelector('.netmap__tooltip');
  const nodes5g = nm5g.querySelectorAll('.netmap__node');
  function showTip(node) {
    nodes5g.forEach(n => n.classList.toggle('is-tapped', n === node));
    tip5g.innerHTML = '<strong>' + (node.getAttribute('data-role') || '') + '</strong> — ' + (node.getAttribute('data-desc') || '');
    tip5g.style.opacity = '1';
  }
  nodes5g.forEach(node => {
    // Le survol est toujours actif : certains appareils (PC portables à écran
    // tactile) sont détectés comme "tactiles" alors qu'ils sont pilotés à la
    // souris, donc on ne se fie pas uniquement à isTouch pour le hover.
    node.addEventListener('mouseenter', () => showTip(node));
    node.addEventListener('mouseleave', () => { tip5g.style.opacity = '0'; nodes5g.forEach(n => n.classList.remove('is-tapped')); });
    node.addEventListener('click', (e) => { e.stopPropagation(); showTip(node); });
    node.addEventListener('focus', () => showTip(node));
  });
  document.addEventListener('click', (e) => {
    if (!nm5g.contains(e.target)) { tip5g.style.opacity = '0'; nodes5g.forEach(n => n.classList.remove('is-tapped')); }
  });
}

/* === LAB : PING === */
const pingRun = document.getElementById('pingRun');
const pingLog = document.getElementById('pingLog');
if (pingRun) {
  pingRun.addEventListener('click', () => {
    pingLog.innerHTML = '';
    const results = [];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= 10) {
        const avg = (results.reduce((a, b) => a + b, 0) / results.length).toFixed(1);
        const line = document.createElement('p');
        line.className = 'arch__log-line';
        line.innerHTML = `<strong style="color: var(--accent)">Moyenne : ${avg} ms ✓ (QoS excellente)</strong>`;
        pingLog.appendChild(line);
        clearInterval(interval);
        return;
      }
      const ms = Math.round(8 + Math.random() * 8);
      results.push(ms);
      const line = document.createElement('p');
      line.className = 'arch__log-line';
      line.textContent = `64 bytes from 192.168.1.10: icmp_seq=${i + 1} ttl=64 time=${ms} ms`;
      pingLog.appendChild(line);
      pingLog.scrollTop = pingLog.scrollHeight;
      i++;
    }, 200);
  });
}

/* === LAB : AUDIT PBO === */
const auditRun = document.getElementById('auditRun');
const auditLog = document.getElementById('auditLog');
if (auditRun) {
  auditRun.addEventListener('click', () => {
    auditLog.innerHTML = '';
    const steps = [
      'Audit PBO-2847 démarré…',
      'Mesure OTDR : perte totale 17.8 dB',
      'Réflectométrie : connecteur propre ✓',
      'Puissance optique reçue : -19.2 dBm ✓',
      'Seuil opérateur : -27 dBm → MARGE OK',
      'Rapport généré : conforme ✓'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) { clearInterval(interval); return; }
      const line = document.createElement('p');
      line.className = 'arch__log-line';
      line.textContent = steps[i];
      auditLog.appendChild(line);
      auditLog.scrollTop = auditLog.scrollHeight;
      i++;
    }, 400);
  });
}

/* === LAB : ALERTE KPI === */
const kpiRun = document.getElementById('kpiRun');
const kpiLog = document.getElementById('kpiLog');
if (kpiRun) {
  kpiRun.addEventListener('click', () => {
    let incidents = 0, escalades = 0;
    const interval = setInterval(() => {
      if (incidents >= 25) {
        clearInterval(interval);
        const line = document.createElement('p');
        line.className = 'arch__log-line';
        line.innerHTML = `<strong style="color: var(--danger)">Seuil CSSR dépassé → escalade NOC N3 ✓</strong>`;
        kpiLog.appendChild(line);
        return;
      }
      incidents++;
      if (incidents % 7 === 0) escalades++;
      kpiLog.innerHTML = `<p class="arch__log-line">${incidents} incidents reçus · ${escalades} escalades N2/N3 · SLA maintenu</p>`;
    }, 80);
  });
}

/* === LAB : REBOOT CPE === */
const rebootRun = document.getElementById('rebootRun');
const rebootLog = document.getElementById('rebootLog');
const cpeProcs = document.getElementById('cpeProcs');
if (rebootRun && cpeProcs) {
  rebootRun.addEventListener('click', () => {
    const procs = cpeProcs.querySelectorAll('.proc');
    if (procs[1]) {
      procs[1].innerHTML = '<span class="proc__dot proc__dot--off"></span> CPE-042 · REBOOT en cours…';
      rebootLog.innerHTML = '<p class="arch__log-line">[TR-069] Envoi commande reboot vers CPE-042…</p>';
    }
    setTimeout(() => {
      if (procs[1]) procs[1].innerHTML = '<span class="proc__dot proc__dot--on"></span> CPE-042 · uptime 00:01 (redémarré)';
      rebootLog.innerHTML = '<p class="arch__log-line" style="color: var(--accent)">✓ CPE-042 redémarré, service restauré en 48s</p>';
    }, 2000);
  });
}

/* === ONGLETS NOC (Overview / Alerts / Network) === */
const socTabs = document.getElementById('socTabs');
if (socTabs) {
  const tabs = socTabs.querySelectorAll('.soc__tab');
  const panels = document.querySelectorAll('.soc__panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('soc__tab--active'));
      tab.classList.add('soc__tab--active');
      const target = tab.getAttribute('data-tab');
      panels.forEach(p => { p.hidden = p.getAttribute('data-panel') !== target; });
    });
  });
}

/* === FILTRES PROJETS === */
const projectFilters = document.getElementById('projectFilters');
if (projectFilters) {
  const filterBtns = projectFilters.querySelectorAll('.pfilter');
  const projectCards = document.querySelectorAll('#projectsGrid .project');
  const emptyMsg = document.getElementById('projectsEmpty');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('pfilter--active'));
      btn.classList.add('pfilter--active');
      const filter = btn.getAttribute('data-filter');
      let visibleCount = 0;
      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags') || '';
        const match = filter === 'all' || tags.includes(filter);
        card.classList.toggle('is-hidden', !match);
        if (match) visibleCount++;
      });
      if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;
    });
  });
}

/* === ACCORDÉON ÉTUDES DE CAS === */
document.querySelectorAll('.case__toggle').forEach(toggleBtn => {
  toggleBtn.addEventListener('click', () => {
    const caseEl = toggleBtn.closest('.case');
    const wasOpen = caseEl.classList.contains('case--open');
    document.querySelectorAll('.case').forEach(c => c.classList.remove('case--open'));
    if (!wasOpen) caseEl.classList.add('case--open');
  });
});

console.log('Portfolio Télécoms chargé avec succès ! 🚀');
