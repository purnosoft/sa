const replayBtn = document.getElementById('replayPageBtn');

replayBtn.addEventListener('click', ()=>{
    let task = getLocalStorage('stopwatch') || getLocalStorage("timerObject");
    
    if (task) {
        showError('Complete Your Study First!');
        return;
    }
    
    deleteObject('hasVisited');
    initIntroApp();
    setTimeout(()=>{
        document.getElementById('homeBtn').click();
    }, 300);
});

function initIntroApp() {
    'use strict';

    // ── DOM refs ──
    const overlay = document.getElementById('introOverlay');
    const slidesWrapper = document.getElementById('slidesWrapper');
    const dotsContainer = document.getElementById('dotsContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const appContent = document.getElementById('appContent');
    const resetBtn = document.getElementById('resetIntroBtn');

    // Safety check: if the DOM elements don't exist, exit early
    if (!overlay) return;

    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentIndex = 0;
    let isTransitioning = false;

    // ── localStorage key ──
    const STORAGE_INTRO_KEY = 'hasVisited';

    // ── Check if new user ──
    function isNewUser() {
        return !localStorage.getItem(STORAGE_INTRO_KEY);
    }

    // ── Dismiss intro, show app ──
    function dismissIntro(e) {
        if (e.target.id === 'getStartedBtn') {
            playSound('ach');
        } else{
            playSound('click');
        }
        goToSlide(currentIndex + 1);
        overlay.classList.add('hidden');
        if (appContent) appContent.style.display = 'flex';
        localStorage.setItem(STORAGE_INTRO_KEY, 'true');
    }

    // ── Render dots ──
    function renderDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // ── Update Background Theme ──
    function updateBackground(index) {
        // Remove existing theme classes
        for (let i = 0; i < totalSlides; i++) {
            overlay.classList.remove(`theme-${i}`);
        }
        // Add the new theme class to trigger the animated background shift
        overlay.classList.add(`theme-${index}`);
    }

    // ── Update UI to current slide ──
    function updateSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update dots
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Update nav buttons
        if (prevBtn) prevBtn.disabled = (index === 0);
        if (nextBtn) nextBtn.disabled = (index === totalSlides - 1);

        // Show/hide "Get Started" on last slide
        const getStarted = document.querySelector('.btn-get-started');
        if (getStarted) {
            getStarted.style.display = (index === totalSlides - 1) ? 'inline-block' : 'none';
        }

        // Update the background theme
        updateBackground(index);

        currentIndex = index;

        setTimeout(() => {
            isTransitioning = false;
        }, 400);
    }

    // ── Go to slide ──
    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;
        if (index === currentIndex) return;
        updateSlide(index);
    }

    // ── Next / Prev ──
    function nextSlide() {
        if (currentIndex < totalSlides - 1) {
            goToSlide(currentIndex + 1);
        }
    }
    function prevSlide() {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } 
    }

    // ── Keyboard support ──
    function handleKeydown(e) {
        if (overlay.classList.contains('hidden')) return;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'Escape') {
            dismissIntro();
        } else if (e.key === 'Enter' && currentIndex === totalSlides - 1) {
            const btn = document.querySelector('.btn-get-started');
            if (btn && btn.style.display !== 'none') {
                btn.click();
            }
        }
    }

    // ── Touch / swipe support ──
    let touchStartX = 0;
    let touchEndX = 0;
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const threshold = 40;
        if (Math.abs(diff) > threshold) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }
 //──
    function cleanup() {
        if (window.__introInitialized) {
            return;
        }
        window.__introInitialized = true;
    }

    // ── Initialize Intro ──
    function initIntro() {
        if (window.__introInitialized) {
            window.__introInitialized = false;
        }
        cleanup();

        renderDots();
        updateSlide(0);
        
        overlay.style.display = 'flex';
        overlay.classList.remove('hidden');
        if (appContent) appContent.style.display = 'none';

        if (nextBtn) nextBtn.addEventListener('click', ()=>{
            playSound('click');
            nextSlide();
        });
        if (prevBtn) prevBtn.addEventListener('click', ()=>{
            playSound('click');
            prevSlide();
        });
        if (skipBtn) skipBtn.addEventListener('click', dismissIntro);

        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', dismissIntro);
        }

        document.addEventListener('keydown', handleKeydown);

        const container = document.querySelector('.intro-container');
        if (container) {
            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                localStorage.removeItem(STORAGE_INTRO_KEY);
                alert('Intro reset. Refresh the page to see it again.');
                location.reload();
            });
        }

        window.__introInitialized = true;
    }

    // ── Boot logic ──
    function boot() {
        if (isNewUser()) {
            initIntro();
        } else {
            overlay.classList.add('hidden');
            if (appContent) appContent.style.display = 'flex';
        }
    }

    // ── Start ──
    boot();
}

window.initIntroApp = initIntroApp;