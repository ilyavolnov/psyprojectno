// Load courses and webinars for homepage from API
async function loadHomepageCourses() {
    try {
        console.log('Loading courses and webinars for homepage from API...');

        // Load courses from backend API
        const response = await fetch('http://localhost:3001/api/courses');
        const data = await response.json();

        console.log('Homepage courses and webinars loaded:', data);

        if (data.success && data.data) {
            // Filter courses (not webinars) and webinars separately
            const allCourses = data.data.filter(item =>
                item.type !== 'webinar' &&  // Exclude webinars from main courses list
                item.status !== 'completed' // Don't show completed/finished courses in main listing
            );

            const allWebinars = data.data.filter(item =>
                item.type === 'webinar' &&
                item.status !== 'completed' // Don't show completed/finished webinars
            );

            // Update the main courses section
            const coursesList = document.getElementById('courses-list');
            if (coursesList) {
                // Clear existing static course items
                coursesList.innerHTML = '';

                if (allCourses.length > 0) {
                    // Add dynamic courses
                    allCourses.forEach((course, index) => {
                        const courseElement = createCourseElement(course, index + 1);
                        coursesList.appendChild(courseElement);
                    });

                    console.log(`✅ Loaded ${allCourses.length} courses on homepage from API`);
                } else {
                    // If no courses available, show a message
                    coursesList.innerHTML = '<div class="no-courses-message" data-scroll><p>В настоящее время нет доступных курсов</p></div>';
                }

                // Reinitialize hover effects and cursors for new elements
                initCourseHoverEffect();
                if (typeof updateCourseItemCursor === 'function') {
                    updateCourseItemCursor();
                }

                // Reinitialize GSAP animations for new course items if GSAP is available
                if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                    // Re-register the scroll trigger for new course items
                    gsap.utils.toArray('.course-item').forEach((item, index) => {
                        // Check if this item already has an animation
                        if (!item.classList.contains('gsap-anim-loaded')) {
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
                            item.classList.add('gsap-anim-loaded');
                        }
                    });
                }
            }

            // Do not load webinars in the main courses section - keep them only in the separate webinars section
            const webinarsList = document.getElementById('webinars-list');
            if (webinarsList) {
                webinarsList.innerHTML = '<div class="no-webinars-message" data-scroll><p>Вебинары отображаются в отдельной секции</p></div>';
                webinarsList.style.display = 'none';
            }

            // Update the separate webinars section (webinars-section)
            const separateWebinarsSection = document.querySelector('section#webinars-section');
            if (separateWebinarsSection) {
                // Find the courses list inside the separate webinars section
                const separateWebinarsList = separateWebinarsSection.querySelector('.courses-list');
                if (separateWebinarsList) {
                    separateWebinarsList.innerHTML = '';

                    if (allWebinars.length > 0) {
                        // Add dynamic webinars to separate section
                        allWebinars.forEach((webinar, index) => {
                            const webinarElement = createCourseElement(webinar, index + 1);
                            // Add data-scroll attribute to webinar items in this section too
                            webinarElement.setAttribute('data-scroll', '');
                            separateWebinarsList.appendChild(webinarElement);
                        });

                        console.log(`✅ Loaded ${allWebinars.length} webinars in separate webinars section from API`);
                    } else {
                        // If no webinars available, show a message
                        separateWebinarsList.innerHTML = '<div class="no-webinars-message" data-scroll><p>В настоящее время нет доступных вебинаров</p></div>';
                    }

                    // Reinitialize hover effects and cursors for new elements
                    initCourseHoverEffect();
                    if (typeof updateCourseItemCursor === 'function') {
                        updateCourseItemCursor();
                    }

                    // Reinitialize GSAP animations for new webinar items in this section if GSAP is available
                    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                        // Re-register the scroll trigger for new webinar items in this section
                        gsap.utils.toArray('#webinars-section .course-item').forEach((item, index) => {
                            // Check if this item already has an animation
                            if (!item.classList.contains('gsap-anim-loaded')) {
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
                                item.classList.add('gsap-anim-loaded');
                            }
                        });
                    }
                }
            }

            // Update webinars section visibility based on availability
            const webinarsSection = document.getElementById('webinars-section');
            const coursesWebinarsSection = document.querySelector('section[id="courses"]');

            if (webinarsSection && allWebinars.length === 0) {
                webinarsSection.style.display = 'none';
            } else if (webinarsSection) {
                webinarsSection.style.display = 'block';
            }

            // Webinars should not be displayed in the main courses section - only in separate section
            // So we ensure the webinars list in main courses section remains hidden
            const coursesWebinarsList = document.querySelector('section[id="courses"] #webinars-list');
            if (coursesWebinarsList) {
                coursesWebinarsList.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading homepage courses:', error);

        // Fallback to static content if API fails
        console.warn('API failed, keeping static course list as fallback');
    }
}

// Function to create course element
function createCourseElement(course, number) {
    const courseElement = document.createElement('div');
    courseElement.className = 'course-item';
    courseElement.setAttribute('data-scroll', ''); // Add scroll attribute for animations
    courseElement.dataset.image = course.image || '';
    courseElement.dataset.description = course.description || '';
    courseElement.dataset.courseId = course.id;

    // Determine status class and text based on course status
    let statusClass, statusText;
    switch (course.status) {
        case 'available':
            statusClass = 'status-available';
            statusText = 'В доступе';
            break;
        case 'preorder':
            statusClass = 'status-preorder';
            statusText = 'Предзапись';
            if (course.subtitle) {
                statusText = course.subtitle; // Use subtitle for preorder text like "Предзапись V поток"
            }
            break;
        case 'completed':
            statusClass = 'status-completed';
            statusText = 'Завершен';
            break;
        default:
            statusClass = 'status-available';
            statusText = 'В доступе';
    }

    // Format price with proper spacing
    const formattedPrice = new Intl.NumberFormat('ru-RU').format(course.price) + ' ₽';

    courseElement.innerHTML = `
        <div class="course-item-content">
            <span class="course-number">${String(number).padStart(2, '0')}</span>
            <h3 class="course-name">${course.title}</h3>
            <span class="course-status ${statusClass}">${statusText}</span>
            <span class="course-price">${formattedPrice}</span>
        </div>
    `;

    // Add click event to navigate to course page
    courseElement.style.cursor = 'pointer';
    courseElement.addEventListener('click', () => {
        // Determine the correct path based on current location
        const basePath = window.location.pathname.includes('/pages/') ? '../..' : '.';
        const courseUrl = course.slug
            ? `${basePath}/course-page.html?slug=${course.slug}`
            : `${basePath}/course-page.html?id=${course.id}`;
        window.location.href = courseUrl;
    });

    return courseElement;
}

// Load courses when page loads (with a small delay to ensure DOM is ready)
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the homepage and the courses section exists
    const coursesSection = document.getElementById('courses');
    if (coursesSection && document.getElementById('courses-list')) {
        // Load courses after a short delay to ensure all DOM elements are loaded
        setTimeout(loadHomepageCourses, 100);
    }
});

// Also set up a mechanism to reload courses if needed (e.g., via custom event)
window.addEventListener('reloadCourses', loadHomepageCourses);