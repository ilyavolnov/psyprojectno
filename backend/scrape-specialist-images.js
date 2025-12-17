const https = require('https');
const fs = require('fs');
const path = require('path');

// Конфигурация
const SPECIALISTS_JSON = path.join(__dirname, '..', 'specialists-data.json');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'specialists');
const SOURCE_URL = 'https://new.dr-rumyantceva.ru/specialists/';

// Создаем директорию
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

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

// Функция для загрузки изображения
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadImage(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filepath);
            });
            
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

// Парсинг изображений специалистов
function parseSpecialistImages(html) {
    const images = [];
    
    // Ищем карточки специалистов
    const cardRegex = /<div[^>]*class="[^"]*specialist-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    
    let cardMatch;
    while ((cardMatch = cardRegex.exec(html)) !== null) {
        const cardHtml = cardMatch[1];
        const imgMatch = imgRegex.exec(cardHtml);
        
        if (imgMatch) {
            let imgUrl = imgMatch[1];
            
            // Делаем URL абсолютным
            if (imgUrl.startsWith('/')) {
                imgUrl = 'https://new.dr-rumyantceva.ru' + imgUrl;
            } else if (!imgUrl.startsWith('http')) {
                imgUrl = 'https://new.dr-rumyantceva.ru/' + imgUrl;
            }
            
            images.push(imgUrl);
        }
    }
    
    // Если не нашли по карточкам, ищем все изображения
    if (images.length === 0) {
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            let imgUrl = match[1];
            
            // Фильтруем только релевантные изображения
            if (imgUrl.includes('specialist') || 
                imgUrl.includes('photo') ||
                imgUrl.match(/\d+\.(jpg|jpeg|png|webp)/i)) {
                
                if (imgUrl.startsWith('/')) {
                    imgUrl = 'https://new.dr-rumyantceva.ru' + imgUrl;
                } else if (!imgUrl.startsWith('http')) {
                    imgUrl = 'https://new.dr-rumyantceva.ru/' + imgUrl;
                }
                
                images.push(imgUrl);
            }
        }
    }
    
    return images;
}

// Основная функция
async function main() {
    console.log('🚀 Загрузка изображений специалистов\n');
    console.log('=' .repeat(70));
    
    // Читаем данные специалистов
    const specialistsData = JSON.parse(fs.readFileSync(SPECIALISTS_JSON, 'utf8'));
    const specialists = specialistsData.specialists;
    
    console.log(`\n📋 Специалистов в базе: ${specialists.length}`);
    console.log(`🌐 Источник: ${SOURCE_URL}\n`);
    
    // Загружаем страницу
    console.log('⬇️  Загрузка страницы...');
    let html;
    try {
        html = await fetchPage(SOURCE_URL);
        console.log('✅ Страница загружена\n');
    } catch (error) {
        console.error('❌ Ошибка загрузки страницы:', error.message);
        return;
    }
    
    // Парсим изображения
    console.log('🔍 Поиск изображений...');
    const imageUrls = parseSpecialistImages(html);
    console.log(`✅ Найдено изображений: ${imageUrls.length}\n`);
    
    if (imageUrls.length === 0) {
        console.log('⚠️  Изображения не найдены!');
        console.log('💡 Возможные причины:');
        console.log('   - Структура страницы изменилась');
        console.log('   - Изображения загружаются через JavaScript');
        console.log('   - Неверный URL страницы\n');
        return;
    }
    
    // Показываем найденные URL
    console.log('📋 Найденные изображения:');
    imageUrls.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
    });
    console.log('');
    
    // Загружаем изображения
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < Math.min(specialists.length, imageUrls.length); i++) {
        const specialist = specialists[i];
        const imageUrl = imageUrls[i];
        
        console.log(`\n[${i + 1}/${specialists.length}] ${specialist.name}`);
        console.log('-'.repeat(70));
        
        const filename = specialist.photo.split('/').pop();
        const filepath = path.join(IMAGES_DIR, filename);
        
        // Проверяем существование файла
        if (fs.existsSync(filepath)) {
            console.log(`ℹ️  Файл уже существует: ${filename}`);
            successCount++;
            continue;
        }
        
        try {
            console.log(`⬇️  URL: ${imageUrl}`);
            console.log(`💾 Файл: ${filename}`);
            
            await downloadImage(imageUrl, filepath);
            
            const stats = fs.statSync(filepath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            
            console.log(`✅ Загружено! Размер: ${sizeKB} KB`);
            successCount++;
            
            // Небольшая задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`❌ Ошибка: ${error.message}`);
            errorCount++;
        }
    }
    
    // Итоги
    console.log('\n' + '='.repeat(70));
    console.log('📊 ИТОГИ:');
    console.log(`   ✅ Успешно: ${successCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(`   📁 Директория: ${IMAGES_DIR}`);
    console.log('='.repeat(70) + '\n');
    
    if (successCount > 0) {
        console.log('🎉 Изображения загружены!');
        console.log('💡 Проверьте: images/specialists/\n');
    }
}

// Запуск
main().catch(error => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
});
