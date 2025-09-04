
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Search, Filter, Eye, Edit, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsManagement } from '@/components/admin/LeadsManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';

export const AdminLeadsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Administrer leads og selskaper i systemet
        </p>
      </div>
      
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">Leads Management</TabsTrigger>
          <TabsTrigger value="companies">Selskaper</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="mt-6">
          <LeadsManagement />
        </TabsContent>
        
        <TabsContent value="companies" className="mt-6">
          <CompanyManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLeadsPage;
