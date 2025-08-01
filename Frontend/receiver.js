const API_BASE_URL = 'http://localhost:3001';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    if (user.role !== 'receiver') {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 25px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #dc143c, #ff1744)';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

async function loadUserData() {
    const user = checkAuth();
    if (!user) return;
    
    document.getElementById('userName').textContent = user.name;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    
    try {
        // Usar el userId correcto del localStorage
        const response = await fetch(`${API_BASE_URL}/users/${user.userId}`);
        if (response.ok) {
            const userData = await response.json();
            document.getElementById('profileBloodType').textContent = userData.user.BloodType || 'N/A';
            document.getElementById('profilePhone').textContent = userData.user.PhoneNumber || 'N/A';
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
    }
}

async function loadReceiverStats() {
    const user = checkAuth();
    if (!user) return;
    
    try {
        // Usar el userId correcto del localStorage
        const response = await fetch(`${API_BASE_URL}/receivers/${user.userId}`);
        if (response.ok) {
            const data = await response.json();
            const receiver = data.receiver;
            
            // Actualizar estadísticas
            document.getElementById('receivedDonations').textContent = receiver.CurrentDonations || 0;
            document.getElementById('requiredDonations').textContent = receiver.RequiredDonations || 0;
            
            // Calcular progreso
            const progress = receiver.RequiredDonations > 0 
                ? Math.round((receiver.CurrentDonations / receiver.RequiredDonations) * 100)
                : 0;
            document.getElementById('progress').textContent = `${progress}%`;
            
            // Actualizar información médica
            document.getElementById('diagnosis').textContent = receiver.Diagnosis || 'N/A';
            document.getElementById('doctorName').textContent = receiver.DoctorName || 'N/A';
            document.getElementById('deadline').textContent = receiver.Deadline 
                ? new Date(receiver.Deadline).toLocaleDateString() 
                : 'N/A';
            document.getElementById('status').textContent = receiver.Status || 'N/A';
            document.getElementById('hospitalName').textContent = receiver.Hospital ? receiver.Hospital.Name : 'N/A';
            
        } else {
            console.error('Error cargando datos del receptor:', response.status);
            // Mostrar valores por defecto si hay error
            document.getElementById('receivedDonations').textContent = '0';
            document.getElementById('requiredDonations').textContent = '0';
            document.getElementById('progress').textContent = '0%';
            document.getElementById('diagnosis').textContent = 'Error cargando datos';
            document.getElementById('doctorName').textContent = 'Error cargando datos';
            document.getElementById('deadline').textContent = 'Error cargando datos';
            document.getElementById('status').textContent = 'Error cargando datos';
            document.getElementById('hospitalName').textContent = 'Error cargando datos';
        }
    } catch (error) {
        console.error('Error cargando estadísticas del receptor:', error);
        // Mostrar valores por defecto si hay error
        document.getElementById('receivedDonations').textContent = '0';
        document.getElementById('requiredDonations').textContent = '0';
        document.getElementById('progress').textContent = '0%';
        document.getElementById('diagnosis').textContent = 'Error de conexión';
        document.getElementById('doctorName').textContent = 'Error de conexión';
        document.getElementById('deadline').textContent = 'Error de conexión';
        document.getElementById('status').textContent = 'Error de conexión';
        document.getElementById('hospitalName').textContent = 'Error de conexión';
    }
}

async function loadDonationHistory() {
    const user = checkAuth();
    if (!user) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/receivers/${user.userId}/donations`);
        if (response.ok) {
            const data = await response.json();
            const historyContainer = document.getElementById('donationHistory');
            
            if (data.donations.length === 0) {
                historyContainer.innerHTML = '<p class="no-data">No hay donaciones recibidas</p>';
                return;
            }
            
            historyContainer.innerHTML = data.donations.map(donation => `
                <div class="history-item">
                    <div class="history-date">
                        <strong>${new Date(donation.DonationDate).toLocaleDateString()}</strong>
                    </div>
                    <div class="history-details">
                        <div class="donor">
                            <i class="fas fa-user"></i>
                            ${donation.Donor ? `${donation.Donor.User.FirstName} ${donation.Donor.User.LastName}` : 'Donador anónimo'}
                            <span class="blood-type">(${donation.Donor ? donation.Donor.User.BloodType : 'N/A'})</span>
                        </div>
                        <div class="hospital">
                            <i class="fas fa-hospital"></i>
                            ${donation.Hospital ? donation.Hospital.Name : 'Hospital no especificado'}
                        </div>
                        ${donation.Notes ? `
                            <div class="notes">
                                <i class="fas fa-sticky-note"></i>
                                ${donation.Notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
        } else {
            console.error('Error obteniendo historial:', response.status);
            const historyContainer = document.getElementById('donationHistory');
            historyContainer.innerHTML = '<p class="error">Error cargando historial</p>';
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
        const historyContainer = document.getElementById('donationHistory');
        historyContainer.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// Funciones del modal de edición de perfil
function showEditProfile() {
    const user = checkAuth();
    if (!user) return;
    
    // Cargar datos actuales en el formulario
    loadCurrentUserData();
    
    document.getElementById('editProfileModal').style.display = 'block';
}

function closeEditProfile() {
    document.getElementById('editProfileModal').style.display = 'none';
}

async function loadCurrentUserData() {
    const user = checkAuth();
    if (!user) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${user.userId}`);
        if (response.ok) {
            const userData = await response.json();
            
            // Llenar formulario con datos actuales
            document.getElementById('editFirstName').value = userData.user.FirstName || '';
            document.getElementById('editLastName').value = userData.user.LastName || '';
            document.getElementById('editEmail').value = userData.user.Email || '';
            document.getElementById('editPhone').value = userData.user.PhoneNumber || '';
            document.getElementById('editBloodType').value = userData.user.BloodType || '';
            
        } else {
            console.error('Error cargando datos del usuario:', response.status);
            showMessage('Error cargando datos del usuario', 'error');
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function handleEditProfile(event) {
    event.preventDefault();
    const user = checkAuth();
    if (!user) return;
    
    const formData = new FormData(event.target);
    
    try {
        // Actualizar datos del usuario
        const userUpdateData = {
            FirstName: formData.get('firstName'),
            LastName: formData.get('lastName'),
            Email: formData.get('email'),
            PhoneNumber: formData.get('phone'),
            BloodType: formData.get('bloodType'),
            BirthDate: formData.get('birthDate')
        };
        
        const userResponse = await fetch(`${API_BASE_URL}/users/${user.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userUpdateData)
        });
        
        if (!userResponse.ok) {
            throw new Error('Error actualizando datos del usuario');
        }
        
        // Actualizar datos del receptor
        const receiverUpdateData = {
            Diagnosis: formData.get('diagnosis'),
            DoctorName: formData.get('doctorName'),
            RequiredDonations: parseInt(formData.get('requiredDonations')),
            Deadline: formData.get('deadline'),
            Story: formData.get('story')
        };
        
        const receiverResponse = await fetch(`${API_BASE_URL}/receivers/${user.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receiverUpdateData)
        });
        
        if (!receiverResponse.ok) {
            throw new Error('Error actualizando datos del receptor');
        }
        
        showMessage('Perfil actualizado exitosamente', 'success');
        closeEditProfile();
        
        // Recargar datos
        await Promise.all([
            loadUserData(),
            loadReceiverStats()
        ]);
        
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        showMessage('Error actualizando perfil', 'error');
    }
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('editProfileModal');
    if (event.target === modal) {
        closeEditProfile();
    }
}

// Estilos CSS para elementos visuales atractivos
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes glow {
        0% { box-shadow: 0 0 5px rgba(220, 53, 69, 0.5); }
        50% { box-shadow: 0 0 20px rgba(220, 53, 69, 0.8); }
        100% { box-shadow: 0 0 5px rgba(220, 53, 69, 0.5); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Mejoras en las tarjetas de estadísticas */
    .stats-card {
        background: linear-gradient(135deg, #000000 0%, #dc3545 100%);
        border-radius: 20px;
        padding: 25px;
        color: white;
        text-align: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        z-index: 1;
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.2);
    }
    
    .stats-card h3,
    .stats-card .stats-number {
        position: relative;
        z-index: 2;
    }
    
    .stats-card h3 {
        font-size: 16px;
        margin-bottom: 10px;
        opacity: 0.9;
    }
    
    .stats-card .stats-number {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    /* Barra de progreso mejorada */
    .progress-container {
        background: rgba(255,255,255,0.2);
        border-radius: 25px;
        height: 20px;
        overflow: hidden;
        position: relative;
        margin: 10px 0;
    }
    
    .progress-bar {
        height: 100%;
        border-radius: 25px;
        transition: width 0.8s ease;
        position: relative;
        overflow: hidden;
    }
    
    .progress-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    .progress-bar.high {
        background: linear-gradient(45deg, #dc3545, #c82333);
        animation: glow 2s infinite;
    }
    
    .progress-bar.medium {
        background: linear-gradient(45deg, #dc3545, #e55a00);
        animation: pulse 2s infinite;
    }
    
    .progress-bar.low {
        background: linear-gradient(45deg, #343a40, #495057);
    }
    
    /* Mejoras en el formulario de edición */
    .edit-form {
        background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(220, 53, 69, 0.1);
        border: none;
    }
    
    .edit-form h3 {
        color: #dc3545;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        display: block;
    }
    
    .form-control {
        border-radius: 10px;
        border: 2px solid #e9ecef;
        padding: 12px 15px;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .form-control:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        outline: none;
    }
    
    /* Botón de guardar especial */
    .btn-save {
        background: linear-gradient(45deg, #dc3545, #c82333);
        border: none;
        border-radius: 25px;
        padding: 15px 30px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        color: white;
        width: 100%;
    }
    
    .btn-save:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
    }
    
    /* Mejoras en la tabla de historial */
    .donation-history {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: none;
    }
    
    .donation-history thead th {
        background: linear-gradient(45deg, #343a40, #495057);
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 15px;
        border: none;
    }
    
    .donation-history tbody tr {
        transition: all 0.3s ease;
    }
    
    .donation-history tbody tr:hover {
        background: linear-gradient(45deg, #f8f9fa, #e9ecef);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .donation-history tbody td {
        padding: 15px;
        border-bottom: 1px solid #dee2e6;
        vertical-align: middle;
    }
    
    /* Indicador de urgencia */
    .urgency-indicator {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 10px 0;
    }
    
    .urgency-indicator.high {
        background: linear-gradient(45deg, #dc3545, #c82333);
        color: white;
        animation: glow 2s infinite;
    }
    
    .urgency-indicator.medium {
        background: linear-gradient(45deg, #fd7e14, #e55a00);
        color: white;
        animation: pulse 2s infinite;
    }
    
    .urgency-indicator.low {
        background: linear-gradient(45deg, #28a745, #20c997);
        color: white;
    }
    
    /* Mejoras en el header */
    .header {
        background: linear-gradient(135deg, #000000 0%, #dc3545 100%);
        color: white;
        padding: 30px 0;
        text-align: center;
        position: relative;
        overflow: hidden;
    }
    
    .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        z-index: 1;
    }
    
    .header h1,
    .header p {
        position: relative;
        z-index: 2;
    }
    
    .header h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .header p {
        font-size: 1.1rem;
        opacity: 0.9;
    }
    
    /* Mejoras en modales */
    .modal {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .modal-header {
        background: linear-gradient(45deg, #343a40, #495057);
        color: white;
        padding: 20px;
        border: none;
    }
    
    .modal-body {
        padding: 30px;
    }
    
    /* Animaciones para elementos que aparecen */
    .fade-in {
        animation: fadeIn 0.6s ease-in;
    }
`;
document.head.appendChild(style);

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;
    
    // Cargar datos
    await Promise.all([
        loadUserData(),
        loadReceiverStats(),
        loadDonationHistory()
    ]);
    
    // Event listeners
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
}); 