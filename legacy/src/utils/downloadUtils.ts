
export const downloadDocument = (docName: string, docType: string = 'pdf') => {
  // Simulate document download - in real app, this would fetch from server
  const blob = new Blob(['Sample document content'], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${docName}.${docType}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAllDocuments = () => {
  const documents = [
    'Franchise Agreement',
    'Operations Manual', 
    'Territory Map',
    'Financial Projections'
  ];
  
  documents.forEach((doc, index) => {
    setTimeout(() => {
      downloadDocument(doc);
    }, index * 500); // Stagger downloads
  });
};
