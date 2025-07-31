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
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
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

// Estilos CSS para animaciones de mensajes
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
`;
document.head.appendChild(style); 