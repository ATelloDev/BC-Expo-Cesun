const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Función para hacer peticiones HTTP
async function makeRequest(method, endpoint, data = null) {
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
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Función principal para probar la API
async function testAPI() {
  console.log('🚀 Iniciando pruebas de la API...\n');

  // 1. Probar endpoint raíz
  console.log('1. Probando endpoint raíz:');
  await makeRequest('GET', '/');
  console.log('');

  // 2. Registrar un donador
  console.log('2. Registrando un donador:');
  const donorData = {
    Username: 'test_donor',
    Password: 'password123',
    Email: 'test_donor@email.com',
    FirstName: 'Test',
    LastName: 'Donor',
    PhoneNumber: '555-999-9999',
    BirthDate: '1995-06-15',
    Gender: 'M',
    BloodType: 'O+',
    UserType: 'donor'
  };
  await makeRequest('POST', '/users/register', donorData);
  console.log('');

  // 3. Registrar un receptor
  console.log('3. Registrando un receptor:');
  const receiverData = {
    Username: 'test_receiver',
    Password: 'password123',
    Email: 'test_receiver@email.com',
    FirstName: 'Test',
    LastName: 'Receiver',
    PhoneNumber: '555-888-8888',
    BirthDate: '1980-03-20',
    Gender: 'F',
    BloodType: 'A+',
    UserType: 'receiver',
    HospitalID: 1,
    MedicalRecordNumber: 'MRN_TEST_001',
    Diagnosis: 'Anemia por deficiencia de hierro',
    DoctorName: 'Dr. Test',
    RequiredDonations: 2,
    Deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 días
    Story: 'Paciente que necesita transfusiones urgentes'
  };
  await makeRequest('POST', '/users/register', receiverData);
  console.log('');

  // 4. Login del donador
  console.log('4. Login del donador:');
  const loginData = {
    Username: 'test_donor',
    Password: 'password123'
  };
  await makeRequest('POST', '/users/login', loginData);
  console.log('');

  // 5. Obtener donadores disponibles
  console.log('5. Obteniendo donadores disponibles:');
  await makeRequest('GET', '/donors/available');
  console.log('');

  // 6. Obtener receptores urgentes
  console.log('6. Obteniendo receptores urgentes:');
  await makeRequest('GET', '/receivers/urgent');
  console.log('');

  // 7. Obtener todos los receptores
  console.log('7. Obteniendo todos los receptores:');
  await makeRequest('GET', '/receivers');
  console.log('');

  // 8. Probar filtros en receptores
  console.log('8. Probando filtros en receptores:');
  await makeRequest('GET', '/receivers?bloodType=A+&status=active');
  console.log('');

  console.log('🎉 Pruebas completadas!');
}

// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI, makeRequest }; 