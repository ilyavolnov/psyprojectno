console.log('script.js loaded on page:', window.location.pathname);

// Burger menu toggle - centralized function that can be called multiple times safely
function initBurgerMenuFromScriptJS() {
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav');

    console.log('initBurgerMenuFromScriptJS called', { burgerMenu, nav, hasElements: !!burgerMenu && !!nav }); // Отладочный вывод

    if (!burgerMenu || !nav) return; // Don't execute if elements don't exist

    // Check if event listeners have already been added to avoid duplicates
    if (burgerMenu.dataset.burgerInitializedFromScriptJS === 'true') {
        return;
    }

    // Additional check: if the burger menu already has the 'active' class functionality working,
    // it likely means it's already initialized by page-specific code
    if (burgerMenu.classList.contains('active') || nav.classList.contains('active')) {
        // If the menu is already active, don't re-initialize
        if (document.body.style.overflow === 'hidden') {
            return;
        }
    }

    // Mark as initialized
    burgerMenu.dataset.burgerInitializedFromScriptJS = 'true';

    // Toggle menu
    burgerMenu.addEventListener('click', () => {
        burgerMenu.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burgerMenu.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !burgerMenu.contains(e.target) && nav.classList.contains('active')) {
            burgerMenu.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Try to initialize immediately if elements exist
initBurgerMenuFromScriptJS();

// Also initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initBurgerMenuFromScriptJS, 100); // Slight delay to ensure elements are rendered
});

// Set up a periodic check to initialize burger menu if it appears later
// This is a fallback in case MutationObserver doesn't catch all cases
const intervalId = setInterval(() => {
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav');

    if (burgerMenu && nav) {
        console.log('Periodic check found burger menu elements, initializing...');
        initBurgerMenuFromScriptJS();
        // Stop the interval once we've found the elements
        clearInterval(intervalId);
    }
}, 300); // Check every 300ms

// Stop the interval after 10 seconds to prevent it from running indefinitely
setTimeout(() => {
    clearInterval(intervalId);
}, 10000);

// Add a global function that can be called by other scripts after dynamic content is loaded
window.initBurgerMenuFromScriptJS = initBurgerMenuFromScriptJS;

// Set up a mutation observer to handle dynamically added header elements
if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if header elements were added specifically to the header placeholder
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if this element or its descendants contain the header structure
                        const hasBurgerMenu = node.classList &&
                            (node.classList.contains('header') && node.querySelector('.burger-menu'));

                        const hasBurgerMenuDirectly = node.classList && node.classList.contains('burger-menu');

                        if (hasBurgerMenu || hasBurgerMenuDirectly) {
                            console.log('MutationObserver detected header with burger menu, initializing...');
                            // Delay to ensure elements are rendered
                            setTimeout(initBurgerMenuFromScriptJS, 30);
                        }
                    }
                });

                // Also check if the header-placeholder itself was affected
                if (mutation.target && mutation.target.id === 'header-placeholder') {
                    const hasBurgerMenu = mutation.target.querySelector &&
                        mutation.target.querySelector('.burger-menu');
                    if (hasBurgerMenu) {
                        console.log('MutationObserver detected header-placeholder now contains burger menu, initializing...');
                        setTimeout(initBurgerMenuFromScriptJS, 30);
                    }
                }
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// CTA buttons handlers
document.querySelectorAll('.hero-cta-button').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        // Главная кнопка ведет на страницу курсов
        window.location.href = 'pages/courses/courses.html';
    });
});

// Other CTA buttons scroll to contact form, but header button opens popup
document.querySelectorAll('.cta-button').forEach(button => {
    // Don't apply scroll behavior to header button since it has onclick handler for popup
    if (!button.hasAttribute('onclick')) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Focus on first input after scroll
                setTimeout(() => {
                    const firstInput = contactForm.querySelector('input[type="text"]');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 800);
            }
        });
    }
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.padding = '20px 0';
    } else {
        header.style.padding = '30px 0';
    }

    lastScroll = currentScroll;
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, observerOptions);

document.querySelectorAll('[data-scroll]').forEach((el) => {
    observer.observe(el);
});

// Parallax effect for hero shapes and stars
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    const stars = document.querySelectorAll('.star');

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });

    stars.forEach((star, index) => {
        const speed = (index + 1) * 0.15;
        const rotation = scrolled * 0.1;
        star.style.transform = `translateY(${scrolled * speed}px) rotate(${rotation}deg)`;
    });
});

// Course list hover card effect
function initCourseHoverEffect() {
    const courseItems = document.querySelectorAll('.course-item:not(.course-item-closed)');
    const hoverCard = document.querySelector('.course-hover-card');
    const hoverImageElement = hoverCard ? hoverCard.querySelector('img') : null;
    const hoverDescription = hoverCard ? hoverCard.querySelector('.course-hover-description') : null;

    if (courseItems.length > 0 && hoverCard && hoverImageElement && hoverDescription) {
        courseItems.forEach(item => {
            // Remove existing event listeners if any
            item.removeEventListener('mouseenter', handleCourseMouseEnter);
            item.removeEventListener('mousemove', handleCourseMouseMove);
            item.removeEventListener('mouseleave', handleCourseMouseLeave);

            // Add event listeners
            item.addEventListener('mouseenter', handleCourseMouseEnter);
            item.addEventListener('mousemove', handleCourseMouseMove);
            item.addEventListener('mouseleave', handleCourseMouseLeave);
        });
    }
}

// Separate functions for event handling to allow proper removal
function handleCourseMouseEnter(e) {
    const item = e.currentTarget;
    const imageUrl = item.getAttribute('data-image');
    const description = item.getAttribute('data-description');
    const hoverCard = document.querySelector('.course-hover-card');
    const hoverImageElement = hoverCard ? hoverCard.querySelector('img') : null;
    const hoverDescription = hoverCard ? hoverCard.querySelector('.course-hover-description') : null;

    if (imageUrl && description && hoverCard && hoverImageElement && hoverDescription) {
        hoverImageElement.src = imageUrl;
        hoverDescription.textContent = description;
        hoverCard.classList.add('active');
    }
}

function handleCourseMouseMove(e) {
    const hoverCard = document.querySelector('.course-hover-card');
    if (hoverCard && hoverCard.classList.contains('active')) {
        const offsetX = 30;
        const offsetY = -hoverCard.offsetHeight / 2;

        hoverCard.style.left = (e.clientX + offsetX) + 'px';
        hoverCard.style.top = (e.clientY + offsetY) + 'px';
    }
}

function handleCourseMouseLeave(e) {
    const hoverCard = document.querySelector('.course-hover-card');
    if (hoverCard) {
        hoverCard.classList.remove('active');
    }
}

// Initialize hover effect
initCourseHoverEffect();

// Scroll animations with GSAP
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate course/webinar items on scroll
    gsap.utils.toArray('.course-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: 'power3.out',
            delay: index * 0.02
        });
    });

    // Animate section titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top bottom-=50',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Animate subtitles
    gsap.utils.toArray('.courses-subtitle').forEach(subtitle => {
        gsap.from(subtitle, {
            scrollTrigger: {
                trigger: subtitle,
                start: 'top bottom-=50',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 20,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out'
        });
    });

    // Parallax effect for team section
    const teamSection = document.querySelector('.team-section');
    if (teamSection) {
        gsap.to(teamSection, {
            scrollTrigger: {
                trigger: teamSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -100,
            ease: 'none'
        });
    }

    // Parallax effect for supervision background image
    const supervisionBgImage = document.querySelector('.supervision-bg-image');
    if (supervisionBgImage) {
        gsap.to(supervisionBgImage, {
            scrollTrigger: {
                trigger: '.supervision-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5
            },
            y: -100,
            ease: 'none'
        });
    }

    // Animate team specializations
    gsap.utils.toArray('.spec-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top bottom-=50',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -30,
            duration: 0.6,
            delay: index * 0.03,
            ease: 'power2.out'
        });
    });

    // Animate hero stats with scale effect
    gsap.utils.toArray('.stat-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            scale: 0.8,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    });

    // Smooth reveal for credentials card
    const credentialsCard = document.querySelector('.hero-credentials');
    if (credentialsCard) {
        gsap.from(credentialsCard, {
            scrollTrigger: {
                trigger: credentialsCard,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            rotationX: -15,
            duration: 1,
            ease: 'power3.out'
        });
    }
}

// Mouse move effect for cards
document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Custom cursor for specialization items
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.innerHTML = '<span>Подбор специалиста</span>';
document.body.appendChild(cursor);

let cursorVisible = false;

document.querySelectorAll('.spec-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursorVisible = true;
        cursor.classList.add('active');
        item.style.cursor = 'pointer';
    });

    item.addEventListener('mouseleave', () => {
        cursorVisible = false;
        cursor.classList.remove('active');
        item.style.cursor = 'default';
    });

    item.addEventListener('mousemove', (e) => {
        if (cursorVisible) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });

    item.addEventListener('click', () => {
        window.location.href = 'specialists.html';
    });
});

// Cursor glow effect
const cursorGlow = document.querySelector('.cursor-glow');
const heroSection = document.querySelector('.hero');

if (cursorGlow && heroSection) {
    document.addEventListener('mousemove', (e) => {
        const heroRect = heroSection.getBoundingClientRect();

        // Check if cursor is within hero section
        if (e.clientY >= heroRect.top && e.clientY <= heroRect.bottom) {
            cursorGlow.style.opacity = '1';
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        } else {
            cursorGlow.style.opacity = '0';
        }
    });

    heroSection.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });
}




// Testimonials carousel - infinite loop
const testimonialsCarousel = document.querySelector('.testimonials-carousel');
const prevBtn = document.querySelector('.testimonial-prev');
const nextBtn = document.querySelector('.testimonial-next');

if (testimonialsCarousel && prevBtn && nextBtn) {
    const cards = document.querySelectorAll('.testimonial-card');
    const cardWidth = 390; // 360px + 30px gap

    // Clone cards for infinite loop
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        testimonialsCarousel.appendChild(clone);
    });

    let currentIndex = 0;
    let isTransitioning = false;

    function updateCarousel(smooth = true) {
        if (smooth) {
            testimonialsCarousel.style.transition = 'transform 0.5s ease';
        } else {
            testimonialsCarousel.style.transition = 'none';
        }
        const offset = currentIndex * cardWidth;
        testimonialsCarousel.style.transform = `translateX(-${offset}px)`;
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateCarousel();

        // Reset to beginning seamlessly when reaching cloned cards
        if (currentIndex >= cards.length) {
            setTimeout(() => {
                testimonialsCarousel.style.transition = 'none';
                currentIndex = 0;
                testimonialsCarousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                setTimeout(() => {
                    testimonialsCarousel.style.transition = 'transform 0.5s ease';
                    isTransitioning = false;
                }, 50);
            }, 500);
        } else {
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
        }
    }

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;

        if (currentIndex === 0) {
            testimonialsCarousel.style.transition = 'none';
            currentIndex = cards.length;
            testimonialsCarousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            setTimeout(() => {
                testimonialsCarousel.style.transition = 'transform 0.5s ease';
                currentIndex--;
                testimonialsCarousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            }, 50);
        } else {
            currentIndex--;
            updateCarousel();
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
        }
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Auto-scroll
    let autoScrollInterval = setInterval(nextSlide, 5000);

    // Pause auto-scroll on hover
    testimonialsCarousel.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });

    testimonialsCarousel.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(nextSlide, 5000);
    });

    // Drag to scroll on mobile
    const wrapper = document.querySelector('.testimonials-carousel-wrapper');
    if (wrapper && window.innerWidth <= 768) {
        let isDown = false;
        let startX;
        let scrollLeft;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            wrapper.style.cursor = 'grabbing';
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });

        wrapper.addEventListener('mouseleave', () => {
            isDown = false;
            wrapper.style.cursor = 'grab';
        });

        wrapper.addEventListener('mouseup', () => {
            isDown = false;
            wrapper.style.cursor = 'grab';
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 2;
            wrapper.scrollLeft = scrollLeft - walk;
        });

        wrapper.style.cursor = 'grab';
    }
}




// Parallax background images for courses/webinars sections
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    document.querySelectorAll('[data-parallax-bg]').forEach((img) => {
        const section = img.closest('section');

        if (section) {
            // Move up on scroll
            gsap.fromTo(img,
                {
                    y: 0
                },
                {
                    y: -100,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                }
            );
        }
    });
}




// Contact form submission
const mainContactForm = document.getElementById('contactForm');
if (mainContactForm) {
    mainContactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = this.querySelector('.form-submit');
        const originalText = submitButton.innerHTML;

        // Disable button and show loading
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Отправка...</span>';

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            request_type: 'consultation',
            userType: document.querySelector('input[name="userType"]:checked')?.value
        };

        // Add userType to message
        if (formData.userType) {
            formData.message = `[${formData.userType === 'client' ? 'Клиент' : 'Психотерапевт'}] ${formData.message}`;
        }

        try {
            const response = await fetch(API_CONFIG.getApiUrl('requests'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                submitButton.innerHTML = '<span>✅ Заявка отправлена!</span>';
                submitButton.style.background = '#28a745';

                // Reset form
                mainContactForm.reset();

                // Show success notification
                showNotification('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');

                // Restore button after 3 seconds
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                    submitButton.style.background = '';
                }, 3000);
            } else {
                throw new Error(data.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Error submitting form:', error);

            // Show error
            submitButton.innerHTML = '<span>❌ Ошибка отправки</span>';
            submitButton.style.background = '#dc3545';

            showNotification('Произошла ошибка. Попробуйте позже или свяжитесь с нами по телефону.', 'error');

            // Restore button after 3 seconds
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                submitButton.style.background = '';
            }, 3000);
        }
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <p class="notification-message">${message}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide and remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
