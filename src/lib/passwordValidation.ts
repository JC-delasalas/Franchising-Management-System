
export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  strength: number; // 1-3, higher is stronger
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters long',
    test: (password) => password.length >= 8,
    strength: 1
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
    strength: 1
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
    strength: 1
  },
  {
    id: 'number',
    label: 'Contains number (0-9)',
    test: (password) => /[0-9]/.test(password),
    strength: 2
  },
  {
    id: 'special',
    label: 'Contains special character (!@#$%^&*)',
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    strength: 2
  },
  {
    id: 'noCommon',
    label: 'Not a common password',
    test: (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    strength: 3
  },
  {
    id: 'noSequential',
    label: 'No sequential characters (e.g., 123, abc)',
    test: (password) => {
      const sequential = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def'];
      return !sequential.some(seq => password.toLowerCase().includes(seq));
    },
    strength: 2
  }
];

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'password1',
  'qwerty123', 'hello', 'welcome123', 'login', 'admin123'
];

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  strength: 'weak' | 'fair' | 'good' | 'strong';
  passedRequirements: string[];
  failedRequirements: string[];
  suggestions: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const passedRequirements: string[] = [];
  const failedRequirements: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  PASSWORD_REQUIREMENTS.forEach(requirement => {
    maxScore += requirement.strength * 10;
    
    if (requirement.test(password)) {
      passedRequirements.push(requirement.id);
      totalScore += requirement.strength * 10;
    } else {
      failedRequirements.push(requirement.id);
    }
  });

  const score = Math.round((totalScore / maxScore) * 100);
  
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'fair';
  else if (score < 80) strength = 'good';
  else strength = 'strong';

  const suggestions: string[] = [];
  if (failedRequirements.includes('length')) {
    suggestions.push('Use at least 8 characters');
  }
  if (failedRequirements.includes('special')) {
    suggestions.push('Add special characters like !@#$%');
  }
  if (failedRequirements.includes('number')) {
    suggestions.push('Include numbers');
  }
  if (failedRequirements.includes('noCommon')) {
    suggestions.push('Avoid common passwords');
  }

  return {
    isValid: failedRequirements.length === 0,
    score,
    strength,
    passedRequirements,
    failedRequirements,
    suggestions
  };
};

export const getPasswordStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'weak': return 'text-red-600';
    case 'fair': return 'text-orange-600';
    case 'good': return 'text-blue-600';
    case 'strong': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const getPasswordStrengthBg = (strength: string): string => {
  switch (strength) {
    case 'weak': return 'bg-red-500';
    case 'fair': return 'bg-orange-500';
    case 'good': return 'bg-blue-500';
    case 'strong': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};
