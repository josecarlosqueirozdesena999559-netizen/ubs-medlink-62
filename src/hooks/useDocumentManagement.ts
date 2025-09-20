import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/database';

export const useDocumentManagement = (ubsId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ubsId) {
      fetchDocuments();
    }
  }, [ubsId]);

  const fetchDocuments = async () => {
    if (!ubsId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('ubs_id', ubsId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, title: string, description?: string) => {
    if (!ubsId) return { error: 'UBS ID is required' };

    setUploading(true);
    try {
      // Check if UBS already has an active document
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('ubs_id', ubsId)
        .eq('active', true);

      if (existingDocs && existingDocs.length > 0) {
        return { error: 'Esta UBS já possui um documento ativo. Exclua o documento atual antes de enviar um novo.' };
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          title,
          description,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          ubs_id: ubsId,
          uploaded_by: user.id,
          public_url: publicUrl,
          active: true
        });

      if (insertError) throw insertError;

      // Refresh documents
      await fetchDocuments();
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      // Refresh documents
      await fetchDocuments();
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const getActiveDocument = () => {
    return documents.find(doc => doc.active) || null;
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    getActiveDocument,
    refreshDocuments: fetchDocuments
  };
};