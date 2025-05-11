import { supabase } from '@/integrations/supabase/client';

interface UserProfileData {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  accounts?: {
    email?: string;
    last_sign_in_at?: string;
  };
}

export const fetchMembers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, accounts:auth.users!inner(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;

  // Process and transform the data
  return (data as unknown as UserProfileData[]).map(profile => ({
    id: profile.id,
    full_name: profile.full_name || 'N/A',
    email: profile.email || profile.accounts?.email || 'N/A',
    phone: profile.phone || 'N/A',
    lastLogin: profile.accounts?.last_sign_in_at ? new Date(profile.accounts.last_sign_in_at).toLocaleDateString() : 'N/A',
    joined: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'
  }));
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast({
      title: 'Tilbakestilling av passord',
      description: 'E-post for tilbakestilling av passord er sendt.',
    });
  } catch (error) {
    console.error('Failed to send password reset:', error);
    toast({
      title: 'Feil',
      description: 'Kunne ikke sende e-post for tilbakestilling av passord.',
      variant: 'destructive',
    });
  }
};

export const sendUsername = async (email: string): Promise<void> => {
  try {
    // In a real implementation, you would send an email with the username
    // For now, we'll just show a toast notification
    
    toast({
      title: 'Brukernavn sendt',
      description: `En e-post med brukernavnet er sendt til ${email}.`,
    });
  } catch (error) {
    console.error('Failed to send username:', error);
    toast({
      title: 'Feil',
      description: 'Kunne ikke sende e-post med brukernavn.',
      variant: 'destructive',
    });
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'Ukjent') return 'Ukjent';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Ugyldig dato';
  }
};
