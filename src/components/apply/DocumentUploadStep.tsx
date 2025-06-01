
import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, X, AlertTriangle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FormValidation from './FormValidation';

interface DocumentUploadStepProps {
  onValidationChange: (isValid: boolean) => void;
}

interface DocumentType {
  name: string;
  required: boolean;
  accept: string;
  maxSize: number;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ onValidationChange }) => {
  const [uploadedDocs, setUploadedDocs] = useState<{[key: string]: boolean}>({
    'Valid Government ID': false,
    'Proof of Billing/Address': false,
    'Bank Statement (Last 3 months)': false,
    'Business License (if applicable)': false
  });
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});

  const documents: DocumentType[] = [
    { name: 'Valid Government ID', required: true, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5 },
    { name: 'Proof of Billing/Address', required: true, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5 },
    { name: 'Bank Statement (Last 3 months)', required: false, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 10 },
    { name: 'Business License (if applicable)', required: false, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5 }
  ];

  const requiredDocs = documents.filter(doc => doc.required);
  const allRequiredUploaded = requiredDocs.every(doc => uploadedDocs[doc.name]);

  React.useEffect(() => {
    onValidationChange(allRequiredUploaded);
  }, [allRequiredUploaded, onValidationChange]);

  const validateFile = useCallback((file: File, maxSizeMB: number): string[] => {
    const errors: string[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only PDF, JPG, JPEG, and PNG files are allowed');
    }

    // Check file name length
    if (file.name.length > 255) {
      errors.push('File name is too long');
    }

    return errors;
  }, []);

  const handleFileUpload = useCallback((docName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const document = documents.find(doc => doc.name === docName);
    if (!document) return;

    const validationErrors = validateFile(file, document.maxSize);
    
    if (validationErrors.length > 0) {
      setErrors(prev => ({ ...prev, [docName]: validationErrors }));
      setUploadedDocs(prev => ({ ...prev, [docName]: false }));
      // Clear the input
      event.target.value = '';
      return;
    }

    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docName];
      return newErrors;
    });

    console.log(`Successfully uploading ${docName}:`, {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });
    
    setUploadedDocs(prev => ({ ...prev, [docName]: true }));
  }, [documents, validateFile]);

  const removeDocument = useCallback((docName: string) => {
    setUploadedDocs(prev => ({ ...prev, [docName]: false }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docName];
      return newErrors;
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Upload Requirements</h3>
        <p className="text-gray-600">Please upload the following documents to complete your application:</p>
      </div>
      
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>File Requirements:</strong> Only PDF, JPG, JPEG, and PNG files are accepted. 
          Maximum file size varies by document type (5-10MB).
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="space-y-2">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${
                uploadedDocs[doc.name] 
                  ? 'border-green-400 bg-green-50' 
                  : errors[doc.name]?.length
                    ? 'border-red-400 bg-red-50'
                    : doc.required 
                      ? 'border-red-300 bg-red-50 hover:border-red-400' 
                      : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {uploadedDocs[doc.name] ? (
                <>
                  <div className="flex items-center justify-center mb-2">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-700">{doc.name}</p>
                  <p className="text-xs text-green-600 mt-1">Document uploaded successfully</p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Uploaded
                    </Badge>
                    <button 
                      onClick={() => removeDocument(doc.name)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Remove document"
                      aria-label={`Remove ${doc.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to upload or drag and drop (Max {doc.maxSize}MB)
                  </p>
                  <Badge variant={doc.required ? "destructive" : "outline"} className="mt-2">
                    {doc.required ? "Required" : "Optional"}
                  </Badge>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => handleFileUpload(doc.name, e)}
                    accept={doc.accept}
                    aria-label={`Upload ${doc.name}`}
                  />
                </>
              )}
            </div>
            
            <FormValidation errors={errors[doc.name] || []} />
          </div>
        ))}
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Notice:</strong> All uploaded documents are encrypted and stored securely. 
          They will only be used for franchise application processing and will be deleted after 90 days if the application is not approved.
        </AlertDescription>
      </Alert>
      
      {!allRequiredUploaded && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Missing Required Documents:</strong> Please upload all required documents to continue to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DocumentUploadStep;
