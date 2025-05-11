
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader, User } from 'lucide-react';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MemberDetailView } from '../components/MemberDetailView';
import { MembersTable } from '../components/members/MembersTable';
import { MembersEmptyState } from '../components/members/MembersEmptyState';
import { 
  fetchMembers, 
  resetPassword, 
  sendUsername, 
  formatDate 
} from '../services/memberService';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  request_count: number;
  last_active: string;
}

export function MembersManagementPage() {
  // Role guard to ensure only master admins can access this page
  const { isAllowed, loading } = useRoleGuard({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Fetch members data
  const { data: members = [], isLoading, error, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
    enabled: isAllowed
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Laster...</span>
      </div>
    );
  }
  
  if (!isAllowed) {
    return null; // Will be redirected by the useRoleGuard hook
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Brukeradministrasjon - Medlemmer</h1>
      <AdminNavigation />
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="ml-2">Laster medlemmer...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md my-6">
          <p>Feil ved lasting av medlemmer. Prøv igjen senere.</p>
        </div>
      ) : (
        <>
          {members.length > 0 ? (
            <MembersTable
              members={members}
              onSelectMember={setSelectedMember}
              handleResetPassword={resetPassword}
              handleSendUsername={sendUsername}
              formatDate={formatDate}
            />
          ) : (
            <MembersEmptyState />
          )}
        </>
      )}
      
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Medlemdetaljer</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <MemberDetailView 
              member={selectedMember} 
              onClose={() => setSelectedMember(null)}
              onUpdate={refetch}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
