const { body } = require('express-validator');

const userValidators = {
  register: [
    body('Username')
      .isLength({ min: 3, max: 50 })
      .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
    body('Password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('Email')
      .isEmail()
      .withMessage('Debe ser un email válido'),
    
    body('FirstName')
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    
    body('LastName')
      .isLength({ min: 2, max: 50 })
      .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    
    body('PhoneNumber')
      .optional()
      .matches(/^[\+]?[0-9\s\-\(\)]+$/)
      .withMessage('El número de teléfono no es válido'),
    
    body('BirthDate')
      .isISO8601()
      .withMessage('La fecha de nacimiento debe ser válida')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18 || age > 65) {
          throw new Error('La edad debe estar entre 18 y 65 años');
        }
        return true;
      }),
    
    body('Gender')
      .isIn(['M', 'F'])
      .withMessage('El género debe ser M o F'),
    
    body('BloodType')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('El tipo de sangre debe ser válido'),
    
    body('UserType')
      .isIn(['donor', 'receiver', 'admin'])
      .withMessage('El tipo de usuario debe ser donor, receiver o admin'),
    
    // Validaciones específicas para receptores
    body('HospitalID')
      .if(body('UserType').equals('receiver'))
      .isInt()
      .withMessage('HospitalID es requerido para receptores'),
    
    body('MedicalRecordNumber')
      .if(body('UserType').equals('receiver'))
      .isLength({ min: 1, max: 50 })
      .withMessage('El número de expediente médico es requerido para receptores'),
    
    body('Diagnosis')
      .if(body('UserType').equals('receiver'))
      .isLength({ min: 1 })
      .withMessage('El diagnóstico es requerido para receptores'),
    
    body('DoctorName')
      .if(body('UserType').equals('receiver'))
      .isLength({ min: 1, max: 100 })
      .withMessage('El nombre del doctor es requerido para receptores'),
    
    body('RequiredDonations')
      .if(body('UserType').equals('receiver'))
      .isInt({ min: 1 })
      .withMessage('El número de donaciones requeridas debe ser al menos 1'),
    
    body('Deadline')
      .if(body('UserType').equals('receiver'))
      .isISO8601()
      .withMessage('La fecha límite debe ser válida')
      .custom((value) => {
        const deadline = new Date(value);
        const today = new Date();
        if (deadline <= today) {
          throw new Error('La fecha límite debe ser futura');
        }
        return true;
      })
  ],

  login: [
    body('Username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
    
    body('Email')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido'),
    
    body('Password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    
    // Validación personalizada para asegurar que se proporcione Username o Email
    body()
      .custom((value, { req }) => {
        if (!req.body.Username && !req.body.Email) {
          throw new Error('Se requiere Username o Email');
        }
        return true;
      })
  ]
};

const donorValidators = {
  donate: [
    body('HospitalID')
      .isInt()
      .withMessage('HospitalID debe ser un número entero'),
    
    body('AssignmentID')
      .optional()
      .isInt()
      .withMessage('AssignmentID debe ser un número entero'),
    
    body('Notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Las notas no pueden exceder 500 caracteres')
  ]
};

module.exports = {
  userValidators,
  donorValidators
}; 