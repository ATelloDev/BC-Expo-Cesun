// Configuración de la API
const API_BASE_URL = 'http://localhost:3001';

// Verificar si el usuario está logueado
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    
    if (user.role !== 'donor') {
        window.location.href = 'index.html';
        return null;
    }
    
    return user;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Función para mostrar mensajes
function showMessage(message, type = 'success') {
    // Crear elemento de mensaje
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

// Cargar datos del usuario
async function loadUserData() {
    const user = checkAuth();
    if (!user) return;
    
    document.getElementById('userName').textContent = user.name;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${user.userId}`);
        if (response.ok) {
            const userData = await response.json();
            document.getElementById('bloodType').textContent = userData.user.BloodType || 'N/A';
            document.getElementById('profileBloodType').textContent = userData.user.BloodType || 'N/A';
            document.getElementById('profilePhone').textContent = userData.user.PhoneNumber || 'N/A';
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
    }
}

// Cargar hospitales
async function loadHospitals() {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`);
        if (response.ok) {
            const data = await response.json();
            const hospitalSelect = document.getElementById('hospital');
            hospitalSelect.innerHTML = '<option value="">Seleccionar hospital</option>';
            
            data.hospitals.forEach(hospital => {
                const option = document.createElement('option');
                option.value = hospital.HospitalID;
                option.textContent = hospital.Name;
                hospitalSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando hospitales:', error);
        showMessage('Error cargando hospitales', 'error');
    }
}

// Cargar estadísticas
async function loadStats() {
    const user = checkAuth();
    if (!user) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/donors/${user.userId}/stats`);
        if (response.ok) {
            const data = await response.json();
            const stats = data.donor;
            
            // Actualizar estadísticas
            document.getElementById('totalDonations').textContent = stats.TotalDonations || 0;
            document.getElementById('donationsThisYear').textContent = stats.DonationsThisYear || 0;
            document.getElementById('bloodType').textContent = stats.User.BloodType || 'N/A';
            
            // Actualizar estado de donación
            const canDonateElement = document.getElementById('canDonate');
            if (stats.CanDonateNow) {
                canDonateElement.textContent = 'Puede donar';
                canDonateElement.className = 'status available';
            } else {
                canDonateElement.textContent = `Puede donar después de ${new Date(stats.CanDonateAfter).toLocaleDateString()}`;
                canDonateElement.className = 'status unavailable';
            }
            
            // Actualizar última donación
            const lastDonationElement = document.getElementById('lastDonation');
            if (stats.LastDonationDate) {
                lastDonationElement.textContent = new Date(stats.LastDonationDate).toLocaleDateString();
            } else {
                lastDonationElement.textContent = 'Nunca';
            }
            
        } else {
            console.error('Error obteniendo estadísticas:', response.status);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        showMessage('Error cargando estadísticas', 'error');
    }
}

// Cargar historial de donaciones
async function loadDonationHistory() {
    const user = checkAuth();
    if (!user) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/donors/${user.userId}/history`);
        if (response.ok) {
            const data = await response.json();
            const historyContainer = document.getElementById('donationHistory');
            
            if (data.history.length === 0) {
                historyContainer.innerHTML = '<p class="no-data">No hay historial de donaciones</p>';
                return;
            }
            
            historyContainer.innerHTML = data.history.map(donation => `
                <div class="history-item">
                    <div class="history-date">
                        <strong>${new Date(donation.DonationDate).toLocaleDateString()}</strong>
                    </div>
                    <div class="history-details">
                        <div class="hospital">
                            <i class="fas fa-hospital"></i>
                            ${donation.Hospital ? donation.Hospital.Name : 'Hospital no especificado'}
                        </div>
                        ${donation.Receiver ? `
                            <div class="receiver">
                                <i class="fas fa-user-injured"></i>
                                ${donation.Receiver.User.FirstName} ${donation.Receiver.User.LastName}
                                <span class="diagnosis">(${donation.Receiver.Diagnosis})</span>
                            </div>
                        ` : ''}
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

// Manejar formulario de donación
async function handleDonationForm(event) {
    event.preventDefault();
    
    const user = checkAuth();
    if (!user) return;
    
    const formData = new FormData(event.target);
    const hospitalId = formData.get('hospital');
    const donationDate = formData.get('donationDate');
    const notes = formData.get('notes');
    
    if (!hospitalId) {
        showMessage('Por favor selecciona un hospital', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/donors/${user.userId}/donate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                HospitalID: parseInt(hospitalId),
                DonationDate: donationDate,
                Notes: notes
            })
        });
        
        if (response.ok) {
            showMessage('Donación programada exitosamente', 'success');
            event.target.reset();
            // Recargar datos
            await Promise.all([loadStats(), loadDonationHistory()]);
        } else {
            const data = await response.json();
            showMessage(data.message || 'Error al programar la donación', 'error');
        }
    } catch (error) {
        console.error('Error programando donación:', error);
        showMessage('Error de conexión con el servidor', 'error');
    }
}

// Establecer fecha mínima para la donación
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('donationDate').min = today;
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    const user = checkAuth();
    if (!user) return;
    
    // Cargar datos
    await Promise.all([
        loadUserData(),
        loadHospitals(),
        loadStats(),
        loadDonationHistory()
    ]);
    
    // Configurar fecha mínima
    setMinDate();
    
    // Event listeners
    document.getElementById('donationForm').addEventListener('submit', handleDonationForm);
});

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
    
    @keyframes heartbeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.3); }
        28% { transform: scale(1); }
        42% { transform: scale(1.3); }
        70% { transform: scale(1); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
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
    
    /* Mejoras en el formulario de donación */
    .donation-form {
        background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(220, 53, 69, 0.1);
        border: none;
    }
    
    .donation-form h3 {
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
    
    /* Botón de donación especial */
    .btn-donate {
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
    
    .btn-donate:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
        animation: heartbeat 1s;
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
        background: linear-gradient(45deg, #000000, #343a40);
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
        background: linear-gradient(45deg, #fff5f5, #ffe6e6);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2);
    }
    
    .donation-history tbody td {
        padding: 15px;
        border-bottom: 1px solid #dee2e6;
        vertical-align: middle;
    }
    
    /* Indicador de estado de donación */
    .donation-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .donation-status.completed {
        background: linear-gradient(45deg, #dc3545, #c82333);
        color: white;
    }
    
    .donation-status.scheduled {
        background: linear-gradient(45deg, #343a40, #495057);
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
    
    /* Animaciones para elementos que aparecen */
    .fade-in {
        animation: fadeIn 0.6s ease-in;
    }
`;
document.head.appendChild(style); 