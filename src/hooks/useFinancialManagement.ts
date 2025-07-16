import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useRealTimeSubscription } from './useRealTimeData';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';
import { FinancialManagementService } from '@/services/FinancialManagementService';
import { PaymentGatewayService } from '@/services/PaymentGatewayService';

interface FinancialFilters {
  period_start?: string;
  period_end?: string;
  transaction_type?: string;
  status?: string;
}

export const useFinancialManagement = (filters: FinancialFilters = {}) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const franchiseId = user?.metadata?.primary_location_id || user?.id;

  // Get financial dashboard data
  const { data: financialDashboard, isLoading, error } = useQuery({
    queryKey: ['financial-dashboard', franchiseId, filters],
    queryFn: async () => {
      if (!franchiseId) throw new Error('Franchise ID required');
      return FinancialManagementService.getFinancialDashboard(franchiseId);
    },
    enabled: !!franchiseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Get recurring billings
  const { data: recurringBillings, isLoading: billingsLoading } = useQuery({
    queryKey: ['recurring-billings', franchiseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_billing')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('next_billing_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!franchiseId,
    staleTime: 5 * 60 * 1000,
  });

  // Get payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  // Get financial transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', franchiseId, filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('created_at', { ascending: false });

      if (filters.period_start) {
        query = query.gte('created_at', filters.period_start);
      }

      if (filters.period_end) {
        query = query.lte('created_at', filters.period_end);
      }

      if (filters.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!franchiseId,
    staleTime: 60 * 1000,
  });

  // Create recurring billing
  const createRecurringBillingMutation = useMutation({
    mutationFn: async (billingData: Omit<RecurringBilling, 'id' | 'created_at' | 'updated_at'>) => {
      return FinancialManagementService.createRecurringBilling({
        ...billingData,
        franchise_id: franchiseId
      });
    },
    onSuccess: () => {
      toast({
        title: "Recurring Billing Created",
        description: "Recurring billing has been set up successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['recurring-billings'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Billing",
        description: error.message || "Failed to create recurring billing",
        variant: "destructive",
      });
    }
  });

  // Add payment method
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodData: any) => {
      return FinancialManagementService.addPaymentMethod(user!.id, paymentMethodData);
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Added",
        description: "Payment method has been added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Payment Method",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    }
  });

  // Process manual payment
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      amount: number;
      currency: string;
      payment_method_id: string;
      description: string;
      metadata?: any;
    }) => {
      const paymentGateway = new PaymentGatewayService();
      return paymentGateway.processPayment(paymentData);
    },
    onSuccess: (result) => {
      if (result.status === 'completed') {
        toast({
          title: "Payment Successful",
          description: `Payment of ₱${result.amount.toLocaleString()} completed successfully`,
        });
      } else {
        toast({
          title: "Payment Pending",
          description: "Payment is being processed",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      });
    }
  });

  // Generate financial report
  const generateReportMutation = useMutation({
    mutationFn: async ({ periodStart, periodEnd }: { periodStart: string; periodEnd: string }) => {
      return FinancialManagementService.generateFinancialReport(franchiseId, periodStart, periodEnd);
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Financial report has been generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Report Generation Failed",
        description: error.message || "Failed to generate financial report",
        variant: "destructive",
      });
    }
  });

  // Real-time subscription for financial updates
  const { isConnected: isRealTimeConnected } = useRealTimeSubscription([
    {
      table: 'financial_transactions',
      filter: `franchise_id=eq.${franchiseId}`,
      callback: (payload) => {
        queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
        
        if (payload.eventType === 'INSERT') {
          const transaction = payload.new;
          toast({
            title: "New Transaction",
            description: `${transaction.transaction_type} of ₱${transaction.amount.toLocaleString()}`,
            duration: 5000,
          });
        }
      }
    },
    {
      table: 'recurring_billing',
      filter: `franchise_id=eq.${franchiseId}`,
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ['recurring-billings'] });
      }
    }
  ], { enabled: !!franchiseId });

  // Calculate financial metrics
  const financialMetrics = {
    totalRevenue: financialDashboard?.financial_report?.revenue?.total_revenue || 0,
    totalExpenses: financialDashboard?.financial_report?.expenses?.total_expenses || 0,
    netProfit: financialDashboard?.financial_report?.profit_loss?.net_profit || 0,
    profitMargin: financialDashboard?.financial_report?.profit_loss?.profit_margin || 0,
    cashFlow: financialDashboard?.financial_report?.cash_flow?.net_cash_flow || 0,
    upcomingBillingsCount: financialDashboard?.upcoming_billings?.length || 0,
    upcomingBillingsAmount: financialDashboard?.upcoming_billings?.reduce((sum: number, billing: any) => sum + billing.amount, 0) || 0,
    recentTransactionsCount: financialDashboard?.recent_transactions?.length || 0,
    pendingTransactions: transactions?.filter(t => t.status === 'pending').length || 0,
    failedTransactions: transactions?.filter(t => t.status === 'failed').length || 0
  };

  return {
    financialDashboard,
    recurringBillings,
    paymentMethods,
    transactions,
    financialMetrics,
    isLoading,
    billingsLoading,
    paymentMethodsLoading,
    transactionsLoading,
    error,
    isRealTimeConnected,
    createRecurringBilling: createRecurringBillingMutation.mutate,
    addPaymentMethod: addPaymentMethodMutation.mutate,
    processPayment: processPaymentMutation.mutate,
    generateReport: generateReportMutation.mutate,
    isCreatingBilling: createRecurringBillingMutation.isPending,
    isAddingPaymentMethod: addPaymentMethodMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    isGeneratingReport: generateReportMutation.isPending,
    reportData: generateReportMutation.data
  };
};

// Hook for currency conversion
export const useCurrencyConversion = () => {
  const convertCurrencyMutation = useMutation({
    mutationFn: async ({ amount, fromCurrency, toCurrency }: {
      amount: number;
      fromCurrency: string;
      toCurrency: string;
    }) => {
      return FinancialManagementService.convertCurrency(amount, fromCurrency, toCurrency);
    }
  });

  return {
    convertCurrency: convertCurrencyMutation.mutate,
    convertedAmount: convertCurrencyMutation.data,
    isConverting: convertCurrencyMutation.isPending,
    conversionError: convertCurrencyMutation.error
  };
};

// Hook for payment processing
export const usePaymentProcessing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processRefundMutation = useMutation({
    mutationFn: async ({ transactionId, amount, reason }: {
      transactionId: string;
      amount?: number;
      reason?: string;
    }) => {
      const paymentGateway = new PaymentGatewayService();
      return paymentGateway.processRefund({ transaction_id: transactionId, amount, reason });
    },
    onSuccess: (result) => {
      toast({
        title: "Refund Processed",
        description: `Refund of ₱${Math.abs(result.amount).toLocaleString()} processed successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    }
  });

  return {
    processRefund: processRefundMutation.mutate,
    isProcessingRefund: processRefundMutation.isPending,
    refundResult: processRefundMutation.data
  };
};

// Hook for franchisor financial overview
export const useFranchisorFinancials = () => {
  const { user } = useAuth();

  const { data: networkFinancials, isLoading } = useQuery({
    queryKey: ['network-financials', user?.id],
    queryFn: async () => {
      // Get all franchises for this franchisor
      const { data: franchises } = await supabase
        .from('franchises')
        .select('id, name')
        .eq('franchisor_id', user!.id);

      if (!franchises) return null;

      // Get financial data for all franchises
      const financialData = await Promise.all(
        franchises.map(async (franchise) => {
          const dashboard = await FinancialManagementService.getFinancialDashboard(franchise.id);
          return {
            franchise_id: franchise.id,
            franchise_name: franchise.name,
            ...dashboard
          };
        })
      );

      // Aggregate network totals
      const networkTotals = financialData.reduce((totals, franchise) => {
        const report = franchise.financial_report;
        return {
          total_revenue: totals.total_revenue + (report?.revenue?.total_revenue || 0),
          total_expenses: totals.total_expenses + (report?.expenses?.total_expenses || 0),
          total_profit: totals.total_profit + (report?.profit_loss?.net_profit || 0),
          total_royalties: totals.total_royalties + (report?.fees?.royalty_fees || 0),
          total_marketing_fees: totals.total_marketing_fees + (report?.fees?.marketing_fees || 0)
        };
      }, {
        total_revenue: 0,
        total_expenses: 0,
        total_profit: 0,
        total_royalties: 0,
        total_marketing_fees: 0
      });

      return {
        franchise_data: financialData,
        network_totals: networkTotals
      };
    },
    enabled: !!user && user.role === 'franchisor',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  return {
    networkFinancials,
    isLoading,
    totalRevenue: networkFinancials?.network_totals?.total_revenue || 0,
    totalRoyalties: networkFinancials?.network_totals?.total_royalties || 0,
    totalMarketingFees: networkFinancials?.network_totals?.total_marketing_fees || 0,
    totalProfit: networkFinancials?.network_totals?.total_profit || 0,
    franchiseCount: networkFinancials?.franchise_data?.length || 0
  };
};
