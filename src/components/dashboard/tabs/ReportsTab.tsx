
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { reportService, type GeneratedReport } from '@/services/reportService';
import { FileText, Download, Trash2, Plus, Calendar } from 'lucide-react';

const reportTypes = [
  { value: 'sales_summary', label: 'Sales Summary Report' },
  { value: 'inventory_status', label: 'Inventory Status Report' },
  { value: 'franchise_performance', label: 'Franchise Performance Report' },
  { value: 'financial_overview', label: 'Financial Overview Report' }
];

export const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newReport, setNewReport] = useState({
    report_type: '',
    report_name: '',
    date_from: '',
    date_to: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await reportService.getReports();
      if (error) {
        throw error;
      }
      setReports(data || []);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!newReport.report_type || !newReport.report_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await reportService.generateReport({
        report_type: newReport.report_type,
        report_name: newReport.report_name,
        date_from: newReport.date_from || undefined,
        date_to: newReport.date_to || undefined
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Report generation started. It will be ready shortly.",
      });

      // Reset form
      setNewReport({
        report_type: '',
        report_name: '',
        date_from: '',
        date_to: ''
      });

      await loadReports();
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, reportName: string) => {
    try {
      const { url, error } = await reportService.downloadReport(reportId);
      if (error) {
        throw error;
      }

      if (url) {
        // In a real implementation, this would trigger a download
        toast({
          title: "Download Started",
          description: `${reportName} is being downloaded.`,
        });
      }
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string, reportName: string) => {
    if (!confirm(`Are you sure you want to delete ${reportName}?`)) {
      return;
    }

    try {
      const { error } = await reportService.deleteReport(reportId);
      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Report deleted successfully.",
      });

      await loadReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Generating</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Generate New Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type *</label>
                <Select
                  value={newReport.report_type}
                  onValueChange={(value) => setNewReport({...newReport, report_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Report Name *</label>
                <Input
                  placeholder="Enter report name"
                  value={newReport.report_name}
                  onChange={(e) => setNewReport({...newReport, report_name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date From</label>
                <Input
                  type="date"
                  value={newReport.date_from}
                  onChange={(e) => setNewReport({...newReport, date_from: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date To</label>
                <Input
                  type="date"
                  value={newReport.date_to}
                  onChange={(e) => setNewReport({...newReport, date_to: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports generated yet. Create your first report above.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.report_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{report.report_name}</h3>
                        <p className="text-sm text-gray-600">
                          {reportTypes.find(t => t.value === report.report_type)?.label || report.report_type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(report.created_at)}
                    </div>
                    {report.date_from && (
                      <div>
                        <span className="font-medium">From:</span> {formatDate(report.date_from)}
                      </div>
                    )}
                    {report.date_to && (
                      <div>
                        <span className="font-medium">To:</span> {formatDate(report.date_to)}
                      </div>
                    )}
                    {report.file_size && (
                      <div>
                        <span className="font-medium">Size:</span> {formatFileSize(report.file_size)}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    {report.status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(report.report_id, report.report_name)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteReport(report.report_id, report.report_name)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
