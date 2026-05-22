function toggleMenu() {
  document.getElementById('navMenu').classList.toggle('active');
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('active');
  }
});

window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.animate-in').forEach(function(el) {
    observer.observe(el);
  });

  // Animated counters
  document.querySelectorAll('[data-count]').forEach(function(el) {
    const countObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCount(el);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    countObserver.observe(el);
  });
});

function animateCount(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Parallax on hero decorative elements
window.addEventListener('scroll', function() {
  const scrolled = window.scrollY;
  const parallaxElements = document.querySelectorAll('.parallax');
  parallaxElements.forEach(function(el) {
    const speed = parseFloat(el.getAttribute('data-speed')) || 0.3;
    el.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
  });
});
