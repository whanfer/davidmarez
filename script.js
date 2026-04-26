/* ══════════════════════════════════════════
   script.js — David Marez Landing Page
══════════════════════════════════════════ */

// ── FIRESTORE CONFIG ─────────────────────
// Reemplaza con los valores de tu proyecto Firebase
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAxARpRcHMLR2chUkW9GvbaWFWRut6MSYY",
  authDomain:        "davidmarez-b0756.firebaseapp.com",
  projectId:         "davidmarez-b0756",
  storageBucket:     "davidmarez-b0756.firebasestorage.app",
  messagingSenderId: "964387953297",
  appId:             "1:964387953297:web:65c424baee8bf028dd7d30",
  measurementId:     "G-4L13GLDBN4"
};

let _db = null;
async function getDb() {
  if (_db) return _db;
  const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js');
  const { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js');
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  _db = { db: getFirestore(app), collection, addDoc, getDocs, orderBy, query, serverTimestamp };
  return _db;
}

async function saveLeadToFirestore(data) {
  const { db, collection, addDoc, serverTimestamp } = await getDb();
  await addDoc(collection(db, 'leads'), { ...data, creadoEn: serverTimestamp() });
}

async function getLeadsFromFirestore() {
  const { db, collection, getDocs, query, orderBy } = await getDb();
  const q = query(collection(db, 'leads'), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

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

  // Guardar en Firestore
  saveLeadToFirestore(mfData)
    .then(() => { closeModal(); showToast(); })
    .catch(() => { closeModal(); showToast(); })
    .finally(() => { btn.textContent = 'Enviar solicitud →'; btn.disabled = false; });
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
//
// heroVideo:
//   - Inicia muted + animación en botón "Activar sonido"
//   - Al primer scroll, activa sonido automáticamente (interacción = scroll)
//   - Si sale del viewport → pausa
//   - Si vuelve → retoma con sonido (ya hubo interacción)
//   - Botón mute en esquina para control manual
//
// testVideo: play/pause por visibilidad, con botón mute propio

let heroSoundUnlocked = false; // ¿ya hubo interacción del usuario?

function syncMuteIcons(muted, iconUnmutedId, iconMutedId) {
  const iconUnmuted = document.getElementById(iconUnmutedId);
  const iconMuted   = document.getElementById(iconMutedId);
  if (!iconUnmuted || !iconMuted) return;
  iconUnmuted.style.display = muted ? 'none' : '';
  iconMuted.style.display   = muted ? ''     : 'none';
}

function dismissHeroOverlay() {
  const overlay = document.getElementById('heroUnmuteOverlay');
  const muteBtn = document.getElementById('heroMuteBtn');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => overlay.style.display = 'none', 500);
  }
  if (muteBtn) muteBtn.style.display = '';
}

// Llamado por clic en el botón overlay
function heroActivateSound() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  heroSoundUnlocked = true;
  video.muted = false;
  video.play().catch(() => { video.muted = true; });
  dismissHeroOverlay();
  syncMuteIcons(video.muted, 'heroIconUnmuted', 'heroIconMuted');
}

// Llamado al hacer scroll (primera vez)
function heroUnlockOnScroll() {
  if (heroSoundUnlocked) return;
  const video = document.getElementById('heroVideo');
  if (!video || video.paused) return; // solo si está reproduciendo
  heroSoundUnlocked = true;
  video.muted = false;
  // Si el navegador rechaza igual, se queda muted silenciosamente
  video.play().catch(() => { video.muted = true; });
  dismissHeroOverlay();
  syncMuteIcons(video.muted, 'heroIconUnmuted', 'heroIconMuted');
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

// Scroll listener: desbloquea sonido al primer scroll mientras hero es visible
window.addEventListener('scroll', () => {
  if (heroSoundUnlocked) return;
  heroUnlockOnScroll();
}, { passive: true });

// Observer hero: play muted al entrar, pausa al salir
// Una vez desbloqueado el sonido, retoma con audio
const heroObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      if (heroSoundUnlocked) {
        video.muted = false;
        syncMuteIcons(false, 'heroIconUnmuted', 'heroIconMuted');
      } else {
        video.muted = true;
      }
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.3 });

// Observer testimonio: play/pause con intento de sonido
const testObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        syncMuteIcons(true, 'iconUnmuted', 'iconMuted');
        video.play().catch(() => {});
      });
      syncMuteIcons(video.muted, 'iconUnmuted', 'iconMuted');
    } else {
      video.pause();
    }
  });
}, { threshold: 0.3 });

// ── INICIALIZAR OBSERVERS DE VIDEO ───────
window.addEventListener('DOMContentLoaded', () => {
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.muted = true; // inicia muted, el botón/scroll lo desbloquea
    heroObs.observe(heroVideo);
  }

  const testVideo = document.getElementById('testVideo');
  if (testVideo) testObs.observe(testVideo);
});



// ══════════════════════════════════════════
//  ADMIN — Login + Dashboard + PDF
// ══════════════════════════════════════════
const ADMIN_USER = 'luis';
const ADMIN_PASS = 'davidmarez2026';
let adminAuthenticated = false;

function openAdminLogin() {
  document.getElementById('adminLoginModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('adminLoginError').style.display = 'none';
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
}

function closeAdminLogin() {
  document.getElementById('adminLoginModal').classList.remove('active');
  document.body.style.overflow = '';
}

function adminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  const err  = document.getElementById('adminLoginError');
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    adminAuthenticated = true;
    closeAdminLogin();
    openAdminDashboard();
  } else {
    err.style.display = 'block';
    err.textContent = 'Usuario o contraseña incorrectos.';
  }
}

async function openAdminDashboard() {
  if (!adminAuthenticated) { openAdminLogin(); return; }
  const modal = document.getElementById('adminDashModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  const body = document.getElementById('adminDashBody');
  body.innerHTML = '<p style="text-align:center;opacity:.6;padding:2rem">Cargando leads...</p>';
  try {
    const leads = await getLeadsFromFirestore();
    renderLeadsTable(leads);
  } catch(e) {
    body.innerHTML = '<p style="color:#f87171;text-align:center;padding:2rem">Error al cargar datos. Revisa la configuración de Firebase.</p>';
  }
}

function closeAdminDash() {
  document.getElementById('adminDashModal').classList.remove('active');
  document.body.style.overflow = '';
}

function renderLeadsTable(leads) {
  const body = document.getElementById('adminDashBody');
  if (!leads.length) {
    body.innerHTML = '<p style="text-align:center;opacity:.6;padding:2rem">No hay leads aún.</p>';
    return;
  }
  const rows = leads.map((l, i) => {
    const fecha = l.creadoEn?.toDate ? l.creadoEn.toDate().toLocaleString('es-CO') : '—';
    return `<tr>
      <td>${i+1}</td>
      <td>${l.nombre || '—'}</td>
      <td>${l.ig || '—'}</td>
      <td>${l.wa || '—'}</td>
      <td>${l.email || '—'}</td>
      <td>${l.industria || '—'}</td>
      <td>${l.reto || '—'}</td>
      <td>${l.facturacion || '—'}</td>
      <td>${l.inversion ? '$'+parseInt(l.inversion).toLocaleString() : '—'}</td>
      <td>${l.decision || '—'}</td>
      <td>${fecha}</td>
    </tr>`;
  }).join('');

  body.innerHTML = `
    <div style="overflow-x:auto">
      <table id="leadsTable" style="width:100%;border-collapse:collapse;font-size:0.8rem">
        <thead>
          <tr style="background:rgba(79,142,247,0.15);text-align:left">
            <th>#</th><th>Nombre</th><th>Instagram</th><th>WhatsApp</th>
            <th>Email</th><th>Industria</th><th>Reto</th><th>Facturación</th>
            <th>Inversión</th><th>Decisión</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p style="margin-top:1rem;opacity:.5;font-size:0.75rem">${leads.length} lead(s) en total</p>
  `;

  // guardar leads para el PDF
  window._adminLeads = leads;
}

async function downloadLeadsPDF() {
  const leads = window._adminLeads;
  if (!leads || !leads.length) { alert('No hay datos para exportar.'); return; }

  // Cargar jsPDF dinámicamente
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('David Marez — Leads de Asesoría', 14, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Generado: ' + new Date().toLocaleString('es-CO'), 220, 14);

  // Tabla
  doc.autoTable({
    startY: 26,
    head: [['#','Nombre','Instagram','WhatsApp','Email','Industria','Reto','Facturación','Inversión','Decisión','Fecha']],
    body: leads.map((l, i) => {
      const fecha = l.creadoEn?.toDate ? l.creadoEn.toDate().toLocaleString('es-CO') : '—';
      return [
        i+1, l.nombre||'—', l.ig||'—', l.wa||'—', l.email||'—',
        l.industria||'—', l.reto||'—', l.facturacion||'—',
        l.inversion ? '$'+parseInt(l.inversion).toLocaleString() : '—',
        l.decision||'—', fecha
      ];
    }),
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: [79, 142, 247], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save('leads-davidmarez-' + new Date().toISOString().slice(0,10) + '.pdf');
}

window.openAdminLogin     = openAdminLogin;
window.closeAdminLogin    = closeAdminLogin;
window.adminLogin         = adminLogin;
window.openAdminDashboard = openAdminDashboard;
window.closeAdminDash     = closeAdminDash;
window.downloadLeadsPDF   = downloadLeadsPDF;

// ── EXPOSE GLOBALS ───────────────────────
window.openModal         = openModal;
window.closeModal        = closeModal;
window.submitForm        = submitForm;
window.closeMobileNav    = closeMobileNav;
window.toggleTestMute    = toggleTestMute;
window.toggleHeroMute    = toggleHeroMute;
window.heroActivateSound = heroActivateSound;