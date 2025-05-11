
import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { CompanyDetailView } from '../components/CompanyDetailView';
import { CompanyProfile } from '../types/types';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompaniesLoading } from '../components/companies/CompaniesLoading';
import { CompaniesError } from '../components/companies/CompaniesError';
import { useCompanies } from '../hooks/useCompanies';

export default function CompaniesManagementPage() {
  // Role guard to ensure only master admins can access this page
  const { isAllowed, loading } = useRoleGuard({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });

  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  
  // Fetch companies data
  const { data: companies = [], isLoading, error, refetch } = useCompanies();
  
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
      <h1 className="text-3xl font-bold mb-6">Brukeradministrasjon - Bedrifter</h1>
      <AdminNavigation />
      
      {isLoading ? (
        <CompaniesLoading />
      ) : error ? (
        <CompaniesError />
      ) : (
        <CompaniesTable 
          companies={companies} 
          onSelectCompany={setSelectedCompany}
        />
      )}
      
      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bedriftsdetaljer</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <CompanyDetailView 
              company={selectedCompany} 
              onClose={() => setSelectedCompany(null)}
              onUpdate={refetch}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
