#!/bin/bash

# Script d'installation des dépendances pour les captures d'écran Odoo

echo "🚀 Installation des dépendances pour les captures d'écran Odoo"
echo ""

# Vérifier Python
echo "📝 Vérification de Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python installé: $PYTHON_VERSION"
else
    echo "❌ Python 3 n'est pas installé"
    echo "   Installez-le depuis https://www.python.org/downloads/"
    exit 1
fi

# Installer Selenium
echo ""
echo "📦 Installation de Selenium..."
pip3 install selenium

# Vérifier Chrome
echo ""
echo "📝 Vérification de Google Chrome..."
if [ -d "/Applications/Google Chrome.app" ]; then
    echo "✅ Google Chrome installé"
else
    echo "⚠️ Google Chrome non trouvé"
    echo "   Installez-le depuis https://www.google.com/chrome/"
fi

# Installer ChromeDriver
echo ""
echo "📦 Installation de ChromeDriver..."
brew install chromedriver

# Vérifier l'installation
echo ""
echo "📝 Vérification de ChromeDriver..."
if command -v chromedriver &> /dev/null; then
    CHROMEDRIVER_VERSION=$(chromedriver --version)
    echo "✅ ChromeDriver installé: $CHROMEDRIVER_VERSION"
else
    echo "⚠️ ChromeDriver non trouvé"
    echo "   Installez-le manuellement depuis https://chromedriver.chromium.org/"
fi

# Permissions pour ChromeDriver (macOS)
echo ""
echo "🔐 Configuration des permissions ChromeDriver (macOS)..."
xattr -d com.apple.quarantine $(which chromedriver) 2>/dev/null || echo "   (déjà configuré ou non applicable)"

echo ""
echo "✅ Installation terminée!"
echo ""
echo "📝 Pour exécuter le script de captures:"
echo "   cd /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou"
echo "   python3 capture_odoo_screenshots.py"
echo ""
