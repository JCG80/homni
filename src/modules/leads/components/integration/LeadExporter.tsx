import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Download, FileText, File, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ExportFilters {
  format: 'csv' | 'json';
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  includeMetadata: boolean;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'Ny' },
  { value: 'qualified', label: 'Kvalifisert' },
  { value: 'contacted', label: 'Kontaktet' },
  { value: 'converted', label: 'Konvertert' },
  { value: 'lost', label: 'Tapt' },
];

const LEAD_CATEGORIES = [
  { value: 'elektroarbeid', label: 'Elektroarbeid' },
  { value: 'rørleggerarbeid', label: 'Rørleggerarbeid' },
  { value: 'bygg', label: 'Bygg og anlegg' },
  { value: 'maling', label: 'Maling' },
  { value: 'tak', label: 'Takarbeid' },
  { value: 'other', label: 'Annet' },
];

export const LeadExporter = () => {
  const [filters, setFilters] = useState<ExportFilters>({
    format: 'csv',
    startDate: '',
    endDate: '',
    status: '',
    category: '',
    includeMetadata: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Du må være logget inn for å eksportere data');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.format) params.append('format', filters.format);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      // Call the export edge function
      const response = await fetch(
        `https://kkazhcihooovsuwravhs.supabase.co/functions/v1/export-leads?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eksport feilet');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `leads-export-${format(new Date(), 'yyyy-MM-dd')}.${filters.format}`;

      // Create and download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Eksport fullført",
        description: `Leads eksportert som ${filename}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Eksport feilet",
        description: error instanceof Error ? error.message : "Kunne ikke eksportere leads",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateFilter = (key: keyof ExportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Eksporter Leads
        </CardTitle>
        <CardDescription>
          Eksporer lead-data til CSV eller JSON format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select 
              value={filters.format} 
              onValueChange={(value: 'csv' | 'json') => updateFilter('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Fra dato</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Til dato</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle statuser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle statuser</SelectItem>
                {LEAD_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle kategorier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle kategorier</SelectItem>
                {LEAD_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-metadata"
              checked={filters.includeMetadata}
              onCheckedChange={(checked) => updateFilter('includeMetadata', checked)}
            />
            <Label 
              htmlFor="include-metadata" 
              className="text-sm font-normal cursor-pointer"
            >
              Inkluder metadata og tekniske detaljer
            </Label>
          </div>
        </div>

        {/* Export Summary */}
        <div className="rounded-lg bg-muted p-4">
          <h4 className="font-medium mb-2">Eksport sammendrag</h4>
          <div className="text-sm space-y-1">
            <p><strong>Format:</strong> {filters.format.toUpperCase()}</p>
            {filters.startDate && <p><strong>Fra:</strong> {format(new Date(filters.startDate), 'dd.MM.yyyy', { locale: nb })}</p>}
            {filters.endDate && <p><strong>Til:</strong> {format(new Date(filters.endDate), 'dd.MM.yyyy', { locale: nb })}</p>}
            {filters.status && <p><strong>Status:</strong> {LEAD_STATUSES.find(s => s.value === filters.status)?.label}</p>}
            {filters.category && <p><strong>Kategori:</strong> {LEAD_CATEGORIES.find(c => c.value === filters.category)?.label}</p>}
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Eksporterer...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Eksporter Leads
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};