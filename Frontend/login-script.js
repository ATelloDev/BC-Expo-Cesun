// Configuración de la API
const API_BASE_URL = 'http://localhost:3001';

// Función para ocultar/mostrar ventana de usuarios de prueba
function toggleTestUsers() {
    const testUsersWindow = document.querySelector('.test-users-window');
    const container = document.querySelector('.container');
    const toggleButton = document.querySelector('.toggle-test-users');
    const toggleIcon = toggleButton.querySelector('i');
    
    if (testUsersWindow.classList.contains('hidden')) {
        // Mostrar ventana de usuarios de prueba
        testUsersWindow.classList.remove('hidden');
        container.classList.remove('test-users-hidden');
        toggleIcon.className = 'fas fa-eye';
        toggleButton.title = 'Ocultar Usuarios de Prueba';
    } else {
        // Ocultar ventana de usuarios de prueba
        testUsersWindow.classList.add('hidden');
        container.classList.add('test-users-hidden');
        toggleIcon.className = 'fas fa-eye-slash';
        toggleButton.title = 'Mostrar Usuarios de Prueba';
    }
}

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginCard = document.querySelector('.login-card');
const registerCard = document.getElementById('registerCard');
const messageDiv = document.getElementById('message');
const regMessageDiv = document.getElementById('regMessage');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Elementos del formulario de registro
const regRoleSelect = document.getElementById('regRole');
const receiverFields = document.getElementById('receiverFields');
const regHospitalSelect = document.getElementById('regHospital');

// Usuarios de prueba para crear automáticamente
const testUsers = [
    {
        Username: 'juan_donor_new',
        Password: '123456',
        Email: 'juan.donor@test.com',
        FirstName: 'Juan',
        LastName: 'Pérez',
        PhoneNumber: '1234567890',
        BirthDate: '1990-01-01',
        Gender: 'M',
        BloodType: 'O+',
        UserType: 'donor'
    },
    {
        Username: 'alejandro321',
        Password: '123456',
        Email: 'alejandro.tello.hdz@gmail.com',
        FirstName: 'Alejandro',
        LastName: 'Tello',
        PhoneNumber: '0987654321',
        BirthDate: '1985-05-15',
        Gender: 'M',
        BloodType: 'A+',
        UserType: 'receiver',
        HospitalID: 1,
        MedicalRecordNumber: 'MR001',
        Diagnosis: 'Necesita transfusión',
        DoctorName: 'Dr. López',
        RequiredDonations: 2,
        Deadline: '2024-12-31',
        Story: 'Paciente con anemia severa'
    },
    {
        Username: 'admin_new',
        Password: '123456',
        Email: 'admin.new@test.com',
        FirstName: 'Admin',
        LastName: 'Sistema',
        PhoneNumber: '1234567890',
        BirthDate: '1980-01-01',
        Gender: 'M',
        BloodType: 'O+',
        UserType: 'admin'
    }
];

// Función para mostrar mensajes
function showMessage(element, message, type = 'success') {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Función para crear usuarios de prueba
async function createTestUsers() {
    try {
        for (const user of testUsers) {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });
            
            if (response.ok) {
                console.log(`Usuario ${user.Email} creado exitosamente`);
            } else {
                const data = await response.json();
                if (data.message && data.message.includes('ya existe')) {
                    console.log(`Usuario ${user.Email} ya existe`);
                } else {
                    console.log(`Error creando usuario ${user.Email}:`, data.message);
                }
            }
        }
    } catch (error) {
        console.error('Error creando usuarios de prueba:', error);
    }
}

// Función para cargar hospitales
async function loadHospitals() {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`);
        if (response.ok) {
            const data = await response.json();
            regHospitalSelect.innerHTML = '<option value="">Selecciona un hospital</option>';
            data.hospitals.forEach(hospital => {
                const option = document.createElement('option');
                option.value = hospital.HospitalID;
                option.textContent = hospital.Name;
                regHospitalSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando hospitales:', error);
    }
}

// Función para manejar el cambio de rol en el registro
function handleRoleChange() {
    const selectedRole = regRoleSelect.value;
    if (selectedRole === 'receiver') {
        receiverFields.style.display = 'block';
        // Hacer campos requeridos
        document.getElementById('regHospital').required = true;
        document.getElementById('regMedicalRecord').required = true;
        document.getElementById('regDiagnosis').required = true;
        document.getElementById('regDoctor').required = true;
        document.getElementById('regRequiredDonations').required = true;
        document.getElementById('regDeadline').required = true;
    } else {
        receiverFields.style.display = 'none';
        // Quitar requerimiento
        document.getElementById('regHospital').required = false;
        document.getElementById('regMedicalRecord').required = false;
        document.getElementById('regDiagnosis').required = false;
        document.getElementById('regDoctor').required = false;
        document.getElementById('regRequiredDonations').required = false;
        document.getElementById('regDeadline').required = false;
    }
}

// Función para manejar el login
async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Email: email,
                Password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar información del usuario en localStorage
            localStorage.setItem('user', JSON.stringify({
                name: `${data.user.FirstName} ${data.user.LastName}`,
                email: data.user.Email,
                role: data.user.UserType,
                userId: data.user.UserID
            }));
            
            // Redirigir a la página correspondiente según el rol
            redirectToDashboard(data.user.UserType);
        } else {
            showMessage(messageDiv, data.message || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showMessage(messageDiv, 'Error de conexión con el servidor', 'error');
    }
}

// Función para redirigir al dashboard correspondiente
function redirectToDashboard(role) {
    switch(role) {
        case 'donor':
            window.location.href = 'donor.html';
            break;
        case 'receiver':
            window.location.href = 'receiver.html';
            break;
        case 'admin':
            window.location.href = 'admin.html';
            break;
        default:
            showMessage(messageDiv, 'Rol no válido', 'error');
    }
}

// Función para manejar el registro
async function handleRegister(formData) {
    try {
        const userData = {
            Username: formData.get('username'),
            Password: formData.get('password'),
            Email: formData.get('email'),
            FirstName: formData.get('firstName'),
            LastName: formData.get('lastName'),
            PhoneNumber: formData.get('phone'),
            BirthDate: formData.get('birthDate'),
            Gender: formData.get('gender'),
            BloodType: formData.get('bloodType'),
            UserType: formData.get('role')
        };
        
        // Agregar campos específicos para receptores
        if (formData.get('role') === 'receiver') {
            userData.HospitalID = parseInt(formData.get('hospitalId'));
            userData.MedicalRecordNumber = formData.get('medicalRecord');
            userData.Diagnosis = formData.get('diagnosis');
            userData.DoctorName = formData.get('doctorName');
            userData.RequiredDonations = parseInt(formData.get('requiredDonations'));
            userData.Deadline = formData.get('deadline');
            userData.Story = formData.get('story') || '';
        }
        
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(regMessageDiv, 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
            // Cambiar al formulario de login
            setTimeout(() => {
                showLoginForm();
            }, 2000);
        } else {
            showMessage(regMessageDiv, data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        showMessage(regMessageDiv, 'Error de conexión con el servidor', 'error');
    }
}

// Función para mostrar formulario de registro
function showRegisterForm() {
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
    loadHospitals(); // Cargar hospitales cuando se muestra el formulario
}

// Función para mostrar formulario de login
function showLoginForm() {
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMessage(messageDiv, 'Por favor completa todos los campos', 'error');
        return;
    }
    
    await handleLogin(email, password);
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Validar campos requeridos
    const requiredFields = ['username', 'password', 'email', 'firstName', 'lastName', 'phone', 'birthDate', 'gender', 'bloodType', 'role'];
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            showMessage(regMessageDiv, `Por favor completa el campo ${field}`, 'error');
            return;
        }
    }
    
    // Validar campos específicos para receptores
    if (formData.get('role') === 'receiver') {
        const receiverFields = ['hospitalId', 'medicalRecord', 'diagnosis', 'doctorName', 'requiredDonations', 'deadline'];
        for (const field of receiverFields) {
            if (!formData.get(field)) {
                showMessage(regMessageDiv, `Por favor completa el campo ${field}`, 'error');
                return;
            }
        }
    }
    
    await handleRegister(formData);
});

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// Event listener para cambio de rol
regRoleSelect.addEventListener('change', handleRoleChange);

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Crear usuarios de prueba si no existen
    createTestUsers(); // Habilitado para crear usuarios automáticamente
    
    // Establecer fecha mínima para fecha de nacimiento (18 años atrás)
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    
    document.getElementById('regBirthDate').min = minDate.toISOString().split('T')[0];
    document.getElementById('regBirthDate').max = maxDate.toISOString().split('T')[0];
    
    // Establecer fecha mínima para deadline (mañana)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('regDeadline').min = tomorrow.toISOString().split('T')[0];
}); 