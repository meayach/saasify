#!/bin/bash

# Script pour remplacer tous les console.log par this.logger.log dans les composants

echo "🧹 Nettoyage des console.log dans les composants..."

# Fonction pour remplacer dans un fichier
replace_console_logs() {
    local file="$1"
    echo "  📝 Traitement de $file"
    
    # Remplacer console.log par this.logger.log
    sed -i '' 's/console\.log(/this.logger.log(/g' "$file"
    
    # Remplacer console.warn par this.logger.warn  
    sed -i '' 's/console\.warn(/this.logger.warn(/g' "$file"
    
    # Remplacer console.info par this.logger.info
    sed -i '' 's/console\.info(/this.logger.info(/g' "$file"
    
    # Garder console.error comme this.logger.error mais les erreurs doivent rester visibles
    sed -i '' 's/console\.error(/this.logger.error(/g' "$file"
}

# Chemins des fichiers à traiter
APPLICATION_CONFIGURE="saas-app-frontend/src/app/@features/applications/components/application-configure/application-configure.component.ts"
APPLICATION_NEW="saas-app-frontend/src/app/@features/applications/components/application-new/application-new.component.ts"

# Traitement des fichiers
replace_console_logs "$APPLICATION_CONFIGURE"
replace_console_logs "$APPLICATION_NEW"

echo "✅ Nettoyage terminé !"
echo "ℹ️  Les console.log sont maintenant des this.logger.log"
echo "ℹ️  Les logs ne s'afficheront qu'en mode développement"
