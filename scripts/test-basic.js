const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let testResults = [];

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Función para hacer peticiones HTTP
async function makeRequest(method, endpoint, data = null, description = '', expectedStatus = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    const result = {
      success: true,
      method,
      endpoint,
      status: response.status,
      description,
      data: response.data
    };

    // Si se especificó un status esperado, verificar si coincide
    if (expectedStatus && response.status !== expectedStatus) {
      result.success = false;
      result.expectedStatus = expectedStatus;
      console.log(`${colors.red}❌${colors.reset} ${method} ${endpoint} - ${response.status} (esperado: ${expectedStatus})`);
    } else {
      console.log(`${colors.green}✅${colors.reset} ${method} ${endpoint} - ${response.status} ${response.statusText}`);
    }
    
    if (description) {
      console.log(`   ${colors.blue}${description}${colors.reset}`);
    }
    
    return result;
  } catch (error) {
    const result = {
      success: false,
      method,
      endpoint,
      status: error.response?.status || 'ERROR',
      description,
      error: error.response?.data || error.message
    };

    // Si se especificó un status esperado y coincide, es un éxito
    if (expectedStatus && error.response?.status === expectedStatus) {
      result.success = true;
      console.log(`${colors.green}✅${colors.reset} ${method} ${endpoint} - ${result.status} (esperado: ${expectedStatus})`);
    } else {
      console.log(`${colors.red}❌${colors.reset} ${method} ${endpoint} - ${result.status}`);
    }
    
    if (description) {
      console.log(`   ${colors.blue}${description}${colors.reset}`);
    }
    
    if (!result.success) {
      console.log(`   ${colors.red}Error: ${JSON.stringify(result.error)}${colors.reset}`);
    }
    
    return result;
  }
}

// Función para mostrar resumen
function showSummary() {
  console.log(`\n${colors.bold}${colors.blue}📊 RESUMEN DE PRUEBAS${colors.reset}`);
  console.log('='.repeat(50));
  
  const successful = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const total = testResults.length;
  
  console.log(`${colors.green}✅ Exitosas: ${successful}${colors.reset}`);
  console.log(`${colors.red}❌ Fallidas: ${failed}${colors.reset}`);
  console.log(`${colors.blue}📋 Total: ${total}${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}${colors.bold}❌ ENDPOINTS CON ERRORES:${colors.reset}`);
    testResults.filter(r => !r.success).forEach(result => {
      console.log(`   ${colors.red}• ${result.method} ${result.endpoint} - ${result.status}${colors.reset}`);
    });
  }
  
  console.log(`\n${colors.green}${colors.bold}✅ ENDPOINTS EXITOSOS:${colors.reset}`);
  testResults.filter(r => r.success).forEach(result => {
    console.log(`   ${colors.green}• ${result.method} ${result.endpoint} - ${result.status}${colors.reset}`);
  });
}

// Función principal de pruebas
async function runBasicTests() {
  console.log(`${colors.bold}${colors.blue}🧪 PRUEBAS BÁSICAS DE LA API${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);
  
  // 1. Prueba de conectividad básica
  console.log(`${colors.yellow}${colors.bold}1. PRUEBAS DE CONECTIVIDAD${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/', null, 'Información de la API'));
  
  // 2. Pruebas de registro de usuarios
  console.log(`\n${colors.yellow}${colors.bold}2. PRUEBAS DE REGISTRO DE USUARIOS${colors.reset}`);
  console.log('-'.repeat(30));
  
  const donorData = {
    Username: 'test_donor_basic',
    Password: 'password123',
    Email: 'test_donor_basic@email.com',
    FirstName: 'Test',
    LastName: 'Donor',
    PhoneNumber: '555-999-9999',
    BirthDate: '1995-06-14',
    Gender: 'M',
    BloodType: 'O+',
    UserType: 'donor'
  };
  
  testResults.push(await makeRequest('POST', '/users/register', donorData, 'Registro de donador'));
  
  // 3. Pruebas de login con usuario existente
  console.log(`\n${colors.yellow}${colors.bold}3. PRUEBAS DE AUTENTICACIÓN${colors.reset}`);
  console.log('-'.repeat(30));
  
  const loginData = {
    Username: 'maria_donor',
    Password: 'password123'
  };
  
  testResults.push(await makeRequest('POST', '/users/login', loginData, 'Login con usuario existente'));
  
  // 4. Pruebas de donadores
  console.log(`\n${colors.yellow}${colors.bold}4. PRUEBAS DE DONADORES${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/donors/available', null, 'Lista de donadores disponibles'));
  
  // 5. Pruebas de receptores
  console.log(`\n${colors.yellow}${colors.bold}5. PRUEBAS DE RECEPTORES${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/receivers/urgent', null, 'Receptores urgentes'));
  testResults.push(await makeRequest('GET', '/receivers', null, 'Todos los receptores'));
  
  // 6. Pruebas de validación (esperadas)
  console.log(`\n${colors.yellow}${colors.bold}6. PRUEBAS DE VALIDACIÓN${colors.reset}`);
  console.log('-'.repeat(30));
  
  const invalidLoginData = {
    Username: 'usuario_inexistente',
    Password: 'password123'
  };
  
  testResults.push(await makeRequest('POST', '/users/login', invalidLoginData, 'Login con credenciales inválidas', 401));
  
  // 7. Pruebas de endpoints inexistentes (esperadas)
  console.log(`\n${colors.yellow}${colors.bold}7. PRUEBAS DE ENDPOINTS INEXISTENTES${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/endpoint-inexistente', null, 'Endpoint inexistente', 404));
  
  // Mostrar resumen final
  showSummary();
  
  // Determinar si las pruebas críticas pasaron
  const criticalTests = testResults.filter(r => 
    r.endpoint === '/' || 
    r.endpoint === '/users/register' || 
    r.endpoint === '/users/login' ||
    r.endpoint === '/donors/available' ||
    r.endpoint === '/receivers/urgent' ||
    r.endpoint === '/receivers'
  );
  
  const criticalSuccess = criticalTests.filter(r => r.success).length;
  const criticalTotal = criticalTests.length;
  
  console.log(`\n${colors.bold}${colors.blue}🎯 PRUEBAS CRÍTICAS: ${criticalSuccess}/${criticalTotal}${colors.reset}`);
  
  if (criticalSuccess === criticalTotal) {
    console.log(`${colors.green}${colors.bold}🎉 ¡TODAS LAS PRUEBAS CRÍTICAS PASARON! La API está funcionando correctamente.${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}${colors.bold}⚠️  ALGUNAS PRUEBAS CRÍTICAS FALLARON. Revisa los errores arriba.${colors.reset}`);
    return false;
  }
}

// Función para verificar conectividad
async function checkConnectivity() {
  try {
    console.log(`${colors.blue}🔍 Verificando conectividad con la API...${colors.reset}`);
    await axios.get(BASE_URL, { timeout: 5000 });
    console.log(`${colors.green}✅ API está disponible en ${BASE_URL}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ No se puede conectar a la API en ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}💡 Asegúrate de que el servidor esté corriendo con: npm run dev${colors.reset}\n`);
    return false;
  }
}

// Función principal
async function main() {
  console.log(`${colors.bold}${colors.blue}🚀 PRUEBAS BÁSICAS - API DE DONACIÓN DE SANGRE${colors.reset}`);
  console.log('='.repeat(50));
  
  // Verificar conectividad
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    process.exit(1);
  }
  
  // Ejecutar pruebas
  const success = await runBasicTests();
  
  if (success) {
    console.log(`\n${colors.green}${colors.bold}✅ Pruebas básicas completadas exitosamente${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Pruebas básicas completadas con errores${colors.reset}`);
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

module.exports = { runBasicTests, checkConnectivity }; 