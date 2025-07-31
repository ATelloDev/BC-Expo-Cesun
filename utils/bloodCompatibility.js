// Matriz de compatibilidad de tipos de sangre
const bloodCompatibilityMatrix = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
};

/**
 * Verifica si un tipo de sangre es compatible con otro
 * @param {string} donorType - Tipo de sangre del donador
 * @param {string} receiverType - Tipo de sangre del receptor
 * @returns {boolean} - True si son compatibles
 */
function isBloodCompatible(donorType, receiverType) {
  if (!bloodCompatibilityMatrix[donorType] || !bloodCompatibilityMatrix[receiverType]) {
    return false;
  }
  return bloodCompatibilityMatrix[donorType].includes(receiverType);
}

/**
 * Calcula la fecha en que un donador puede volver a donar
 * @param {string} gender - Género del donador ('M' o 'F')
 * @param {Date} lastDonationDate - Fecha de la última donación
 * @returns {Date} - Fecha en que puede volver a donar
 */
function calculateNextDonationDate(gender, lastDonationDate) {
  const monthsToWait = gender === 'M' ? 3 : 4;
  const nextDate = new Date(lastDonationDate);
  nextDate.setMonth(nextDate.getMonth() + monthsToWait);
  return nextDate;
}

/**
 * Verifica si un donador puede donar en la fecha actual
 * @param {Date} canDonateAfter - Fecha en que puede volver a donar
 * @returns {boolean} - True si puede donar
 */
function canDonateNow(canDonateAfter) {
  if (!canDonateAfter) return true;
  return new Date() >= new Date(canDonateAfter);
}

module.exports = {
  isBloodCompatible,
  calculateNextDonationDate,
  canDonateNow,
  bloodCompatibilityMatrix
}; 