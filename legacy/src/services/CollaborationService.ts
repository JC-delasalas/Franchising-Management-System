import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Collaboration Service Interfaces
export interface CollaborativeDocument {
  document_id: string;
  title: string;
  content: any; // JSON content (could be text, structured data, etc.)
  document_type: 'text' | 'spreadsheet' | 'form' | 'plan' | 'training';
  franchise_location_id: string;
  created_by: string;
  collaborators: Array<{
    user_id: string;
    user_name: string;
    permission: 'read' | 'comment' | 'edit' | 'admin';
    joined_at: string;
    last_active: string;
  }>;
  version: number;
  last_modified: string;
  last_modified_by: string;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
  metadata: {
    template_id?: string;
    category: string;
    tags: string[];
    sharing_settings: {
      public: boolean;
      franchise_wide: boolean;
      specific_users: string[];
    };
  };
}

export interface DocumentRevision {
  revision_id: string;
  document_id: string;
  version: number;
  content: any;
  changes: Array<{
    type: 'insert' | 'delete' | 'modify';
    position: number;
    content: any;
    user_id: string;
    timestamp: string;
  }>;
  created_by: string;
  created_at: string;
  comment?: string;
}

export interface ChatMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_type: 'text' | 'file' | 'system' | 'document_link';
  content: string;
  attachments?: Array<{
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
  }>;
  reply_to?: string;
  reactions: Array<{
    user_id: string;
    emoji: string;
    timestamp: string;
  }>;
  is_edited: boolean;
  edited_at?: string;
  sent_at: string;
  read_by: Array<{
    user_id: string;
    read_at: string;
  }>;
}

export interface Conversation {
  conversation_id: string;
  title: string;
  conversation_type: 'direct' | 'group' | 'franchise' | 'support';
  participants: Array<{
    user_id: string;
    user_name: string;
    role: string;
    joined_at: string;
    last_read: string;
  }>;
  franchise_location_id?: string;
  created_by: string;
  created_at: string;
  last_message?: ChatMessage;
  unread_count: number;
  is_archived: boolean;
  metadata: {
    description?: string;
    category: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    auto_archive_days?: number;
  };
}

export interface CollaborativePlan {
  plan_id: string;
  title: string;
  plan_type: 'inventory' | 'marketing' | 'training' | 'operations' | 'financial';
  franchise_location_id: string;
  content: {
    objectives: string[];
    tasks: Array<{
      task_id: string;
      title: string;
      description: string;
      assigned_to: string[];
      due_date: string;
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      priority: 'low' | 'medium' | 'high';
      dependencies: string[];
      comments: Array<{
        user_id: string;
        comment: string;
        timestamp: string;
      }>;
    }>;
    timeline: {
      start_date: string;
      end_date: string;
      milestones: Array<{
        milestone_id: string;
        title: string;
        date: string;
        status: 'upcoming' | 'completed' | 'overdue';
      }>;
    };
    resources: Array<{
      resource_id: string;
      name: string;
      type: 'budget' | 'personnel' | 'equipment' | 'material';
      quantity: number;
      cost: number;
      allocated_to: string[];
    }>;
  };
  collaborators: Array<{
    user_id: string;
    role: 'owner' | 'editor' | 'reviewer' | 'viewer';
    permissions: string[];
  }>;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SharedWorkspace {
  workspace_id: string;
  name: string;
  description: string;
  workspace_type: 'training' | 'onboarding' | 'project' | 'department';
  franchise_location_id: string;
  members: Array<{
    user_id: string;
    role: 'admin' | 'moderator' | 'member' | 'guest';
    joined_at: string;
    last_active: string;
  }>;
  resources: Array<{
    resource_id: string;
    name: string;
    type: 'document' | 'video' | 'quiz' | 'assignment' | 'discussion';
    url?: string;
    content?: any;
    created_by: string;
    created_at: string;
  }>;
  progress_tracking: {
    enabled: boolean;
    completion_criteria: any;
    member_progress: Array<{
      user_id: string;
      completion_percentage: number;
      last_activity: string;
      completed_resources: string[];
    }>;
  };
  settings: {
    is_public: boolean;
    allow_guest_access: boolean;
    moderation_enabled: boolean;
    auto_archive_inactive_days: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Collaboration Service for Real-time Collaboration Features
 * Provides document collaboration, messaging, planning tools, and shared workspaces
 */
export class CollaborationService {
  private static activeChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Create a new collaborative document
   */
  static async createDocument(
    title: string,
    documentType: 'text' | 'spreadsheet' | 'form' | 'plan' | 'training',
    franchiseLocationId: string,
    initialContent: any,
    userId: string,
    metadata?: any
  ): Promise<CollaborativeDocument> {
    try {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const document: CollaborativeDocument = {
        document_id: documentId,
        title,
        content: initialContent,
        document_type: documentType,
        franchise_location_id: franchiseLocationId,
        created_by: userId,
        collaborators: [{
          user_id: userId,
          user_name: 'Current User', // Would fetch actual name
          permission: 'admin',
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }],
        version: 1,
        last_modified: new Date().toISOString(),
        last_modified_by: userId,
        is_locked: false,
        metadata: {
          category: metadata?.category || 'general',
          tags: metadata?.tags || [],
          sharing_settings: {
            public: false,
            franchise_wide: false,
            specific_users: []
          }
        }
      };

      // Store document in database
      const { data, error } = await supabase
        .from('collaborative_documents')
        .insert(document)
        .select()
        .single();

      if (error) throw error;

      // Create initial revision
      await this.createDocumentRevision(documentId, 1, initialContent, [], userId);

      return data;
    } catch (error) {
      console.error('Error creating collaborative document:', error);
      throw new Error('Failed to create collaborative document');
    }
  }

  /**
   * Update document content with real-time collaboration
   */
  static async updateDocument(
    documentId: string,
    content: any,
    changes: any[],
    userId: string
  ): Promise<CollaborativeDocument> {
    try {
      // Get current document
      const { data: currentDoc, error: fetchError } = await supabase
        .from('collaborative_documents')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Check if document is locked by another user
      if (currentDoc.is_locked && currentDoc.locked_by !== userId) {
        throw new Error('Document is currently locked by another user');
      }

      const newVersion = currentDoc.version + 1;

      // Update document
      const { data, error } = await supabase
        .from('collaborative_documents')
        .update({
          content,
          version: newVersion,
          last_modified: new Date().toISOString(),
          last_modified_by: userId
        })
        .eq('document_id', documentId)
        .select()
        .single();

      if (error) throw error;

      // Create revision
      await this.createDocumentRevision(documentId, newVersion, content, changes, userId);

      // Broadcast changes to collaborators
      await this.broadcastDocumentChange(documentId, {
        type: 'content_update',
        content,
        changes,
        version: newVersion,
        user_id: userId,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Error updating collaborative document:', error);
      throw new Error('Failed to update collaborative document');
    }
  }

  /**
   * Send a chat message
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'file' | 'system' | 'document_link' = 'text',
    attachments?: any[],
    replyTo?: string
  ): Promise<ChatMessage> {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const message: ChatMessage = {
        message_id: messageId,
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: 'Current User', // Would fetch actual name
        message_type: messageType,
        content,
        attachments: attachments || [],
        reply_to: replyTo,
        reactions: [],
        is_edited: false,
        sent_at: new Date().toISOString(),
        read_by: [{
          user_id: senderId,
          read_at: new Date().toISOString()
        }]
      };

      // Store message in database
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message_id: messageId,
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      // Broadcast message to conversation participants
      await this.broadcastMessage(conversationId, data);

      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error('Failed to send chat message');
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(
    title: string,
    conversationType: 'direct' | 'group' | 'franchise' | 'support',
    participantIds: string[],
    createdBy: string,
    franchiseLocationId?: string,
    metadata?: any
  ): Promise<Conversation> {
    try {
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const conversation: Conversation = {
        conversation_id: conversationId,
        title,
        conversation_type: conversationType,
        participants: participantIds.map(id => ({
          user_id: id,
          user_name: `User ${id}`, // Would fetch actual names
          role: id === createdBy ? 'admin' : 'member',
          joined_at: new Date().toISOString(),
          last_read: new Date().toISOString()
        })),
        franchise_location_id: franchiseLocationId,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        unread_count: 0,
        is_archived: false,
        metadata: {
          category: metadata?.category || 'general',
          priority: metadata?.priority || 'normal',
          auto_archive_days: metadata?.auto_archive_days
        }
      };

      // Store conversation in database
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversation)
        .select()
        .single();

      if (error) throw error;

      // Create real-time channel for conversation
      await this.createConversationChannel(conversationId);

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Create a collaborative plan
   */
  static async createCollaborativePlan(
    title: string,
    planType: 'inventory' | 'marketing' | 'training' | 'operations' | 'financial',
    franchiseLocationId: string,
    content: any,
    createdBy: string
  ): Promise<CollaborativePlan> {
    try {
      const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const plan: CollaborativePlan = {
        plan_id: planId,
        title,
        plan_type: planType,
        franchise_location_id: franchiseLocationId,
        content: {
          objectives: content.objectives || [],
          tasks: content.tasks || [],
          timeline: content.timeline || {
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            milestones: []
          },
          resources: content.resources || []
        },
        collaborators: [{
          user_id: createdBy,
          role: 'owner',
          permissions: ['read', 'write', 'admin', 'delete']
        }],
        status: 'draft',
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store plan in database
      const { data, error } = await supabase
        .from('collaborative_plans')
        .insert(plan)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating collaborative plan:', error);
      throw new Error('Failed to create collaborative plan');
    }
  }

  /**
   * Create a shared workspace
   */
  static async createSharedWorkspace(
    name: string,
    description: string,
    workspaceType: 'training' | 'onboarding' | 'project' | 'department',
    franchiseLocationId: string,
    createdBy: string,
    settings?: any
  ): Promise<SharedWorkspace> {
    try {
      const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const workspace: SharedWorkspace = {
        workspace_id: workspaceId,
        name,
        description,
        workspace_type: workspaceType,
        franchise_location_id: franchiseLocationId,
        members: [{
          user_id: createdBy,
          role: 'admin',
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }],
        resources: [],
        progress_tracking: {
          enabled: settings?.progress_tracking || false,
          completion_criteria: {},
          member_progress: []
        },
        settings: {
          is_public: settings?.is_public || false,
          allow_guest_access: settings?.allow_guest_access || false,
          moderation_enabled: settings?.moderation_enabled || true,
          auto_archive_inactive_days: settings?.auto_archive_inactive_days || 90
        },
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store workspace in database
      const { data, error } = await supabase
        .from('shared_workspaces')
        .insert(workspace)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating shared workspace:', error);
      throw new Error('Failed to create shared workspace');
    }
  }

  /**
   * Subscribe to real-time document changes
   */
  static subscribeToDocument(
    documentId: string,
    onUpdate: (update: any) => void,
    onUserJoin: (user: any) => void,
    onUserLeave: (user: any) => void
  ): RealtimeChannel {
    const channelName = `document:${documentId}`;

    if (this.activeChannels.has(channelName)) {
      return this.activeChannels.get(channelName)!;
    }

    const channel = supabase.channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'collaborative_documents',
        filter: `document_id=eq.${documentId}`
      }, onUpdate)
      .on('broadcast', { event: 'user_join' }, onUserJoin)
      .on('broadcast', { event: 'user_leave' }, onUserLeave)
      .subscribe();

    this.activeChannels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to real-time conversation messages
   */
  static subscribeToConversation(
    conversationId: string,
    onMessage: (message: ChatMessage) => void,
    onTyping: (typing: any) => void
  ): RealtimeChannel {
    const channelName = `conversation:${conversationId}`;

    if (this.activeChannels.has(channelName)) {
      return this.activeChannels.get(channelName)!;
    }

    const channel = supabase.channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => onMessage(payload.new as ChatMessage))
      .on('broadcast', { event: 'typing' }, onTyping)
      .subscribe();

    this.activeChannels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from real-time updates
   */
  static unsubscribe(channelName: string): void {
    const channel = this.activeChannels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.activeChannels.delete(channelName);
    }
  }

  // Private helper methods
  private static async createDocumentRevision(
    documentId: string,
    version: number,
    content: any,
    changes: any[],
    userId: string,
    comment?: string
  ): Promise<DocumentRevision> {
    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const revision: DocumentRevision = {
      revision_id: revisionId,
      document_id: documentId,
      version,
      content,
      changes,
      created_by: userId,
      created_at: new Date().toISOString(),
      comment
    };

    const { data, error } = await supabase
      .from('document_revisions')
      .insert(revision)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private static async broadcastDocumentChange(documentId: string, change: any): Promise<void> {
    const channelName = `document:${documentId}`;
    const channel = this.activeChannels.get(channelName);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'document_change',
        payload: change
      });
    }
  }

  private static async broadcastMessage(conversationId: string, message: ChatMessage): Promise<void> {
    const channelName = `conversation:${conversationId}`;
    const channel = this.activeChannels.get(channelName);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: message
      });
    }
  }

  private static async createConversationChannel(conversationId: string): Promise<void> {
    // Initialize real-time channel for the conversation
    const channelName = `conversation:${conversationId}`;
    const channel = supabase.channel(channelName);
    this.activeChannels.set(channelName, channel);
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          chat_messages!inner(*)
        `)
        .contains('participants', [{ user_id: userId }])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw new Error('Failed to get user conversations');
    }
  }

  /**
   * Get conversation messages
   */
  static async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw new Error('Failed to get conversation messages');
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    conversationId: string,
    userId: string,
    messageIds: string[]
  ): Promise<void> {
    try {
      // Update read status for messages
      const { error } = await supabase
        .from('chat_messages')
        .update({
          read_by: supabase.sql`read_by || ${JSON.stringify([{
            user_id: userId,
            read_at: new Date().toISOString()
          }])}`
        })
        .eq('conversation_id', conversationId)
        .in('message_id', messageIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  /**
   * Add collaborator to document
   */
  static async addDocumentCollaborator(
    documentId: string,
    userId: string,
    permission: 'read' | 'comment' | 'edit' | 'admin',
    addedBy: string
  ): Promise<void> {
    try {
      // Get current document
      const { data: document, error: fetchError } = await supabase
        .from('collaborative_documents')
        .select('collaborators')
        .eq('document_id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Add new collaborator
      const updatedCollaborators = [
        ...document.collaborators,
        {
          user_id: userId,
          user_name: `User ${userId}`, // Would fetch actual name
          permission,
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
      ];

      // Update document
      const { error } = await supabase
        .from('collaborative_documents')
        .update({ collaborators: updatedCollaborators })
        .eq('document_id', documentId);

      if (error) throw error;

      // Broadcast user join event
      await this.broadcastDocumentChange(documentId, {
        type: 'user_join',
        user_id: userId,
        permission,
        added_by: addedBy,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding document collaborator:', error);
      throw new Error('Failed to add document collaborator');
    }
  }

  /**
   * Update plan task status
   */
  static async updatePlanTask(
    planId: string,
    taskId: string,
    updates: any,
    userId: string
  ): Promise<void> {
    try {
      // Get current plan
      const { data: plan, error: fetchError } = await supabase
        .from('collaborative_plans')
        .select('content')
        .eq('plan_id', planId)
        .single();

      if (fetchError) throw fetchError;

      // Update task
      const updatedContent = {
        ...plan.content,
        tasks: plan.content.tasks.map((task: any) =>
          task.task_id === taskId ? { ...task, ...updates } : task
        )
      };

      // Update plan
      const { error } = await supabase
        .from('collaborative_plans')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', planId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating plan task:', error);
      throw new Error('Failed to update plan task');
    }
  }

  /**
   * Add resource to workspace
   */
  static async addWorkspaceResource(
    workspaceId: string,
    resource: {
      name: string;
      type: 'document' | 'video' | 'quiz' | 'assignment' | 'discussion';
      url?: string;
      content?: any;
    },
    userId: string
  ): Promise<void> {
    try {
      const resourceId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get current workspace
      const { data: workspace, error: fetchError } = await supabase
        .from('shared_workspaces')
        .select('resources')
        .eq('workspace_id', workspaceId)
        .single();

      if (fetchError) throw fetchError;

      // Add new resource
      const updatedResources = [
        ...workspace.resources,
        {
          resource_id: resourceId,
          ...resource,
          created_by: userId,
          created_at: new Date().toISOString()
        }
      ];

      // Update workspace
      const { error } = await supabase
        .from('shared_workspaces')
        .update({
          resources: updatedResources,
          updated_at: new Date().toISOString()
        })
        .eq('workspace_id', workspaceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding workspace resource:', error);
      throw new Error('Failed to add workspace resource');
    }
  }
}