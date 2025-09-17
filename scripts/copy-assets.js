const fs = require('fs');
const path = require('path');

// Script para copiar archivos estáticos del directorio Huby/ al directorio public/
function copyAssets() {
  const sourceDir = path.join(__dirname, '../Huby');
  const destDir = path.join(__dirname, '../public');

  // Función recursiva para copiar directorios
  function copyRecursive(src, dest) {
    try {
      const stats = fs.statSync(src);

      if (stats.isDirectory()) {
        // Crear directorio si no existe
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        // Copiar contenido del directorio
        const files = fs.readdirSync(src);
        files.forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        // Copiar archivo
        fs.copyFileSync(src, dest);
        console.log(`Copiado: ${src} → ${dest}`);
      }
    } catch (error) {
      console.error(`Error copiando ${src}:`, error.message);
    }
  }

  console.log('🔄 Copiando archivos estáticos...');
  copyRecursive(sourceDir, destDir);
  console.log('✅ Archivos estáticos copiados exitosamente');
}

copyAssets();
