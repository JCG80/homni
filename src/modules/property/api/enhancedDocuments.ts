import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  is_required: boolean;
  sort_order: number;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  name: string;
  description?: string;
  document_type: string;
  category_id?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  thumbnail_path?: string;
  tags?: string[];
  is_public: boolean;
  expires_at?: string;
  metadata?: any;
  current_version: number;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
}

export interface MaintenanceTask {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'interior' | 'garden' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  due_date?: string;
  completed_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  recurring_frequency?: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  created_at: string;
  updated_at: string;
}

/**
 * Enhanced Property Documentation Service
 * Boligmappa.no style document management with advanced features
 */
export class EnhancedPropertyDocumentService {
  /**
   * Get all document categories
   */
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document categories:', error);
      return [];
    }
  }

  /**
   * Get property documents with enhanced features
   */
  async getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]> {
    try {
      const { data, error } = await supabase
        .from('property_documents')
        .select(`
          *,
          category:document_categories(*)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching property documents:', error);
      toast.error('Kunne ikke hente dokumenter');
      return [];
    }
  }

  /**
   * Upload and create document with file handling
   */
  async uploadDocument(
    propertyId: string,
    file: File,
    documentData: {
      name: string;
      description?: string;
      category_id?: string;
      tags?: string[];
      is_public?: boolean;
      expires_at?: string;
    }
  ): Promise<PropertyDocument | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${propertyId}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('property_documents')
        .insert({
          property_id: propertyId,
          name: documentData.name,
          description: documentData.description,
          document_type: documentData.category_id ? 'categorized' : 'general',
          category_id: documentData.category_id,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          tags: documentData.tags || [],
          is_public: documentData.is_public || false,
          expires_at: documentData.expires_at,
          metadata: {
            original_filename: file.name,
            uploaded_by: user.id,
            upload_date: new Date().toISOString()
          },
          current_version: 1
        })
        .select(`
          *,
          category:document_categories(*)
        `)
        .single();

      if (docError) throw docError;

      // Create initial version record
      await supabase.from('property_document_versions').insert({
        document_id: docData.id,
        version_number: 1,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
        upload_metadata: {
          original_filename: file.name,
          upload_method: 'web_upload'
        }
      });

      toast.success('Dokument lastet opp');
      return docData;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Kunne ikke laste opp dokument');
      return null;
    }
  }

  /**
   * Get document download URL
   */
  async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('property-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  }

  /**
   * Delete document and file
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get document to find file path
      const { data: doc, error: fetchError } = await supabase
        .from('property_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete file from storage
      if (doc.file_path) {
        await supabase.storage
          .from('property-documents')
          .remove([doc.file_path]);
      }

      // Delete document record (versions will cascade)
      const { error: deleteError } = await supabase
        .from('property_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      toast.success('Dokument slettet');
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Kunne ikke slette dokument');
      return false;
    }
  }

  /**
   * Get maintenance tasks for property
   */
  async getMaintenanceTasks(propertyId: string): Promise<MaintenanceTask[]> {
    try {
      const { data, error } = await supabase
        .from('property_maintenance_tasks')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(task => ({
        ...task,
        category: task.category as MaintenanceTask['category']
      })) as MaintenanceTask[];
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      return [];
    }
  }

  /**
   * Create maintenance task
   */
  async createMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceTask | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_maintenance_tasks')
        .insert({
          ...task,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      const normalized = data
        ? ({ ...data, category: data.category as MaintenanceTask['category'] } as MaintenanceTask)
        : null;
      toast.success('Vedlikeholdsoppgave opprettet');
      return normalized;
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      toast.error('Kunne ikke opprette vedlikeholdsoppgave');
      return null;
    }
  }

  /**
   * Update maintenance task
   */
  async updateMaintenanceTask(taskId: string, updates: Partial<MaintenanceTask>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('property_maintenance_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Vedlikeholdsoppgave oppdatert');
      return true;
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      toast.error('Kunne ikke oppdatere vedlikeholdsoppgave');
      return false;
    }
  }

  /**
   * Generate property documentation report
   */
  async generateDocumentationReport(propertyId: string): Promise<any> {
    try {
      const [documents, tasks, categories] = await Promise.all([
        this.getPropertyDocuments(propertyId),
        this.getMaintenanceTasks(propertyId),
        this.getDocumentCategories()
      ]);

      // Calculate documentation completeness score
      const requiredCategories = categories.filter(cat => cat.is_required);
      const documentedCategories = new Set(
        documents.filter(doc => doc.category_id).map(doc => doc.category_id)
      );
      const completenessScore = requiredCategories.length > 0 
        ? (requiredCategories.filter(cat => documentedCategories.has(cat.id)).length / requiredCategories.length) * 100
        : 0;

      // Calculate maintenance score
      const recentTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
        return taskDate > sixMonthsAgo;
      });
      const maintenanceScore = Math.min((recentTasks.length / 4) * 100, 100);

      return {
        property_id: propertyId,
        total_documents: documents.length,
        documentation_completeness: Math.round(completenessScore),
        maintenance_score: Math.round(maintenanceScore),
        categories_covered: documentedCategories.size,
        total_categories: categories.length,
        recent_maintenance_tasks: recentTasks.length,
        missing_required_documents: requiredCategories
          .filter(cat => !documentedCategories.has(cat.id))
          .map(cat => cat.name),
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating documentation report:', error);
      return null;
    }
  }

  /**
   * Search documents with advanced filtering
   */
  async searchDocuments(propertyId: string, filters: {
    query?: string;
    category_id?: string;
    tags?: string[];
    date_range?: { from: string; to: string };
  }): Promise<PropertyDocument[]> {
    try {
      let query = supabase
        .from('property_documents')
        .select(`
          *,
          category:document_categories(*)
        `)
        .eq('property_id', propertyId);

      // Apply filters
      if (filters.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.from)
          .lte('created_at', filters.date_range.to);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}

export const enhancedPropertyDocumentService = new EnhancedPropertyDocumentService();