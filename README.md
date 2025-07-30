# API REST para Sistema de Donación de Sangre

API REST desarrollada con Node.js, Express y Sequelize para SQL Server que gestiona un sistema completo de donación de sangre.

## 🚀 Características

- **Gestión de usuarios**: Registro y autenticación de donadores, receptores y administradores
- **Gestión de donaciones**: Registro de donaciones con validaciones de compatibilidad
- **Gestión de receptores**: Listado de receptores urgentes con priorización
- **Validaciones de negocio**: Compatibilidad de tipos de sangre, fechas de donación, etc.
- **Base de datos**: SQL Server con Sequelize ORM
- **Seguridad**: Encriptación de contraseñas con bcrypt

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- SQL Server (2016 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd blood-donation-api
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   
   Asegúrate de que SQL Server esté corriendo y crea la base de datos:
   ```sql
   CREATE DATABASE BloodDonationDB;
   ```

4. **Configurar la conexión**
   
   La configuración de la base de datos está en `config/database.js`:
   - Host: DESKTOP-G2GP0G1
   - Usuario: sa
   - Contraseña: "112233rr.."
   - Base de datos: BloodDonationDB

5. **Ejecutar la aplicación**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   ```

## 🧪 Scripts de Prueba

### Comandos de prueba disponibles

```bash
# Limpiar base de datos (elimina todas las tablas)
npm run clean

# Crear tablas en la base de datos
npm run create-tables

# Poblar base de datos con datos de prueba
npm run seed

# Probar endpoints básicos
npm run test

# Probar todos los endpoints (requiere servidor corriendo)
npm run test-all

# Prueba completa (verifica servidor + ejecuta todas las pruebas)
npm run test-complete
```

### Secuencia recomendada para pruebas

```bash
# 1. Limpiar y recrear la base de datos
npm run clean
npm run create-tables
npm run seed

# 2. Iniciar servidor
npm run dev

# 3. En otra terminal, ejecutar pruebas completas
npm run test-complete
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

1. **Users** - Usuarios base del sistema
2. **Hospitals** - Hospitales afiliados
3. **Donors** - Perfiles de donadores
4. **Receivers** - Perfiles de receptores
5. **DonorReceiverAssignments** - Asignaciones entre donadores y receptores

### Relaciones

- Un usuario puede ser donador, receptor o administrador
- Un administrador gestiona un hospital
- Un hospital tiene muchos receptores
- Los donadores se asignan a receptores compatibles

## 📡 Endpoints de la API

### Usuarios

#### POST /users/register
Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "Username": "juan_donor",
  "Password": "password123",
  "Email": "juan@email.com",
  "FirstName": "Juan",
  "LastName": "Pérez",
  "PhoneNumber": "1234567890",
  "BirthDate": "1990-01-01",
  "Gender": "M",
  "BloodType": "O+",
  "UserType": "donor"
}
```

**Para receptores, incluir campos adicionales:**
```json
{
  "HospitalID": 1,
  "MedicalRecordNumber": "MRN123456",
  "Diagnosis": "Leucemia",
  "DoctorName": "Dr. García",
  "RequiredDonations": 3,
  "Deadline": "2024-06-01",
  "Story": "Necesita donaciones urgentes"
}
```

#### POST /users/login
Autentica un usuario en el sistema.

**Body:**
```json
{
  "Username": "juan_donor",
  "Password": "password123"
}
```

### Donadores

#### POST /donors/{id}/donate
Registra una donación de sangre.

**Body:**
```json
{
  "HospitalID": 1,
  "AssignmentID": 5,
  "Notes": "Donación exitosa"
}
```

#### GET /donors/available
Lista todos los donadores disponibles para donar.

### Receptores

#### GET /receivers/urgent
Lista receptores con urgencia alta o crítica.

#### GET /receivers
Lista todos los receptores con filtros opcionales.

**Query Parameters:**
- `status`: active, completed, cancelled
- `bloodType`: A+, A-, B+, B-, AB+, AB-, O+, O-
- `hospitalId`: ID del hospital

## 🔧 Validaciones de Negocio

### Compatibilidad de Tipos de Sangre

- **A+**: Compatible con A+, AB+
- **A-**: Compatible con A+, A-, AB+, AB-
- **B+**: Compatible con B+, AB+
- **B-**: Compatible con B+, B-, AB+, AB-
- **AB+**: Compatible solo con AB+
- **AB-**: Compatible con AB+, AB-
- **O+**: Compatible con A+, B+, AB+, O+
- **O-**: Universal (compatible con todos)

### Fechas de Donación

- **Hombres**: Pueden donar cada 3 meses
- **Mujeres**: Pueden donar cada 4 meses

### Validaciones de Usuario

- Edad entre 18 y 65 años
- Email único
- Username único
- Contraseña mínima 6 caracteres

## 🚨 Manejo de Errores

La API retorna códigos de estado HTTP apropiados:

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación o datos incorrectos
- **401**: No autorizado
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## 📝 Ejemplos de Uso

### 1. Registrar un donador
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "maria_donor",
    "Password": "password123",
    "Email": "maria@email.com",
    "FirstName": "María",
    "LastName": "García",
    "PhoneNumber": "0987654321",
    "BirthDate": "1985-05-15",
    "Gender": "F",
    "BloodType": "A+",
    "UserType": "donor"
  }'
```

### 2. Registrar un receptor
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "carlos_receiver",
    "Password": "password123",
    "Email": "carlos@email.com",
    "FirstName": "Carlos",
    "LastName": "López",
    "PhoneNumber": "1122334455",
    "BirthDate": "1975-12-20",
    "Gender": "M",
    "BloodType": "O+",
    "UserType": "receiver",
    "HospitalID": 1,
    "MedicalRecordNumber": "MRN789012",
    "Diagnosis": "Anemia severa",
    "DoctorName": "Dr. Martínez",
    "RequiredDonations": 2,
    "Deadline": "2024-05-15",
    "Story": "Necesita donaciones urgentes"
  }'
```

### 3. Registrar una donación
```bash
curl -X POST http://localhost:3000/donors/1/donate \
  -H "Content-Type: application/json" \
  -d '{
    "HospitalID": 1,
    "Notes": "Donación exitosa"
  }'
```

### 4. Obtener receptores urgentes
```bash
curl -X GET http://localhost:3000/receivers/urgent
```

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Validación de entrada con express-validator
- CORS habilitado para desarrollo
- Manejo seguro de errores

## 🧪 Pruebas

Para probar la API, puedes usar:

- **Postman**: Importar la colección de endpoints
- **cURL**: Ejemplos incluidos en la documentación
- **Thunder Client**: Extensión de VS Code

## 📊 Monitoreo

La API incluye:

- Logging de todas las peticiones
- Manejo de errores centralizado
- Métricas básicas de rendimiento

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.

---

**Nota**: Esta API está diseñada para fines educativos y de demostración. Para uso en producción, se recomienda implementar medidas de seguridad adicionales como JWT, rate limiting, y validaciones más estrictas. 