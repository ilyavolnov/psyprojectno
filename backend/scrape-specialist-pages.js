const https = require('https');
const fs = require('fs');
const path = require('path');

const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'specialists-content.md');
const BASE_URL = 'https://new.dr-rumyantceva.ru';

// Читаем данные специалистов
const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
const specialists = specialistsData.specialists;

// Функция для загрузки HTML страницы
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            let html = '';
            
            response.on('data', chunk => html += chunk);
            response.on('end', () => resolve(html));
            response.on('error', reject);
        }).on('error', reject);
    });
}

// Функция для извлечения текста из HTML
function extractTextContent(html) {
    // Удаляем скрипты и стили
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Извлекаем основной контент
    const content = {
        title: '',
        description: '',
        education: [],
        methods: [],
        services: [],
        testimonials: [],
        blocks: []
    };
    
    // Заголовок специалиста
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
        content.title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    // Описание
    const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
        content.description = descMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    // Образование
    const eduRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let eduSection = html.match(/<div[^>]*class="[^"]*education[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (eduSection) {
        let match;
        while ((match = eduRegex.exec(eduSection[1])) !== null) {
            const text = match[1].replace(/<[^>]+>/g, '').trim();
            if (text) content.education.push(text);
        }
    }
    
    // Методы терапии
    let methodsSection = html.match(/<div[^>]*class="[^"]*methods[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (methodsSection) {
        let match;
        eduRegex.lastIndex = 0;
        while ((match = eduRegex.exec(methodsSection[1])) !== null) {
            const text = match[1].replace(/<[^>]+>/g, '').trim();
            if (text) content.methods.push(text);
        }
    }
    
    // Отзывы
    const testimonialRegex = /<div[^>]*class="[^"]*testimonial[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    while ((match = testimonialRegex.exec(html)) !== null) {
        const testimonialHtml = match[1];
        const textMatch = testimonialHtml.match(/<p[^>]*>(.*?)<\/p>/i);
        const authorMatch = testimonialHtml.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>(.*?)<\/span>/i);
        
        if (textMatch) {
            content.testimonials.push({
                text: textMatch[1].replace(/<[^>]+>/g, '').trim(),
                author: authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : ''
            });
        }
    }
    
    // Все секции с заголовками
    const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/gi;
    while ((match = sectionRegex.exec(html)) !== null) {
        const sectionHtml = match[1];
        const h2Match = sectionHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const h3Match = sectionHtml.match(/<h3[^>]*>(.*?)<\/h3>/i);
        
        if (h2Match || h3Match) {
            const title = (h2Match || h3Match)[1].replace(/<[^>]+>/g, '').trim();
            const contentMatch = sectionHtml.replace(/<h[23][^>]*>.*?<\/h[23]>/gi, '');
            const text = contentMatch.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            
            if (title && text && text.length > 20) {
                content.blocks.push({
                    title: title,
                    content: text
                });
            }
        }
    }
    
    return content;
}

// Функция для поиска URL специалиста на странице списка
async function findSpecialistUrls() {
    console.log('🔍 Поиск URL специалистов...\n');
    
    try {
        const html = await fetchPage(`${BASE_URL}/specialists/`);
        
        // Ищем ссылки на специалистов
        const linkRegex = /<a[^>]+href="([^"]*specialist[^"]*)"[^>]*>/gi;
        const urls = new Set();
        let match;
        
        while ((match = linkRegex.exec(html)) !== null) {
            let url = match[1];
            if (!url.startsWith('http')) {
                url = BASE_URL + (url.startsWith('/') ? '' : '/') + url;
            }
            urls.add(url);
        }
        
        return Array.from(urls);
    } catch (error) {
        console.error('❌ Ошибка поиска URL:', error.message);
        return [];
    }
}

// Основная функция
async function main() {
    console.log('🚀 Скачивание контента специалистов\n');
    console.log('='.repeat(70));
    
    // Находим URL специалистов
    const urls = await findSpecialistUrls();
    console.log(`\n✅ Найдено URL: ${urls.length}\n`);
    
    if (urls.length === 0) {
        console.log('⚠️  URL не найдены. Используем имена специалистов для поиска.\n');
    }
    
    let mdContent = '# Контент специалистов\n\n';
    mdContent += `Дата: ${new Date().toLocaleString('ru-RU')}\n\n`;
    mdContent += '---\n\n';
    
    let successCount = 0;
    let errorCount = 0;
    
    // Обрабатываем каждого специалиста
    for (let i = 0; i < specialists.length; i++) {
        const specialist = specialists[i];
        
        console.log(`\n[${i + 1}/${specialists.length}] ${specialist.name}`);
        console.log('-'.repeat(70));
        
        // Пытаемся найти URL специалиста
        let specialistUrl = null;
        
        // Поиск по имени в URL
        const nameSlug = specialist.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-zа-я0-9-]/g, '');
        
        specialistUrl = urls.find(url => 
            url.toLowerCase().includes(nameSlug) ||
            url.toLowerCase().includes(specialist.name.toLowerCase())
        );
        
        if (!specialistUrl && urls[i]) {
            specialistUrl = urls[i];
        }
        
        if (!specialistUrl) {
            console.log('⚠️  URL не найден, пропускаем');
            errorCount++;
            
            // Добавляем заглушку в MD
            mdContent += `## ${specialist.id}. ${specialist.name}\n\n`;
            mdContent += `**Статус:** URL не найден\n\n`;
            mdContent += '---\n\n';
            continue;
        }
        
        try {
            console.log(`⬇️  URL: ${specialistUrl}`);
            
            const html = await fetchPage(specialistUrl);
            const content = extractTextContent(html);
            
            console.log(`✅ Загружено`);
            console.log(`   Блоков: ${content.blocks.length}`);
            console.log(`   Отзывов: ${content.testimonials.length}`);
            console.log(`   Образование: ${content.education.length} пунктов`);
            
            // Формируем MD
            mdContent += `## ${specialist.id}. ${specialist.name}\n\n`;
            mdContent += `**URL:** ${specialistUrl}\n\n`;
            
            if (content.description) {
                mdContent += `### Описание\n\n${content.description}\n\n`;
            }
            
            if (content.education.length > 0) {
                mdContent += `### Образование\n\n`;
                content.education.forEach(item => {
                    mdContent += `- ${item}\n`;
                });
                mdContent += '\n';
            }
            
            if (content.methods.length > 0) {
                mdContent += `### Методы терапии\n\n`;
                content.methods.forEach(item => {
                    mdContent += `- ${item}\n`;
                });
                mdContent += '\n';
            }
            
            if (content.blocks.length > 0) {
                mdContent += `### Блоки контента\n\n`;
                content.blocks.forEach((block, idx) => {
                    mdContent += `#### ${idx + 1}. ${block.title}\n\n`;
                    mdContent += `${block.content}\n\n`;
                });
            }
            
            if (content.testimonials.length > 0) {
                mdContent += `### Отзывы\n\n`;
                content.testimonials.forEach((t, idx) => {
                    mdContent += `**Отзыв ${idx + 1}**\n\n`;
                    mdContent += `${t.text}\n\n`;
                    if (t.author) {
                        mdContent += `*— ${t.author}*\n\n`;
                    }
                });
            }
            
            mdContent += '---\n\n';
            successCount++;
            
            // Задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`❌ Ошибка: ${error.message}`);
            errorCount++;
            
            mdContent += `## ${specialist.id}. ${specialist.name}\n\n`;
            mdContent += `**Ошибка:** ${error.message}\n\n`;
            mdContent += '---\n\n';
        }
    }
    
    // Сохраняем MD файл
    fs.writeFileSync(OUTPUT_FILE, mdContent, 'utf8');
    
    // Итоги
    console.log('\n' + '='.repeat(70));
    console.log('📊 ИТОГИ:');
    console.log(`   ✅ Успешно: ${successCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(`   📄 Файл: ${OUTPUT_FILE}`);
    console.log('='.repeat(70) + '\n');
    
    if (successCount > 0) {
        console.log('🎉 Контент сохранен в specialists-content.md!');
    }
}

// Запуск
main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
