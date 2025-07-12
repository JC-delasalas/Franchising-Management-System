
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { fileService, type FileRecord } from '@/services/fileService';
import { Download, Upload, Trash2, FileText } from 'lucide-react';

const marketingCategories = [
  { category: 'logos', name: 'Logos & Branding', description: 'Brand logos and visual identity assets' },
  { category: 'menus', name: 'Menu & Pricing', description: 'Menu cards, price lists, and nutritional information' },
  { category: 'promotional', name: 'Promotional Materials', description: 'Flyers, posters, and promotional content' }
];

export const MarketingTab: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fileService.getFiles();
      if (error) {
        throw error;
      }
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load marketing files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image, PDF, or Word document.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCategory(category);

    try {
      const { data, error } = await fileService.uploadFile({
        file,
        category,
        description: uploadDescription
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "File uploaded successfully.",
      });

      setUploadDescription('');
      await loadFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingCategory(null);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    try {
      const { error } = await fileService.deleteFile(fileId);
      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "File deleted successfully.",
      });

      await loadFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFilesByCategory = (category: string) => {
    return files.filter(file => file.category === category);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Marketing Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <Textarea
              placeholder="Add a description for the file..."
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid md:grid-cols-3 gap-6">
        {marketingCategories.map((categoryInfo) => {
          const categoryFiles = getFilesByCategory(categoryInfo.category);
          return (
            <Card key={categoryInfo.category}>
              <CardHeader>
                <CardTitle className="text-lg">{categoryInfo.name}</CardTitle>
                <p className="text-sm text-gray-600">{categoryInfo.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, categoryInfo.category)}
                      className="hidden"
                      id={`file-upload-${categoryInfo.category}`}
                      disabled={uploadingCategory === categoryInfo.category}
                    />
                    <label
                      htmlFor={`file-upload-${categoryInfo.category}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      {uploadingCategory === categoryInfo.category ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </label>
                  </div>

                  <Separator />

                  {/* Files List */}
                  {isLoading ? (
                    <div className="text-center text-sm text-gray-500">Loading files...</div>
                  ) : categoryFiles.length === 0 ? (
                    <div className="text-center text-sm text-gray-500">No files uploaded yet</div>
                  ) : (
                    <div className="space-y-2">
                      {categoryFiles.map((file) => (
                        <div key={file.file_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{file.file_name}</p>
                              {file.file_size && (
                                <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                              )}
                              {file.description && (
                                <p className="text-xs text-gray-600">{file.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteFile(file.file_id, file.file_name)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
