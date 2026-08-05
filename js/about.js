// about.js
function createAboutPage() {
    const aboutPage = document.getElementById('aboutPage');
    if (!aboutPage) {
        console.warn('⚠️ About page container not found');
        return;
    }

    // ============================================================
    // DOM refs
    // ============================================================
    const toc = aboutPage.querySelector('.toc');
    const stickyToggle = aboutPage.querySelector('.toc__toggle-sticky');
    const parentLink = aboutPage.querySelector('.toc__parent');
    const subMenu = aboutPage.querySelector('#features-sub');
    const allSections = aboutPage.querySelectorAll('.section, .feature-card--detailed');
    const mainLinks = aboutPage.querySelectorAll('.toc__link:not(.toc__parent)');
    const subLinks = aboutPage.querySelectorAll('.toc__sub-link');

    // ============================================================
    // 1. STICKY TOGGLE (Pin / Unpin)
    // ============================================================
    if (toc && stickyToggle) {
        // Load saved preference
        const stickyPref = localStorage.getItem('tocSticky');
        if (stickyPref === 'true') {
            toc.classList.add('sticky');
            stickyToggle.classList.add('active');
        }

        // Toggle on click - using a direct handler
        stickyToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('active');
            const isSticky = this.classList.contains('active');
            toc.classList.toggle('sticky', isSticky);
            localStorage.setItem('tocSticky', isSticky);
            
        });
    } else {
        console.warn('⚠️ TOC or toggle not found');
    }

    // ============================================================
    // 2. COLLAPSIBLE FEATURES SUB‑MENU
    // ============================================================
    if (parentLink && subMenu) {
        
        const hasActiveSub = subMenu.querySelector('.toc__sub-link.active');
        if (hasActiveSub) {
            parentLink.classList.add('open');
            subMenu.classList.add('open');
            
        }

        // Toggle submenu – NO SCROLLING!
        parentLink.addEventListener('click', function(e) {
            e.preventDefault();      // CRITICAL: stop anchor jump
            e.stopPropagation();
            
            this.classList.toggle('open');
            subMenu.classList.toggle('open');
            
        });

        // Sub‑links: scroll to target and mark active
        subLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = aboutPage.querySelector(`#${targetId}`);
                
                if (targetElement) {
                    const targetTop = targetElement.offsetTop - 80;
                    aboutPage.scrollTo({
    top: targetTop,
    behavior: "smooth"
});
                }

                // Update active state
                subLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // Ensure parent is expanded
                if (!parentLink.classList.contains('open')) {
                    parentLink.classList.add('open');
                    subMenu.classList.add('open');
                }
            });
        });
    }

    // ============================================================
    // 3. OTHER TOC LINKS (Purpose, Reason) – smooth scroll
    // ============================================================
    mainLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = aboutPage.querySelector(`#${targetId}`);
     
            if (targetElement) {
                const targetTop = targetElement.offsetTop - 80;
                aboutPage.scrollTo({
    top: targetTop,
    behavior: "smooth"
});
                history.pushState(null, null, `#${targetId}`);
            }

            // Update active state
            mainLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
                        parentLink.classList.remove("active");
            subLinks.forEach(link => link.classList.remove("active"));
        });
    });

    // ============================================================
    // 4. ACTIVE LINK HIGHLIGHTING ON SCROLL
    // ============================================================
    function updateActiveLink() {
        const scrollPos = aboutPage.scrollTop + 120;
        let current = '';

        allSections.forEach(el => {
            if (!el.id) return;
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = el.id;
            }
        });

        // Update main links
        mainLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${current}`;
            link.classList.toggle('active', isActive);
        });

        // Update sub‑links
        let anyActive = false;
        subLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${current}`;
            link.classList.toggle('active', isActive);
            if (isActive) anyActive = true;
        });
        
parentLink.classList.toggle("active", anyActive);
        
    }

    aboutPage.addEventListener("scroll", updateActiveLink);
    setTimeout(updateActiveLink, 300);

    // ============================================================
    // 5. MOTIVATION BACKGROUND ANIMATION
    // ============================================================
    const motivationSection = aboutPage.querySelector('#motivation');
    if (motivationSection) {
        const orbs = motivationSection.querySelectorAll('.orb');

        function updateMotivationBackground() {
            const rect = motivationSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            let progress = 0;
            if (rect.top < windowHeight && rect.bottom > 0) {
                const visiblePart = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                progress = Math.min(Math.max(visiblePart / rect.height, 0), 1);
            } else if (rect.top < 0 && rect.bottom > windowHeight) {
                progress = 1;
            }

            // Vibrant color transition
            const r1 = 30, g1 = 20, b1 = 60;   // deep violet
            const r2 = 70, g2 = 60, b2 = 180;  // bright indigo
            const r3 = 0,  g3 = 180, b3 = 220; // vivid cyan

            let r, g, b;
            if (progress <= 0.5) {
                const t = progress / 0.5;
                r = Math.round(r1 + (r2 - r1) * t);
                g = Math.round(g1 + (g2 - g1) * t);
                b = Math.round(b1 + (b2 - b1) * t);
            } else {
                const t = (progress - 0.5) / 0.5;
                r = Math.round(r2 + (r3 - r2) * t);
                g = Math.round(g2 + (g3 - g2) * t);
                b = Math.round(b2 + (b3 - b2) * t);
            }

            motivationSection.style.background = `rgb(${r}, ${g}, ${b})`;

            orbs.forEach((orb, idx) => {
                const shiftX = (progress - 0.5) * 30 * (idx + 1);
                const shiftY = (progress - 0.5) * 15 * (idx + 1);
                orb.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            });
        }

        aboutPage.addEventListener("scroll", updateMotivationBackground);
        window.addEventListener('resize', updateMotivationBackground);
        setTimeout(updateMotivationBackground, 300);
    }

}
