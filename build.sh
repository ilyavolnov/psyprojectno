#!/bin/bash

# Build script to organize project files for deployment
# Copies files from src/ structure to correct locations for web server

echo "Building project..."

# Create necessary directories
mkdir -p includes
mkdir -p pages/{courses,specialists,supervisions,certificates}

# Copy files from src to their deployment locations
echo "Copying components..."

# Copy footer-loader.js
cp -f src/components/footer/footer-loader.js . 2>/dev/null || echo "footer-loader.js not found, skipping..."

# Copy load-components.js
cp -f src/utils/loaders/load-components.js includes/ 2>/dev/null || echo "load-components.js not found, skipping..."

# Copy other components
cp -f src/components/popups/consultation-popup.js . 2>/dev/null || echo "consultation-popup.js not found, skipping..."
cp -f src/components/popups/order-popup.js . 2>/dev/null || echo "order-popup.js not found, skipping..."

# Copy page loaders
cp -f src/utils/loaders/courses-loader.js pages/courses/ 2>/dev/null || echo "courses-loader.js not found, skipping..."
cp -f src/utils/loaders/specialists-loader.js pages/specialists/ 2>/dev/null || echo "specialists-loader.js not found, skipping..."
cp -f src/utils/loaders/supervisions-loader.js pages/supervisions/ 2>/dev/null || echo "supervisions-loader.js not found, skipping..."

# Copy other page files
cp -f src/pages/specialists/specialists.html pages/specialists/ 2>/dev/null || echo "specialists.html not found, skipping..."
cp -f src/pages/supervisions/supervision.html pages/supervisions/ 2>/dev/null || echo "supervision.html not found, skipping..."
cp -f src/pages/certificates/certificates.html pages/certificates/ 2>/dev/null || echo "certificates.html not found, skipping..."

# Copy other utilities
cp -f src/utils/helpers/utils.js . 2>/dev/null || echo "utils.js not found, skipping..."
cp -f src/utils/helpers/smooth-scroll.js . 2>/dev/null || echo "smooth-scroll.js not found, skipping..."

echo "Build completed!"