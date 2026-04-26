/* ══════════════════════════════════════════
   script.js — David Marez Landing Page
══════════════════════════════════════════ */

// ── NAV SCROLL ──────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── HERO IMAGE FADE ON SCROLL ────────────
const heroBgImg = document.getElementById('heroBgImg');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    const heroHeight = document.getElementById('hero').offsetHeight;
    // De 0.28 al inicio hasta 0 al final del hero
    const progress = Math.min(window.scrollY / (heroHeight * 0.7), 1);
    heroBgImg.style.opacity = 0.28 * (1 - progress);
  }, { passive: true });
}


// ── MOBILE NAV ──────────────────────────
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

navBurger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

function closeMobileNav() {
  navMobile.classList.remove('open');
}


// ── ANIMATE ON SCROLL ───────────────────
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), +delay);
      animateObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate]').forEach((el, i) => {
  const siblings = [...el.parentElement.querySelectorAll('[data-animate]')];
  const idx = siblings.indexOf(el);
  if (idx > 0) el.dataset.delay = idx * 90;
  animateObserver.observe(el);
});


// ── FAQ ACCORDION ────────────────────────
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});


// ── MODAL ────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');

function openModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Reset multi-step form
  mfShowStep(1);
  document.querySelectorAll('.mf-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.mf-next').forEach(b => b.disabled = true);
  document.querySelectorAll('input[name="decision"]').forEach(r => r.checked = false);
  ['inputName','inputIg','inputWa','inputEmail'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  setTimeout(initSlider, 50);
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
});

// ── MULTI-STEP FORM ──────────────────────
const MF_TOTAL = 5;
let mfCurrentStep = 1;
const mfData = {};

function mfShowStep(n) {
  for (let i = 1; i <= MF_TOTAL; i++) {
    const el = document.getElementById('mfStep' + i);
    if (el) el.style.display = i === n ? '' : 'none';
  }
  mfCurrentStep = n;
  const pct = ((n - 1) / MF_TOTAL) * 100;
  document.getElementById('mfProgressBar').style.width = pct + '%';
  document.getElementById('mfStepLabel').textContent = 'Paso ' + n + ' de ' + MF_TOTAL;
}

function mfNext(step) {
  if (step === 1) mfData.industria = document.querySelector('#mfIndustria .mf-card.selected')?.dataset.val;
  if (step === 2) mfData.reto      = document.querySelector('#mfReto .mf-card.selected')?.dataset.val;
  if (step === 3) mfData.facturacion = document.querySelector('#mfFacturacion .mf-card.selected')?.dataset.val;
  if (step === 4) mfData.inversion = document.getElementById('mfInversion').value;
  mfShowStep(step + 1);
}

// Card selection behaviour
document.addEventListener('click', (e) => {
  const card = e.target.closest('.mf-card');
  if (!card) return;
  const group = card.closest('.mf-cards');
  group.querySelectorAll('.mf-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  // Enable the Next button for this step
  const step = card.closest('.mf-step');
  const btn = step?.querySelector('.mf-next');
  if (btn) btn.disabled = false;
});

// Slider
function mfUpdateSlider(val) {
  const min = 200, max = 10000;
  const pct = ((val - min) / (max - min)) * 100;
  document.getElementById('mfSliderFill').style.width = pct + '%';
  const fmt = parseInt(val).toLocaleString('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  document.getElementById('mfSliderAmount').textContent = fmt;
  const labels = [
    [200,  1000, '💡 Dando los primeros pasos'],
    [1001, 2500, '🚀 Listo para crecer'],
    [2501, 5000, '🔥 Inversión seria'],
    [5001, 10000,'💎 Comprometido al máximo'],
  ];
  const n = parseInt(val);
  const match = labels.find(([lo, hi]) => n >= lo && n <= hi);
  document.getElementById('mfSliderLabel').textContent = match ? match[2] : '';
}

// Init slider on modal open
function initSlider() {
  mfUpdateSlider(document.getElementById('mfInversion').value);
}

function submitForm() {
  const name  = document.getElementById('inputName').value.trim();
  const ig    = document.getElementById('inputIg').value.trim();
  const wa    = document.getElementById('inputWa').value.trim();
  const email = document.getElementById('inputEmail').value.trim();

  if (!name || !ig || !wa || !email) {
    alert('Por favor completa todos los campos antes de enviar.');
    return;
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    alert('Por favor ingresa un correo electrónico válido.');
    return;
  }

  const btn = document.getElementById('mfSubmitBtn');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // Collect final data
  mfData.nombre  = name;
  mfData.ig      = ig;
  mfData.wa      = wa;
  mfData.email   = email;
  mfData.decision = document.querySelector('input[name="decision"]:checked')?.value || '';

  console.log('Form data:', mfData); // Replace with actual API call

  setTimeout(() => {
    closeModal();
    showToast();
    btn.textContent = 'Enviar solicitud →';
    btn.disabled = false;
  }, 1400);
}


// ── SUCCESS TOAST ────────────────────────
function showToast() {
  const t = document.createElement('div');
  t.innerHTML = `<span style="font-size:1.2rem">✓</span><div><strong>¡Solicitud recibida!</strong><p style="font-size:0.77rem;opacity:.7;margin-top:2px">Te contactaremos en menos de 24 horas.</p></div>`;
  Object.assign(t.style, {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    background: '#0f172a', border: '1px solid rgba(79,142,247,0.4)',
    borderRadius: '12px', padding: '1rem 1.4rem',
    display: 'flex', alignItems: 'center', gap: '0.8rem',
    color: '#f4f4f5', fontFamily: "'Space Grotesk', sans-serif",
    zIndex: '9999', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    transform: 'translateY(20px)', opacity: '0',
    transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s',
    maxWidth: '300px',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => setTimeout(() => { t.style.transform='translateY(0)'; t.style.opacity='1'; }, 10));
  setTimeout(() => { t.style.transform='translateY(20px)'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, 4500);
}


// ── SMOOTH SCROLL ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});


// ── IG FOLLOWER COUNTER ──────────────────
function formatCount(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'M';
  if (n >= 1000)    return (n/1000).toFixed(1).replace('.0','') + 'K';
  return n.toString();
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target);
    const dur = 2000;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.ig-counter').forEach(el => counterObs.observe(el));


// ── IG GROWTH BARS ────────────────────────
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.width = entry.target.dataset.width + '%';
    barObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.ig-bar').forEach(bar => barObs.observe(bar));


// ── VIDEO PLAY / PAUSE POR VIEWPORT ──────
// Lógica unificada para ambos videos:
//   • heroVideo   (hero)        → play/pause + sonido según visibilidad
//   • testVideo   (testimonio)  → play/pause + sonido según visibilidad
//
// Ambos intentan reproducirse con sonido; si el navegador lo bloquea
// (política de autoplay), caen automáticamente a muted.
// El botón de mute de cada video sigue funcionando igual.

// Sincroniza los íconos de mute de un video dado su config de IDs
function syncMuteIcons(muted, iconUnmutedId, iconMutedId) {
  const iconUnmuted = document.getElementById(iconUnmutedId);
  const iconMuted   = document.getElementById(iconMutedId);
  if (!iconUnmuted || !iconMuted) return;
  iconUnmuted.style.display = muted ? 'none' : '';
  iconMuted.style.display   = muted ? ''     : 'none';
}

// Intenta reproducir con sonido; si el navegador lo bloquea, cae a muted
function tryPlayWithAudio(video, iconUnmutedId, iconMutedId) {
  video.muted = false;
  const p = video.play();
  if (p !== undefined) {
    p.catch(() => {
      video.muted = true;
      syncMuteIcons(true, iconUnmutedId, iconMutedId);
      video.play().catch(() => {});
    });
  }
  syncMuteIcons(video.muted, iconUnmutedId, iconMutedId);
}

function toggleHeroMute() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  video.muted = !video.muted;
  syncMuteIcons(video.muted, 'heroIconUnmuted', 'heroIconMuted');
}

function toggleTestMute() {
  const video = document.getElementById('testVideo');
  if (!video) return;
  video.muted = !video.muted;
  syncMuteIcons(video.muted, 'iconUnmuted', 'iconMuted');
}

// Observer compartido: threshold 0.5 = video al menos 50% visible para activarse
const videoViewportObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    const isHero = video.id === 'heroVideo';

    if (entry.isIntersecting) {
      if (isHero) {
        tryPlayWithAudio(video, 'heroIconUnmuted', 'heroIconMuted');
      } else {
        tryPlayWithAudio(video, 'iconUnmuted', 'iconMuted');
      }
    } else {
      // Salió del viewport → pausar
      video.pause();
    }
  });
}, { threshold: 0.5 });

// ── INICIALIZAR OBSERVERS DE VIDEO ───────
window.addEventListener('DOMContentLoaded', () => {
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) videoViewportObs.observe(heroVideo); // ← hero ahora observado

  const testVideo = document.getElementById('testVideo');
  if (testVideo) videoViewportObs.observe(testVideo);
});


// ── EXPOSE GLOBALS ───────────────────────
window.openModal      = openModal;
window.closeModal     = closeModal;
window.submitForm     = submitForm;
window.closeMobileNav = closeMobileNav;
window.toggleTestMute = toggleTestMute;
window.toggleHeroMute = toggleHeroMute;