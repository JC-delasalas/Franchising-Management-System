
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Download, FileText, AlertTriangle, RefreshCw } from 'lucide-react';

interface MarketingFile {
  id: string;
  filename: string;
  category: string;
  file_type: string;
  file_size: number;
  description?: string;
  created_at: string;
}

export const MarketingTab: React.FC = () => {
  const { user } = useAuth();

  // Fetch marketing files from database
  const { data: marketingFiles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['marketing-files', user?.id],
    queryFn: async (): Promise<MarketingFile[]> => {
      const { data, error } = await supabase
        .from('file_storage')
        .select('*')
        .eq('category', 'marketing')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('filename', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Group files by category
  const groupedFiles = marketingFiles.reduce((acc, file) => {
    const category = file.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {} as Record<string, MarketingFile[]>);

  const handleDownload = async (file: MarketingFile) => {
    try {
      // In a real implementation, this would download the file
      console.log('Downloading file:', file.filename);
      // You could implement actual file download logic here
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>Error loading marketing materials. Please try again.</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (Object.keys(groupedFiles).length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4" />
        <p>No marketing materials available at this time.</p>
        <p className="text-sm mt-2">Check back later or contact support for assistance.</p>
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(groupedFiles).map(([category, files]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{file.filename}</span>
                    {file.description && (
                      <span className="text-xs text-gray-500 truncate block">{file.description}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {(file.file_size / 1024).toFixed(1)} KB • {file.file_type}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(file)}
                    className="ml-2 flex-shrink-0"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
