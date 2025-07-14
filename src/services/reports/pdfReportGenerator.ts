import { supabase } from '@/integrations/supabase/client';

export interface ReportData {
  title: string;
  subtitle?: string;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalSales: number;
    totalTransactions: number;
    averageOrderValue: number;
    growthRate?: number;
  };
  details: Array<{
    category: string;
    items: Array<{
      name: string;
      value: number;
      percentage?: number;
      trend?: 'up' | 'down' | 'stable';
    }>;
  }>;
  charts?: Array<{
    type: 'bar' | 'line' | 'pie';
    title: string;
    data: Array<{
      label: string;
      value: number;
    }>;
  }>;
}

/**
 * PDF Report Generator Service
 * Handles comprehensive report generation with error handling and logging
 */
export class PDFReportGenerator {
  
  /**
   * Generate sales summary report
   */
  static async generateSalesReport(
    dateFrom: string, 
    dateTo: string, 
    options: {
      brandId?: string;
      locationId?: string;
      franchisorId?: string;
      includeCharts?: boolean;
    } = {}
  ): Promise<{ success: boolean; reportUrl?: string; error?: string }> {
    
    try {
      console.log('Generating sales report...', { dateFrom, dateTo, options });
      
      // Collect report data
      const reportData = await this.collectSalesReportData(dateFrom, dateTo, options);
      
      // Generate PDF content
      const pdfContent = await this.generatePDFContent(reportData);
      
      // Save report to storage
      const reportUrl = await this.saveReportToStorage(pdfContent, 'sales-report', dateFrom, dateTo);
      
      // Log report generation
      await this.logReportGeneration('sales_summary', reportUrl, dateFrom, dateTo);
      
      return { success: true, reportUrl };
      
    } catch (error) {
      console.error('Error generating sales report:', error);
      
      // Log error
      await this.logReportError('sales_summary', error as Error, dateFrom, dateTo);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  /**
   * Generate KPI performance report
   */
  static async generateKPIReport(
    dateFrom: string, 
    dateTo: string, 
    options: {
      brandId?: string;
      locationId?: string;
      franchisorId?: string;
    } = {}
  ): Promise<{ success: boolean; reportUrl?: string; error?: string }> {
    
    try {
      console.log('Generating KPI report...', { dateFrom, dateTo, options });
      
      // Collect KPI data
      const reportData = await this.collectKPIReportData(dateFrom, dateTo, options);
      
      // Generate PDF content
      const pdfContent = await this.generatePDFContent(reportData);
      
      // Save report to storage
      const reportUrl = await this.saveReportToStorage(pdfContent, 'kpi-report', dateFrom, dateTo);
      
      // Log report generation
      await this.logReportGeneration('kpi_performance', reportUrl, dateFrom, dateTo);
      
      return { success: true, reportUrl };
      
    } catch (error) {
      console.error('Error generating KPI report:', error);
      
      // Log error
      await this.logReportError('kpi_performance', error as Error, dateFrom, dateTo);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  /**
   * Collect sales report data
   */
  private static async collectSalesReportData(
    dateFrom: string, 
    dateTo: string, 
    options: any
  ): Promise<ReportData> {
    
    // Get sales data
    let salesQuery = supabase
      .from('daily_sales_report')
      .select(`
        total_sales,
        total_transactions,
        report_date,
        location:location_id(
          location_name,
          franchisee:franchisee_id(
            business_name,
            brand:brand_id(
              brand_name,
              franchisor_id
            )
          )
        )
      `)
      .gte('report_date', dateFrom)
      .lte('report_date', dateTo);
    
    if (options.brandId) {
      salesQuery = salesQuery.eq('location.franchisee.brand_id', options.brandId);
    }
    
    if (options.locationId) {
      salesQuery = salesQuery.eq('location_id', options.locationId);
    }
    
    const { data: salesData, error: salesError } = await salesQuery;
    
    if (salesError) throw salesError;
    
    // Calculate summary metrics
    const totalSales = salesData?.reduce((sum, sale) => sum + (sale.total_sales || 0), 0) || 0;
    const totalTransactions = salesData?.reduce((sum, sale) => sum + (sale.total_transactions || 0), 0) || 0;
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Group by location
    const locationPerformance = new Map();
    salesData?.forEach(sale => {
      const locationName = sale.location?.location_name || 'Unknown';
      if (!locationPerformance.has(locationName)) {
        locationPerformance.set(locationName, { sales: 0, transactions: 0 });
      }
      const location = locationPerformance.get(locationName);
      location.sales += sale.total_sales || 0;
      location.transactions += sale.total_transactions || 0;
    });
    
    // Group by brand
    const brandPerformance = new Map();
    salesData?.forEach(sale => {
      const brandName = sale.location?.franchisee?.brand?.brand_name || 'Unknown';
      if (!brandPerformance.has(brandName)) {
        brandPerformance.set(brandName, { sales: 0, transactions: 0 });
      }
      const brand = brandPerformance.get(brandName);
      brand.sales += sale.total_sales || 0;
      brand.transactions += sale.total_transactions || 0;
    });
    
    return {
      title: 'Sales Summary Report',
      subtitle: `Period: ${dateFrom} to ${dateTo}`,
      dateRange: { from: dateFrom, to: dateTo },
      summary: {
        totalSales,
        totalTransactions,
        averageOrderValue
      },
      details: [
        {
          category: 'Location Performance',
          items: Array.from(locationPerformance.entries()).map(([name, data]) => ({
            name,
            value: data.sales,
            percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0
          }))
        },
        {
          category: 'Brand Performance',
          items: Array.from(brandPerformance.entries()).map(([name, data]) => ({
            name,
            value: data.sales,
            percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0
          }))
        }
      ]
    };
  }
  
  /**
   * Collect KPI report data
   */
  private static async collectKPIReportData(
    dateFrom: string, 
    dateTo: string, 
    options: any
  ): Promise<ReportData> {
    
    let kpiQuery = supabase
      .from('kpi_data')
      .select(`
        actual_value,
        recorded_date,
        kpi:kpi_id(
          kpi_name,
          target_value,
          brand_id
        ),
        location:location_id(
          location_name,
          franchisee:franchisee_id(
            brand:brand_id(
              franchisor_id
            )
          )
        )
      `)
      .gte('recorded_date', dateFrom)
      .lte('recorded_date', dateTo);
    
    if (options.brandId) {
      kpiQuery = kpiQuery.eq('kpi.brand_id', options.brandId);
    }
    
    if (options.locationId) {
      kpiQuery = kpiQuery.eq('location_id', options.locationId);
    }
    
    const { data: kpiData, error: kpiError } = await kpiQuery;
    
    if (kpiError) throw kpiError;
    
    // Aggregate KPI performance
    const kpiPerformance = new Map();
    kpiData?.forEach(item => {
      const kpiName = item.kpi?.kpi_name;
      if (!kpiName) return;
      
      if (!kpiPerformance.has(kpiName)) {
        kpiPerformance.set(kpiName, {
          actual: 0,
          target: item.kpi.target_value || 0,
          count: 0
        });
      }
      
      const kpi = kpiPerformance.get(kpiName);
      kpi.actual += item.actual_value || 0;
      kpi.count += 1;
    });
    
    return {
      title: 'KPI Performance Report',
      subtitle: `Period: ${dateFrom} to ${dateTo}`,
      dateRange: { from: dateFrom, to: dateTo },
      summary: {
        totalSales: 0,
        totalTransactions: 0,
        averageOrderValue: 0
      },
      details: [
        {
          category: 'KPI Performance',
          items: Array.from(kpiPerformance.entries()).map(([name, data]) => {
            const avgActual = data.actual / data.count;
            const achievement = data.target > 0 ? (avgActual / data.target) * 100 : 0;
            return {
              name,
              value: avgActual,
              percentage: achievement,
              trend: achievement >= 100 ? 'up' : achievement >= 80 ? 'stable' : 'down'
            };
          })
        }
      ]
    };
  }
  
  /**
   * Generate PDF content (simplified HTML-to-PDF approach)
   */
  private static async generatePDFContent(reportData: ReportData): Promise<string> {
    // For now, return HTML content that can be converted to PDF
    // In a real implementation, you would use a library like jsPDF or Puppeteer
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 20px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .item { margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportData.title}</h1>
          <p>${reportData.subtitle}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p>Total Sales: $${reportData.summary.totalSales.toFixed(2)}</p>
          <p>Total Transactions: ${reportData.summary.totalTransactions}</p>
          <p>Average Order Value: $${reportData.summary.averageOrderValue.toFixed(2)}</p>
        </div>
        
        ${reportData.details.map(section => `
          <div class="section">
            <h2>${section.category}</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${section.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>$${item.value.toFixed(2)}</td>
                    <td>${(item.percentage || 0).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  }
  
  /**
   * Save report to Supabase storage
   */
  private static async saveReportToStorage(
    content: string, 
    reportType: string, 
    dateFrom: string, 
    dateTo: string
  ): Promise<string> {
    
    const fileName = `${reportType}-${dateFrom}-to-${dateTo}-${Date.now()}.html`;
    const filePath = `reports/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('franchise-reports')
      .upload(filePath, new Blob([content], { type: 'text/html' }));
    
    if (error) {
      console.error('Error uploading report:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('franchise-reports')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  }
  
  /**
   * Log successful report generation
   */
  private static async logReportGeneration(
    reportType: string, 
    reportUrl: string, 
    dateFrom: string, 
    dateTo: string
  ): Promise<void> {
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('generated_reports').insert({
        report_type: reportType,
        report_name: `${reportType.replace('_', ' ')} Report`,
        file_url: reportUrl,
        date_from: dateFrom,
        date_to: dateTo,
        generated_by: user?.id,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error logging report generation:', error);
    }
  }
  
  /**
   * Log report generation error
   */
  private static async logReportError(
    reportType: string, 
    error: Error, 
    dateFrom: string, 
    dateTo: string
  ): Promise<void> {
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('generated_reports').insert({
        report_type: reportType,
        report_name: `${reportType.replace('_', ' ')} Report`,
        date_from: dateFrom,
        date_to: dateTo,
        generated_by: user?.id,
        status: 'failed',
        error_message: error.message
      });
    } catch (logError) {
      console.error('Error logging report error:', logError);
    }
  }
}
