
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormValidationProps {
  errors: string[];
  className?: string;
}

const FormValidation: React.FC<FormValidationProps> = ({ errors, className = '' }) => {
  // Safety check for errors
  const safeErrors = Array.isArray(errors) ? errors.filter(Boolean) : [];
  
  if (safeErrors.length === 0) return null;

  return (
    <Alert variant="destructive" className={`${className} mt-2`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {safeErrors.length === 1 ? (
          <span className="text-sm">{safeErrors[0]}</span>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {safeErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default FormValidation;
