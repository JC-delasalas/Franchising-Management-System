
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { FileText, Download } from 'lucide-react';

interface Document {
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  description: string;
}

interface ContractDocumentsProps {
  documents: Document[];
  onDownload: (docName: string) => void;
  isDownloading: string | null;
}

const ContractDocuments: React.FC<ContractDocumentsProps> = ({
  documents,
  onDownload,
  isDownloading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{doc.type}</span>
                    <span>{doc.size}</span>
                    <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => onDownload(doc.name)} disabled={isDownloading === doc.name}>
                {isDownloading === doc.name ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractDocuments;
