
import { supabase } from '@/integrations/supabase/client';

export interface GeneratedReport {
  report_id: string;
  franchisor_id: string;
  franchisee_id?: string;
  report_type: string;
  report_name: string;
  parameters?: any;
  file_path?: string;
  file_size?: number;
  generated_by?: string;
  date_from?: string;
  date_to?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportRequest {
  report_type: string;
  report_name: string;
  parameters?: any;
  franchisee_id?: string;
  date_from?: string;
  date_to?: string;
}

class ReportService {
  async generateReport(request: ReportRequest): Promise<{ data: GeneratedReport | null; error: any }> {
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

      const reportRecord = {
        franchisor_id: profile.franchisor_id,
        franchisee_id: request.franchisee_id || null,
        report_type: request.report_type,
        report_name: request.report_name,
        parameters: request.parameters || null,
        generated_by: user.id,
        date_from: request.date_from || null,
        date_to: request.date_to || null,
        status: 'generating'
      };

      const { data, error } = await supabase
        .from('generated_reports')
        .insert(reportRecord)
        .select()
        .single();

      if (data && !error) {
        // Simulate report generation process
        setTimeout(async () => {
          await this.completeReportGeneration(data.report_id);
        }, 3000);
      }

      return { data, error };
    } catch (error) {
      console.error('Error generating report:', error);
      return { data: null, error };
    }
  }

  private async completeReportGeneration(reportId: string): Promise<void> {
    try {
      const filePath = `/reports/${reportId}_${Date.now()}.pdf`;
      const fileSize = Math.floor(Math.random() * 1000000) + 100000; // Simulate file size

      await supabase
        .from('generated_reports')
        .update({
          status: 'completed',
          file_path: filePath,
          file_size: fileSize
        })
        .eq('report_id', reportId);
    } catch (error) {
      console.error('Error completing report generation:', error);
      // Mark as failed
      await supabase
        .from('generated_reports')
        .update({ status: 'failed' })
        .eq('report_id', reportId);
    }
  }

  async getReports(): Promise<{ data: GeneratedReport[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { data: null, error };
    }
  }

  async downloadReport(reportId: string): Promise<{ url: string | null; error: any }> {
    try {
      const { data: report } = await supabase
        .from('generated_reports')
        .select('file_path, status')
        .eq('report_id', reportId)
        .single();

      if (!report || report.status !== 'completed' || !report.file_path) {
        throw new Error('Report not ready for download');
      }

      // In a real implementation, this would generate a signed URL or direct download
      // For now, we'll return the file path
      return { url: report.file_path, error: null };
    } catch (error) {
      console.error('Error downloading report:', error);
      return { url: null, error };
    }
  }

  async deleteReport(reportId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('generated_reports')
        .delete()
        .eq('report_id', reportId);

      return { error };
    } catch (error) {
      console.error('Error deleting report:', error);
      return { error };
    }
  }
}

export const reportService = new ReportService();
