
import { supabase } from '@/integrations/supabase/client';

export interface FileRecord {
  file_id: string;
  franchisor_id: string;
  franchisee_id?: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  file_path: string;
  category: string;
  description?: string;
  uploaded_by?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadRequest {
  file: File;
  category: string;
  description?: string;
  franchisee_id?: string;
}

class FileService {
  async uploadFile(request: FileUploadRequest): Promise<{ data: FileRecord | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user profile to find franchisor info
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('franchisor_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Create file path
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${request.file.name}`;
      const filePath = `${request.category}/${fileName}`;

      // Upload file to storage (Note: This would need storage bucket setup)
      // For now, we'll simulate the file path
      const simulatedPath = `/uploads/${filePath}`;

      // Save file record to database
      const fileRecord = {
        franchisor_id: profile.franchisor_id,
        franchisee_id: request.franchisee_id || null,
        file_name: request.file.name,
        file_type: request.file.type,
        file_size: request.file.size,
        file_path: simulatedPath,
        category: request.category,
        description: request.description || null,
        uploaded_by: user.id,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('file_maintenance')
        .insert(fileRecord)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }

  async getFiles(category?: string): Promise<{ data: FileRecord[] | null; error: any }> {
    try {
      let query = supabase
        .from('file_maintenance')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching files:', error);
      return { data: null, error };
    }
  }

  async deleteFile(fileId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('file_maintenance')
        .update({ status: 'deleted' })
        .eq('file_id', fileId);

      return { error };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { error };
    }
  }

  async updateFile(fileId: string, updates: Partial<FileRecord>): Promise<{ data: FileRecord | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('file_maintenance')
        .update(updates)
        .eq('file_id', fileId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating file:', error);
      return { data: null, error };
    }
  }
}

export const fileService = new FileService();
