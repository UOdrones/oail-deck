// ============================================
// OAIL DECK — Main JS
// Scroll animations, nav dots, progress bar
// ============================================

import './style.css';
import { initThreeScene } from './threeScene.js';

// Init background 3D Scene
initThreeScene();

// Create nav dots
const slides = document.querySelectorAll('.slide');
const navDots = document.getElementById('navDots');
const progressBar = document.getElementById('progressBar');

slides.forEach((slide, i) => {
  const dot = document.createElement('button');
  dot.className = 'nav-dot';
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => {
    slide.scrollIntoView({ behavior: 'smooth' });
  });
  navDots.appendChild(dot);
});

// Intersection Observer for slide animations
const observerOptions = {
  root: null,
  threshold: 0.2,
  rootMargin: '0px',
};

const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const slideIndex = parseInt(entry.target.dataset.slide);
      
      // Update nav dots
      document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === slideIndex);
      });

      // Trigger animations within this slide
      const animElements = entry.target.querySelectorAll('.animate-in');
      animElements.forEach((el) => {
        el.classList.add('visible');
      });
    } else {
      // Reset animations when leaving viewport (optional — makes re-entry animate)
      const animElements = entry.target.querySelectorAll('.animate-in');
      animElements.forEach((el) => {
        el.classList.remove('visible');
      });
    }
  });
}, observerOptions);

slides.forEach((slide) => slideObserver.observe(slide));

// Progress bar
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });

// Timeline node clicks
document.querySelectorAll('.timeline-node').forEach((node) => {
  node.addEventListener('click', () => {
    const targetId = node.dataset.target;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Smooth anchor clicks
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const activeDot = document.querySelector('.nav-dot.active');
  const dots = Array.from(document.querySelectorAll('.nav-dot'));
  const currentIndex = dots.indexOf(activeDot);

  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    const next = Math.min(currentIndex + 1, slides.length - 1);
    slides[next].scrollIntoView({ behavior: 'smooth' });
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    const prev = Math.max(currentIndex - 1, 0);
    slides[prev].scrollIntoView({ behavior: 'smooth' });
  }
});

// Initial state
updateProgress();
document.querySelector('.nav-dot')?.classList.add('active');

// Parallax effect on backgrounds
window.addEventListener('scroll', () => {
  slides.forEach((slide) => {
    const bg = slide.querySelector('.slide-bg');
    if (bg) {
      const rect = slide.getBoundingClientRect();
      const scrollPercent = rect.top / window.innerHeight;
      bg.style.transform = `translateY(${scrollPercent * 30}px)`;
    }
  });
}, { passive: true });


// ============================================
// Syncing logic for Intelligence screen tracking
// ============================================
const vidUntagged = document.getElementById('vidUntagged');
const vidTagged = document.getElementById('vidTagged');
if(vidUntagged && vidTagged) {
  // Configurable offset (in seconds)
  window.SYNC_OFFSET = 0; 
  
  const syncVideos = () => {
    if (!vidUntagged.paused) {
      let targetTime = vidUntagged.currentTime + window.SYNC_OFFSET;
      
      // If we attempt to seek past the length of the shorter tagged video, loop early
      if (vidTagged.readyState >= 1 && targetTime > vidTagged.duration - 0.1) {
        vidUntagged.currentTime = 0; 
        targetTime = window.SYNC_OFFSET;
      }
      
      if (Math.abs(vidTagged.currentTime - targetTime) > 0.15) {
        vidTagged.currentTime = targetTime;
      }
    }
    requestAnimationFrame(syncVideos);
  };
  
  vidUntagged.addEventListener('play', () => {
    vidTagged.play();
    syncVideos();
  });
  
  vidUntagged.addEventListener('pause', () => {
    vidTagged.pause();
  });
}
