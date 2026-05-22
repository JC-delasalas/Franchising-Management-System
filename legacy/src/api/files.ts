import { BaseAPI } from './base';
import { supabase } from '@/lib/supabase';

export interface FileStorageRecord {
  id: string;
  filename: string;
  file_path: string;
  file_type: 'document' | 'video' | 'audio' | 'image';
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  franchise_id?: string;
  category: 'contract' | 'training' | 'marketing' | 'product' | 'manual' | 'legal' | 'application' | 'report';
  version: number;
  is_active: boolean;
  metadata: Record<string, any>;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  change_description?: string;
  is_current: boolean;
  created_at: string;
}

export interface FilePermission {
  id: string;
  file_id: string;
  user_id?: string;
  role?: string;
  franchise_id?: string;
  permission_type: 'read' | 'write' | 'delete' | 'share';
  granted_by: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface StorageBucket {
  id: string;
  bucket_name: string;
  file_type: string;
  max_file_size: number;
  allowed_mime_types: string[];
  is_public: boolean;
  cdn_enabled: boolean;
  compression_enabled: boolean;
  created_at: string;
}

export interface FileUploadOptions {
  franchise_id?: string;
  category: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FileSearchFilters {
  file_type?: string;
  category?: string;
  franchise_id?: string;
  uploaded_by?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
}

export class FileAPI extends BaseAPI {
  /**
   * Upload a file to storage and create database record
   */
  static async uploadFile(
    file: File,
    options: FileUploadOptions
  ): Promise<FileStorageRecord> {
    try {
      // Validate file size and type
      const bucket = await this.getBucketForFileType(file.type);
      if (file.size > bucket.max_file_size) {
        throw new Error(`File size exceeds maximum allowed size of ${bucket.max_file_size} bytes`);
      }

      if (!bucket.allowed_mime_types.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed for this bucket`);
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${options.category}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket.bucket_name)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const fileRecord = {
        filename: file.name,
        file_path: uploadData.path,
        file_type: this.getFileTypeFromMime(file.type),
        file_size: file.size,
        mime_type: file.type,
        franchise_id: options.franchise_id,
        category: options.category,
        description: options.description,
        tags: options.tags,
        metadata: options.metadata || {},
      };

      const { data, error } = await supabase
        .from('file_storage')
        .insert(fileRecord)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get file by ID
   */
  static async getFile(fileId: string): Promise<FileStorageRecord> {
    try {
      const { data, error } = await supabase
        .from('file_storage')
        .select('*')
        .eq('id', fileId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search files with filters
   */
  static async searchFiles(
    filters: FileSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ data: FileStorageRecord[]; total: number }> {
    try {
      let query = supabase
        .from('file_storage')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.file_type) {
        query = query.eq('file_type', filters.file_type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.franchise_id) {
        query = query.eq('franchise_id', filters.franchise_id);
      }
      if (filters.uploaded_by) {
        query = query.eq('uploaded_by', filters.uploaded_by);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get file versions
   */
  static async getFileVersions(fileId: string): Promise<FileVersion[]> {
    try {
      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new file version
   */
  static async createFileVersion(
    fileId: string,
    file: File,
    changeDescription?: string
  ): Promise<FileVersion> {
    try {
      // Get current file record
      const currentFile = await this.getFile(fileId);
      
      // Upload new version
      const bucket = await this.getBucketForFileType(file.type);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-v${currentFile.version + 1}.${fileExt}`;
      const filePath = `${currentFile.category}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket.bucket_name)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update file record with new version
      const { error: updateError } = await supabase
        .from('file_storage')
        .update({
          version: currentFile.version + 1,
          file_path: uploadData.path,
          file_size: file.size,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId);

      if (updateError) throw updateError;

      // The trigger will automatically create the version record
      // Get the newly created version
      const { data: versionData, error: versionError } = await supabase
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .eq('is_current', true)
        .single();

      if (versionError) throw versionError;

      return versionData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get download URL for file
   */
  static async getDownloadUrl(filePath: string, bucketName?: string): Promise<string> {
    try {
      if (!bucketName) {
        // Determine bucket from file path
        bucketName = this.getBucketNameFromPath(filePath);
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      // Soft delete - mark as inactive
      const { error } = await supabase
        .from('file_storage')
        .update({ is_active: false })
        .eq('id', fileId);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Grant file permission
   */
  static async grantPermission(
    fileId: string,
    permission: Omit<FilePermission, 'id' | 'created_at'>
  ): Promise<FilePermission> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .insert(permission)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get file permissions
   */
  static async getFilePermissions(fileId: string): Promise<FilePermission[]> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select('*')
        .eq('file_id', fileId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get storage buckets configuration
   */
  static async getStorageBuckets(): Promise<StorageBucket[]> {
    try {
      const { data, error } = await supabase
        .from('storage_buckets')
        .select('*')
        .order('file_type');

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper methods
  private static async getBucketForFileType(mimeType: string): Promise<StorageBucket> {
    const buckets = await this.getStorageBuckets();
    const bucket = buckets.find(b => b.allowed_mime_types.includes(mimeType));
    
    if (!bucket) {
      throw new Error(`No storage bucket configured for file type: ${mimeType}`);
    }
    
    return bucket;
  }

  private static getFileTypeFromMime(mimeType: string): 'document' | 'video' | 'audio' | 'image' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private static getBucketNameFromPath(filePath: string): string {
    if (filePath.includes('video/')) return 'videos';
    if (filePath.includes('audio/')) return 'audio';
    if (filePath.includes('image/')) return 'images';
    return 'documents';
  }
}
