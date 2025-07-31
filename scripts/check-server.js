const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function checkServer() {
  try {
    console.log(`${colors.blue}🔍 Verificando si el servidor está corriendo...${colors.reset}`);
    await axios.get(BASE_URL, { timeout: 3000 });
    console.log(`${colors.green}✅ Servidor ya está corriendo en ${BASE_URL}${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Servidor no está corriendo en ${BASE_URL}${colors.reset}`);
    return false;
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}🚀 Iniciando servidor...${colors.reset}`);
    
    const server = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true
    });
    
    let isReady = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output.trim());
      
      // Verificar si el servidor está listo
      if (output.includes('Servidor corriendo en http://localhost:3000')) {
        if (!isReady) {
          isReady = true;
          console.log(`${colors.green}✅ Servidor iniciado exitosamente${colors.reset}`);
          resolve(server);
        }
      }
    });
    
    server.stderr.on('data', (data) => {
      console.log(`${colors.red}❌ Error del servidor: ${data.toString()}${colors.reset}`);
    });
    
    server.on('error', (error) => {
      console.log(`${colors.red}❌ Error al iniciar servidor: ${error.message}${colors.reset}`);
      reject(error);
    });
    
    // Timeout después de 30 segundos
    setTimeout(() => {
      if (!isReady) {
        server.kill();
        reject(new Error('Timeout: El servidor no se inició en 30 segundos'));
      }
    }, 30000);
  });
}

async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(BASE_URL, { timeout: 2000 });
      console.log(`${colors.green}✅ Servidor está respondiendo${colors.reset}`);
      return true;
    } catch (error) {
      console.log(`${colors.yellow}⏳ Esperando servidor... (intento ${i + 1}/${maxAttempts})${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

async function main() {
  console.log(`${colors.bold}${colors.blue}🔧 VERIFICADOR DE SERVIDOR${colors.reset}`);
  console.log('='.repeat(40));
  
  // Verificar si el servidor ya está corriendo
  const isRunning = await checkServer();
  
  if (isRunning) {
    console.log(`${colors.green}✅ El servidor está listo para las pruebas${colors.reset}`);
    return;
  }
  
  try {
    // Iniciar servidor
    const serverProcess = await startServer();
    
    // Esperar a que el servidor esté completamente listo
    const isReady = await waitForServer();
    
    if (isReady) {
      console.log(`${colors.green}✅ Servidor iniciado y listo para las pruebas${colors.reset}`);
      console.log(`${colors.yellow}💡 Para detener el servidor, presiona Ctrl+C${colors.reset}`);
      
      // Mantener el proceso vivo
      process.on('SIGINT', () => {
        console.log(`\n${colors.yellow}🛑 Deteniendo servidor...${colors.reset}`);
        serverProcess.kill();
        process.exit(0);
      });
      
      // No resolver la promesa para mantener el proceso vivo
      return new Promise(() => {});
    } else {
      console.log(`${colors.red}❌ El servidor no se pudo iniciar correctamente${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}❌ Error inesperado:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = { checkServer, startServer, waitForServer }; 