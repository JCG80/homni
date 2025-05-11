
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader, Home, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  request_count: number;
  last_active: string;
}

interface MemberDetailViewProps {
  member: Member;
  onClose: () => void;
  onUpdate: () => void;
}

export function MemberDetailView({ member, onClose, onUpdate }: MemberDetailViewProps) {
  const [activeTab, setActiveTab] = useState('requests');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch member's requests/leads
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['member-requests', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('submitted_by', member.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch member's properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['member-properties', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', member.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch member's notes
  const { data: memberData, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['member-notes', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', member.id)
        .single();
      
      if (error) throw error;
      
      // Set the notes from metadata if available
      if (data?.metadata?.admin_notes) {
        setNotes(data.metadata.admin_notes);
      }
      
      return data || { metadata: {} };
    }
  });
  
  const saveNotes = async () => {
    setIsSaving(true);
    try {
      // Get the current metadata
      const currentMetadata = memberData?.metadata || {};
      
      // Update the metadata with the new notes
      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata: {
            ...currentMetadata,
            admin_notes: notes
          }
        })
        .eq('id', member.id);
      
      if (error) throw error;
      
      toast({
        title: 'Notater lagret',
        description: 'Dine notater ble lagret.',
      });
      
      onUpdate();
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke lagre notater.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Navn:</p>
          <p className="text-lg">{member.full_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">E-post:</p>
          <p className="text-lg">{member.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Telefon:</p>
          <p className="text-lg">{member.phone}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Status:</p>
          <p className="text-lg">{member.status === 'active' ? 'Aktiv' : member.status === 'verified' ? 'Verifisert' : 'Inaktiv'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Sist aktiv:</p>
          <p className="text-lg">{formatDate(member.last_active)}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="requests">Forespørsler</TabsTrigger>
          <TabsTrigger value="properties">Eiendommer</TabsTrigger>
          <TabsTrigger value="notes">Interne notater</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          {isLoadingRequests ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster forespørsler...</span>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{request.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                    <div className="flex justify-between text-xs">
                      <span>Kategori: {request.category}</span>
                      <span>Status: {request.status}</span>
                      <span>Dato: {formatDate(request.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen forespørsler funnet for dette medlemmet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="properties">
          {isLoadingProperties ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster eiendommer...</span>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Home className="h-4 w-4 inline mr-2" /> {property.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{property.address}</p>
                    <div className="flex justify-between text-xs mt-2">
                      <span>Type: {property.type}</span>
                      <span>Størrelse: {property.size} m²</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen eiendommer funnet for dette medlemmet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes">
          {isLoadingNotes ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster notater...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-medium">Interne notater</h3>
              </div>
              <Textarea 
                placeholder="Skriv interne notater om dette medlemmet her..."
                className="min-h-[200px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={saveNotes} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Lagrer...
                    </>
                  ) : 'Lagre notater'}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>Lukk</Button>
      </div>
    </div>
  );
}
