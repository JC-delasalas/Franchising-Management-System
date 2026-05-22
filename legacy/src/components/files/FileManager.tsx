import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileAPI, FileStorageRecord, FileSearchFilters } from '@/api/files';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image, 
  Video, 
  Music,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileManagerProps {
  franchiseId?: string;
  category?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  onFileSelect?: (file: FileStorageRecord) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  franchiseId,
  category,
  allowUpload = true,
  allowDelete = false,
  onFileSelect
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchFilters, setSearchFilters] = useState<FileSearchFilters>({
    franchise_id: franchiseId,
    category: category,
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileStorageRecord | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Query for files
  const { data: filesData, isLoading, error } = useQuery({
    queryKey: ['files', searchFilters, searchTerm],
    queryFn: () => FileAPI.searchFiles(searchFilters),
    staleTime: 30000,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data: { file: File; options: any }) => 
      FileAPI.uploadFile(data.file, data.options),
    onSuccess: () => {
      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded and is now available.",
      });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploadFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => FileAPI.deleteFile(fileId),
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  }, []);

  const handleUploadConfirm = useCallback(() => {
    if (!uploadFile) return;

    const options = {
      franchise_id: franchiseId,
      category: category || 'document',
      description: `Uploaded by ${user?.full_name}`,
      tags: [],
      metadata: {}
    };

    uploadMutation.mutate({ file: uploadFile, options });
  }, [uploadFile, franchiseId, category, user, uploadMutation]);

  const handleDownload = useCallback(async (file: FileStorageRecord) => {
    try {
      const downloadUrl = await FileAPI.getDownloadUrl(file.file_path);
      window.open(downloadUrl, '_blank');
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDelete = useCallback((fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  }, [deleteMutation]);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading files: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">File Manager</h2>
          <p className="text-gray-600">Manage your documents, images, and media files</p>
        </div>
        
        {allowUpload && (
          <div className="flex gap-2">
            <Input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </label>
          </div>
        )}
      </div>

      {/* Upload Confirmation */}
      {uploadFile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to upload: {uploadFile.name}</p>
                <p className="text-sm text-gray-600">Size: {formatFileSize(uploadFile.size)}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUploadConfirm}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? <LoadingSpinner /> : 'Confirm Upload'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setUploadFile(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={searchFilters.file_type || 'all'}
              onValueChange={(value) => 
                setSearchFilters(prev => ({ 
                  ...prev, 
                  file_type: value === 'all' ? undefined : value 
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchFilters.category || 'all'}
              onValueChange={(value) => 
                setSearchFilters(prev => ({ 
                  ...prev, 
                  category: value === 'all' ? undefined : value 
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="manual">Manuals</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filesData?.data.map((file) => (
          <Card 
            key={file.id} 
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedFile?.id === file.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedFile(file);
              onFileSelect?.(file);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.file_type)}
                  <CardTitle className="text-sm truncate">{file.filename}</CardTitle>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    {allowDelete && (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(file.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">{file.category}</Badge>
                  <span className="text-gray-500">v{file.version}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Size: {formatFileSize(file.file_size)}</p>
                  <p>Uploaded: {new Date(file.created_at).toLocaleDateString()}</p>
                </div>
                
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{file.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filesData?.data.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.keys(searchFilters).length > 2
              ? "Try adjusting your search criteria"
              : "Upload your first file to get started"
            }
          </p>
          {allowUpload && !searchTerm && (
            <label htmlFor="file-upload">
              <Button className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default FileManager;
