// Script de confirmación para limpiar usuarios
const { spawn } = require('child_process');

console.log('🔄 Ejecutando limpieza de usuarios...');
console.log('⚠️ Esta acción eliminará todos los usuarios excepto uno de cada tipo.');

const cleanup = spawn('node', ['scripts/cleanup-users.js', '--confirm'], {
    stdio: 'inherit'
});

cleanup.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Limpieza completada exitosamente');
    } else {
        console.log('❌ Error durante la limpieza');
    }
}); 