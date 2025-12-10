// Load courses from API
async function loadCourses() {
    try {
        console.log('Loading courses from API...');
        // Load both courses and webinars
        const response = await fetch('http://localhost:3001/api/courses');
        const data = await response.json();
        console.log('Courses and webinars loaded:', data);
        
        if (data.success && data.data) {
            const coursesList = document.getElementById('courses-list');
            coursesList.innerHTML = '';
            
            // Разделяем на курсы и вебинары
            const courses = data.data.filter(item => item.type === 'course' || !item.type);
            const webinars = data.data.filter(item => item.type === 'webinar');
            
            // Функция для создания элемента
            const createItem = (item, index, type) => {
                console.log(`${type} ${index + 1}:`, item.title, 'slug:', item.slug);
                const itemElement = document.createElement('div');
                itemElement.className = 'course-item';
                itemElement.dataset.image = item.image || '';
                itemElement.dataset.description = item.description || '';
                itemElement.dataset.courseId = item.id;
                
                const statusClass = item.status === 'available' ? 'status-available' : 
                                   item.status === 'preorder' ? 'status-preorder' : 'status-completed';
                const statusText = item.status === 'available' ? 'В доступе' : 
                                  item.status === 'preorder' ? 'Предзапись' : 'Завершен';
                
                itemElement.innerHTML = `
                    <div class="course-item-content">
                        <span class="course-number">${String(index + 1).padStart(2, '0')}</span>
                        <h3 class="course-name">${item.title}</h3>
                        <span class="course-status ${statusClass}">${statusText}</span>
                        <span class="course-price">${item.price} ₽</span>
                    </div>
                `;
                
                itemElement.style.cursor = 'pointer';
                itemElement.addEventListener('click', () => {
                    // Determine the correct path based on current location (relative to root)
                    const basePath = window.location.pathname.includes('/pages/') ? '../..' : '.';
                    const targetUrl = item.slug
                        ? `${basePath}/course-page.html?slug=${item.slug}`
                        : `${basePath}/course-page.html?id=${item.id}`;
                    window.location.href = targetUrl;
                });
                
                return itemElement;
            };
            
            // Добавляем заголовок и курсы
            if (courses.length > 0) {
                const coursesHeader = document.createElement('div');
                coursesHeader.className = 'courses-section-header';
                coursesHeader.innerHTML = '<h2 class="section-title">Курсы</h2>';
                coursesList.appendChild(coursesHeader);
                
                courses.forEach((course, index) => {
                    coursesList.appendChild(createItem(course, index, 'Course'));
                });
            }
            
            // Добавляем заголовок и вебинары
            if (webinars.length > 0) {
                const webinarsHeader = document.createElement('div');
                webinarsHeader.className = 'courses-section-header';
                webinarsHeader.innerHTML = '<h2 class="section-title">Вебинары</h2>';
                coursesList.appendChild(webinarsHeader);
                
                webinars.forEach((webinar, index) => {
                    coursesList.appendChild(createItem(webinar, index, 'Webinar'));
                });
            }
            
            console.log(`✅ Loaded ${courses.length} courses and ${webinars.length} webinars from API`);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Load courses when page loads
document.addEventListener('DOMContentLoaded', loadCourses);
