# 🩸 Frontend - Sistema de Donación de Sangre

## 📋 Descripción

Frontend desarrollado en HTML, CSS y JavaScript para el Sistema de Donación de Sangre. Incluye un sistema de login con 3 tipos de usuarios y dashboards específicos para cada rol.

## 🚀 Características

- **Sistema de Login/Registro**: Interfaz moderna y responsiva
- **3 Tipos de Usuario**: Donador, Receptor y Administrador
- **Dashboards Específicos**: Cada rol tiene su vista personalizada
- **Conexión con API**: Integración completa con la API REST
- **Diseño Moderno**: UI/UX atractiva con gradientes y animaciones

## 👥 Usuarios de Prueba

El sistema crea automáticamente los siguientes usuarios de prueba:

### Donador
- **Username**: donador
- **Email**: donador@test.com
- **Contraseña**: 123456
- **Rol**: donor

### Receptora
- **Username**: receptora
- **Email**: receptora@test.com
- **Contraseña**: 123456
- **Rol**: receiver

### Administrador
- **Username**: admin
- **Email**: admin@test.com
- **Contraseña**: 123456
- **Rol**: admin

## 🛠️ Instalación y Uso

1. **Asegúrate de que la API esté corriendo**:
   ```bash
   cd ../API
   node server.js
   ```

2. **Abre el frontend**:
   - Abre `Frontend/index.html` en tu navegador
   - O ejecuta: `start Frontend/index.html`

3. **Inicia sesión**:
   - Usa cualquiera de los usuarios de prueba
   - O registra un nuevo usuario

## 📁 Estructura de Archivos

```
Frontend/
├── index.html          # Página principal con login/registro
├── styles.css          # Estilos CSS modernos
├── script.js           # Lógica JavaScript y conexión con API
└── README.md           # Este archivo
```

## 🎨 Características del Diseño

- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Moderno**: Gradientes, sombras y animaciones suaves
- **Accesible**: Contraste adecuado y navegación por teclado
- **Intuitivo**: Interfaz clara y fácil de usar

## 🔧 Funcionalidades

### Login/Registro
- Formularios de login y registro
- Validación de campos
- Mensajes de error/éxito
- Cambio entre formularios

### Dashboards Específicos

#### 🩸 Vista Donador
- **Estadísticas personales**: Donaciones realizadas, última donación, próxima disponible
- **Nueva donación**: Formulario para programar donaciones
- **Historial**: Lista de donaciones anteriores
- **Gestión de citas**: Selección de hospital y fecha

#### 🔍 Vista Receptor
- **Búsqueda de donadores**: Por tipo de sangre y ubicación
- **Mis solicitudes**: Lista de solicitudes activas y completadas
- **Nueva solicitud**: Formulario para crear solicitudes de sangre
- **Gestión de urgencias**: Niveles de prioridad

#### 👨‍💼 Panel de Administración
- **Estadísticas generales**: Total de donadores, receptores, donaciones mensuales
- **Gestión de hospitales**: Ver, agregar y editar hospitales
- **Gestión de usuarios**: Control de usuarios activos/inactivos
- **Reportes y análisis**: Gráficos de donaciones y solicitudes
- **Configuración del sistema**: Backup, logs, mantenimiento

### Conexión con API
- Registro de usuarios
- Autenticación
- Manejo de sesiones
- Gestión de errores

## 🚀 Próximas Funcionalidades

- [ ] Formularios de donación funcionales
- [ ] Búsqueda de donadores en tiempo real
- [ ] Historial de donaciones conectado a la API
- [ ] Estadísticas del sistema dinámicas
- [ ] Perfil de usuario editable
- [ ] Notificaciones en tiempo real
- [ ] Gráficos interactivos
- [ ] Sistema de citas

## 📞 Soporte

Para cualquier problema o consulta, verifica:
1. Que la API esté corriendo en `http://localhost:3001`
2. Que el navegador tenga JavaScript habilitado
3. Que no haya errores en la consola del navegador (F12)

## 🔧 Solución de Problemas

### Error de "Error interno del servidor"
- Verifica que la API esté corriendo
- Revisa la consola del navegador (F12) para errores específicos
- Asegúrate de que los campos del formulario estén completos

### Problemas de Login
- Usa los usuarios de prueba exactos como se muestran arriba
- Para login, usa el email completo (ej: donador@test.com)
- El sistema automáticamente convierte el email a username

### Dashboard no se muestra
- Verifica que el login sea exitoso
- Revisa la consola del navegador para errores
- Asegúrate de que el rol seleccionado sea correcto

## 🎯 Características de las Vistas

### Vista Donador
- ✅ Estadísticas personales
- ✅ Formulario de nueva donación
- ✅ Historial de donaciones
- ✅ Selección de hospital

### Vista Receptor
- ✅ Búsqueda de donadores
- ✅ Gestión de solicitudes
- ✅ Formulario de nueva solicitud
- ✅ Niveles de urgencia

### Vista Administrador
- ✅ Dashboard completo con estadísticas
- ✅ Gestión de hospitales
- ✅ Gestión de usuarios
- ✅ Reportes y análisis
- ✅ Configuración del sistema 