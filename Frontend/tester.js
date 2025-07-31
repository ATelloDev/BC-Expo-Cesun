const API_BASE_URL = 'http://localhost:3001';

// Función para regresar a la página anterior
function goBack() {
    // Intentar usar history.back() primero
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Si no hay historial, redirigir al login
        window.location.href = 'login.html';
    }
}

// Variables globales para el estado de las pruebas
let testResults = [];
let totalTests = 0;
let successTests = 0;
let failedTests = 0;
let startTime = 0;

// Función para actualizar estadísticas
function updateStats() {
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('successTests').textContent = successTests;
    document.getElementById('failedTests').textContent = failedTests;
    
    const progress = totalTests > 0 ? (successTests / totalTests) * 100 : 0;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Función para actualizar el estado de una prueba
function updateTestStatus(testId, status, message = '') {
    const statusElement = document.getElementById(testId);
    if (statusElement) {
        statusElement.className = `status ${status}`;
        statusElement.textContent = status === 'success' ? '✅ Exitoso' : 
                                  status === 'error' ? '❌ Fallido' : '⏳ Pendiente';
    }
}

// Función para agregar resultado
function addResult(testName, success, message, responseTime = 0) {
    const result = {
        name: testName,
        success: success,
        message: message,
        timestamp: new Date().toLocaleString(),
        responseTime: responseTime
    };
    
    testResults.push(result);
    
    if (success) {
        successTests++;
    } else {
        failedTests++;
    }
    
    totalTests++;
    updateStats();
    
    // Agregar resultado a la lista visual
    const resultsList = document.getElementById('resultsList');
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${success ? 'success' : 'error'}`;
    
    resultItem.innerHTML = `
        <h4>${testName}</h4>
        <p>${message}</p>
        <div class="time">${result.timestamp} - ${responseTime}ms</div>
    `;
    
    // Limpiar mensaje inicial si existe
    if (resultsList.querySelector('p[style*="italic"]')) {
        resultsList.innerHTML = '';
    }
    
    resultsList.appendChild(resultItem);
    resultsList.scrollTop = resultsList.scrollHeight;
}

// Función para hacer petición HTTP con timeout
async function makeRequest(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        const responseTime = Date.now() - startTime;
        
        clearTimeout(timeoutId);
        
        const data = await response.json().catch(() => ({}));
        
        return {
            success: response.ok,
            status: response.status,
            data: data,
            responseTime: responseTime
        };
    } catch (error) {
        clearTimeout(timeoutId);
        return {
            success: false,
            error: error.message,
            responseTime: 0
        };
    }
}

// Pruebas de Conexión
async function testAPIConnection() {
    updateTestStatus('apiConnectionStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/users`);
    
    if (result.success) {
        updateTestStatus('apiConnectionStatus', 'success');
        addResult('Conexión a API', true, `Servidor respondiendo correctamente. Status: ${result.status}`, result.responseTime);
    } else {
        updateTestStatus('apiConnectionStatus', 'error');
        addResult('Conexión a API', false, `Error: ${result.error || 'Servidor no responde'}`, result.responseTime);
    }
}

async function testDatabaseConnection() {
    updateTestStatus('dbConnectionStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/users`);
    
    if (result.success && result.data.users) {
        updateTestStatus('dbConnectionStatus', 'success');
        addResult('Conexión a Base de Datos', true, `Base de datos conectada. ${result.data.users.length} usuarios encontrados`, result.responseTime);
    } else {
        updateTestStatus('dbConnectionStatus', 'error');
        addResult('Conexión a Base de Datos', false, `Error: No se pudo conectar a la base de datos`, result.responseTime);
    }
}

// Pruebas de Usuarios
async function testGetUsers() {
    updateTestStatus('getUsersStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/users`);
    
    if (result.success) {
        updateTestStatus('getUsersStatus', 'success');
        addResult('Obtener Usuarios', true, `${result.data.users?.length || 0} usuarios obtenidos`, result.responseTime);
    } else {
        updateTestStatus('getUsersStatus', 'error');
        addResult('Obtener Usuarios', false, `Error: ${result.error || 'No se pudieron obtener usuarios'}`, result.responseTime);
    }
}

async function testUserLogin() {
    updateTestStatus('userLoginStatus', 'pending');
    
    const loginData = {
        Email: 'alejandro.tello.hdz@gmail.com',
        Password: '123456'
    };
    
    const result = await makeRequest(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    });
    
    if (result.success && result.data.user) {
        updateTestStatus('userLoginStatus', 'success');
        addResult('Login de Usuario', true, `Login exitoso para ${result.data.user.FirstName} ${result.data.user.LastName}`, result.responseTime);
    } else {
        updateTestStatus('userLoginStatus', 'error');
        addResult('Login de Usuario', false, `Error: ${result.data.message || 'Login fallido'}`, result.responseTime);
    }
}

async function testGetUserById() {
    updateTestStatus('getUserByIdStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/users/22`);
    
    if (result.success && result.data.user) {
        updateTestStatus('getUserByIdStatus', 'success');
        addResult('Obtener Usuario por ID', true, `Usuario ${result.data.user.FirstName} ${result.data.user.LastName} obtenido`, result.responseTime);
    } else {
        updateTestStatus('getUserByIdStatus', 'error');
        addResult('Obtener Usuario por ID', false, `Error: ${result.data.message || 'Usuario no encontrado'}`, result.responseTime);
    }
}

// Pruebas de Receptores
async function testGetReceivers() {
    updateTestStatus('getReceiversStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/receivers`);
    
    if (result.success) {
        updateTestStatus('getReceiversStatus', 'success');
        addResult('Obtener Receptores', true, `${result.data.receivers?.length || 0} receptores obtenidos`, result.responseTime);
    } else {
        updateTestStatus('getReceiversStatus', 'error');
        addResult('Obtener Receptores', false, `Error: ${result.error || 'No se pudieron obtener receptores'}`, result.responseTime);
    }
}

async function testGetReceiverById() {
    updateTestStatus('getReceiverByIdStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/receivers/22`);
    
    if (result.success && result.data.receiver) {
        updateTestStatus('getReceiverByIdStatus', 'success');
        addResult('Obtener Receptor por ID', true, `Receptor ${result.data.receiver.User.FirstName} ${result.data.receiver.User.LastName} obtenido`, result.responseTime);
    } else {
        updateTestStatus('getReceiverByIdStatus', 'error');
        addResult('Obtener Receptor por ID', false, `Error: ${result.data.message || 'Receptor no encontrado'}`, result.responseTime);
    }
}

async function testGetReceiverDonations() {
    updateTestStatus('getReceiverDonationsStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/receivers/22/donations`);
    
    if (result.success) {
        updateTestStatus('getReceiverDonationsStatus', 'success');
        addResult('Historial de Donaciones del Receptor', true, `${result.data.donations?.length || 0} donaciones encontradas`, result.responseTime);
    } else {
        updateTestStatus('getReceiverDonationsStatus', 'error');
        addResult('Historial de Donaciones del Receptor', false, `Error: ${result.data.message || 'No se pudo obtener historial'}`, result.responseTime);
    }
}

// Pruebas de Donadores
async function testGetDonors() {
    updateTestStatus('getDonorsStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/donors`);
    
    if (result.success) {
        updateTestStatus('getDonorsStatus', 'success');
        addResult('Obtener Donadores', true, `${result.data.donors?.length || 0} donadores obtenidos`, result.responseTime);
    } else {
        updateTestStatus('getDonorsStatus', 'error');
        addResult('Obtener Donadores', false, `Error: ${result.error || 'No se pudieron obtener donadores'}`, result.responseTime);
    }
}

async function testGetDonorStats() {
    updateTestStatus('getDonorStatsStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/donors/2/stats`);
    
    if (result.success && result.data.donor) {
        updateTestStatus('getDonorStatsStatus', 'success');
        addResult('Estadísticas del Donador', true, `Estadísticas obtenidas para ${result.data.donor.User.FirstName}`, result.responseTime);
    } else {
        updateTestStatus('getDonorStatsStatus', 'error');
        addResult('Estadísticas del Donador', false, `Error: ${result.data.message || 'No se pudieron obtener estadísticas'}`, result.responseTime);
    }
}

async function testGetDonorHistory() {
    updateTestStatus('getDonorHistoryStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/donors/2/history`);
    
    if (result.success) {
        updateTestStatus('getDonorHistoryStatus', 'success');
        addResult('Historial de Donaciones del Donador', true, `${result.data.history?.length || 0} donaciones en historial`, result.responseTime);
    } else {
        updateTestStatus('getDonorHistoryStatus', 'error');
        addResult('Historial de Donaciones del Donador', false, `Error: ${result.data.message || 'No se pudo obtener historial'}`, result.responseTime);
    }
}

// Pruebas de Hospitales
async function testGetHospitals() {
    updateTestStatus('getHospitalsStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/hospitals`);
    
    if (result.success) {
        updateTestStatus('getHospitalsStatus', 'success');
        addResult('Obtener Hospitales', true, `${result.data.hospitals?.length || 0} hospitales obtenidos`, result.responseTime);
    } else {
        updateTestStatus('getHospitalsStatus', 'error');
        addResult('Obtener Hospitales', false, `Error: ${result.error || 'No se pudieron obtener hospitales'}`, result.responseTime);
    }
}

async function testGetHospitalById() {
    updateTestStatus('getHospitalByIdStatus', 'pending');
    
    const result = await makeRequest(`${API_BASE_URL}/hospitals/1`);
    
    if (result.success && result.data.hospital) {
        updateTestStatus('getHospitalByIdStatus', 'success');
        addResult('Obtener Hospital por ID', true, `Hospital ${result.data.hospital.Name} obtenido`, result.responseTime);
    } else {
        updateTestStatus('getHospitalByIdStatus', 'error');
        addResult('Obtener Hospital por ID', false, `Error: ${result.data.message || 'Hospital no encontrado'}`, result.responseTime);
    }
}

// Pruebas de Registro
async function testRegisterDonor() {
    updateTestStatus('registerDonorStatus', 'pending');
    
    const donorData = {
        Username: 'test_donor_' + Date.now(),
        Password: '123456',
        Email: 'test_donor_' + Date.now() + '@test.com',
        FirstName: 'Test',
        LastName: 'Donor',
        PhoneNumber: '1234567890',
        BirthDate: '1990-01-01',
        Gender: 'M',
        BloodType: 'O+',
        UserType: 'donor'
    };
    
    const result = await makeRequest(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(donorData)
    });
    
    if (result.success) {
        updateTestStatus('registerDonorStatus', 'success');
        addResult('Registro de Donador', true, `Donador ${donorData.FirstName} ${donorData.LastName} registrado exitosamente`, result.responseTime);
    } else {
        updateTestStatus('registerDonorStatus', 'error');
        addResult('Registro de Donador', false, `Error: ${result.data.message || 'Registro fallido'}`, result.responseTime);
    }
}

async function testRegisterReceiver() {
    updateTestStatus('registerReceiverStatus', 'pending');
    
    const receiverData = {
        Username: 'test_receiver_' + Date.now(),
        Password: '123456',
        Email: 'test_receiver_' + Date.now() + '@test.com',
        FirstName: 'Test',
        LastName: 'Receiver',
        PhoneNumber: '1234567890',
        BirthDate: '1990-01-01',
        Gender: 'F',
        BloodType: 'A+',
        UserType: 'receiver',
        HospitalID: 1,
        MedicalRecordNumber: 'MR' + Date.now(),
        Diagnosis: 'Test diagnosis',
        DoctorName: 'Dr. Test',
        RequiredDonations: 2,
        Deadline: '2025-12-31',
        Story: 'Test story'
    };
    
    const result = await makeRequest(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiverData)
    });
    
    if (result.success) {
        updateTestStatus('registerReceiverStatus', 'success');
        addResult('Registro de Receptor', true, `Receptor ${receiverData.FirstName} ${receiverData.LastName} registrado exitosamente`, result.responseTime);
    } else {
        updateTestStatus('registerReceiverStatus', 'error');
        addResult('Registro de Receptor', false, `Error: ${result.data.message || 'Registro fallido'}`, result.responseTime);
    }
}

// Función para ejecutar todas las pruebas
async function runAllTests() {
    // Resetear estadísticas
    testResults = [];
    totalTests = 0;
    successTests = 0;
    failedTests = 0;
    startTime = Date.now();
    
    // Limpiar resultados
    document.getElementById('resultsList').innerHTML = '<p style="text-align: center; color: #888888; font-style: italic;">Ejecutando pruebas...</p>';
    
    // Resetear todos los estados
    const statusElements = document.querySelectorAll('.status');
    statusElements.forEach(el => {
        el.className = 'status pending';
        el.textContent = '⏳ Pendiente';
    });
    
    // Lista de todas las pruebas
    const tests = [
        { name: 'Conexión a API', func: testAPIConnection },
        { name: 'Conexión a Base de Datos', func: testDatabaseConnection },
        { name: 'Obtener Usuarios', func: testGetUsers },
        { name: 'Login de Usuario', func: testUserLogin },
        { name: 'Obtener Usuario por ID', func: testGetUserById },
        { name: 'Obtener Receptores', func: testGetReceivers },
        { name: 'Obtener Receptor por ID', func: testGetReceiverById },
        { name: 'Historial de Donaciones del Receptor', func: testGetReceiverDonations },
        { name: 'Obtener Donadores', func: testGetDonors },
        { name: 'Estadísticas del Donador', func: testGetDonorStats },
        { name: 'Historial de Donaciones del Donador', func: testGetDonorHistory },
        { name: 'Obtener Hospitales', func: testGetHospitals },
        { name: 'Obtener Hospital por ID', func: testGetHospitalById },
        { name: 'Registro de Donador', func: testRegisterDonor },
        { name: 'Registro de Receptor', func: testRegisterReceiver }
    ];
    
    // Ejecutar pruebas con delay para mejor UX
    for (let i = 0; i < tests.length; i++) {
        await tests[i].func();
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay de 500ms entre pruebas
    }
    
    // Actualizar tiempo total
    const totalTime = (Date.now() - startTime) / 1000;
    document.getElementById('totalTime').textContent = `${totalTime.toFixed(1)}s`;
    
    // Mostrar resumen
    const resultsList = document.getElementById('resultsList');
    const summary = document.createElement('div');
    summary.className = 'result-item success';
    summary.innerHTML = `
        <h4>🎉 Pruebas Completadas</h4>
        <p>Total: ${totalTests} | Exitosas: ${successTests} | Fallidas: ${failedTests} | Tiempo: ${totalTime.toFixed(1)}s</p>
        <div class="time">${new Date().toLocaleString()}</div>
    `;
    resultsList.appendChild(summary);
}

// Función para generar reporte
function generateReport() {
    const report = {
        title: 'Reporte de Pruebas - Sistema de Donación de Sangre',
        timestamp: new Date().toLocaleString(),
        summary: {
            total: totalTests,
            success: successTests,
            failed: failedTests,
            successRate: totalTests > 0 ? ((successTests / totalTests) * 100).toFixed(2) : 0
        },
        results: testResults
    };
    
    let reportText = `${report.title}\n`;
    reportText += `Fecha: ${report.timestamp}\n`;
    reportText += `\n=== RESUMEN ===\n`;
    reportText += `Total de Pruebas: ${report.summary.total}\n`;
    reportText += `Pruebas Exitosas: ${report.summary.success}\n`;
    reportText += `Pruebas Fallidas: ${report.summary.failed}\n`;
    reportText += `Tasa de Éxito: ${report.summary.successRate}%\n`;
    reportText += `\n=== DETALLES ===\n`;
    
    report.results.forEach((result, index) => {
        reportText += `\n${index + 1}. ${result.name}\n`;
        reportText += `   Estado: ${result.success ? '✅ EXITOSO' : '❌ FALLIDO'}\n`;
        reportText += `   Mensaje: ${result.message}\n`;
        reportText += `   Tiempo: ${result.responseTime}ms\n`;
        reportText += `   Fecha: ${result.timestamp}\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-pruebas-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Mostrar mensaje de éxito
    alert('Reporte generado y descargado exitosamente!');
}

// Función para limpiar resultados
function clearResults() {
    testResults = [];
    totalTests = 0;
    successTests = 0;
    failedTests = 0;
    
    updateStats();
    
    // Limpiar resultados visuales
    document.getElementById('resultsList').innerHTML = '<p style="text-align: center; color: #888888; font-style: italic;">Los resultados de las pruebas aparecerán aquí...</p>';
    
    // Resetear estados
    const statusElements = document.querySelectorAll('.status');
    statusElements.forEach(el => {
        el.className = 'status pending';
        el.textContent = 'Pendiente';
    });
    
    // Resetear tiempo
    document.getElementById('totalTime').textContent = '0s';
    document.getElementById('progressBar').style.width = '0%';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
}); 