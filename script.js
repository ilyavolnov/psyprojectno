// Burger menu toggle
const burgerMenu = document.querySelector('.burger-menu');
const nav = document.querySelector('.nav');

burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    nav.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        burgerMenu.classList.remove('active');
        nav.classList.remove('active');
    });
});

// Smooth scroll for CTA buttons
document.querySelectorAll('.cta-button, .hero-cta-button').forEach(button => {
    button.addEventListener('click', function () {
        // Placeholder for modal or scroll to contact form
        alert('Форма консультации будет добавлена позже');
    });
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
            item.addEventListener('mouseenter', (e) => {
                const imageUrl = item.getAttribute('data-image');
                const description = item.getAttribute('data-description');
                
                if (imageUrl && description) {
                    hoverImageElement.src = imageUrl;
                    hoverDescription.textContent = description;
                    hoverCard.classList.add('active');
                }
            });
            
            item.addEventListener('mousemove', (e) => {
                if (hoverCard.classList.contains('active')) {
                    const offsetX = 30;
                    const offsetY = -hoverCard.offsetHeight / 2;
                    
                    hoverCard.style.left = (e.clientX + offsetX) + 'px';
                    hoverCard.style.top = (e.clientY + offsetY) + 'px';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                hoverCard.classList.remove('active');
            });
        });
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
            duration: 0.8,
            ease: 'power3.out',
            delay: index * 0.05
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
            y: -50,
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
            rotation: 5,
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
    });

    item.addEventListener('mouseleave', () => {
        cursorVisible = false;
        cursor.classList.remove('active');
    });

    item.addEventListener('mousemove', (e) => {
        if (cursorVisible) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });
});

// Cursor glow effect
const cursorGlow = document.querySelector('.cursor-glow');
const heroSection = document.querySelector('.hero');

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




// Testimonials carousel
const testimonialsCarousel = document.querySelector('.testimonials-carousel');
const prevBtn = document.querySelector('.testimonial-prev');
const nextBtn = document.querySelector('.testimonial-next');

if (testimonialsCarousel && prevBtn && nextBtn) {
    let currentIndex = 0;
    const cards = document.querySelectorAll('.testimonial-card');
    const cardWidth = 430; // 400px + 30px gap
    const maxIndex = cards.length - 2; // Show 2 cards at a time
    
    function updateCarousel() {
        const offset = currentIndex * cardWidth;
        testimonialsCarousel.style.transform = `translateX(-${offset}px)`;
    }
    
    nextBtn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
    
    // Auto-scroll
    let autoScrollInterval = setInterval(() => {
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }, 5000);
    
    // Pause auto-scroll on hover
    testimonialsCarousel.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });
    
    testimonialsCarousel.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(() => {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000);
    });
}


// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would normally send data to your backend
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.');
        
        // Reset form
        contactForm.reset();
    });
}


// Parallax effect for form clouds
const formCloud = document.querySelector('.form-cloud');
const formCloudBg = document.querySelector('.form-cloud-bg');

if (formCloud && typeof gsap !== 'undefined') {
    gsap.to(formCloud, {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2
        },
        y: -80,
        x: 30,
        rotation: 5,
        ease: 'none'
    });
}

if (formCloudBg && typeof gsap !== 'undefined') {
    gsap.to(formCloudBg, {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        },
        y: 60,
        x: -20,
        rotation: -3,
        ease: 'none'
    });
}

// Parallax effect for form leaf
const formLeaf = document.querySelector('.form-leaf');
if (formLeaf && typeof gsap !== 'undefined') {
    gsap.to(formLeaf, {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2.5
        },
        y: -70,
        x: -25,
        rotation: -8,
        ease: 'none'
    });
}

// Parallax effect for form heart
const formHeart = document.querySelector('.form-heart');
if (formHeart && typeof gsap !== 'undefined') {
    gsap.to(formHeart, {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.8
        },
        y: -50,
        x: 20,
        rotation: 10,
        scale: 1.1,
        ease: 'none'
    });
}
