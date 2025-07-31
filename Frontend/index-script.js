// Configuración de la API
const API_BASE_URL = 'http://localhost:3001';

// Función para cargar historias de pacientes
async function loadPatientStories() {
    try {
        const response = await fetch(`${API_BASE_URL}/receivers`);
        if (response.ok) {
            const data = await response.json();
            displayStories(data.receivers);
        } else {
            console.error('Error cargando historias:', response.status);
            displaySampleStories();
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        displaySampleStories();
    }
}

// Función para mostrar historias
function displayStories(receivers) {
    const storiesGrid = document.getElementById('storiesGrid');
    
    if (!receivers || receivers.length === 0) {
        displaySampleStories();
        return;
    }

    // Filtrar receptores que tienen historias
    const receiversWithStories = receivers.filter(receiver => 
        receiver.Story && receiver.Story.trim() !== ''
    );

    if (receiversWithStories.length === 0) {
        displaySampleStories();
        return;
    }

    storiesGrid.innerHTML = receiversWithStories.map(receiver => `
        <div class="story-card">
            <div class="story-header">
                <div class="story-avatar">
                    ${receiver.User && receiver.User.FirstName ? receiver.User.FirstName.charAt(0) : 'P'}
                </div>
                <div class="story-info">
                    <h3>${receiver.User ? (receiver.User.FirstName || '') + ' ' + (receiver.User.LastName || '') : 'Paciente'}</h3>
                    <p>Paciente en ${receiver.Hospital ? receiver.Hospital.Name : 'Hospital'}</p>
                </div>
            </div>
            <div class="story-content">
                <p class="story-text">${receiver.Story || 'Historia del paciente'}</p>
            </div>
            <div class="story-meta">
                <span class="blood-type">${receiver.User ? receiver.User.BloodType : 'N/A'}</span>
                <span>Necesita ${receiver.RequiredDonations || 0} donación${(receiver.RequiredDonations || 0) > 1 ? 'es' : ''}</span>
            </div>
        </div>
    `).join('');
}

// Función para mostrar historias de ejemplo
function displaySampleStories() {
    const storiesGrid = document.getElementById('storiesGrid');
    
    const sampleStories = [
        {
            name: 'Alejandro Tello',
            hospital: 'Hospital General de Tijuana',
            story: 'Me dejaron hecho pedazos 💔 y los doctores dicen que la única cura es una transfusión... de 12 almas buenas que quieran donarme un poquito de su sangre. Sí, necesito 12 donadores para esta operación de mal de amores. ¿Te animas a salvarme el corazón (y la vida)? 🩸❤️',
            bloodType: 'A+',
            requiredDonations: 12
        },
        {
            name: 'María González',
            hospital: 'Centro Médico del Norte',
            story: 'Soy una madre de 3 niños pequeños que necesita urgentemente una transfusión de sangre. Mi familia depende de mí y cada día es una lucha. Por favor, ayúdenme a estar ahí para mis hijos. 🙏',
            bloodType: 'O+',
            requiredDonations: 3
        },
        {
            name: 'Carlos Rodríguez',
            hospital: 'Hospital de Especialidades',
            story: 'Después de un accidente automovilístico, necesito múltiples transfusiones para recuperarme. Soy estudiante de medicina y quiero poder ayudar a otros algún día. ¡Cada donación cuenta! 🚑',
            bloodType: 'B+',
            requiredDonations: 5
        },
        {
            name: 'Ana Martínez',
            hospital: 'Clínica del Sol',
            story: 'Como paciente con anemia severa, las transfusiones regulares son parte de mi vida. Gracias a todos los donadores que me han ayudado a mantener mi calidad de vida. 💪',
            bloodType: 'AB+',
            requiredDonations: 2
        },
        {
            name: 'Luis Pérez',
            hospital: 'Hospital Regional',
            story: 'Necesito una cirugía de corazón y requiero donaciones de sangre para el procedimiento. Mi familia está muy preocupada y cualquier ayuda es bienvenida. ❤️',
            bloodType: 'O-',
            requiredDonations: 4
        },
        {
            name: 'Sofia Herrera',
            hospital: 'Centro Oncológico',
            story: 'Como paciente con cáncer, las transfusiones son vitales durante mi tratamiento. Cada donador es un ángel que me da esperanza y fuerza para seguir luchando. 🌟',
            bloodType: 'A-',
            requiredDonations: 6
        }
    ];

    storiesGrid.innerHTML = sampleStories.map(story => `
        <div class="story-card">
            <div class="story-header">
                <div class="story-avatar">
                    ${story.name.charAt(0)}
                </div>
                <div class="story-info">
                    <h3>${story.name}</h3>
                    <p>Paciente en ${story.hospital}</p>
                </div>
            </div>
            <div class="story-content">
                <p class="story-text">${story.story}</p>
            </div>
            <div class="story-meta">
                <span class="blood-type">${story.bloodType}</span>
                <span>Necesita ${story.requiredDonations} donación${story.requiredDonations > 1 ? 'es' : ''}</span>
            </div>
        </div>
    `).join('');
}

// Función para actualizar estadísticas en tiempo real
async function updateStats() {
    try {
        const [receiversResponse, donorsResponse, hospitalsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/receivers`),
            fetch(`${API_BASE_URL}/donors`),
            fetch(`${API_BASE_URL}/hospitals`)
        ]);

        let livesSaved = 0;
        let activeDonors = 0;
        let hospitals = 0;

        if (receiversResponse.ok) {
            const receiversData = await receiversResponse.json();
            livesSaved = receiversData.receivers ? receiversData.receivers.length * 2 : 1247; // Estimación
        }

        if (donorsResponse.ok) {
            const donorsData = await donorsResponse.json();
            activeDonors = donorsData.donors ? donorsData.donors.length : 3891;
        }

        if (hospitalsResponse.ok) {
            const hospitalsData = await hospitalsResponse.json();
            hospitals = hospitalsData.hospitals ? hospitalsData.hospitals.length : 156;
        }

        // Animar los números
        animateNumber('lives-saved', livesSaved);
        animateNumber('active-donors', activeDonors);
        animateNumber('hospitals', hospitals);

    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// Función para animar números
function animateNumber(elementId, finalNumber) {
    const element = document.querySelector(`[data-stat="${elementId}"]`);
    if (!element) return;

    const startNumber = 0;
    const duration = 2000;
    const increment = finalNumber / (duration / 16);

    let currentNumber = startNumber;
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
            currentNumber = finalNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentNumber).toLocaleString();
    }, 16);
}

// Función para scroll suave
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Función para manejar navegación
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            smoothScroll(target);
        });
    });
}

// Función para animar elementos al hacer scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.story-card, .feature, .stat');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Función para manejar el header sticky
function handleStickyHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.9)';
        }

        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

// Función para agregar efectos de hover a las tarjetas
function addHoverEffects() {
    const storyCards = document.querySelectorAll('.story-card');
    
    storyCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Función para manejar el modo oscuro/claro (futuro)
function handleThemeToggle() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (!prefersDark.matches) {
        // Aplicar tema claro si es necesario
        document.body.classList.add('light-theme');
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🩸 BloodCode - Página principal cargada');
    
    // Cargar historias de pacientes
    loadPatientStories();
    
    // Actualizar estadísticas
    updateStats();
    
    // Configurar navegación
    handleNavigation();
    
    // Configurar animaciones
    animateOnScroll();
    
    // Configurar header sticky
    handleStickyHeader();
    
    // Agregar efectos de hover
    addHoverEffects();
    
    // Manejar tema
    handleThemeToggle();
    
    // Actualizar estadísticas cada 30 segundos
    setInterval(updateStats, 30000);
});

// Función para mostrar mensaje de bienvenida
function showWelcomeMessage() {
    const welcomeMessages = [
        "¡Bienvenido a BloodCode! 🩸",
        "Cada donación salva vidas 💪",
        "Únete a nuestra comunidad ❤️",
        "Juntos podemos hacer la diferencia 🌟"
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.5s ease;
    `;
    notification.textContent = randomMessage;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Mostrar mensaje de bienvenida después de 2 segundos
setTimeout(showWelcomeMessage, 2000); 