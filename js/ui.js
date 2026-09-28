/* ==========================================================================
   OVR / ILLUSION : EA SPORTS FC 27 Dataviz
   Interactions de l'interface (les graphiques sont dans js/app.js).
   ========================================================================== */

// Active les styles qui dépendent du JS (apparitions au scroll, etc.)
document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollProgress();
  initReveal();
  initCountUp();
  initCardTilt();
  initRibbons();
  initPoll();
  setYear();
});

/* --- Navigation : menu mobile, fond au scroll, lien actif -------------- */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = nav.querySelector('.nav__toggle');
  const links = [...nav.querySelectorAll('.nav__menu a')];

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Le lien de la section au centre de l'écran devient actif
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* --- Barre de progression de lecture ---------------------------------- */
function initScrollProgress() {
  const bar = document.querySelector('.progress__bar');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* --- Apparition des blocs au scroll ----------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => observer.observe(el));
}

/* --- Compteurs animés (attribut data-count) --------------------------- */
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => {
    el.textContent = '0';
    observer.observe(el);
  });
}

function animateCount(el) {
  const target = Number(el.dataset.count);
  const duration = 1400;
  const start = performance.now();

  const tick = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* --- Carte holographique : inclinaison + reflet qui suit le curseur ---- */
function initCardTilt() {
  const zone = document.querySelector('[data-tilt-zone]');
  const card = document.querySelector('[data-tilt]');
  if (!zone || !card || prefersReducedMotion) return;

  const MAX_TILT = 16; // en degrés

  zone.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;

    const rect = card.getBoundingClientRect();
    // Position du curseur relative à la carte, bornée entre 0 et 1
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

    card.classList.add('is-active');
    card.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  });

  zone.addEventListener('pointerleave', () => {
    card.classList.remove('is-active');
    ['--rx', '--ry', '--mx', '--my'].forEach(prop => card.style.removeProperty(prop));
  });
}

/* --- Bandeaux défilants : on duplique le contenu pour une boucle sans fin */
function initRibbons() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.ribbon__track').forEach(track => {
    const group = track.querySelector('.ribbon__group');
    const items = [...group.children];
    const minWidth = track.parentElement.offsetWidth;

    // Répète la séquence jusqu'à couvrir toute la largeur du bandeau
    let guard = 0;
    while (group.scrollWidth < minWidth && guard < 20) {
      items.forEach(item => group.appendChild(item.cloneNode(true)));
      guard++;
    }

    track.appendChild(group.cloneNode(true));

    // Vitesse constante (~70 px/s) quelle que soit la longueur du texte
    track.style.animationDuration = `${group.scrollWidth / 70}s`;
    track.classList.add('is-ready');
  });
}

/* --- Pronostic du visiteur (rappelé dans le verdict) ------------------ */
function initPoll() {
  const buttons = document.querySelectorAll('[data-vote]');
  const feedback = document.querySelector('.poll__feedback');
  const recall = document.querySelector('[data-recall]');
  const verdict = document.querySelector('.verdict');
  const STORAGE_KEY = 'ovr-illusion:pronostic';

  const choices = {
    verite: {
      label: 'Vérité',
      feedback: 'Pronostic enregistré\u00a0: tu fais confiance à la note. Voyons si les données te donnent raison.',
    },
    illusion: {
      label: 'Illusion',
      feedback: 'Pronostic enregistré\u00a0: pour toi, la note est trompeuse. Voyons si les données te donnent raison.',
    },
  };

  const render = vote => {
    if (!choices[vote]) return;

    buttons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.vote === vote)));
    feedback.textContent = choices[vote].feedback;
    verdict.dataset.choice = vote;

    const strong = document.createElement('strong');
    strong.className = `is-${vote}`;
    strong.textContent = choices[vote].label.toUpperCase();
    recall.replaceChildren('Ton pronostic de départ\u00a0: ', strong, '. Alors, verdict\u00a0?');
  };

  // Le choix est gardé dans le navigateur du visiteur (si le stockage est disponible)
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) { /* stockage indisponible : on ignore */ }
  render(saved);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const vote = btn.dataset.vote;
      try {
        localStorage.setItem(STORAGE_KEY, vote);
      } catch (e) { /* stockage indisponible : on ignore */ }
      render(vote);
    });
  });
}

/* --- Année du footer --------------------------------------------------- */
function setYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}
