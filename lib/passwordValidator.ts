/**
 * Password validation utilities
 * Ensures strong, professional password standards
 */

export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Validate password strength based on professional security standards
 */
export const validatePassword = (password: string): PasswordStrength => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Length checks
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `Le mot de passe doit contenir au minimum ${PASSWORD_MIN_LENGTH} caractères`
    );
  } else {
    score += 15;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(
      `Le mot de passe doit contenir maximum ${PASSWORD_MAX_LENGTH} caractères`
    );
  }

  // Character variety checks
  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    errors.push("Ajoutez au moins une lettre majuscule (A-Z)");
    suggestions.push("Utilisez au moins une majuscule");
  } else {
    score += 15;
  }

  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    errors.push("Ajoutez au moins une lettre minuscule (a-z)");
  } else {
    score += 15;
  }

  const hasNumbers = /\d/.test(password);
  if (!hasNumbers) {
    errors.push("Ajoutez au moins un chiffre (0-9)");
    suggestions.push("Incluez des nombres");
  } else {
    score += 15;
  }

  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (!hasSpecialChars) {
    suggestions.push("Utilisez des caractères spéciaux pour plus de sécurité");
  } else {
    score += 20;
  }

  // Length bonus
  if (password.length >= 12) {
    score += 10;
  }
  if (password.length >= 16) {
    score += 10;
  }

  // Check for common weak patterns
  if (hasCommonPattern(password)) {
    errors.push("Évitez les séquences évidentes (123, abc, etc.)");
    score = Math.max(0, score - 20);
  }

  // Check for repeated characters
  if (hasRepeatedCharacters(password)) {
    suggestions.push("Évitez de répéter les mêmes caractères");
    score = Math.max(0, score - 10);
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  return {
    isValid: errors.length === 0,
    score,
    errors,
    suggestions,
  };
};

/**
 * Check if password contains common weak patterns
 */
const hasCommonPattern = (password: string): boolean => {
  const commonPatterns = [
    /123/, // sequential numbers
    /abc/i, // sequential letters
    /qwerty/i, // keyboard patterns
    /password/i,
    /letmein/i,
    /welcome/i,
    /admin/i,
    /pass/i,
    /.*(.)\1{2,}.*/, // 3+ repeated chars
  ];

  return commonPatterns.some((pattern) => pattern.test(password));
};

/**
 * Check if password has too many repeated characters
 */
const hasRepeatedCharacters = (password: string): boolean => {
  return /(.)\1{2,}/.test(password);
};

/**
 * Get password strength label
 */
export const getStrengthLabel = (score: number): string => {
  if (score < 20) return "Très faible";
  if (score < 40) return "Faible";
  if (score < 60) return "Moyen";
  if (score < 80) return "Bon";
  return "Excellent";
};

/**
 * Get password strength color
 */
export const getStrengthColor = (score: number): string => {
  if (score < 20) return "#FF4444";
  if (score < 40) return "#FF8C00";
  if (score < 60) return "#FFD700";
  if (score < 80) return "#90EE90";
  return "#00AA00";
};

/**
 * Verify password matches confirmation
 */
export const validatePasswordMatch = (
  password: string,
  confirmation: string
): { isValid: boolean; error?: string } => {
  if (password !== confirmation) {
    return {
      isValid: false,
      error: "Les mots de passe ne correspondent pas",
    };
  }
  return { isValid: true };
};
