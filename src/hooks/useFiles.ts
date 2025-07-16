import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileAPI, FileSearchFilters, FileUploadOptions } from '@/api/files';

export const useFiles = (filters: FileSearchFilters = {}, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['files', filters, page, limit],
    queryFn: () => FileAPI.searchFiles(filters, page, limit),
    staleTime: 30000,
  });
};

export const useFile = (fileId: string) => {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: () => FileAPI.getFile(fileId),
    enabled: !!fileId,
    staleTime: 60000,
  });
};

export const useFileVersions = (fileId: string) => {
  return useQuery({
    queryKey: ['file-versions', fileId],
    queryFn: () => FileAPI.getFileVersions(fileId),
    enabled: !!fileId,
    staleTime: 60000,
  });
};

export const useFilePermissions = (fileId: string) => {
  return useQuery({
    queryKey: ['file-permissions', fileId],
    queryFn: () => FileAPI.getFilePermissions(fileId),
    enabled: !!fileId,
    staleTime: 30000,
  });
};

export const useStorageBuckets = () => {
  return useQuery({
    queryKey: ['storage-buckets'],
    queryFn: () => FileAPI.getStorageBuckets(),
    staleTime: 300000, // 5 minutes
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, options }: { file: File; options: FileUploadOptions }) =>
      FileAPI.uploadFile(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => FileAPI.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

export const useCreateFileVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, file, description }: { 
      fileId: string; 
      file: File; 
      description?: string 
    }) => FileAPI.createFileVersion(fileId, file, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['file', variables.fileId] });
      queryClient.invalidateQueries({ queryKey: ['file-versions', variables.fileId] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

export const useGrantFilePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, permission }: { 
      fileId: string; 
      permission: any 
    }) => FileAPI.grantPermission(fileId, permission),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['file-permissions', variables.fileId] });
    },
  });
};
