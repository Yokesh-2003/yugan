// ─── 1. PAGE LOAD PRELOADER ──────────────────────────────────────────────────
(function () {
    var preloader = document.getElementById('preloader');
    var counter = document.getElementById('preloader-count');
    var bar = document.getElementById('preloader-bar');
    var pct = 0;
    var target = 100;
    var duration = 1200; // ms
    var steps = 60;
    var interval = duration / steps;

    var timer = setInterval(function () {
        pct = Math.min(pct + Math.ceil(target / steps), target);
        if (counter) counter.textContent = pct;
        if (bar) bar.style.width = pct + '%';
        if (pct >= target) {
            clearInterval(timer);
            setTimeout(function () {
                if (preloader) preloader.classList.add('done');
                // Feature 4: reveal hero profile image after preloader
                var profileImg = document.querySelector('.profile-img');
                if (profileImg) {
                    setTimeout(function () { profileImg.classList.add('revealed'); }, 200);
                }
            }, 300);
        }
    }, interval);

    // Safety: also hide on window load if counter somehow stalls
    window.addEventListener('load', function () {
        setTimeout(function () {
            if (preloader && !preloader.classList.contains('done')) {
                if (counter) counter.textContent = '100';
                if (bar) bar.style.width = '100%';
                preloader.classList.add('done');
                var profileImg = document.querySelector('.profile-img');
                if (profileImg) profileImg.classList.add('revealed');
            }
        }, 1400);
    });

    // Feature 3: hide scroll indicator after user scrolls past hero
    var scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 120) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        }, { passive: true });
    }
})();

// ─── 2. MOUSE / ORIENTATION PARALLAX for profile image ──────────────────────
(function () {
    var profileWrap = document.getElementById('profile-wrap');
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var currentX = 0, currentY = 0;
    var velocityX = 0, velocityY = 0;
    var damping = 25, stiffness = 150;

    function mapRange(value, inMin, inMax, outMin, outMax) {
        return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    }

    function springStep() {
        var targetX = mapRange(mouseX, 0, window.innerWidth, -50, 50);
        var targetY = mapRange(mouseY, 0, window.innerHeight, -50, 50);
        var dt = 1 / 60;
        velocityX += (-stiffness * (currentX - targetX) - damping * velocityX) * dt;
        currentX += velocityX * dt;
        velocityY += (-stiffness * (currentY - targetY) - damping * velocityY) * dt;
        currentY += velocityY * dt;
        if (profileWrap) {
            profileWrap.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
        }
        requestAnimationFrame(springStep);
    }

    window.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('deviceorientation', function (e) {
        if (e.beta !== null && e.gamma !== null) {
            var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            var maxTilt = 30;
            mouseX = cx + (Math.min(Math.max(e.gamma || 0, -maxTilt), maxTilt) / maxTilt) * (window.innerWidth / 2);
            mouseY = cy + (Math.min(Math.max((e.beta || 0) - 45, -maxTilt), maxTilt) / maxTilt) * (window.innerHeight / 2);
        }
    });
    requestAnimationFrame(springStep);
})();

// ─── 3. SCROLL REVEALS (Bunyan-style cards + heading/fade-up) ────────────────
(function () {
    // ── Bunyan card reveal: fires when card is past the viewport midpoint ──────
    var cards = document.querySelectorAll('.bunyan-card');
    var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = parseFloat(el.dataset.delay || 0) * 1000;
                setTimeout(function () { el.classList.add('visible'); }, delay);
                cardObserver.unobserve(el);
            }
        });
    }, {
        // Negative bottom margin = card must be well inside the viewport
        // before triggering — so they only show once the white panel
        // has scrolled past roughly the midpoint of the screen.
        rootMargin: '-30% 0px -10% 0px',
        threshold: 0
    });
    cards.forEach(function (el) { cardObserver.observe(el); });

    // ── Legacy fade-up + heading-reveal + slide-left/right ────────────────────
    var others = document.querySelectorAll('.fade-up, .heading-reveal, .slide-left, .slide-right');
    var otherObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = parseFloat(el.dataset.delay || 0) * 1000;
                setTimeout(function () { el.classList.add('visible'); }, delay);
                otherObserver.unobserve(el);
            }
        });
    }, { rootMargin: '-60px', threshold: 0 });
    others.forEach(function (el) { otherObserver.observe(el); });
})();

// ─── 4. PROJECT DRAWER ────────────────────────────────────────────────────────
(function () {
    var drawer = document.getElementById('drawer');
    var drawerOverlay = document.getElementById('drawer-overlay');
    var drawerClose = document.getElementById('drawer-close');
    var drawerContent = document.getElementById('drawer-content');

    // Project data map
    var projects = {
        'video-editing': {
            tag: 'Cut & Craft',
            title: 'Video Editing',
            desc: 'Professional video production and editing work — from raw footage to polished cinematic pieces. Specializing in performance ads, short films, and brand storytelling.',
            imgs: ['src/assets/project-projection.png']
        },
        'videography': {
            tag: 'LiveMotion',
            title: 'Videography',
            desc: 'Dynamic live event and studio videography capturing real moments with a creative lens. From live performances to brand shoots, every frame tells a story.',
            imgs: ['src/assets/project-touchdesigner.png']
        },
        'performance-marketing': {
            tag: 'Marketing',
            title: 'Performance Marketing',
            desc: 'Data-driven performance marketing campaigns across Meta, Google, and YouTube. Focused on ROI, conversion rate optimization, and scaling paid acquisition for brands.',
            imgs: []
        },
        'uiux': {
            tag: 'Design',
            title: 'Web Building',
            desc: 'End-to-end user interface and experience design — from wireframes and prototypes to polished high-fidelity screens. Creating digital products that are both beautiful and intuitive.',
            imgs: []
        },
        'work-experience': {
            tag: 'Career',
            title: 'Work Experience',
            desc: 'A journey through roles in content creation, performance marketing, video production, and design. Worked across agencies and startups, building brands and delivering measurable growth.',
            imgs: []
        },
        'freelance': {
            tag: 'Projects',
            title: 'Freelance Work',
            desc: 'A collection of independent projects across various industries, focusing on creative solutions, brand identity, and digital growth strategies for diverse clients.',
            imgs: []
        },
        'photography': {
            tag: 'Visuals',
            title: 'Photography',
            desc: 'Capturing moments through a specialized lens, focusing on composition, lighting, and storytelling. From architectural shots to event coverage and creative portraits.',
            imgs: []
        },
        'brands': {
            tag: 'Clients',
            title: 'Brands Worked With',
            desc: 'Collaborated with a diverse range of brands — from local startups to established businesses — delivering creative content, marketing campaigns, and design solutions that drive results.',
            imgs: []
        },
        'zara': {
            tag: 'Redesign',
            title: 'Zara Redesign',
            desc: 'A conceptual UI/UX redesign of the Zara e-commerce platform — focusing on a cleaner, more premium shopping experience with improved navigation and visual hierarchy.',
            imgs: ['src/assets/project-zara.png']
        },
        'lead': {
            tag: 'Internship',
            title: 'Lead Management System',
            desc: 'An end-to-end lead tracking and management application built during an internship. Features real-time status updates, assignment flows, and analytics dashboards.',
            imgs: ['src/assets/project-lead1.png', 'src/assets/project-lead2.png']
        },
        'ballot': {
            tag: 'Application',
            title: 'Ballot Book',
            desc: 'A digital voting and polling application designed for transparent, accessible elections. Features secure authentication, real-time results, and a clean mobile-first interface.',
            imgs: ['src/assets/project-ballot1.png', 'src/assets/project-ballot2.png']
        },
        'srishti': {
            tag: 'Application',
            title: 'Srishti Marketplace',
            desc: 'A campus marketplace app connecting students for buying, selling, and trading. Built with an emphasis on trust, simplicity, and community-driven interactions.',
            imgs: ['src/assets/project-srishti1.png', 'src/assets/project-srishti2.png']
        },
        'blackboard': {
            tag: 'Redesign',
            title: 'Blackboard Redesign',
            desc: 'A modern overhaul of the Blackboard LMS interface — improving usability, reducing cognitive load, and bringing a fresh, accessible design to student learning.',
            imgs: ['src/assets/project-bb1.png']
        },
        'moneymap': {
            tag: 'Application',
            title: 'MoneyMap',
            desc: 'A personal finance tracking application that visualizes spending patterns, sets budget goals, and provides actionable insights to improve financial health.',
            imgs: ['src/assets/project-moneymap1.png', 'src/assets/project-moneymap2.png']
        },
        'sahyagri': {
            tag: 'Logo',
            title: 'Sahyagri',
            desc: 'Brand identity and logo design for Sahyagri, an agri-tech startup. The mark balances organic warmth with modern clarity to communicate trust and growth.',
            imgs: ['src/assets/project-sahyagri.png']
        },
        'leafpect': {
            tag: 'Logo',
            title: 'Leafpect',
            desc: 'A clean, nature-inspired logo and visual identity for Leafpect. The design uses botanical forms and a fresh palette to reflect the brand\'s eco-conscious values.',
            imgs: ['src/assets/project-leafpect.png']
        }
    };

    function openDrawer(projectKey) {
        var data = projects[projectKey];
        if (!data || !drawerContent) return;

        // Build content
        var imgsHtml = data.imgs.map(function (src) {
            return '<img src="' + src + '" alt="' + data.title + '" loading="lazy" />';
        }).join('');

        drawerContent.innerHTML =
            '<span class="drawer-tag">' + data.tag + '</span>' +
            '<h2 class="drawer-title">' + data.title + '</h2>' +
            '<p class="drawer-desc">' + data.desc + '</p>' +
            '<div class="drawer-imgs">' + imgsHtml + '</div>';

        // Show
        drawer.classList.add('open');
        drawerOverlay.style.display = 'block';
        requestAnimationFrame(function () {
            drawerOverlay.classList.add('open');
        });
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () {
            drawerOverlay.style.display = 'none';
        }, 400);
    }

    // Wire up card clicks
    document.querySelectorAll('.project-card[data-project]').forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            var project = card.dataset.project;
            if (project === 'video-editing') {
                window.location.href = 'video-editing.html';
            } else {
                openDrawer(project);
            }
        });
    });

    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // Escape key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDrawer();
    });
})();

// ─── Contact Form Handler ─────────────────────────────────────────────────────
function handleContactSubmit(e) {
    e.preventDefault();
    var btn = e.target.querySelector('.contact-submit');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'hsl(38 90% 55%)';
    e.target.reset();
    setTimeout(function () {
        btn.innerHTML = 'Send Message <span class="contact-submit-arrow">→</span>';
        btn.style.background = '';
    }, 3000);
}

// ─── 6. MOBILE SCROLL MOMENTUM ANIMATIONS ──────────────────────────────────────
(function () {
    var mobileCards = document.querySelectorAll('.bunyan-card');
    if (mobileCards.length === 0) return;

    function updateMobileAnimations() {
        if (window.innerWidth > 640) {
            // Reset transforms if user resizes to desktop
            mobileCards.forEach(function (card) {
                card.style.transform = '';
            });
            return;
        }

        var vh = window.innerHeight;
        var center = vh / 2;

        mobileCards.forEach(function (card) {
            if (!card.classList.contains('visible')) return;

            var rect = card.getBoundingClientRect();
            var cardCenter = rect.top + rect.height / 2;
            var distanceFromCenter = cardCenter - center;

            // Normalize distance: 0 at center, 1 at edges of viewport
            var normalized = distanceFromCenter / center;
            var absNormalized = Math.abs(normalized);

            // Subtle premium effects
            var translateY = normalized * 20; // Slight parallax
            var rotateX = normalized * -8;    // Perspective tilt
            var scale = 1 - (absNormalized * 0.05); // Taper off size towards edges

            // Clamp scale so it doesn't get too small
            scale = Math.max(0.92, scale);

            card.style.transform =
                'translateY(' + translateY + 'px) ' +
                'rotateX(' + rotateX + 'deg) ' +
                'scale(' + scale + ')';
        });
    }

    // Use a throttled scroll or rAF for smoothness
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateMobileAnimations();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    window.addEventListener('load', updateMobileAnimations);
})();

// ─── 7. SCROLLABLE REELS FEED LOGIC ─────────────────────────────────────────
(function () {
    const videoModal = document.getElementById('video-modal');
    const modalClose = document.getElementById('video-modal-close');
    const videoFeed = document.getElementById('video-feed');
    const playBtn = document.querySelector('.social-bar a[aria-label="Play"]');
    const scrollHint = document.getElementById('scroll-hint');

    if (!videoModal || !playBtn || !videoFeed) return;

    // Intersection Observer to handle play/pause on scroll
    const observerOptions = {
        root: videoFeed,
        threshold: 0.6 // Video must be 60% visible to play
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (entry.isIntersecting) {
                video.play().catch(() => { });
            } else {
                video.pause();
                video.currentTime = 0; // Optional: reset video when scrolled away
            }
        });
    }, observerOptions);

    // Observe all slides
    const slides = videoFeed.querySelectorAll('.reel-slide');
    slides.forEach(slide => videoObserver.observe(slide));

    function shuffleVideos() {
        const slidesArray = Array.from(videoFeed.querySelectorAll('.reel-slide'));
        // Fisher-Yates shuffle
        for (let i = slidesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [slidesArray[i], slidesArray[j]] = [slidesArray[j], slidesArray[i]];
        }
        slidesArray.forEach(slide => videoFeed.appendChild(slide));
    }

    let hintTimeout;

    // Open Modal
    playBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Shuffle videos for random order
        shuffleVideos();

        videoModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Show scroll hint
        if (scrollHint) {
            scrollHint.classList.add('show');
            clearTimeout(hintTimeout);
            hintTimeout = setTimeout(() => {
                scrollHint.classList.remove('show');
            }, 10000);
        }

        // Ensure new first video starts playing
        const newSlides = videoFeed.querySelectorAll('.reel-slide');
        const firstVideo = newSlides[0].querySelector('video');
        if (firstVideo) firstVideo.play().catch(() => { });
    });

    // Close Modal
    function closeModal() {
        videoModal.classList.remove('open');
        document.body.style.overflow = '';

        // Hide scroll hint immediately
        if (scrollHint) scrollHint.classList.remove('show');
        clearTimeout(hintTimeout);

        // Stop all videos
        slides.forEach(slide => {
            const v = slide.querySelector('video');
            v.pause();
            v.currentTime = 0;
        });

        // Reset scroll position to top
        videoFeed.scrollTop = 0;
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) closeModal();
    });

    // Escape key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal.classList.contains('open')) closeModal();
    });

    // Toggle mute on click within the reel (Disabled per user request for unmuted autoplay)
    /* videoFeed.addEventListener('click', function (e) {
        if (e.target.tagName === 'VIDEO') {
            e.target.muted = !e.target.muted;
        }
    }); */

    // Set all videos to full volume initially
    slides.forEach(slide => {
        const v = slide.querySelector('video');
        if (v) v.volume = 1;
    });
})();
