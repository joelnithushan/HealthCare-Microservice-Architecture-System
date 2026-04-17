/**
 * Validation constraints strictly for Sri Lankan contexts & Healthcare System Rules.
 */

/**
 * Validates a Sri Lankan National Identity Card (NIC).
 * Supports Old Format (9 digits followed by 'V', 'v', 'X', 'x')
 * Supports New Format (12 digits)
 */
export const validateNIC = (nic) => {
  if (!nic || !nic.trim()) return 'NIC is required.';
  const isValid = /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(nic);
  if (!isValid) {
    return 'Must be a valid Sri Lankan NIC (e.g. 961234567V or 199612345678).';
  }
  return null;
};

/**
 * Validates a Sri Lankan mobile number.
 * Supports +947xxxxxxxx or 07xxxxxxxx formats.
 */
export const validateLankanMobile = (mobile) => {
  if (!mobile || !mobile.trim()) return 'Mobile number is required.';
  const stringClean = mobile.replace(/\s+/g, '');
  const isValid = /^(?:\+94|0)(7\d{8})$/.test(stringClean);
  if (!isValid) {
    return 'Must be a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567).';
  }
  return null;
};

/**
 * Validates email with standard robust regex.
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required.';
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    return 'Please enter a valid email address.';
  }
  return null;
};

/**
 * Calculates and validates age from DOB.
 * Age must be >= 0 and <= 120. (Sri Lankan context, general human limits).
 * Returns validation message if invalid, null if valid.
 */
export const validateDOB = (dobString) => {
  if (!dobString) return 'Date of Birth is required.';

  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 'Invalid date format provided.';

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 0) {
    return 'Date of Birth cannot be in the future.';
  }
  if (age > 120) {
    return 'Please enter a valid realistic Date of Birth.';
  }

  return null;
};

/**
 * Validates standard doctor SLMC (Sri Lanka Medical Council) Registration numbers.
 * Typically these are numeric. 
 */
export const validateSLMC = (slmc) => {
  if (!slmc || !slmc.trim()) return 'SLMC Registration Number is required.';
  const isValid = /^[0-9]+$/.test(slmc);
  if (!isValid) {
    return 'SLMC numbers are typically numeric.';
  }
  return null;
};

/**
 * Validates appointment date. Prevents booking on past dates.
 */
export const validateAppointmentDate = (dateStr) => {
  if (!dateStr) return 'Date is required.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return 'Cannot book appointments on a past date.';
  }
  return null;
};

/**
 * Validates appointment time. Prevents booking past times on the current day.
 */
export const validateAppointmentTime = (dateStr, timeStr) => {
  if (!timeStr) return 'Time is required.';
  
  // First ensure date is valid
  const dateErr = validateAppointmentDate(dateStr);
  if (dateErr) return dateErr;

  const today = new Date();
  const selectedDate = new Date(dateStr);
  
  // Check if the selected date matches today's date
  if (
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate()
  ) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (hours < today.getHours() || (hours === today.getHours() && minutes <= today.getMinutes())) {
      return 'Cannot select a past time for today.';
    }
  }
  return null;
};
