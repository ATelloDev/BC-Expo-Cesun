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
async function makeRequest(method, endpoint, data = null, description = '') {
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

    console.log(`${colors.green}✅${colors.reset} ${method} ${endpoint} - ${response.status} ${response.statusText}`);
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

    console.log(`${colors.red}❌${colors.reset} ${method} ${endpoint} - ${result.status}`);
    if (description) {
      console.log(`   ${colors.blue}${description}${colors.reset}`);
    }
    console.log(`   ${colors.red}Error: ${JSON.stringify(result.error)}${colors.reset}`);
    
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
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}🧪 INICIANDO PRUEBAS COMPLETAS DE LA API${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);
  
  // 1. Prueba de conectividad básica
  console.log(`${colors.yellow}${colors.bold}1. PRUEBAS DE CONECTIVIDAD${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/', null, 'Información de la API'));
  
  // 2. Pruebas de registro de usuarios
  console.log(`\n${colors.yellow}${colors.bold}2. PRUEBAS DE REGISTRO DE USUARIOS${colors.reset}`);
  console.log('-'.repeat(30));
  
  const donorData = {
    Username: 'test_donor_complete',
    Password: 'password123',
    Email: 'test_donor_complete@email.com',
    FirstName: 'Test',
    LastName: 'Donor',
    PhoneNumber: '555-999-9999',
    BirthDate: '1995-06-14',
    Gender: 'M',
    BloodType: 'O+',
    UserType: 'donor'
  };
  
  const receiverData = {
    Username: 'test_receiver_complete',
    Password: 'password123',
    Email: 'test_receiver_complete@email.com',
    FirstName: 'Test',
    LastName: 'Receiver',
    PhoneNumber: '555-888-8888',
    BirthDate: '1980-03-19',
    Gender: 'F',
    BloodType: 'A+',
    UserType: 'receiver',
    HospitalID: 1,
    MedicalRecordNumber: 'MRN_TEST_COMPLETE',
    Diagnosis: 'Anemia por deficiencia de hierro',
    DoctorName: 'Dr. Test',
    RequiredDonations: 2,
    Deadline: '2025-08-15',
    Story: 'Paciente que necesita transfusiones urgentes'
  };
  
  testResults.push(await makeRequest('POST', '/users/register', donorData, 'Registro de donador'));
  testResults.push(await makeRequest('POST', '/users/register', receiverData, 'Registro de receptor'));
  
  // 3. Pruebas de login
  console.log(`\n${colors.yellow}${colors.bold}3. PRUEBAS DE AUTENTICACIÓN${colors.reset}`);
  console.log('-'.repeat(30));
  
  const loginData = {
    Username: 'juan_donor',
    Password: 'password123'
  };
  
  // También probar con un usuario que sabemos que existe
  const existingLoginData = {
    Username: 'maria_donor',
    Password: 'password123'
  };
  
  testResults.push(await makeRequest('POST', '/users/login', loginData, 'Login con credenciales válidas'));
  testResults.push(await makeRequest('POST', '/users/login', existingLoginData, 'Login con usuario existente'));
  
  // Login con credenciales inválidas
  const invalidLoginData = {
    Username: 'usuario_inexistente',
    Password: 'password123'
  };
  
  testResults.push(await makeRequest('POST', '/users/login', invalidLoginData, 'Login con credenciales inválidas (debe fallar)'));
  
  // 4. Pruebas de donadores
  console.log(`\n${colors.yellow}${colors.bold}4. PRUEBAS DE DONADORES${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/donors/available', null, 'Lista de donadores disponibles'));
  
  // 5. Pruebas de receptores
  console.log(`\n${colors.yellow}${colors.bold}5. PRUEBAS DE RECEPTORES${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/receivers/urgent', null, 'Receptores urgentes'));
  testResults.push(await makeRequest('GET', '/receivers', null, 'Todos los receptores'));
  
  // Pruebas con filtros
  testResults.push(await makeRequest('GET', '/receivers?bloodType=A+&status=active', null, 'Receptores filtrados por tipo de sangre A+ y estado activo'));
  testResults.push(await makeRequest('GET', '/receivers?bloodType=O+', null, 'Receptores filtrados por tipo de sangre O+'));
  testResults.push(await makeRequest('GET', '/receivers?status=active', null, 'Receptores filtrados por estado activo'));
  
  // 6. Pruebas de donaciones
  console.log(`\n${colors.yellow}${colors.bold}6. PRUEBAS DE DONACIONES${colors.reset}`);
  console.log('-'.repeat(30));
  
  const donationData = {
    AssignmentID: null,
    HospitalID: 1,
    Notes: 'Donación de prueba realizada exitosamente'
  };
  
  // Primero crear una asignación para poder probar la donación
  const assignmentData = {
    DonorID: 1,
    ReceiverID: 1,
    HospitalID: 1,
    Status: 'confirmed',
    Notes: 'Asignación de prueba'
  };
  
  // Intentar crear la asignación directamente en la base de datos
  try {
    const { DonorReceiverAssignment } = require('../models');
    await DonorReceiverAssignment.create(assignmentData);
    console.log(`${colors.green}✅ Asignación creada para pruebas${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}⚠️  No se pudo crear asignación: ${error.message}${colors.reset}`);
  }
  
  testResults.push(await makeRequest('POST', '/donors/1/donate', donationData, 'Registrar donación para donador ID 1'));
  
  // 7. Pruebas de validación
  console.log(`\n${colors.yellow}${colors.bold}7. PRUEBAS DE VALIDACIÓN${colors.reset}`);
  console.log('-'.repeat(30));
  
  // Registro con datos inválidos
  const invalidUserData = {
    Username: '', // Username vacío
    Password: '123', // Contraseña muy corta
    Email: 'email-invalido', // Email inválido
    FirstName: '',
    LastName: '',
    BirthDate: '2025-01-01', // Fecha futura
    Gender: 'X', // Género inválido
    BloodType: 'Z+', // Tipo de sangre inválido
    UserType: 'invalid' // Tipo de usuario inválido
  };
  
  testResults.push(await makeRequest('POST', '/users/register', invalidUserData, 'Registro con datos inválidos (debe fallar)'));
  
  // 8. Pruebas de endpoints inexistentes
  console.log(`\n${colors.yellow}${colors.bold}8. PRUEBAS DE ENDPOINTS INEXISTENTES${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('GET', '/endpoint-inexistente', null, 'Endpoint inexistente (debe retornar 404)'));
  testResults.push(await makeRequest('POST', '/users/invalid-endpoint', null, 'Endpoint inválido (debe retornar 404)'));
  
  // 9. Pruebas de métodos HTTP no permitidos
  console.log(`\n${colors.yellow}${colors.bold}9. PRUEBAS DE MÉTODOS HTTP NO PERMITIDOS${colors.reset}`);
  console.log('-'.repeat(30));
  
  testResults.push(await makeRequest('PUT', '/users', null, 'Método PUT no permitido (debe fallar)'));
  testResults.push(await makeRequest('DELETE', '/donors', null, 'Método DELETE no permitido (debe fallar)'));
  
  // Mostrar resumen final
  showSummary();
  
  // Retornar resultados para uso programático
  return testResults;
}

// Función para verificar conectividad antes de ejecutar pruebas
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
  console.log(`${colors.bold}${colors.blue}🚀 SCRIPT DE PRUEBAS COMPLETAS - API DE DONACIÓN DE SANGRE${colors.reset}`);
  console.log('='.repeat(60));
  
  // Verificar conectividad
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    process.exit(1);
  }
  
  // Ejecutar todas las pruebas
  const results = await runAllTests();
  
  // Determinar si todas las pruebas críticas pasaron
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
  
  console.log(`\n${colors.bold}${colors.blue}🎯 PRUEBAS CRÍTICAS: ${criticalSuccess}/${criticalTotal}${colors.reset}`);
  
  if (criticalSuccess === criticalTotal) {
    console.log(`${colors.green}${colors.bold}🎉 ¡TODAS LAS PRUEBAS CRÍTICAS PASARON! La API está funcionando correctamente.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️  ALGUNAS PRUEBAS CRÍTICAS FALLARON. Revisa los errores arriba.${colors.reset}`);
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

module.exports = { runAllTests, checkConnectivity }; 