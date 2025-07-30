const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { User, Hospital, Donor, Receiver, DonorReceiverAssignment } = require('./models');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const donorRoutes = require('./routes/donorRoutes');
const receiverRoutes = require('./routes/receiverRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/users', userRoutes);
app.use('/donors', donorRoutes);
app.use('/receivers', receiverRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API REST para Sistema de Donación de Sangre',
    version: '1.0.0',
    endpoints: {
      users: {
        register: 'POST /users/register',
        login: 'POST /users/login'
      },
      donors: {
        donate: 'POST /donors/:id/donate',
        available: 'GET /donors/available'
      },
      receivers: {
        urgent: 'GET /receivers/urgent',
        all: 'GET /receivers'
      }
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Función para verificar la conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Verificar que las tablas existen
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN ('Users', 'Hospitals', 'Donors', 'Receivers', 'DonorReceiverAssignments')
    `);
    
    if (results.length === 5) {
      console.log('✅ Todas las tablas están disponibles.');
    } else {
      console.log('⚠️  Algunas tablas no existen. Ejecuta: npm run create-tables');
      console.log('Tablas encontradas:', results.map(r => r.TABLE_NAME).join(', '));
    }
    
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Iniciar servidor
async function startServer() {
  await checkDatabaseConnection();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Ambiente:', process.env.NODE_ENV || 'development');
  });
}

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nCerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar la aplicación
startServer().catch(error => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
}); 