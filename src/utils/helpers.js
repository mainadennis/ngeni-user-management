/**
 * Check the strength of a password based on length, lowercase letters, uppercase letters, numbers, and special characters.
 * @param {string} password - The password to check.
 * @returns {number} A score ranging from 0 to 5 based on the criteria met.
 */
const checkPasswordStrength = (password) => {
  const minLength = 8;
  let score = 0;

  // Check length
  if (password.length >= minLength) {
    score++;
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score++;
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++;
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score++;
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  }

  return score; // Score ranges from 0 to 5 based on the criteria
};

/**
 * Validates the format of an email address.
 * Uses a regular expression to check if the email is in a valid format.
 *
 * @param {string} email - The email address to be validated.
 * @returns {boolean} - True if the email format is valid, false otherwise.
 */

const validateEmail = (email) => {
  // Regular expression to validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
};

module.exports = { checkPasswordStrength, validateEmail };
