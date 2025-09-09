import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  User, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Activity 
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  reason?: string;
  created_at: string;
  admin_user_id?: string;
  metadata?: any;
}

interface AuditLogViewerProps {
  auditLogs: AuditLog[];
  loading?: boolean;
}

const actionConfig = {
  granted: {
    icon: UserPlus,
    label: 'Access Granted',
    color: 'text-green-600',
    variant: 'default' as const
  },
  revoked: {
    icon: UserMinus,
    label: 'Access Revoked', 
    color: 'text-red-600',
    variant: 'destructive' as const
  },
  auto_assigned: {
    icon: Shield,
    label: 'Auto-Assigned',
    color: 'text-blue-600',
    variant: 'secondary' as const
  }
};

export function AuditLogViewer({ auditLogs, loading = false }: AuditLogViewerProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Access History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Access History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No access changes recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Access History
          <Badge variant="outline" className="ml-auto">
            {auditLogs.length} {auditLogs.length === 1 ? 'entry' : 'entries'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {auditLogs.map((log) => {
              const config = actionConfig[log.action as keyof typeof actionConfig] || {
                icon: Activity,
                label: log.action,
                color: 'text-gray-600',
                variant: 'outline' as const
              };
              
              const Icon = config.icon;
              const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
              const isBulkOperation = log.metadata?.bulk_operation;
              
              return (
                <div key={log.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg border">
                  <div className={`p-2 rounded-full bg-white border ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                      {isBulkOperation && (
                        <Badge variant="outline" className="text-xs">
                          Bulk Operation
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo}</span>
                      {log.admin_user_id && (
                        <>
                          <User className="h-3 w-3 ml-2" />
                          <span className="truncate">Admin: {log.admin_user_id.slice(0, 8)}...</span>
                        </>
                      )}
                    </div>
                    
                    {log.reason && (
                      <p className="text-sm text-foreground bg-white/50 rounded px-2 py-1 border">
                        {log.reason}
                      </p>
                    )}
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Technical Details
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}