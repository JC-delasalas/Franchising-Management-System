
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Upload } from 'lucide-react';

const DocumentUploadStep: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Upload Requirements</h3>
      <p className="text-gray-600 mb-6">Please upload the following documents to complete your application:</p>
      
      <div className="space-y-4">
        {[
          { name: 'Valid Government ID', required: true },
          { name: 'Proof of Billing/Address', required: true },
          { name: 'Bank Statement (Last 3 months)', required: false },
          { name: 'Business License (if applicable)', required: false }
        ].map((doc, index) => (
          <div key={index} className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors ${
            doc.required ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">{doc.name}</p>
            <p className="text-xs text-gray-500 mt-1">Click to upload or drag and drop</p>
            <Badge variant={doc.required ? "destructive" : "outline"} className="mt-2">
              {doc.required ? "Required" : "Optional"}
            </Badge>
          </div>
        ))}
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Required documents must be submitted to proceed. Optional documents can also be submitted during the interview process.
        </p>
      </div>
    </div>
  );
};

export default DocumentUploadStep;
