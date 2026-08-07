// Animation des particules sur le canvas
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 80;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(77, 159, 255, 0.5)';
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(77, 159, 255, ${0.2 * (1 - distance / 150)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  connectParticles();
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Barre de progression du scroll
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = scrollPercent + '%';
});

// Curseur à halo
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX - 20 + 'px';
  cursorGlow.style.top = e.clientY - 20 + 'px';
});

// Animation de révélation au scroll
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => revealObserver.observe(el));

// Animation des barres de progression
const bars = document.querySelectorAll('.bar__fill, .lang__fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const width = entry.target.getAttribute('data-width');
      entry.target.style.width = width + '%';
    }
  });
}, { threshold: 0.5 });

bars.forEach(bar => barObserver.observe(bar));

// Animation des compteurs
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.getAttribute('data-count'));
      const suffix = entry.target.getAttribute('data-suffix') || '';
      let current = 0;
      const increment = target / 50;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          entry.target.textContent = Math.ceil(current) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          entry.target.textContent = target + suffix;
        }
      };

      updateCounter();
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// Horloge NOC en temps réel
function updateClock() {
  const clock = document.getElementById('socClock');
  if (clock) {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('fr-FR');
  }
}

setInterval(updateClock, 1000);
updateClock();

// Menu mobile
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
  });
}

// Fermer le menu mobile lors du clic sur un lien
const navLinks = document.querySelectorAll('.nav__link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Terminal interactif
const shellForm = document.getElementById('shellForm');
const shellInput = document.getElementById('shellInput');
const shellBody = document.getElementById('shellBody');

const commands = {
  help: 'Commandes disponibles : <strong>help</strong>, <strong>profil</strong>, <strong>competences</strong>, <strong>experience</strong>, <strong>contact</strong>, <strong>clear</strong>',
  profil: 'Ingénieur support FAI chez ALTEN Sénégal, spécialisé en qualité fibre FTTH et QoS. Actuellement en Master à l\'ESMT de Dakar.',
  competences: 'FTTH, GPON, xDSL, Qualité de Service (QoS), Configuration et Dépannage CPE, MPLS/OSPF/BGP, Cœur de réseau mobile (EPC, IMS), Systèmes Linux/Windows, Supervision réseau.',
  experience: 'Ingénieur support FAI chez ALTEN (depuis fév. 2026), Superviseur réseau chez T.M.C Niger (Airtel B2B), Technicien réseau chez RAINBOW Sarl (Airtel B2B).',
  contact: 'Email : abdoul.ali.etu@esmt.sn | Tél : +221 78 715 09 11 | LinkedIn : linkedin.com/in/daouda-ali-abdoul-latifou | Localisation : Grand Dakar, Sénégal',
  clear: 'CLEAR'
};

if (shellForm) {
  shellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cmd = shellInput.value.trim().toLowerCase();

    if (cmd) {
      // Ajouter la commande tapée
      const line = document.createElement('p');
      line.className = 't-line';
      line.innerHTML = `<span class="t-prompt">visitor@portfolio:~$</span> <span class="t-typed">${cmd}</span>`;
      shellBody.insertBefore(line, shellBody.lastElementChild);

      // Répondre
      if (cmd === 'clear') {
        shellBody.innerHTML = '<p class="t-line t-blink"><span class="t-prompt">visitor@portfolio:~$</span> <span class="t-cursor">▋</span></p>';
      } else {
        const response = commands[cmd] || 'Commande inconnue. Tapez <strong>help</strong> pour voir les commandes disponibles.';
        const output = document.createElement('p');
        output.className = 't-out t-out--block';
        output.innerHTML = response;
        shellBody.insertBefore(output, shellBody.lastElementChild);
      }

      shellInput.value = '';
      shellBody.scrollTop = shellBody.scrollHeight;
    }
  });
}

// Année automatique dans le footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Smooth scroll pour les ancres
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Effet de survol sur la carte réseau
const netmapNodes = document.querySelectorAll('.netmap__node');
const netmapTooltip = document.getElementById('netmapTooltip');

netmapNodes.forEach(node => {
  node.addEventListener('mouseenter', () => {
    const role = node.getAttribute('data-role');
    if (netmapTooltip) {
      netmapTooltip.textContent = role;
      netmapTooltip.style.opacity = '1';
    }
  });

  node.addEventListener('mouseleave', () => {
    if (netmapTooltip) {
      netmapTooltip.style.opacity = '0';
    }
  });
});

// Effet tilt sur les cartes de projets
const tiltCards = document.querySelectorAll('[data-tilt]');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

console.log('Portfolio Télécoms chargé avec succès ! 🚀');
