import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UBS, Document, UBSWithDocuments } from '@/types/database';

export const useUBS = () => {
  const [ubsList, setUbsList] = useState<UBSWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUBS();
  }, []);

  const fetchUBS = async () => {
    try {
      setLoading(true);
      
      // Fetch UBS data with documents
      const { data: ubsData, error: ubsError } = await supabase
        .from('ubs')
        .select(`
          *,
          documents:documents(*)
        `)
        .eq('active', true)
        .order('name');

      if (ubsError) {
        throw ubsError;
      }

      setUbsList(ubsData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching UBS:', err);
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const createUBS = async (ubsData: Omit<UBS, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ubs')
        .insert([{ ...ubsData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      await fetchUBS(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error creating UBS:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error creating UBS' };
    }
  };

  const updateUBS = async (id: string, ubsData: Partial<UBS>) => {
    try {
      const { data, error } = await supabase
        .from('ubs')
        .update(ubsData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchUBS(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error updating UBS:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error updating UBS' };
    }
  };

  return {
    ubsList,
    loading,
    error,
    fetchUBS,
    createUBS,
    updateUBS
  };
};

export const useDocuments = (ubsId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ubsId) {
      fetchDocuments(ubsId);
    }
  }, [ubsId]);

  const fetchDocuments = async (ubsId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('ubs_id', ubsId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Error fetching documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, ubsId: string, title: string, description?: string) => {
    try {
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${ubsId}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save document metadata
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          title,
          description,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          ubs_id: ubsId,
          uploaded_by: user.id,
          public_url: publicUrlData.publicUrl
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchDocuments(ubsId); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error uploading document:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error uploading document' };
    }
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument
  };
};