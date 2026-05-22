
import React from 'react';
import { validatePassword, PASSWORD_REQUIREMENTS, getPasswordStrengthColor, getPasswordStrengthBg } from '@/lib/passwordValidation';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true
}) => {
  const validation = validatePassword(password);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span className={`font-medium capitalize ${getPasswordStrengthColor(validation.strength)}`}>
            {validation.strength}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBg(validation.strength)}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
          <div className="space-y-1">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const isPassed = validation.passedRequirements.includes(requirement.id);
              return (
                <div key={requirement.id} className="flex items-center space-x-2 text-sm">
                  {isPassed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={isPassed ? 'text-green-700' : 'text-red-600'}>
                    {requirement.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Suggestions:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            {validation.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
