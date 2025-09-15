import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, History, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target_user: string;
  role: string;
  created_at: string;
  old_values: any;
  new_values: any;
  actor_name?: string;
  target_name?: string;
}

export const RoleHistoryViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Fetch role audit log
  const { data: auditLog, isLoading, refetch } = useQuery({
    queryKey: ['role-audit-log', searchTerm, actionFilter, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('role_audit_log')
        .select(`
          id,
          actor,
          action,
          target_user,
          role,
          created_at,
          old_values,
          new_values
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user names for actor and target
      const userIds = [...new Set([
        ...data.map(entry => entry.actor),
        ...data.map(entry => entry.target_user)
      ].filter(Boolean))];

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map(entry => ({
        ...entry,
        actor_name: profileMap.get(entry.actor) || 'System',
        target_name: profileMap.get(entry.target_user) || 'Unknown User'
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'grant_role': return 'default';
      case 'revoke_role': return 'destructive';
      case 'request_role': return 'secondary';
      case 'approve_request': return 'default';
      case 'deny_request': return 'destructive';
      default: return 'outline';
    }
  };

  const getActionDisplayName = (action: string) => {
    const names: Record<string, string> = {
      'grant_role': 'Rolle tildelt',
      'revoke_role': 'Rolle fjernet',
      'request_role': 'Rolle forespurt',
      'approve_request': 'Forespørsel godkjent',
      'deny_request': 'Forespørsel avslått',
      'init_challenge': 'Challenge initiert',
      'verify_and_execute': 'Challenge utført'
    };
    return names[action] || action;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: nb });
  };

  // Filter data based on search term
  const filteredData = auditLog?.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.actor_name?.toLowerCase().includes(searchLower) ||
      entry.target_name?.toLowerCase().includes(searchLower) ||
      entry.role?.toLowerCase().includes(searchLower) ||
      entry.action?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const uniqueActions = [...new Set(auditLog?.map(entry => entry.action) || [])];
  const uniqueRoles = [...new Set(auditLog?.map(entry => entry.role).filter(Boolean) || [])];

  if (isLoading) {
    return <div className="flex justify-center p-6">Laster endringshistorikk...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtere
          </CardTitle>
          <CardDescription>
            Filtrer endringshistorikken etter handlinger, roller eller søkeord
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk i historikk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alle handlinger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle handlinger</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {getActionDisplayName(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alle roller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle roller</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setActionFilter('all');
                setRoleFilter('all');
              }}
            >
              Nullstill filtere
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Oppdater
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Rolleendringshistorikk
          </CardTitle>
          <CardDescription>
            Viser de siste {filteredData.length} endringene
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tidspunkt</TableHead>
                  <TableHead>Handling</TableHead>
                  <TableHead>Utført av</TableHead>
                  <TableHead>Bruker</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Detaljer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDateTime(entry.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(entry.action)}>
                        {getActionDisplayName(entry.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {entry.actor_name}
                    </TableCell>
                    <TableCell>{entry.target_name}</TableCell>
                    <TableCell>
                      {entry.role && (
                        <Badge variant="outline">{entry.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.new_values && (
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {entry.new_values.justification || 
                           entry.new_values.reason || 
                           'Ingen tilleggsdetaljer'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredData.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                Ingen endringshistorikk funnet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};