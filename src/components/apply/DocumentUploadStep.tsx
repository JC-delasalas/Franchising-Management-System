
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, X } from 'lucide-react';

interface DocumentUploadStepProps {
  onValidationChange: (isValid: boolean) => void;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ onValidationChange }) => {
  const [uploadedDocs, setUploadedDocs] = useState<{[key: string]: boolean}>({
    'Valid Government ID': false,
    'Proof of Billing/Address': false,
    'Bank Statement (Last 3 months)': false,
    'Business License (if applicable)': false
  });

  const documents = [
    { name: 'Valid Government ID', required: true },
    { name: 'Proof of Billing/Address', required: true },
    { name: 'Bank Statement (Last 3 months)', required: false },
    { name: 'Business License (if applicable)', required: false }
  ];

  const requiredDocs = documents.filter(doc => doc.required);
  const allRequiredUploaded = requiredDocs.every(doc => uploadedDocs[doc.name]);

  React.useEffect(() => {
    onValidationChange(allRequiredUploaded);
  }, [allRequiredUploaded, onValidationChange]);

  const handleFileUpload = (docName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`Uploading ${docName}:`, file.name);
      setUploadedDocs(prev => ({ ...prev, [docName]: true }));
    }
  };

  const removeDocument = (docName: string) => {
    setUploadedDocs(prev => ({ ...prev, [docName]: false }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Upload Requirements</h3>
      <p className="text-gray-600 mb-6">Please upload the following documents to complete your application:</p>
      
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            uploadedDocs[doc.name] 
              ? 'border-green-400 bg-green-50' 
              : doc.required 
                ? 'border-red-300 bg-red-50 hover:border-red-400' 
                : 'border-gray-300 hover:border-blue-400'
          }`}>
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
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                <p className="text-xs text-gray-500 mt-1">Click to upload or drag and drop</p>
                <Badge variant={doc.required ? "destructive" : "outline"} className="mt-2">
                  {doc.required ? "Required" : "Optional"}
                </Badge>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(doc.name, e)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Required documents must be submitted to proceed. Optional documents can also be submitted during the interview process.
        </p>
      </div>
      
      {!allRequiredUploaded && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Missing Required Documents:</strong> Please upload all required documents to continue to the next step.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadStep;
