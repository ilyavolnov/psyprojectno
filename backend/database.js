const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
let db = null;
let SQL = null;

// Функция для перезагрузки БД из файла (для получения актуальных данных)
async function reloadDatabase() {
    if (!SQL) {
        SQL = await initSqlJs();
    }
    
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    return db;
}

async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            request_type TEXT NOT NULL,
            message TEXT,
            specialist_id INTEGER,
            course_id INTEGER,
            certificate_amount INTEGER,
            status TEXT DEFAULT 'new',
            archived INTEGER DEFAULT 0,
            deleted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS specialists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            photo TEXT,
            specialization TEXT,
            experience INTEGER,
            price INTEGER,
            status TEXT DEFAULT 'available',
            description TEXT,
            education TEXT,
            additional_services TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            description TEXT,
            price INTEGER,
            old_price INTEGER,
            status TEXT DEFAULT 'available',
            image TEXT,
            release_date TEXT,
            access_duration TEXT,
            feedback_duration TEXT,
            has_certificate INTEGER DEFAULT 1,
            whatsapp_number TEXT,
            topics TEXT,
            bonuses TEXT,
            materials TEXT,
            author_name TEXT,
            author_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_archived ON requests(archived);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_requests_deleted ON requests(deleted);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_specialists_status ON specialists(status);`);
    
    // Check if supervision_id column exists in requests
    try {
        const requestsInfo = db.exec("PRAGMA table_info(requests)");
        const hasSupervisionId = requestsInfo[0]?.values.some(col => col[1] === 'supervision_id');
        if (!hasSupervisionId) {
            db.run('ALTER TABLE requests ADD COLUMN supervision_id INTEGER');
            console.log('✅ Added supervision_id column to requests table');
        }
    } catch (error) {
        console.log('ℹ️  Requests migration check:', error.message);
    }

    // Run migrations
    try {
        // Check if slug column exists in courses table
        const tableInfo = db.exec("PRAGMA table_info(courses)");
        const hasSlug = tableInfo[0]?.values.some(col => col[1] === 'slug');
        
        if (!hasSlug) {
            db.run('ALTER TABLE courses ADD COLUMN slug TEXT');
            console.log('✅ Added slug column to courses table');
        }
        
        // Check if page_blocks column exists
        const hasPageBlocks = tableInfo[0]?.values.some(col => col[1] === 'page_blocks');
        if (!hasPageBlocks) {
            db.run('ALTER TABLE courses ADD COLUMN page_blocks TEXT');
            console.log('✅ Added page_blocks column to courses table');
        }
        
        // Check if start_date column exists
        const hasStartDate = tableInfo[0]?.values.some(col => col[1] === 'start_date');
        if (!hasStartDate) {
            db.run('ALTER TABLE courses ADD COLUMN start_date TEXT');
            console.log('✅ Added start_date column to courses table');
        }
        
        // Check if type column exists
        const hasType = tableInfo[0]?.values.some(col => col[1] === 'type');
        if (!hasType) {
            db.run("ALTER TABLE courses ADD COLUMN type TEXT DEFAULT 'course'");
            console.log('✅ Added type column to courses table');
        }

        // Check if old_price column exists
        const hasOldPrice = tableInfo[0]?.values.some(col => col[1] === 'old_price');
        if (!hasOldPrice) {
            db.run('ALTER TABLE courses ADD COLUMN old_price INTEGER');
            console.log('✅ Added old_price column to courses table');
        }

        // Update has_certificate column to default to 0 (disabled) for existing functionality removal
        // We're not removing the column to maintain backward compatibility
        // but we'll effectively disable the certificate functionality by default
        db.run("UPDATE courses SET has_certificate = 0 WHERE has_certificate = 1");
    } catch (error) {
        console.log('ℹ️  Migration check:', error.message);
    }

    // Check if admin_user table exists
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_user'");
    if (tables.length === 0) {
        // Create admin_user table if it doesn't exist
        db.run(`
            CREATE TABLE admin_user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add default admin user with a bcrypt hashed password
        // Default password: admin123 (should be changed in production)
        const bcrypt = require('bcrypt');
        const saltRounds = 12;
        const defaultPassword = 'admin123'; // This should be changed immediately

        // Hash the password with bcrypt
        const defaultHash = bcrypt.hashSync(defaultPassword, saltRounds);

        // Insert default admin user (no need for separate salt with bcrypt)
        db.run(`INSERT OR IGNORE INTO admin_user (username, password_hash) VALUES ('admin', ?)`, [defaultHash]);
    } else {
        // Check if admin_user table has the old 'salt' column and migrate if necessary
        const tableInfo = db.exec("PRAGMA table_info(admin_user)");
        const hasSaltColumn = tableInfo[0]?.values.some(col => col[1] === 'salt');  // Column name is in index 1

        if (hasSaltColumn) {
            // Backup old table data
            const oldUsers = db.exec("SELECT username, password_hash, salt FROM admin_user");

            if (oldUsers.length > 0) {
                // Rename old table
                db.run("ALTER TABLE admin_user RENAME TO admin_user_old;");

                // Create new table without salt column
                db.run(`
                    CREATE TABLE admin_user (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Migrate users with bcrypt hashing
                const bcrypt = require('bcrypt');

                for (const row of oldUsers[0].values) {
                    const username = row[0];  // username
                    const old_hash = row[1];  // password_hash
                    const salt = row[2];      // salt

                    // Since we can't reconstruct the original password from the old hash,
                    // we'll set a temporary default password and force user to change it
                    // In a real scenario, we would have the original password to re-hash
                    // For this migration, let's use a placeholder and require password change
                    const tempPassword = 'TempPass123'; // Temporary password to force change
                    const newHash = bcrypt.hashSync(tempPassword, 12);

                    db.run(`INSERT INTO admin_user (username, password_hash) VALUES (?, ?)`, [username, newHash]);
                }
            }
        }
    }

    // Check if auth_logs table exists
    const authLogTables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='auth_logs'");
    if (authLogTables.length === 0) {
        // Create auth_logs table if it doesn't exist
        db.run(`
            CREATE TABLE auth_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                ip_address TEXT,
                user_agent TEXT,
                action TEXT NOT NULL,  -- 'login_attempt', 'login_success', 'login_failure', 'password_change'
                result TEXT,           -- 'success', 'failure', 'blocked'
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                details TEXT
            );
        `);
    }

    // Initialize default settings
    const existingSettings = db.exec('SELECT COUNT(*) as count FROM settings');
    if (!existingSettings.length || existingSettings[0].values[0][0] === 0) {
    }

    console.log('✅ Database initialized');
    
    // Save database to file
    saveDatabase();
    
    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// Helper functions to match better-sqlite3 API
function prepare(sql) {
    return {
        run: async (...params) => {
            await reloadDatabase(); // Перезагружаем БД перед записью
            if (!db) {
                throw new Error('Database not initialized');
            }
            db.run(sql, params);
            saveDatabase();
            return { changes: db.getRowsModified(), lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
        },
        get: async (...params) => {
            await reloadDatabase(); // Перезагружаем БД перед чтением
            if (!db) {
                throw new Error('Database not initialized');
            }
            const result = db.exec(sql, params);
            if (result.length > 0 && result[0].values.length > 0) {
                const columns = result[0].columns;
                const values = result[0].values[0];
                const row = {};
                columns.forEach((col, i) => row[col] = values[i]);
                return row;
            }
            return undefined;
        },
        all: async (...params) => {
            try {
                await reloadDatabase(); // Перезагружаем БД перед чтением
                if (!db) {
                    console.error('Database not initialized in prepare().all()');
                    return [];
                }
                
                const result = db.exec(sql, params);
                
                if (result.length > 0 && result[0].values && result[0].values.length > 0) {
                    const columns = result[0].columns;
                    const rows = result[0].values.map(values => {
                        const row = {};
                        columns.forEach((col, i) => row[col] = values[i]);
                        return row;
                    });
                    return rows;
                }
                return []; // Всегда возвращаем массив
            } catch (error) {
                console.error('Error in prepare().all():', error);
                return []; // Возвращаем пустой массив при ошибке
            }
        }
    };
}

module.exports = {
    initDatabase,
    getDb: () => db,
    prepare,
    saveDatabase,
    reloadDatabase
};
