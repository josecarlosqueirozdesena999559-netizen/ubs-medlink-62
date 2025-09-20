import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UBS } from '@/types/database';

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  ubsId: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userUBSAssignments, setUserUBSAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchUserUBSAssignments();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUBSAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ubs')
        .select(`
          *,
          profiles!inner(email, full_name),
          ubs!inner(name)
        `);

      if (error) throw error;
      setUserUBSAssignments(data || []);
    } catch (err: any) {
      console.error('Error fetching user UBS assignments:', err);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    try {
      // Call Supabase edge function to create user (admin operation)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          ubsId: userData.ubsId
        }
      });

      if (error) throw error;

      // Refresh data
      await fetchUsers();
      await fetchUserUBSAssignments();

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Call edge function to delete user (admin operation)
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;

      // Refresh data
      await fetchUsers();
      await fetchUserUBSAssignments();

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const unlinkUserFromUBS = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_ubs')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh data
      await fetchUserUBSAssignments();

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteUBS = async (ubsId: string) => {
    try {
      // First unlink all users from this UBS
      await supabase
        .from('user_ubs')
        .delete()
        .eq('ubs_id', ubsId);

      // Delete all documents for this UBS
      await supabase
        .from('documents')
        .delete()
        .eq('ubs_id', ubsId);

      // Finally delete the UBS
      const { error } = await supabase
        .from('ubs')
        .delete()
        .eq('id', ubsId);

      if (error) throw error;

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    users,
    userUBSAssignments,
    loading,
    error,
    createUser,
    deleteUser,
    unlinkUserFromUBS,
    deleteUBS,
    refreshUsers: fetchUsers,
    refreshAssignments: fetchUserUBSAssignments
  };
};