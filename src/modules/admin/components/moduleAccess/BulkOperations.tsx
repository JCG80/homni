import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Users, 
  Edit3, 
  Building2, 
  UserCheck, 
  UserX, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperationsProps {
  onGrantCore: (reason: string) => Promise<boolean>;
  onGrantAdmin: (reason: string) => Promise<boolean>;
  onRevokeAll: (reason: string) => Promise<boolean>;
  onBulkToggleCategory: (category: string, enable: boolean, reason: string) => Promise<boolean>;
  categorizedModules: Record<string, any[]>;
  disabled?: boolean;
}

const categoryInfo = {
  core: { icon: Users, label: 'Core Modules', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  admin: { icon: Shield, label: 'Admin Modules', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  content: { icon: Edit3, label: 'Content Modules', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  company: { icon: Building2, label: 'Company Modules', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
};

export function BulkOperations({ 
  onGrantCore, 
  onGrantAdmin, 
  onRevokeAll, 
  onBulkToggleCategory,
  categorizedModules,
  disabled = false 
}: BulkOperationsProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleBulkOperation = async (
    operation: () => Promise<boolean>,
    operationName: string,
    loadingKey: string
  ) => {
    if (!reason.trim()) {
      toast('Please provide a reason for this bulk operation.');
      return;
    }

    setLoading(loadingKey);
    try {
      const success = await operation();
      if (success) {
        toast(`${operationName} completed successfully.`);
        setReason('');
      } else {
        toast(`Failed to complete ${operationName.toLowerCase()}.`);
      }
    } catch (error) {
      toast(`An error occurred during ${operationName.toLowerCase()}.`);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (key: string) => loading === key;

  return (
    <div className="space-y-6 p-4 bg-muted/50 rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold mb-2">Bulk Operations</h3>
        <p className="text-sm text-muted-foreground">
          Quickly grant or revoke module access by category. All operations require a reason.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="bulk-reason">Reason for bulk operation</Label>
          <Input
            id="bulk-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Role promotion, access review, security audit..."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Quick preset operations */}
        <Button
          variant="outline"
          onClick={() => handleBulkOperation(
            () => onGrantCore(reason),
            'Grant Core Access',
            'core'
          )}
          disabled={disabled || !reason.trim() || isLoading('core')}
          className="flex items-center justify-center gap-2 h-12 border-blue-200 hover:bg-blue-50"
        >
          {isLoading('core') ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="h-4 w-4 text-blue-600" />
          )}
          Grant Core Modules
        </Button>

        <Button
          variant="outline"
          onClick={() => handleBulkOperation(
            () => onGrantAdmin(reason),
            'Grant Admin Access',
            'admin'
          )}
          disabled={disabled || !reason.trim() || isLoading('admin')}
          className="flex items-center justify-center gap-2 h-12 border-red-200 hover:bg-red-50"
        >
          {isLoading('admin') ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 text-red-600" />
          )}
          Grant Admin Modules
        </Button>

        {/* Category-specific operations */}
        {Object.entries(categorizedModules).map(([category, modules]) => {
          if (modules.length === 0) return null;
          
          const info = categoryInfo[category as keyof typeof categoryInfo];
          if (!info) return null;
          
          const Icon = info.icon;
          
          return (
            <div key={category} className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation(
                  () => onBulkToggleCategory(category, true, reason),
                  `Grant ${info.label}`,
                  `grant-${category}`
                )}
                disabled={disabled || !reason.trim() || isLoading(`grant-${category}`)}
                className={`flex-1 ${info.bgColor} ${info.color} border hover:opacity-80`}
              >
                {isLoading(`grant-${category}`) ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <Icon className="h-3 w-3 mr-2" />
                )}
                Grant
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation(
                  () => onBulkToggleCategory(category, false, reason),
                  `Revoke ${info.label}`,
                  `revoke-${category}`
                )}
                disabled={disabled || !reason.trim() || isLoading(`revoke-${category}`)}
                className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5"
              >
                {isLoading(`revoke-${category}`) ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <UserX className="h-3 w-3 mr-2" />
                )}
                Revoke
              </Button>
            </div>
          );
        })}

        {/* Revoke all - dangerous operation */}
        <div className="md:col-span-2">
          <Button
            variant="destructive"
            onClick={() => handleBulkOperation(
              () => onRevokeAll(reason),
              'Revoke All Access',
              'revoke-all'
            )}
            disabled={disabled || !reason.trim() || isLoading('revoke-all')}
            className="w-full h-12"
          >
            {isLoading('revoke-all') ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserX className="h-4 w-4 mr-2" />
            )}
            Revoke All Module Access
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded p-3">
        <strong>Note:</strong> Bulk operations immediately apply changes and create audit logs. 
        They cannot be undone except by manually re-granting access.
      </div>
    </div>
  );
}