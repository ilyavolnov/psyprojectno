#!/bin/bash

echo "🔄 Updating psyproject..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project directory?${NC}"
    exit 1
fi

# Stash local changes
echo -e "${YELLOW}📦 Stashing local changes...${NC}"
git stash

# Pull latest changes
echo -e "${YELLOW}⬇️  Pulling latest changes...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Failed to pull changes${NC}"
    git stash pop
    exit 1
fi

# Restore stashed changes
echo -e "${YELLOW}📦 Restoring local changes...${NC}"
git stash pop

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Failed to install dependencies${NC}"
    exit 1
fi

# Restart PM2 process
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
    pm2 restart psyproject-backend
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PM2 process restarted successfully${NC}"
    else
        echo -e "${RED}❌ Error: Failed to restart PM2 process${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not found. Skipping process restart.${NC}"
fi

# Show status
if command -v pm2 &> /dev/null; then
    echo -e "\n${GREEN}📊 Current status:${NC}"
    pm2 status psyproject-backend
fi

echo -e "\n${GREEN}✅ Update complete!${NC}"
echo -e "${YELLOW}💡 Check logs with: pm2 logs psyproject-backend${NC}"
