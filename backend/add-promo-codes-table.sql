-- Add promo_codes table to existing database
CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount INTEGER NOT NULL,
    description TEXT,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    valid_from TEXT,
    valid_until TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for promo codes table
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_from ON promo_codes(valid_from);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_until ON promo_codes(valid_until);