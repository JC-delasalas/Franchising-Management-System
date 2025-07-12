
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SalesTab: React.FC = () => {
  const [salesData, setSalesData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalSales: '',
    transactions: '',
    notes: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
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

      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!salesData.totalSales || !salesData.transactions) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
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

      // Get first available location for this user's franchisor
      // In a real app, this would be based on the user's assigned location
      const { data: locations } = await supabase
        .from('location')
        .select('location_id, franchisee_id')
        .limit(1);

      if (!locations || locations.length === 0) {
        throw new Error('No location found for sales report');
      }

      const location = locations[0];

      // Prepare sales report data
      const reportData = {
        location_id: location.location_id,
        franchisee_id: location.franchisee_id,
        report_date: salesData.date,
        total_sales: parseFloat(salesData.totalSales),
        total_transactions: parseInt(salesData.transactions),
        notes: salesData.notes || null,
        submitted_by: user.id,
        status: 'submitted'
      };

      // Insert sales report
      const { error } = await supabase
        .from('daily_sales_report')
        .insert(reportData);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Sales report submitted successfully.",
      });

      // Reset form
      setSalesData({
        date: new Date().toISOString().split('T')[0],
        totalSales: '',
        transactions: '',
        notes: ''
      });
      setUploadedFile(null);

    } catch (error: any) {
      console.error('Error submitting sales report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit sales report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!salesData.totalSales || !salesData.transactions) return;

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: locations } = await supabase
        .from('location')
        .select('location_id, franchisee_id')
        .limit(1);

      if (!locations || locations.length === 0) {
        throw new Error('No location found');
      }

      const location = locations[0];

      const reportData = {
        location_id: location.location_id,
        franchisee_id: location.franchisee_id,
        report_date: salesData.date,
        total_sales: parseFloat(salesData.totalSales),
        total_transactions: parseInt(salesData.transactions),
        notes: salesData.notes || null,
        submitted_by: user.id,
        status: 'draft'
      };

      const { error } = await supabase
        .from('daily_sales_report')
        .upsert(reportData, {
          onConflict: 'location_id,report_date'
        });

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Sales report saved as draft.",
      });

    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Daily Sales Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sales Date *</label>
                <Input 
                  type="date" 
                  value={salesData.date}
                  onChange={(e) => setSalesData({...salesData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Sales Amount *</label>
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={salesData.totalSales}
                  onChange={(e) => setSalesData({...salesData, totalSales: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Transactions *</label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={salesData.transactions}
                  onChange={(e) => setSalesData({...salesData, transactions: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Sales Sheet (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploadedFile ? uploadedFile.name : 'Click to upload Excel file or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Supported: .xlsx, .xls, .csv (Max 10MB)</p>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <Textarea 
                  placeholder="Any special notes about today's sales..."
                  value={salesData.notes}
                  onChange={(e) => setSalesData({...salesData, notes: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting || !salesData.totalSales || !salesData.transactions}
            >
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>

        {/* Guidelines Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Reporting Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Submit reports by 11:59 PM daily for accurate tracking</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Include all sales channels (walk-in, delivery, pickup)</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Upload detailed sales sheet for better analytics</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Contact support if you need to modify submitted reports</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
