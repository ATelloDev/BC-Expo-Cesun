const API_BASE_URL = 'http://localhost:3001';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    if (user.role !== 'admin') {
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
}

async function loadGeneralStats() {
    try {
        // Cargar estadísticas generales
        const [usersResponse, donorsResponse, receiversResponse, hospitalsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/donors`),
            fetch(`${API_BASE_URL}/receivers`),
            fetch(`${API_BASE_URL}/hospitals`)
        ]);

        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            document.getElementById('totalUsers').textContent = usersData.total || 0;
        }

        if (donorsResponse.ok) {
            const donorsData = await donorsResponse.json();
            document.getElementById('totalDonors').textContent = donorsData.total || 0;
        }

        if (receiversResponse.ok) {
            const receiversData = await receiversResponse.json();
            document.getElementById('totalReceivers').textContent = receiversData.total || 0;
        }

        if (hospitalsResponse.ok) {
            const hospitalsData = await hospitalsResponse.json();
            document.getElementById('totalHospitals').textContent = hospitalsData.total || 0;
        }

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        showMessage('Error cargando estadísticas', 'error');
    }
}

async function loadHospitals() {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`);
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('hospitalsTableBody');
            
            if (data.hospitals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay hospitales registrados</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.hospitals.map(hospital => `
                <tr>
                    <td>${hospital.HospitalID}</td>
                    <td>${hospital.Name}</td>
                    <td>${hospital.City}</td>
                    <td>${hospital.PhoneNumber}</td>
                    <td>${hospital.Email}</td>
                    <td><span class="status-${hospital.IsActive ? 'active' : 'inactive'}">${hospital.IsActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                        <span class="hospital-activity ${hospital.IsActive ? 'active' : 'inactive'}">
                            <i class="fas ${hospital.IsActive ? 'fa-hospital' : 'fa-hospital-alt'}"></i>
                            ${hospital.IsActive ? 'Operativo' : 'Mantenimiento'}
                        </span>
                    </td>
                </tr>
            `).join('');
            
        } else {
            console.error('Error cargando hospitales:', response.status);
            document.getElementById('hospitalsTableBody').innerHTML = '<tr><td colspan="7" class="error">Error cargando hospitales</td></tr>';
        }
    } catch (error) {
        console.error('Error cargando hospitales:', error);
        document.getElementById('hospitalsTableBody').innerHTML = '<tr><td colspan="7" class="error">Error de conexión</td></tr>';
    }
}

async function loadDonors() {
    try {
        const response = await fetch(`${API_BASE_URL}/donors`);
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('donorsTableBody');
            
            if (data.donors.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay donadores registrados</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.donors.map(donor => `
                <tr>
                    <td>${donor.DonorID}</td>
                    <td>${donor.User.FirstName} ${donor.User.LastName}</td>
                    <td>${donor.User.BloodType}</td>
                    <td>${donor.User.Email}</td>
                    <td>${donor.TotalDonations || 0}</td>
                    <td>${donor.LastDonationDate ? new Date(donor.LastDonationDate).toLocaleDateString() : 'Nunca'}</td>
                    <td><span class="status-${donor.CanDonateNow ? 'active' : 'inactive'}">${donor.CanDonateNow ? 'Disponible' : 'No disponible'}</span></td>
                    <td>
                        <span class="donor-status-indicator ${donor.CanDonateNow ? 'available' : 'unavailable'}">
                            <i class="fas ${donor.CanDonateNow ? 'fa-heart' : 'fa-clock'}"></i>
                            ${donor.CanDonateNow ? 'Disponible' : 'En espera'}
                        </span>
                    </td>
                </tr>
            `).join('');
            
        } else {
            console.error('Error cargando donadores:', response.status);
            document.getElementById('donorsTableBody').innerHTML = '<tr><td colspan="8" class="error">Error cargando donadores</td></tr>';
        }
    } catch (error) {
        console.error('Error cargando donadores:', error);
        document.getElementById('donorsTableBody').innerHTML = '<tr><td colspan="8" class="error">Error de conexión</td></tr>';
    }
}

async function loadReceivers() {
    try {
        const response = await fetch(`${API_BASE_URL}/receivers`);
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('receiversTableBody');
            
            if (data.receivers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay receptores registrados</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.receivers.map(receiver => {
                const progress = receiver.RequiredDonations > 0 
                    ? Math.round((receiver.CurrentDonations / receiver.RequiredDonations) * 100)
                    : 0;
                
                return `
                    <tr>
                        <td>${receiver.ReceiverID}</td>
                        <td>${receiver.User.FirstName} ${receiver.User.LastName}</td>
                        <td>${receiver.User.BloodType}</td>
                        <td>${receiver.Hospital ? receiver.Hospital.Name : 'N/A'}</td>
                        <td>${receiver.Diagnosis}</td>
                        <td>
                            <div>${receiver.CurrentDonations}/${receiver.RequiredDonations}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </td>
                        <td><span class="status-${receiver.Status === 'active' ? 'active' : 'inactive'}">${receiver.Status}</span></td>
                        <td>
                            <span class="receiver-priority ${receiver.RequiredDonations - receiver.CurrentDonations > 2 ? 'high' : receiver.RequiredDonations - receiver.CurrentDonations > 0 ? 'medium' : 'low'}">
                                <i class="fas fa-exclamation-triangle"></i>
                                ${receiver.RequiredDonations - receiver.CurrentDonations} faltantes
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
            
        } else {
            console.error('Error cargando receptores:', response.status);
            document.getElementById('receiversTableBody').innerHTML = '<tr><td colspan="8" class="error">Error cargando receptores</td></tr>';
        }
    } catch (error) {
        console.error('Error cargando receptores:', error);
        document.getElementById('receiversTableBody').innerHTML = '<tr><td colspan="8" class="error">Error de conexión</td></tr>';
    }
}

// Funciones del modal de hospital
function showAddHospitalModal() {
    document.getElementById('hospitalModalTitle').textContent = 'Agregar Hospital';
    document.getElementById('hospitalForm').reset();
    document.getElementById('hospitalModal').style.display = 'block';
}

function closeHospitalModal() {
    document.getElementById('hospitalModal').style.display = 'none';
}

async function handleHospitalForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const hospitalData = {
        Name: formData.get('name'),
        Address: formData.get('address'),
        City: formData.get('city'),
        PhoneNumber: formData.get('phone'),
        Email: formData.get('email'),
        PostalCode: formData.get('postalCode'),
        Description: formData.get('description'),
        AdminUserID: 1,
        IsActive: true
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hospitalData)
        });
        
        if (response.ok) {
            showMessage('Hospital agregado exitosamente', 'success');
            closeHospitalModal();
            loadHospitals();
            loadGeneralStats();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Error agregando hospital', 'error');
        }
    } catch (error) {
        console.error('Error agregando hospital:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Funciones para ver detalles
async function viewHospitalDetails(hospitalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`);
        if (response.ok) {
            const data = await response.json();
            const hospital = data.hospital;
            
            document.getElementById('userDetailsTitle').textContent = 'Detalles del Hospital';
            document.getElementById('userDetailsContent').innerHTML = `
                <div class="user-details">
                    <h3>${hospital.Name}</h3>
                    <div class="detail-row">
                        <span class="label">Dirección:</span>
                        <span class="value">${hospital.Address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Ciudad:</span>
                        <span class="value">${hospital.City}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Teléfono:</span>
                        <span class="value">${hospital.PhoneNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${hospital.Email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Estado:</span>
                        <span class="value status-${hospital.IsActive ? 'active' : 'inactive'}">${hospital.IsActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
            `;
            
            document.getElementById('userDetailsModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando detalles del hospital:', error);
        showMessage('Error cargando detalles', 'error');
    }
}

async function viewDonorDetails(donorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/donors/${donorId}/stats`);
        if (response.ok) {
            const data = await response.json();
            const donor = data.donor;
            
            document.getElementById('userDetailsTitle').textContent = 'Detalles del Donador';
            document.getElementById('userDetailsContent').innerHTML = `
                <div class="user-details">
                    <h3>${donor.User.FirstName} ${donor.User.LastName}</h3>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${donor.User.Email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Tipo de Sangre:</span>
                        <span class="value">${donor.User.BloodType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Donaciones Totales:</span>
                        <span class="value">${donor.TotalDonations}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Última Donación:</span>
                        <span class="value">${donor.LastDonationDate ? new Date(donor.LastDonationDate).toLocaleDateString() : 'Nunca'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Estado:</span>
                        <span class="value status-${donor.CanDonateNow ? 'active' : 'inactive'}">${donor.CanDonateNow ? 'Puede donar' : 'No puede donar'}</span>
                    </div>
                </div>
            `;
            
            document.getElementById('userDetailsModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando detalles del donador:', error);
        showMessage('Error cargando detalles', 'error');
    }
}

async function viewReceiverDetails(receiverId) {
    try {
        const response = await fetch(`${API_BASE_URL}/receivers/${receiverId}`);
        if (response.ok) {
            const data = await response.json();
            const receiver = data.receiver;
            
            document.getElementById('userDetailsTitle').textContent = 'Detalles del Receptor';
            document.getElementById('userDetailsContent').innerHTML = `
                <div class="user-details">
                    <h3>${receiver.User.FirstName} ${receiver.User.LastName}</h3>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${receiver.User.Email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Tipo de Sangre:</span>
                        <span class="value">${receiver.User.BloodType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Hospital:</span>
                        <span class="value">${receiver.Hospital ? receiver.Hospital.Name : 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Diagnóstico:</span>
                        <span class="value">${receiver.Diagnosis}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Doctor:</span>
                        <span class="value">${receiver.DoctorName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Progreso:</span>
                        <span class="value">${receiver.CurrentDonations}/${receiver.RequiredDonations}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Estado:</span>
                        <span class="value status-${receiver.Status === 'active' ? 'active' : 'inactive'}">${receiver.Status}</span>
                    </div>
                </div>
            `;
            
            document.getElementById('userDetailsModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando detalles del receptor:', error);
        showMessage('Error cargando detalles', 'error');
    }
}

function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

// Funciones de edición que faltaban
async function editHospital(hospitalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`);
        if (response.ok) {
            const data = await response.json();
            const hospital = data.hospital;
            
            // Llenar el formulario con los datos del hospital
            document.getElementById('hospitalName').value = hospital.Name || '';
            document.getElementById('hospitalCity').value = hospital.City || '';
            document.getElementById('hospitalAddress').value = hospital.Address || '';
            document.getElementById('hospitalPhone').value = hospital.PhoneNumber || '';
            document.getElementById('hospitalEmail').value = hospital.Email || '';
            document.getElementById('hospitalPostalCode').value = hospital.PostalCode || '';
            document.getElementById('hospitalDescription').value = hospital.Description || '';
            
            // Cambiar el título del modal
            document.getElementById('hospitalModalTitle').textContent = 'Editar Hospital';
            
            // Agregar el ID del hospital al formulario para saber que es una edición
            document.getElementById('hospitalForm').setAttribute('data-edit-id', hospitalId);
            
            // Mostrar el modal
            document.getElementById('hospitalModal').style.display = 'block';
        } else {
            showMessage('Error cargando datos del hospital', 'error');
        }
    } catch (error) {
        console.error('Error cargando hospital:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function editDonor(donorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/donors/${donorId}`);
        if (response.ok) {
            const data = await response.json();
            const donor = data.donor;
            
            // Mostrar detalles del donador en el modal
            document.getElementById('userDetailsTitle').textContent = 'Editar Donador';
            document.getElementById('userDetailsContent').innerHTML = `
                <div class="edit-form">
                    <div class="form-group">
                        <label>Nombre:</label>
                        <input type="text" id="editFirstName" value="${donor.User.FirstName || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Apellido:</label>
                        <input type="text" id="editLastName" value="${donor.User.LastName || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="editEmail" value="${donor.User.Email || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Tipo de Sangre:</label>
                        <select id="editBloodType">
                            <option value="A+" ${donor.User.BloodType === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${donor.User.BloodType === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${donor.User.BloodType === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${donor.User.BloodType === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${donor.User.BloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${donor.User.BloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${donor.User.BloodType === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${donor.User.BloodType === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                    <div class="form-buttons">
                        <button onclick="saveDonorChanges(${donorId})" class="btn-primary">Guardar Cambios</button>
                        <button onclick="closeUserDetailsModal()" class="btn-secondary">Cancelar</button>
                    </div>
                </div>
            `;
            
            document.getElementById('userDetailsModal').style.display = 'block';
        } else {
            showMessage('Error cargando datos del donador', 'error');
        }
    } catch (error) {
        console.error('Error cargando donador:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function editReceiver(receiverId) {
    try {
        const response = await fetch(`${API_BASE_URL}/receivers/${receiverId}`);
        if (response.ok) {
            const data = await response.json();
            const receiver = data.receiver;
            
            // Mostrar detalles del receptor en el modal
            document.getElementById('userDetailsTitle').textContent = 'Editar Receptor';
            document.getElementById('userDetailsContent').innerHTML = `
                <div class="edit-form">
                    <div class="form-group">
                        <label>Nombre:</label>
                        <input type="text" id="editFirstName" value="${receiver.User.FirstName || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Apellido:</label>
                        <input type="text" id="editLastName" value="${receiver.User.LastName || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="editEmail" value="${receiver.User.Email || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Diagnóstico:</label>
                        <input type="text" id="editDiagnosis" value="${receiver.Diagnosis || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Doctor:</label>
                        <input type="text" id="editDoctorName" value="${receiver.DoctorName || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Donaciones Requeridas:</label>
                        <input type="number" id="editRequiredDonations" value="${receiver.RequiredDonations || 0}" />
                    </div>
                    <div class="form-buttons">
                        <button onclick="saveReceiverChanges(${receiverId})" class="btn-primary">Guardar Cambios</button>
                        <button onclick="closeUserDetailsModal()" class="btn-secondary">Cancelar</button>
                    </div>
                </div>
            `;
            
            document.getElementById('userDetailsModal').style.display = 'block';
        } else {
            showMessage('Error cargando datos del receptor', 'error');
        }
    } catch (error) {
        console.error('Error cargando receptor:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function saveDonorChanges(donorId) {
    try {
        const updatedData = {
            FirstName: document.getElementById('editFirstName').value,
            LastName: document.getElementById('editLastName').value,
            Email: document.getElementById('editEmail').value,
            BloodType: document.getElementById('editBloodType').value
        };
        
        const response = await fetch(`${API_BASE_URL}/users/${donorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            showMessage('Donador actualizado exitosamente', 'success');
            closeUserDetailsModal();
            loadDonors(); // Recargar la tabla
        } else {
            const data = await response.json();
            showMessage(data.message || 'Error actualizando donador', 'error');
        }
    } catch (error) {
        console.error('Error actualizando donador:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function saveReceiverChanges(receiverId) {
    try {
        // Actualizar datos del usuario
        const userUpdateData = {
            FirstName: document.getElementById('editFirstName').value,
            LastName: document.getElementById('editLastName').value,
            Email: document.getElementById('editEmail').value
        };
        
        const userResponse = await fetch(`${API_BASE_URL}/users/${receiverId}`, {
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
            Diagnosis: document.getElementById('editDiagnosis').value,
            DoctorName: document.getElementById('editDoctorName').value,
            RequiredDonations: parseInt(document.getElementById('editRequiredDonations').value)
        };
        
        const receiverResponse = await fetch(`${API_BASE_URL}/receivers/${receiverId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receiverUpdateData)
        });
        
        if (!receiverResponse.ok) {
            throw new Error('Error actualizando datos del receptor');
        }
        
        showMessage('Receptor actualizado exitosamente', 'success');
        closeUserDetailsModal();
        loadReceivers(); // Recargar la tabla
    } catch (error) {
        console.error('Error actualizando receptor:', error);
        showMessage('Error actualizando receptor: ' + error.message, 'error');
    }
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const hospitalModal = document.getElementById('hospitalModal');
    const userDetailsModal = document.getElementById('userDetailsModal');
    
    if (event.target === hospitalModal) {
        closeHospitalModal();
    }
    if (event.target === userDetailsModal) {
        closeUserDetailsModal();
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
    
    @keyframes heartbeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.3); }
        28% { transform: scale(1); }
        42% { transform: scale(1.3); }
        70% { transform: scale(1); }
    }
    
    @keyframes glow {
        0% { box-shadow: 0 0 5px rgba(220, 53, 69, 0.5); }
        50% { box-shadow: 0 0 20px rgba(220, 53, 69, 0.8); }
        100% { box-shadow: 0 0 5px rgba(220, 53, 69, 0.5); }
    }
    
    /* Indicadores de estado para donadores */
    .donor-status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    }
    
    .donor-status-indicator.available {
        background: linear-gradient(45deg, #dc3545, #c82333);
        color: white;
        animation: heartbeat 2s infinite;
    }
    
    .donor-status-indicator.unavailable {
        background: linear-gradient(45deg, #343a40, #495057);
        color: white;
    }
    
    .donor-status-indicator i {
        font-size: 14px;
    }
    
    /* Indicadores de prioridad para receptores */
    .receiver-priority {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    }
    
    .receiver-priority.high {
        background: linear-gradient(45deg, #dc3545, #c82333);
        color: white;
        animation: glow 2s infinite;
    }
    
    .receiver-priority.medium {
        background: linear-gradient(45deg, #dc3545, #e55a00);
        color: white;
        animation: pulse 2s infinite;
    }
    
    .receiver-priority.low {
        background: linear-gradient(45deg, #343a40, #495057);
        color: white;
    }
    
    .receiver-priority i {
        font-size: 14px;
    }
    
    /* Indicadores de actividad para hospitales */
    .hospital-activity {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    }
    
    .hospital-activity.active {
        background: linear-gradient(45deg, #dc3545, #c82333);
        color: white;
    }
    
    .hospital-activity.inactive {
        background: linear-gradient(45deg, #343a40, #495057);
        color: white;
    }
    
    .hospital-activity i {
        font-size: 14px;
    }
    
    /* Mejoras en las tablas */
    .data-table {
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: none;
    }
    
    .data-table thead th {
        background: linear-gradient(45deg, #000000, #343a40);
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 15px;
        border: none;
    }
    
    .data-table tbody tr {
        transition: all 0.3s ease;
    }
    
    .data-table tbody tr:hover {
        background: linear-gradient(45deg, #fff5f5, #ffe6e6);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2);
    }
    
    .data-table tbody td {
        padding: 15px;
        border-bottom: 1px solid #dee2e6;
        vertical-align: middle;
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
    
    /* Mejoras en botones */
    .btn-primary {
        background: linear-gradient(45deg, #dc3545, #c82333);
        border: none;
        border-radius: 25px;
        padding: 12px 25px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
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
        background: linear-gradient(45deg, #000000, #dc3545);
        color: white;
        padding: 20px;
        border: none;
    }
    
    .modal-body {
        padding: 30px;
    }
    
    /* Mejoras en formularios */
    .form-control {
        border-radius: 10px;
        border: 2px solid #e9ecef;
        padding: 12px 15px;
        transition: all 0.3s ease;
    }
    
    .form-control:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
    
    /* Animaciones para elementos que aparecen */
    .fade-in {
        animation: fadeIn 0.6s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
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
        loadGeneralStats(),
        loadHospitals(),
        loadDonors(),
        loadReceivers()
    ]);
    
    // Event listeners
    document.getElementById('hospitalForm').addEventListener('submit', handleHospitalForm);
}); 