const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend', 'database.sqlite');
const IMAGES_DIR = path.join(__dirname, 'images', 'specialists');

async function updateSpecialistPhotos() {
    try {
        // Инициализируем БД
        const SQL = await initSqlJs();
        const filebuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(filebuffer);

        // Получаем список всех доступных изображений
        const availablePhotos = fs.readdirSync(IMAGES_DIR)
            .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp'));

        // Сопоставление имен специалистов с изображениями
        const photoMapping = {
            'Маргарита Румянцева': 'rumyantseva.jpg',
            'Анна Б.': 'anna_b.jpg',
            'Ольга П.': 'olya_p.jpg',
            'Анастасия': 'anastasiya_1.jpg',
            'Марина М.': 'marina_m.jpg',
            'Ульяна': 'ulyana.jpg',
            'Ольга': 'olga_1.jpeg',
            'Маргарита': 'margarita_m.jpg'
        };

        console.log('Обновляем изображения специалистов в базе данных...');

        for (const [name, photo] of Object.entries(photoMapping)) {
            if (availablePhotos.includes(photo)) {
                const result = db.run(
                    "UPDATE specialists SET photo = ? WHERE name LIKE ?",
                    [`images/specialists/${photo}`, `%${name}%`]
                );
                console.log(`Обновлено изображение для ${name}: ${photo} (${result.changes} записей)`);
            } else {
                console.log(`⚠️ Изображение не найдено для ${name}: ${photo}`);
            }
        }

        // Для остальных специалистов установим стандартное изображение
        db.run(
            "UPDATE specialists SET photo = ? WHERE photo LIKE 'https://%' OR photo IS NULL OR photo = ''",
            ['images/specialists/hero-page.webp']
        );
        console.log('Остальные специалисты получили стандартное изображение');

        // Сохраняем изменения в БД
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);

        console.log('✅ Изображения обновлены в базе данных');
        db.close();

    } catch (error) {
        console.error('❌ Ошибка при обновлении изображений:', error);
        process.exit(1);
    }
}

updateSpecialistPhotos();