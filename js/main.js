/* ד.ר שחקים – Main JS */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu  = document.getElementById('closeMenu');
if (hamburger) {
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenu.addEventListener('click',  () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileMenu.classList.remove('open'))
  );
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-grid').forEach(el => observer.observe(el));

// Animated counters
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count-up').forEach(el => counterObserver.observe(el));

// Team card expand/collapse
document.querySelectorAll('.team-expand').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = btn.previousElementSibling;
    if (p.classList.contains('truncated')) {
      p.classList.remove('truncated');
      btn.innerHTML = 'סגור <i class="fa-solid fa-chevron-up fa-xs"></i>';
    } else {
      p.classList.add('truncated');
      btn.innerHTML = 'קרא עוד <i class="fa-solid fa-chevron-down fa-xs"></i>';
    }
  });
});

// Mobile: light up ONLY the single service card closest to screen center
const svcCards = document.querySelectorAll('.svc-modern-card');
if (svcCards.length) {
  let ticking = false;
  const updateFocus = () => {
    const vh = window.innerHeight;
    const viewCenter = vh / 2;
    let best = null, bestDist = Infinity;
    svcCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const dist = Math.abs(cardCenter - viewCenter);
      // consider only cards visible on screen
      if (rect.bottom > 0 && rect.top < vh && dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    });
    // only highlight when the nearest card is genuinely near the center
    if (best && bestDist > vh * 0.42) best = null;
    svcCards.forEach(card => card.classList.toggle('in-focus', card === best));
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateFocus); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateFocus();
}

// Contact forms → נשלח דרך FormSubmit ב-AJAX (נשאר בעמוד, בלי backend)
document.querySelectorAll('form.contact-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const label = btn.dataset.label || 'שלח';
    btn.disabled = true;
    btn.textContent = 'שולח...';
    try {
      const res = await fetch('https://formsubmit.co/ajax/info@shk.org.il', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json();
      if (String(data.success) === 'true') {
        btn.textContent = 'הודעה נשלחה! תודה.';
        btn.style.background = '#10B981';
        form.reset();
      } else {
        throw new Error();
      }
    } catch (err) {
      btn.textContent = 'אירעה שגיאה — נסו שוב';
      btn.style.background = '#EF4444';
    }
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ' + label;
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  });
});

// טופס הקריירה נשלח באופן רגיל (multipart) ל-FormSubmit — כדי לתמוך בצירוף קובץ קו"ח.

// File input display
const fileInput = document.getElementById('cvFile');
const fileLabel = document.getElementById('fileLabel');
if (fileInput && fileLabel) {
  fileInput.addEventListener('change', () => {
    const name = fileInput.files[0]?.name;
    fileLabel.textContent = name || 'העלה קורות חיים';
  });
}

// Active nav link (כתובות נקיות, ללא סיומת .html)
let currentPage = window.location.pathname.split('/').pop().replace(/\.html$/, '');
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = (link.getAttribute('href') || '').replace(/\.html$/, '').replace(/^\//, '');
  const isHome = currentPage === '' || currentPage === 'index';
  if (isHome ? (href === '' || href === 'index') : href === currentPage) {
    link.classList.add('active');
  }
});
