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
                        <button class="action-btn" onclick="viewHospitalDetails(${hospital.HospitalID})">Ver</button>
                        <button class="action-btn secondary" onclick="editHospital(${hospital.HospitalID})">Editar</button>
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
                        <button class="action-btn" onclick="viewDonorDetails(${donor.DonorID})">Ver</button>
                        <button class="action-btn secondary" onclick="editDonor(${donor.DonorID})">Editar</button>
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
                            <button class="action-btn" onclick="viewReceiverDetails(${receiver.ReceiverID})">Ver</button>
                            <button class="action-btn secondary" onclick="editReceiver(${receiver.ReceiverID})">Editar</button>
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
        const updatedData = {
            FirstName: document.getElementById('editFirstName').value,
            LastName: document.getElementById('editLastName').value,
            Email: document.getElementById('editEmail').value,
            Diagnosis: document.getElementById('editDiagnosis').value,
            DoctorName: document.getElementById('editDoctorName').value,
            RequiredDonations: parseInt(document.getElementById('editRequiredDonations').value)
        };
        
        const response = await fetch(`${API_BASE_URL}/receivers/${receiverId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            showMessage('Receptor actualizado exitosamente', 'success');
            closeUserDetailsModal();
            loadReceivers(); // Recargar la tabla
        } else {
            const data = await response.json();
            showMessage(data.message || 'Error actualizando receptor', 'error');
        }
    } catch (error) {
        console.error('Error actualizando receptor:', error);
        showMessage('Error de conexión', 'error');
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

// Estilos CSS para animaciones de mensajes y formularios de edición
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
    
    .edit-form {
        padding: 20px;
    }
    
    .edit-form .form-group {
        margin-bottom: 15px;
    }
    
    .edit-form label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
    }
    
    .edit-form input,
    .edit-form select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
    }
    
    .edit-form .form-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .edit-form .btn-primary,
    .edit-form .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
    }
    
    .edit-form .btn-primary {
        background: linear-gradient(45deg, #28a745, #20c997);
        color: white;
    }
    
    .edit-form .btn-secondary {
        background: linear-gradient(45deg, #6c757d, #495057);
        color: white;
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