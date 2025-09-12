import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Copy, RefreshCw, Activity, AlertCircle } from 'lucide-react';

interface WebhookLog {
  id: string;
  source: string;
  lead_id?: string;
  processed_at: string;
  status: string;
  error_message?: string;
}

export const WebhookManager = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const webhookUrl = `https://kkazhcihooovsuwravhs.supabase.co/functions/v1/webhook-lead-receiver`;

  // Generate a simple API key (in production, this should be more secure)
  const generateApiKey = () => {
    const key = `homni_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(key);
    toast({
      title: "API nøkkel generert",
      description: "Ny API-nøkkel er generert og klar til bruk",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: "Teksten er kopiert til utklippstavlen",
    });
  };

  const fetchWebhookLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke hente webhook-logger",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Webhook Konfigurasjon
          </CardTitle>
          <CardDescription>
            Konfigurer eksterne systemer til å sende leads direkte til Homni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Nøkkel</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                value={apiKey}
                placeholder="Generer en API-nøkkel..."
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKey)}
                disabled={!apiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={generateApiKey}>
                Generer
              </Button>
            </div>
          </div>

          <Separator />
          
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium">Integrasjonsinstruksjoner</h4>
            <div className="text-sm space-y-2">
              <p><strong>HTTP Method:</strong> POST</p>
              <p><strong>Headers:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>Content-Type: application/json</code></li>
                <li><code>x-api-key: {apiKey || '[DIN_API_NØKKEL]'}</code></li>
                <li><code>x-webhook-source: [KILDE_NAVN]</code></li>
              </ul>
              <p><strong>Payload eksempel:</strong></p>
              <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
{JSON.stringify({
  name: "John Doe",
  email: "john@example.com",
  phone: "+47 123 45 678",
  address: "Oslo, Norge",
  zipCode: "0123",
  category: "elektroarbeid",
  description: "Trenger elektriker for installasjon",
  estimatedValue: 5000
}, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhook Aktivitetslogg</CardTitle>
              <CardDescription>
                Oversikt over innkommende webhook-forespørsler
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchWebhookLogs}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Oppdater
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {webhookLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Ingen webhook-aktivitet registrert ennå</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhookLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <span className="font-medium">{log.source}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.processed_at).toLocaleString('no-NO')}
                      {log.lead_id && ` • Lead ID: ${log.lead_id.substring(0, 8)}...`}
                    </div>
                    {log.error_message && (
                      <div className="text-sm text-destructive">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};