import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  CollaborationService,
  CollaborativeDocument,
  ChatMessage,
  Conversation,
  CollaborativePlan,
  SharedWorkspace
} from '@/services/CollaborationService';

/**
 * React Query hooks for Collaboration features
 * Provides document collaboration, messaging, planning tools, and shared workspaces
 */

export function useCollaboration(franchiseLocationId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // User's Collaborative Documents
  const {
    data: collaborativeDocuments,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['collaborative-documents', franchiseLocationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborative_documents')
        .select('*')
        .eq('franchise_location_id', franchiseLocationId!)
        .order('last_modified', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    onError: (error: any) => {
      toast({
        title: "Documents Loading Error",
        description: error.message || "Failed to load collaborative documents",
        variant: "destructive",
      });
    }
  });

  // User's Conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => CollaborationService.getUserConversations(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error: any) => {
      toast({
        title: "Conversations Loading Error",
        description: error.message || "Failed to load conversations",
        variant: "destructive",
      });
    }
  });

  // Collaborative Plans
  const {
    data: collaborativePlans,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: ['collaborative-plans', franchiseLocationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborative_plans')
        .select('*')
        .eq('franchise_location_id', franchiseLocationId!)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    onError: (error: any) => {
      toast({
        title: "Plans Loading Error",
        description: error.message || "Failed to load collaborative plans",
        variant: "destructive",
      });
    }
  });

  // Shared Workspaces
  const {
    data: sharedWorkspaces,
    isLoading: isLoadingWorkspaces,
    error: workspacesError,
    refetch: refetchWorkspaces
  } = useQuery({
    queryKey: ['shared-workspaces', franchiseLocationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_workspaces')
        .select('*')
        .eq('franchise_location_id', franchiseLocationId!)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    onError: (error: any) => {
      toast({
        title: "Workspaces Loading Error",
        description: error.message || "Failed to load shared workspaces",
        variant: "destructive",
      });
    }
  });

  // Create Document Mutation
  const createDocumentMutation = useMutation({
    mutationFn: ({ title, documentType, initialContent, metadata }: {
      title: string;
      documentType: 'text' | 'spreadsheet' | 'form' | 'plan' | 'training';
      initialContent: any;
      metadata?: any;
    }) => CollaborationService.createDocument(
      title, documentType, franchiseLocationId!, initialContent, user!.id, metadata
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['collaborative-documents', franchiseLocationId]);
      toast({
        title: "Document Created",
        description: `Successfully created document: ${data.title}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Document Creation Failed",
        description: error.message || "Failed to create collaborative document",
        variant: "destructive",
      });
    }
  });

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content, messageType, attachments, replyTo }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'file' | 'system' | 'document_link';
      attachments?: any[];
      replyTo?: string;
    }) => CollaborationService.sendMessage(
      conversationId, user!.id, content, messageType, attachments, replyTo
    ),
    onSuccess: (data) => {
      // Message will be updated via real-time subscription
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Message Send Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Create Conversation Mutation
  const createConversationMutation = useMutation({
    mutationFn: ({ title, conversationType, participantIds, metadata }: {
      title: string;
      conversationType: 'direct' | 'group' | 'franchise' | 'support';
      participantIds: string[];
      metadata?: any;
    }) => CollaborationService.createConversation(
      title, conversationType, participantIds, user!.id, franchiseLocationId, metadata
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['conversations', user?.id]);
      toast({
        title: "Conversation Created",
        description: `Successfully created conversation: ${data.title}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Conversation Creation Failed",
        description: error.message || "Failed to create conversation",
        variant: "destructive",
      });
    }
  });

  // Create Plan Mutation
  const createPlanMutation = useMutation({
    mutationFn: ({ title, planType, content }: {
      title: string;
      planType: 'inventory' | 'marketing' | 'training' | 'operations' | 'financial';
      content: any;
    }) => CollaborationService.createCollaborativePlan(
      title, planType, franchiseLocationId!, content, user!.id
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['collaborative-plans', franchiseLocationId]);
      toast({
        title: "Plan Created",
        description: `Successfully created plan: ${data.title}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Plan Creation Failed",
        description: error.message || "Failed to create collaborative plan",
        variant: "destructive",
      });
    }
  });

  // Create Workspace Mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: ({ name, description, workspaceType, settings }: {
      name: string;
      description: string;
      workspaceType: 'training' | 'onboarding' | 'project' | 'department';
      settings?: any;
    }) => CollaborationService.createSharedWorkspace(
      name, description, workspaceType, franchiseLocationId!, user!.id, settings
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['shared-workspaces', franchiseLocationId]);
      toast({
        title: "Workspace Created",
        description: `Successfully created workspace: ${data.name}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Workspace Creation Failed",
        description: error.message || "Failed to create shared workspace",
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    collaborativeDocuments,
    conversations,
    collaborativePlans,
    sharedWorkspaces,

    // Loading states
    isLoadingDocuments,
    isLoadingConversations,
    isLoadingPlans,
    isLoadingWorkspaces,

    // Errors
    documentsError,
    conversationsError,
    plansError,
    workspacesError,

    // Refetch functions
    refetchDocuments,
    refetchConversations,
    refetchPlans,
    refetchWorkspaces,

    // Mutations
    createDocument: createDocumentMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    createPlan: createPlanMutation.mutate,
    createWorkspace: createWorkspaceMutation.mutate,

    // Mutation states
    isCreatingDocument: createDocumentMutation.isLoading,
    isSendingMessage: sendMessageMutation.isLoading,
    isCreatingConversation: createConversationMutation.isLoading,
    isCreatingPlan: createPlanMutation.isLoading,
    isCreatingWorkspace: createWorkspaceMutation.isLoading,

    // Utility functions
    refreshAllCollaboration: () => {
      refetchDocuments();
      refetchConversations();
      refetchPlans();
      refetchWorkspaces();
    }
  };
}