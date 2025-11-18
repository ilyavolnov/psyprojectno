const { initDatabase, prepare, saveDatabase } = require('./database');

async function updateSupervisionsTable() {
    console.log('🔄 Updating supervisions table structure...\n');
    
    try {
        await initDatabase();
        
        // Drop old table if exists
        await prepare('DROP TABLE IF EXISTS supervisions').run();
        
        // Create new supervisions table with extended structure
        await prepare(`
            CREATE TABLE supervisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                supervisors TEXT,
                date TEXT,
                experience TEXT,
                price INTEGER DEFAULT 0,
                duration TEXT,
                price_note TEXT,
                description TEXT,
                features TEXT,
                bonus TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
        
        console.log('✅ Supervisions table updated');
        
        // Add default supervisions
        const supervisions = [
            {
                title: 'Супервизия в EMDR-подходе с Натальей С.',
                supervisors: 'Наталья С.',
                date: null,
                experience: '10 лет',
                price: 3900,
                duration: '55 минут',
                price_note: null,
                description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
                features: JSON.stringify([
                    'Индивидуальный разбор вашего случая',
                    'Работа с травматическим опытом',
                    'Практические рекомендации',
                    'Супервизия в EMDR-подходе'
                ]),
                bonus: null
            },
            {
                title: 'Групповая супервизия',
                supervisors: '2 ведущих супервизора',
                date: '27 ноября 13.00-16.00 (мск)',
                experience: 'Более 10 лет',
                price: 2500,
                duration: '3 часа',
                price_note: '*стоимость за встречу',
                description: 'Групповая супервизия с разбором кейсов в полимодальном подходе',
                features: JSON.stringify([
                    'Анализ 2-3 кейсов (выбор делают участники)',
                    'Разбор в ПОЛИмодальном подходе: помощь в составлении плана ведения клиента',
                    'Обозначение «слепых зон» процесса',
                    'Практические рекомендации',
                    'БОНУС! Терапевтический блок для участников (возможность познакомиться с EMDR на личном опыте)',
                    'Встреча будет проходить в программе Zoom (подключение с видео – по желанию)'
                ]),
                bonus: 'Присоединяйтесь! Это станет вашим МЕСТОМ СИЛЫ и опорным профессиональным сообществом'
            },
            {
                title: 'Супервизия с Маргаритой Румянцевой',
                supervisors: 'Маргарита Румянцева',
                date: null,
                experience: '15 лет',
                price: 11900,
                duration: '90 минут',
                price_note: null,
                description: 'Врач-психотерапевт, EMDR-терапевт, IFS-терапевт, Сексолог, Сертифицированный супервизор, Преподаватель, Европейский практик',
                features: JSON.stringify([
                    'Глубокий разбор сложных случаев',
                    'Работа с различными подходами (EMDR, IFS)',
                    'Супервизия от европейского практика',
                    'Индивидуальный подход'
                ]),
                bonus: null
            },
            {
                title: 'Супервизия с Натальей',
                supervisors: 'Наталья',
                date: null,
                experience: '13 лет',
                price: 3900,
                duration: '55 минут',
                price_note: null,
                description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
                features: JSON.stringify([
                    'Разбор клиентских случаев',
                    'EMDR-подход',
                    'Практические рекомендации',
                    'Работа со сложными запросами'
                ]),
                bonus: null
            },
            {
                title: 'Супервизия с Павлом',
                supervisors: 'Павел',
                date: null,
                experience: '16 лет',
                price: 3900,
                duration: '55 минут',
                price_note: null,
                description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
                features: JSON.stringify([
                    'Профессиональная супервизия',
                    'Разбор сложных кейсов',
                    'EMDR-терапия',
                    'Индивидуальный подход'
                ]),
                bonus: null
            }
        ];
        
        for (const supervision of supervisions) {
            await prepare(`
                INSERT INTO supervisions (
                    title, supervisors, date, experience, price, duration,
                    price_note, description, features, bonus, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
            `).run(
                supervision.title,
                supervision.supervisors,
                supervision.date,
                supervision.experience,
                supervision.price,
                supervision.duration,
                supervision.price_note,
                supervision.description,
                supervision.features,
                supervision.bonus
            );
        }
        
        console.log('✅ Default supervisions added');
        
        saveDatabase();
        console.log('✅ Migration completed!\n');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    updateSupervisionsTable().then(() => {
        console.log('Done!');
        process.exit(0);
    });
}

module.exports = { updateSupervisionsTable };
