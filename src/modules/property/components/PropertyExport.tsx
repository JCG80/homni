import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { Download, FileText, Table, FileImage } from 'lucide-react';
import { Property } from '../types/propertyTypes';

interface ExportOptions {
  includeBasicInfo: boolean;
  includeDocuments: boolean;
  includeExpenses: boolean;
  includeMaintenance: boolean;
  format: 'pdf' | 'csv' | 'json';
}

export function PropertyExport() {
  const { user } = useAuth();
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeBasicInfo: true,
    includeDocuments: false,
    includeExpenses: false,
    includeMaintenance: false,
    format: 'pdf'
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-export', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user?.id
  });

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const selectAllProperties = () => {
    setSelectedProperties(
      selectedProperties.length === properties.length 
        ? [] 
        : properties.map(p => p.id)
    );
  };

  const handleExport = async () => {
    if (selectedProperties.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Gather all requested data
      const exportData = await Promise.all(
        selectedProperties.map(async (propertyId) => {
          const property = properties.find(p => p.id === propertyId)!;
          const result: any = { property };

          if (exportOptions.includeDocuments) {
            const { data: documents } = await supabase
              .from('property_documents')
              .select('*')
              .eq('property_id', propertyId);
            result.documents = documents || [];
          }

          if (exportOptions.includeExpenses) {
            const { data: expenses } = await supabase
              .from('property_expenses')
              .select('*')
              .eq('property_id', propertyId);
            result.expenses = expenses || [];
          }

          if (exportOptions.includeMaintenance) {
            const { data: maintenance } = await supabase
              .from('property_maintenance_tasks')
              .select('*')
              .eq('property_id', propertyId);
            result.maintenance = maintenance || [];
          }

          return result;
        })
      );

      // Generate export based on format
      if (exportOptions.format === 'json') {
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, 'eiendommer.json', 'application/json');
      } else if (exportOptions.format === 'csv') {
        const csvString = generateCSV(exportData);
        downloadFile(csvString, 'eiendommer.csv', 'text/csv');
      } else if (exportOptions.format === 'pdf') {
        // For now, just download as JSON. In a real app, you'd generate a proper PDF
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, 'eiendommer.json', 'application/json');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: any[]) => {
    const headers = ['Navn', 'Type', 'Adresse', 'Størrelse', 'Kjøpsdato'];
    
    if (exportOptions.includeDocuments) headers.push('Antall dokumenter');
    if (exportOptions.includeExpenses) headers.push('Totale utgifter');
    if (exportOptions.includeMaintenance) headers.push('Vedlikehold oppgaver');

    const rows = data.map(item => {
      const row = [
        item.property.name,
        item.property.type,
        item.property.address || '',
        item.property.size || '',
        item.property.purchase_date || ''
      ];

      if (exportOptions.includeDocuments) {
        row.push(item.documents?.length || 0);
      }
      if (exportOptions.includeExpenses) {
        const totalExpenses = item.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
        row.push(totalExpenses);
      }
      if (exportOptions.includeMaintenance) {
        row.push(item.maintenance?.length || 0);
      }

      return row;
    });

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Eksporter eiendomsdata
        </CardTitle>
        <CardDescription>
          Velg eiendommer og data som skal eksporteres
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Velg eiendommer</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectAllProperties}
            >
              {selectedProperties.length === properties.length ? 'Fjern alle' : 'Velg alle'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {properties.map(property => (
              <div key={property.id} className="flex items-center space-x-2">
                <Checkbox
                  id={property.id}
                  checked={selectedProperties.includes(property.id)}
                  onCheckedChange={() => handlePropertyToggle(property.id)}
                />
                <label 
                  htmlFor={property.id} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {property.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export options */}
        <div>
          <h4 className="font-medium mb-3">Inkluder data</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="basic-info"
                checked={exportOptions.includeBasicInfo}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeBasicInfo: checked as boolean }))
                }
                disabled
              />
              <label htmlFor="basic-info" className="text-sm">
                Grunnleggende eiendomsinformasjon (påkrevd)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="documents"
                checked={exportOptions.includeDocuments}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeDocuments: checked as boolean }))
                }
              />
              <label htmlFor="documents" className="text-sm">
                Dokumenter og filer
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expenses"
                checked={exportOptions.includeExpenses}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeExpenses: checked as boolean }))
                }
              />
              <label htmlFor="expenses" className="text-sm">
                Utgifter og økonomi
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintenance"
                checked={exportOptions.includeMaintenance}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeMaintenance: checked as boolean }))
                }
              />
              <label htmlFor="maintenance" className="text-sm">
                Vedlikehold og oppgaver
              </label>
            </div>
          </div>
        </div>

        {/* Format selection */}
        <div>
          <h4 className="font-medium mb-3">Format</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { format: 'pdf' as const, label: 'PDF', icon: FileText, description: 'Rapport format' },
              { format: 'csv' as const, label: 'CSV', icon: Table, description: 'Regneark format' },
              { format: 'json' as const, label: 'JSON', icon: FileImage, description: 'Data format' }
            ].map(option => (
              <Button
                key={option.format}
                variant={exportOptions.format === option.format ? 'default' : 'outline'}
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => setExportOptions(prev => ({ ...prev, format: option.format }))}
              >
                <option.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Export button */}
        <Button 
          onClick={handleExport}
          disabled={selectedProperties.length === 0 || isExporting}
          className="w-full"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Eksporterer...' : `Eksporter ${selectedProperties.length} eiendomm${selectedProperties.length === 1 ? '' : 'er'}`}
        </Button>
      </CardContent>
    </Card>
  );
}