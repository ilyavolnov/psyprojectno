const https = require('https');
const fs = require('fs');
const path = require('path');

const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'specialists-content.md');
const BASE_URL = 'https://new.dr-rumyantceva.ru/specialists/';

// Маппинг имен специалистов к их slug на сайте
const SPECIALIST_SLUGS = {
    'Маргарита Румянцева': 'margarita-rumyanczeva',
    'Ольга П.': 'olga-p',
    'Анна Б.': 'anna-b',
    'Анастасия': 'anastasiya',
    'Марина': 'marina',
    'Ольга': 'olga',
    'Ульяна': 'ulyana',
    'Юлия С.': 'yuliya-s',
    'Павел': 'pavel',
    'Владимир': 'vladimir',
    'Анастасия П.': 'anastasiya-p',
    'Мария Р.': 'mariya-r',
    'Вера': 'vera',
    'Марина М.': 'marina-m',
    'Анна Ж.': 'anna-zh',
    'Наталья': 'natalya',
    'Надежда Л.': 'nadezhda-l',
    'Надежда': 'nadezhda',
    'Элеонора': 'eleonora',
    'Елена К.': 'elena-k',
    'Елена': 'elena',
    'Мария': 'mariya',
    'Елена Ч.': 'elena-ch',
    'Инесса': 'inessa',
    'Наталья Г.': 'natalya-g',
    'Елизавета': 'elizaveta',
    'Мария С.': 'mariya-s',
    'Наталья С.': 'natalya-s',
    'Анна С.': 'anna-s',
    'Наталья Я.': 'natalya-ya',
    'Наталья Ш.': 'natalya-sh',
    'Анастасия Б.': 'anastasiya-b',
    'Екатерина М.': 'ekaterina-m',
    'Екатерина': 'ekaterina',
    'Динара': 'dinara',
    'Елена В.': 'elena-v',
    'Анна': 'anna',
    'Евгения': 'evgeniya',
    'Юлия': 'yuliya',
    'Валерия': 'valeriya',
    'Татьяна': 'tatyana',
    'Маргарита М.': 'margarita-m'
};

const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
const specialists = specialistsData.specialists;

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

function cleanText(text) {
    return text
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseSpecialistPage(html) {
    const content = {
        title: '',
        profession: '',
        price: '',
        experience: '',
        skills: [],
        blocks: [],
        testimonials: []
    };
    
    // Заголовок
    const titleMatch = html.match(/<h1[^>]*class="specialistPage__title"[^>]*>(.*?)<\/h1>/is);
    if (titleMatch) {
        content.title = cleanText(titleMatch[1]);
    }
    
    // Профессия
    const profMatch = html.match(/<p[^>]*class="specialistPage__profession"[^>]*>(.*?)<\/p>/is);
    if (profMatch) {
        content.profession = cleanText(profMatch[1]);
    }
    
    // Цена
    const priceMatch = html.match(/<p[^>]*class="specialistPage__price"[^>]*>(.*?)<\/p>/is);
    if (priceMatch) {
        content.price = cleanText(priceMatch[1]);
    }
    
    // Опыт
    const timeMatch = html.match(/<p[^>]*class="specialistPage__time"[^>]*>(.*?)<\/p>/is);
    if (timeMatch) {
        content.experience = cleanText(timeMatch[1]);
    }
    
    // Навыки/специализации
    const skillRegex = /<p[^>]*class="specialistPage__skill"[^>]*>(.*?)<\/p>/gis;
    let skillMatch;
    while ((skillMatch = skillRegex.exec(html)) !== null) {
        const skill = cleanText(skillMatch[1]);
        if (skill) content.skills.push(skill);
    }
    
    // Блоки контента
    const blockRegex = /<div[^>]*class="specialistPage__block"[^>]*>([\s\S]*?)<\/div>/gi;
    let blockMatch;
    while ((blockMatch = blockRegex.exec(html)) !== null) {
        const blockHtml = blockMatch[1];
        
        // Заголовок блока
        const blockTitleMatch = blockHtml.match(/<h[23][^>]*>(.*?)<\/h[23]>/i);
        const blockTitle = blockTitleMatch ? cleanText(blockTitleMatch[1]) : '';
        
        // Контент блока
        let blockContent = blockHtml.replace(/<h[23][^>]*>.*?<\/h[23]>/gi, '');
        
        // Проверяем есть ли список
        const listMatch = blockContent.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
        if (listMatch) {
            const items = [];
            const itemRegex = /<li[^>]*>(.*?)<\/li>/gis;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(listMatch[1])) !== null) {
                const item = cleanText(itemMatch[1]);
                if (item) items.push(item);
            }
            
            if (items.length > 0) {
                content.blocks.push({
                    type: 'list',
                    title: blockTitle,
                    items: items
                });
                continue;
            }
        }
        
        // Обычный текстовый блок
        const text = cleanText(blockContent);
        if (text && text.length > 20) {
            content.blocks.push({
                type: 'text',
                title: blockTitle,
                content: text
            });
        }
    }
    
    // Отзывы (если есть)
    const testimonialRegex = /<div[^>]*class="[^"]*testimonial[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let testMatch;
    while ((testMatch = testimonialRegex.exec(html)) !== null) {
        const testHtml = testMatch[1];
        const textMatch = testHtml.match(/<p[^>]*>(.*?)<\/p>/is);
        const authorMatch = testHtml.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>(.*?)<\/span>/is);
        
        if (textMatch) {
            content.testimonials.push({
                text: cleanText(textMatch[1]),
                author: authorMatch ? cleanText(authorMatch[1]) : ''
            });
        }
    }
    
    return content;
}

async function main() {
    console.log('🚀 Парсинг контента специалистов\n');
    console.log('='.repeat(70));
    
    let mdContent = '# Контент специалистов\n\n';
    mdContent += `Дата: ${new Date().toLocaleString('ru-RU')}\n\n`;
    mdContent += '---\n\n';
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < specialists.length; i++) {
        const specialist = specialists[i];
        const slug = SPECIALIST_SLUGS[specialist.name];
        
        console.log(`\n[${i + 1}/${specialists.length}] ${specialist.name}`);
        console.log('-'.repeat(70));
        
        if (!slug) {
            console.log('⚠️  Slug не найден');
            errorCount++;
            mdContent += `## ${specialist.id}. ${specialist.name}\n\n`;
            mdContent += `**Статус:** Slug не найден\n\n`;
            mdContent += '---\n\n';
            continue;
        }
        
        const url = `${BASE_URL}${slug}/`;
        
        try {
            console.log(`⬇️  ${url}`);
            
            const html = await fetchPage(url);
            const content = parseSpecialistPage(html);
            
            console.log(`✅ Загружено`);
            console.log(`   Блоков: ${content.blocks.length}`);
            console.log(`   Навыков: ${content.skills.length}`);
            console.log(`   Отзывов: ${content.testimonials.length}`);
            
            // Формируем MD
            mdContent += `## ${specialist.id}. ${specialist.name}\n\n`;
            mdContent += `**URL:** ${url}\n\n`;
            
            if (content.profession) {
                mdContent += `**Профессия:** ${content.profession}\n\n`;
            }
            
            if (content.price) {
                mdContent += `**Цена:** ${content.price}\n\n`;
            }
            
            if (content.experience) {
                mdContent += `**Опыт:** ${content.experience}\n\n`;
            }
            
            if (content.skills.length > 0) {
                mdContent += `### Специализации\n\n`;
                content.skills.forEach(skill => {
                    mdContent += `- ${skill}\n`;
                });
                mdContent += '\n';
            }
            
            if (content.blocks.length > 0) {
                mdContent += `### Блоки контента\n\n`;
                content.blocks.forEach((block, idx) => {
                    mdContent += `#### Блок ${idx + 1}: ${block.title || 'Без заголовка'}\n\n`;
                    mdContent += `**Тип:** ${block.type}\n\n`;
                    
                    if (block.type === 'list' && block.items) {
                        block.items.forEach(item => {
                            mdContent += `- ${item}\n`;
                        });
                        mdContent += '\n';
                    } else if (block.content) {
                        mdContent += `${block.content}\n\n`;
                    }
                });
            }
            
            if (content.testimonials.length > 0) {
                mdContent += `### Отзывы\n\n`;
                content.testimonials.forEach((t, idx) => {
                    mdContent += `**Отзыв ${idx + 1}**\n\n`;
                    mdContent += `> ${t.text}\n\n`;
                    if (t.author) {
                        mdContent += `*— ${t.author}*\n\n`;
                    }
                });
            }
            
            mdContent += '---\n\n';
            successCount++;
            
            // Задержка
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`❌ Ошибка: ${error.message}`);
            errorCount++;
            
            mdContent += `## ${specialist.id}. ${specialist.name}\n\n`;
            mdContent += `**Ошибка:** ${error.message}\n\n`;
            mdContent += '---\n\n';
        }
    }
    
    // Сохраняем
    fs.writeFileSync(OUTPUT_FILE, mdContent, 'utf8');
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 ИТОГИ:');
    console.log(`   ✅ Успешно: ${successCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(`   📄 Файл: ${OUTPUT_FILE}`);
    console.log('='.repeat(70) + '\n');
    
    if (successCount > 0) {
        console.log('🎉 Контент сохранен!');
    }
}

main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
