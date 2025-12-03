#!/bin/bash

# Backup script for psyproject
# Run with cron: 0 2 * * * /var/www/psyproject/backup.sh

# Configuration
BACKUP_DIR="/var/backups/psyproject"
PROJECT_DIR="/var/www/psyproject"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Starting backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
if [ -f "$PROJECT_DIR/database.sqlite" ]; then
    echo -e "${YELLOW}📦 Backing up database...${NC}"
    cp "$PROJECT_DIR/database.sqlite" "$BACKUP_DIR/database_$DATE.sqlite"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database backed up successfully${NC}"
    else
        echo -e "${RED}❌ Failed to backup database${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Database file not found${NC}"
    exit 1
fi

# Backup .env file
if [ -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}📦 Backing up .env file...${NC}"
    cp "$PROJECT_DIR/.env" "$BACKUP_DIR/env_$DATE.txt"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ .env backed up successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to backup .env${NC}"
    fi
fi

# Backup uploaded images
if [ -d "$PROJECT_DIR/images/uploads" ]; then
    echo -e "${YELLOW}📦 Backing up uploaded images...${NC}"
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$PROJECT_DIR/images" uploads
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Images backed up successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to backup images${NC}"
    fi
fi

# Remove old backups
echo -e "${YELLOW}🗑️  Removing backups older than $RETENTION_DAYS days...${NC}"
find "$BACKUP_DIR" -name "database_*.sqlite" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "env_*.txt" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Show backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo -e "${GREEN}✅ Backup complete!${NC}"
echo -e "${GREEN}📊 Total backup size: $BACKUP_SIZE${NC}"
echo -e "${GREEN}📁 Backup location: $BACKUP_DIR${NC}"

# List recent backups
echo -e "\n${YELLOW}📋 Recent backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -n 10
