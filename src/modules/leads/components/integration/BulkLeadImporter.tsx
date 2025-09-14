import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImportResult {
  success: number;
  total: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export const BulkLeadImporter = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setImportResult(null);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    multiple: false,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (file.type === 'application/json') {
            const data = JSON.parse(content);
            resolve(Array.isArray(data) ? data : [data]);
          } else {
            // Parse CSV
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              reject(new Error('CSV må ha minst en header-rad og en data-rad'));
              return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] || '';
              });
              return obj;
            });
            resolve(data);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Kunne ikke lese filen'));
      reader.readAsText(file);
    });
  };

  const validateImport = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      const leads = await parseFile(file);
      await performImport(leads, true);
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Valideringsfeil",
        description: error instanceof Error ? error.message : "Kunne ikke validere filen",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const performImport = async (leads: any[], validateOnly = false) => {
    if (!validateOnly) setIsImporting(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Du må være logget inn for å importere data');
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL || 'https://kkazhcihooovsuwravhs.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/bulk-import-leads`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leads,
            validate_only: validateOnly,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import feilet');
      }

      const result = await response.json();
      setImportResult(result.result);

      if (validateOnly) {
        toast({
          title: "Validering fullført",
          description: `${result.result.success} leads kan importeres, ${result.result.errors.length} feil funnet`,
        });
      } else {
        toast({
          title: "Import fullført",
          description: `${result.result.success} leads importert, ${result.result.errors.length} feil`,
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: validateOnly ? "Validering feilet" : "Import feilet",
        description: error instanceof Error ? error.message : "En ukjent feil oppstod",
        variant: "destructive",
      });
    } finally {
      if (!validateOnly) setIsImporting(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const leads = await parseFile(file);
      await performImport(leads, false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import feilet",
        description: error instanceof Error ? error.message : "Kunne ikke importere filen",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,address,zip_code,category,description,estimated_value,priority,source
John Doe,john@example.com,+47 123 45 678,"Oslo, Norge",0123,elektroarbeid,Trenger elektriker for installasjon,5000,medium,manual_import
Jane Smith,jane@example.com,+47 987 65 432,"Bergen, Norge",5020,rørleggerarbeid,Vannlekkasje i bad,3000,high,manual_import`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Massaimport av Leads
          </CardTitle>
          <CardDescription>
            Importer flere leads samtidig fra CSV eller JSON fil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Last ned mal
            </Button>
          </div>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {file ? file.name : 'Dra og slipp fil her'}
                </p>
                <p className="text-sm text-muted-foreground">
                  eller klikk for å velge en CSV eller JSON fil
                </p>
              </div>
            </div>
          </div>

          {/* File Actions */}
          {file && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={validateImport}
                disabled={isValidating || isImporting}
              >
                {isValidating ? 'Validerer...' : 'Valider fil'}
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isImporting || isValidating || !importResult}
              >
                {isImporting ? 'Importerer...' : 'Importer leads'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setFile(null);
                  setImportResult(null);
                }}
              >
                Fjern fil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import resultat</CardTitle>
            <CardDescription>
              Oversikt over importprosessen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.success}
                </div>
                <div className="text-sm text-muted-foreground">Vellykket</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Feil</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {importResult.total}
                </div>
                <div className="text-sm text-muted-foreground">Totalt</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fremgang</span>
                <span>{Math.round((importResult.success / importResult.total) * 100)}%</span>
              </div>
              <Progress 
                value={(importResult.success / importResult.total) * 100} 
                className="h-2"
              />
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Feil som oppstod:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Rad {error.row}:</strong> {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {importResult.success > 0 && importResult.errors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Alle leads ble importert uten feil!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Importretningslinjer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Påkrevde felt:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><code>name</code> - Navn på kontaktperson</li>
              <li><code>email</code> - Gyldig e-postadresse</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Valgfrie felt:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><code>phone</code> - Telefonnummer</li>
              <li><code>address</code> - Adresse</li>
              <li><code>zip_code</code> - Postnummer</li>
              <li><code>category</code> - Kategori (standard: "other")</li>
              <li><code>description</code> - Beskrivelse</li>
              <li><code>estimated_value</code> - Estimert verdi (nummer)</li>
              <li><code>priority</code> - Prioritet (low, medium, high)</li>
              <li><code>source</code> - Kilde (standard: "bulk_import")</li>
            </ul>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Duplikate e-postadresser vil bli avvist. Systemet sjekker automatisk mot eksisterende leads.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};