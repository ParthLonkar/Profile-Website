/* ─── MAIN.JS — ROBUST PORTFOLIO JS ─── */

document.addEventListener('DOMContentLoaded', () => {

    /* ── DYNAMIC GLOW EFFECT ───────────────────────────── */
    const glow = document.createElement('div');
    glow.className = 'radial-glow';
    document.body.appendChild(glow);
    /* ── HIGHLIGHTS SLIDESHOW ───────────────────────────────────────── */
    const highlightSlideshow = document.getElementById('highlightSlideshow');
    const highlightMainImage = document.getElementById('highlightMainImage');
    const highlightMainLabel = document.getElementById('highlightMainLabel');
    const highlightMainCaption = document.getElementById('highlightMainCaption');
    const highlightThumbs = Array.from(document.querySelectorAll('[data-highlight-index]'));
    const highlightSlides = highlightThumbs
        .map(btn => {
            const image = btn.querySelector('img');
            const label = btn.dataset.highlightLabel || (image ? image.alt : '') || btn.textContent.trim();

            return {
                src: btn.dataset.highlightSrc || (image ? image.getAttribute('src') : ''),
                alt: btn.dataset.highlightAlt || (image ? image.alt : label),
                label: label || 'Highlight',
                caption: btn.dataset.highlightCaption || 'Highlight slideshow image.'
            };
        })
        .filter(slide => slide.src);

    let highlightIndex = 0;
    let highlightTimer = null;

    function renderHighlight(index) {
        if (!highlightMainImage || !highlightMainLabel || !highlightMainCaption || !highlightSlides.length) return;

        const slide = highlightSlides[index];
        if (!slide) return;

        highlightMainImage.style.opacity = '0.25';

        const preview = new Image();
        let applied = false;
        const applySlide = () => {
            if (applied) return;
            applied = true;
            highlightMainImage.src = slide.src;
            highlightMainImage.alt = slide.alt;
            highlightMainLabel.textContent = slide.label;
            highlightMainCaption.textContent = slide.caption;
            highlightMainImage.style.opacity = '1';
        };

        preview.onload = applySlide;
        preview.onerror = applySlide;
        preview.src = slide.src;

        if (preview.complete) {
            applySlide();
        }

        highlightThumbs.forEach(btn => {
            const active = Number(btn.dataset.highlightIndex) === index;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });

        highlightIndex = index;
    }

    function stopHighlightTimer() {
        if (highlightTimer) {
            window.clearInterval(highlightTimer);
            highlightTimer = null;
        }
    }

    function startHighlightTimer() {
        if (!highlightSlideshow || highlightSlides.length < 2) return;
        stopHighlightTimer();
        highlightTimer = window.setInterval(() => {
            renderHighlight((highlightIndex + 1) % highlightSlides.length);
        }, 4000);
    }

    if (highlightSlideshow && highlightMainImage && highlightThumbs.length) {
        highlightMainImage.style.transition = 'opacity 0.35s ease';

        highlightThumbs.forEach(btn => {
            btn.addEventListener('click', () => {
                renderHighlight(Number(btn.dataset.highlightIndex) || 0);
                startHighlightTimer();
            });
        });

        highlightSlideshow.addEventListener('mouseenter', stopHighlightTimer);
        highlightSlideshow.addEventListener('mouseleave', startHighlightTimer);

        renderHighlight(0);
        startHighlightTimer();
    }

    document.addEventListener('mousemove', e => {
        const x = e.clientX;
        const y = e.clientY;
        document.body.style.setProperty('--mouse-x', `${x}px`);
        document.body.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });

    /* ── CUSTOM CURSOR ─────────────────────────────────── */
    const dot  = document.getElementById('cDot');
    const ring = document.getElementById('cRing');
    let mx = 0, my = 0, rx = 0, ry = 0;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isWideScreen  = window.innerWidth > 768;

    if (!isTouchDevice && isWideScreen && dot && ring) {
        document.documentElement.classList.add('custom-cursor-active');
        
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top  = my + 'px';
        });

        // Elastic cursor ring animation
        const animRing = () => {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';
            requestAnimationFrame(animRing);
        };
        animRing();

        // Mouse hover states
        const hoverables = document.querySelectorAll('a, button, .work-item, .skill-row, .nav-mobile-btn');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hov'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
        });
    }

    /* ── LOADER REMOVAL ────────────────────────────────── */
    const loader = document.getElementById('loader');
    
    function hideLoader() {
        if (loader && !loader.classList.contains('out')) {
            loader.classList.add('out');
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(hideLoader, 600);
    } else {
        window.addEventListener('load', () => {
            setTimeout(hideLoader, 600);
        });
        // absolute safety fallback
        setTimeout(hideLoader, 2500);
    }

    /* ── MOBILE NAV MENU ───────────────────────────────── */
    const navBtn   = document.getElementById('navBtn');
    const navLinks = document.getElementById('navLinks');

    if (navBtn && navLinks) {
        navBtn.addEventListener('click', () => {
            navBtn.classList.toggle('open');
            navLinks.classList.toggle('mobile-open');
        });

        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navBtn.classList.remove('open');
                navLinks.classList.remove('mobile-open');
            });
        });
    }

    /* ── NAVBAR SCROLL EFFECT ──────────────────────────── */
    const nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    /* ── SMOOTH SCROLLING ──────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const targetId = a.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ── INTERSECTION OBSERVER FOR REVEAL ─────────────── */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = (i % 4) * 0.06 + 's';
        revealObserver.observe(el);
    });

    /* ── WORK ITEMS STAGGERED LOAD ────────────────────── */
    const workObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                workObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.work-item').forEach((el, i) => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(30px)';
        el.style.transition = `opacity .75s ${i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1), transform .75s ${i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1)`;
        workObserver.observe(el);
    });

    /* ── SKILL ROWS STAGGERED LOAD ────────────────────── */
    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.skill-row').forEach((el, i) => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(20px)';
        el.style.transition = `opacity .6s ${i * 0.05}s ease, transform .6s ${i * 0.05}s ease`;
        skillObserver.observe(el);
    });

    /* ── COUNTER NUMBERS ───────────────────────────────── */
    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = +el.dataset.target;
            const duration = 1200;
            const step   = target / (duration / 16);
            let current  = 0;
            
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = Math.floor(current);
                if (current >= target) {
                    el.textContent = target; // Ensure exact final value
                    clearInterval(timer);
                }
            }, 16);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

    /* ── PARALLAX BACKGROUND TEXT ──────────────────────── */
    const heroBg = document.querySelector('.hero-bg-text');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                heroBg.style.transform = `translate(-50%, calc(-50% + ${window.scrollY * 0.22}px))`;
            }
        }, { passive: true });
    }

    /* ── CONTACT FORM SUBMISSION ───────────────────────── */
    const contactForm = document.getElementById('contactForm');
    const submitBtn   = document.getElementById('submitBtn');
    const formStatus  = document.getElementById('formStatus');

    if (contactForm && submitBtn && formStatus) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            
            const data = {
                name:    document.getElementById('name').value,
                email:   document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Sending...';
            formStatus.style.display = 'none';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    formStatus.textContent = '— Message sent. I\'ll be in touch.';
                    formStatus.className   = 'form-status success';
                    contactForm.reset();
                } else {
                    throw new Error('Failed');
                }
            } catch (err) {
                formStatus.textContent = '— Something went wrong. Email me directly.';
                formStatus.className   = 'form-status error';
            } finally {
                formStatus.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Send Message';
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        });
    }
});
