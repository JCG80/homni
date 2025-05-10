import { useState, useEffect } from 'react';
import { getAuditLogs } from '../api';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

type LogEntry = {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
  ip_address?: string;
};

interface AuditLogViewerProps {
  userId?: string;
  limit?: number;
  showAdminInfo?: boolean;
}

export const AuditLogViewer = ({ 
  userId, 
  limit = 20,
  showAdminInfo = false
}: AuditLogViewerProps) => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Only admins can view other users' logs
        const userIdToFetch = isAdmin || !showAdminInfo ? userId : undefined;
        const { logs, error } = await getAuditLogs(userIdToFetch, limit);
        
        if (error) {
          setError('Kunne ikke hente aktivitetslogger.');
          return;
        }
        
        setLogs(logs);
      } catch (err) {
        setError('En uventet feil oppstod ved henting av aktivitetslogger.');
        console.error('Error fetching audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [userId, limit, isAdmin, showAdminInfo]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitetslogger</CardTitle>
          <CardDescription>Laster inn aktivitetsdata...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitetslogger</CardTitle>
          <CardDescription>Det oppstod en feil</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitetslogger</CardTitle>
          <CardDescription>Ingen aktivitetslogger funnet</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Det er ingen registrerte aktiviteter å vise.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitetslogger</CardTitle>
        <CardDescription>
          {userId ? 'Brukerens aktivitetshistorikk' : 'Systemets aktivitetshistorikk'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tidspunkt</TableHead>
              {showAdminInfo && <TableHead>Bruker-ID</TableHead>}
              <TableHead>Handling</TableHead>
              <TableHead>Detaljer</TableHead>
              {showAdminInfo && <TableHead>IP-adresse</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss')}
                </TableCell>
                {showAdminInfo && <TableCell className="font-mono text-xs">{log.user_id}</TableCell>}
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {typeof log.details === 'object' 
                      ? JSON.stringify(log.details).slice(0, 50) + '...'
                      : log.details}
                  </div>
                </TableCell>
                {showAdminInfo && <TableCell>{log.ip_address || '-'}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
