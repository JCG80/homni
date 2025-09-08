/**
 * Content Editor Dashboard - Drafts Card
 * Shows content drafts and publishing status
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ContentDraft {
  id: string;
  title: string;
  content_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
}

export const DraftsCard: React.FC = () => {
  const { data: drafts, isLoading, error, refetch } = useDashboardData<ContentDraft[]>({
    queryKey: ['content-drafts'],
    fetcher: async () => {
      // Mock data - replace with actual content query when content table exists
      const mockDrafts: ContentDraft[] = [
        {
          id: '1',
          title: 'Guide til boligkjøp 2024',
          content_type: 'blog_post',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2', 
          title: 'Forsikringsguide for nye huseiere',
          content_type: 'guide',
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      return mockDrafts;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const draftCount = drafts?.filter(d => d.status === 'draft').length || 0;
  const scheduledCount = drafts?.filter(d => d.status === 'scheduled').length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Utkast</Badge>;
      case 'scheduled':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Planlagt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardCard
      title="Innholdsutkast"
      isLoading={isLoading}
      error={error}
      empty={!drafts?.length}
      emptyMessage="Ingen utkast funnet"
      metric={{
        label: "Totalt utkast",
        value: draftCount,
        change: scheduledCount > 0 ? {
          value: scheduledCount,
          trend: 'neutral' as const,
          period: 'planlagte'
        } : undefined
      }}
      actions={
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Oppdater
        </Button>
      }
    >
      <div className="space-y-3">
        {drafts?.slice(0, 5).map((draft) => (
          <div key={draft.id} className="flex items-start justify-between p-3 border rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{draft.title}</h4>
                {getStatusBadge(draft.status)}
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                {draft.content_type} • Oppdatert {format(parseISO(draft.updated_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
              </div>

              {draft.scheduled_at && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  Publiseres {format(parseISO(draft.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
                </div>
              )}
            </div>

            <div className="flex gap-1 ml-3">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                Rediger
              </Button>
            </div>
          </div>
        ))}

        {drafts && drafts.length > 5 && (
          <Button variant="outline" size="sm" className="w-full">
            Se alle ({drafts.length})
          </Button>
        )}
      </div>
    </DashboardCard>
  );
};