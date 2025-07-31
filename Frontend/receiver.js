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