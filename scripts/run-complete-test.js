const { checkServer, startServer, waitForServer } = require('./check-server');
const { runAllTests } = require('./test-all-endpoints');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function runCompleteTest() {
  console.log(`${colors.bold}${colors.blue}🚀 PRUEBA COMPLETA DE LA API DE DONACIÓN DE SANGRE${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.blue}Este script verificará el servidor y ejecutará todas las pruebas${colors.reset}\n`);
  
  let serverProcess = null;
  
  try {
    // Paso 1: Verificar si el servidor está corriendo
    console.log(`${colors.bold}${colors.yellow}PASO 1: VERIFICANDO SERVIDOR${colors.reset}`);
    const isRunning = await checkServer();
    
    if (!isRunning) {
      console.log(`${colors.yellow}⚠️  El servidor no está corriendo. Iniciando...${colors.reset}`);
      serverProcess = await startServer();
      const isReady = await waitForServer();
      
      if (!isReady) {
        throw new Error('No se pudo iniciar el servidor correctamente');
      }
    }
    
    console.log(`${colors.green}✅ Servidor listo${colors.reset}\n`);
    
    // Paso 2: Ejecutar todas las pruebas
    console.log(`${colors.bold}${colors.yellow}PASO 2: EJECUTANDO PRUEBAS${colors.reset}`);
    const results = await runAllTests();
    
    // Paso 3: Análisis de resultados
    console.log(`\n${colors.bold}${colors.yellow}PASO 3: ANÁLISIS DE RESULTADOS${colors.reset}`);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const total = results.length;
    
    // Identificar pruebas críticas
    const criticalTests = results.filter(r => 
      r.endpoint === '/' || 
      r.endpoint === '/users/register' || 
      r.endpoint === '/users/login' ||
      r.endpoint === '/donors/available' ||
      r.endpoint === '/receivers/urgent' ||
      r.endpoint === '/receivers'
    );
    
    const criticalSuccess = criticalTests.filter(r => r.success).length;
    const criticalTotal = criticalTests.length;
    
    // Mostrar resumen final
    console.log(`${colors.bold}${colors.blue}📊 RESUMEN FINAL${colors.reset}`);
    console.log('='.repeat(40));
    console.log(`${colors.green}✅ Pruebas exitosas: ${successful}/${total}${colors.reset}`);
    console.log(`${colors.red}❌ Pruebas fallidas: ${failed}/${total}${colors.reset}`);
    console.log(`${colors.blue}🎯 Pruebas críticas: ${criticalSuccess}/${criticalTotal}${colors.reset}`);
    
    // Mostrar estado general
    if (criticalSuccess === criticalTotal && successful >= total * 0.8) {
      console.log(`\n${colors.green}${colors.bold}🎉 ¡EXCELENTE! La API está funcionando perfectamente${colors.reset}`);
      console.log(`${colors.green}✅ Todas las funcionalidades críticas están operativas${colors.reset}`);
      console.log(`${colors.green}✅ La API está lista para producción${colors.reset}`);
    } else if (criticalSuccess === criticalTotal) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  BUENO - Funcionalidades críticas OK${colors.reset}`);
      console.log(`${colors.yellow}✅ Las funcionalidades principales funcionan${colors.reset}`);
      console.log(`${colors.yellow}⚠️  Algunas pruebas secundarias fallaron${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ PROBLEMAS DETECTADOS${colors.reset}`);
      console.log(`${colors.red}❌ Algunas funcionalidades críticas no funcionan${colors.reset}`);
      console.log(`${colors.red}❌ Revisa los errores arriba${colors.reset}`);
    }
    
    // Mostrar recomendaciones
    console.log(`\n${colors.bold}${colors.blue}💡 RECOMENDACIONES${colors.reset}`);
    console.log('-'.repeat(30));
    
    if (failed > 0) {
      console.log(`${colors.yellow}• Revisa los endpoints que fallaron${colors.reset}`);
      console.log(`${colors.yellow}• Verifica la configuración de la base de datos${colors.reset}`);
      console.log(`${colors.yellow}• Asegúrate de que todas las tablas existen${colors.reset}`);
    }
    
    console.log(`${colors.blue}• Usa 'npm run dev' para desarrollo${colors.reset}`);
    console.log(`${colors.blue}• Usa 'npm start' para producción${colors.reset}`);
    console.log(`${colors.blue}• Revisa el README.md para documentación${colors.reset}`);
    
    // Código de salida
    if (criticalSuccess === criticalTotal) {
      console.log(`\n${colors.green}${colors.bold}✅ Prueba completada exitosamente${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ Prueba completada con errores${colors.reset}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`\n${colors.red}${colors.bold}❌ ERROR DURANTE LA PRUEBA${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    if (serverProcess) {
      serverProcess.kill();
    }
    
    process.exit(1);
  }
}

// Manejo de señales para limpiar procesos
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Deteniendo pruebas...${colors.reset}`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}🛑 Deteniendo pruebas...${colors.reset}`);
  process.exit(0);
});

// Ejecutar si se llama directamente
if (require.main === module) {
  runCompleteTest().catch(error => {
    console.error(`${colors.red}❌ Error inesperado:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = { runCompleteTest }; 