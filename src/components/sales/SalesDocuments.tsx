import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Eye, Plus, File as FileIcon } from 'lucide-react';

interface SalesDocument {
  id: string;
  name: string;
  type: 'required' | 'optional' | 'generated';
  category: 'legal' | 'technical' | 'marketing' | 'financial';
  status: 'missing' | 'uploaded' | 'generated' | 'verified';
  createdAt?: string;
  fileSize?: string;
  description: string;
}

interface SalesDocumentsProps {
  projectId: string;
}

export function SalesDocuments({ projectId }: SalesDocumentsProps) {
  const [documents] = useState<SalesDocument[]>([
    {
      id: '1',
      name: 'Skjøte',
      type: 'required',
      category: 'legal',
      status: 'uploaded',
      createdAt: '2024-01-15',
      fileSize: '2.3 MB',
      description: 'Hjemmelsdokument som viser eierskap til eiendommen'
    },
    {
      id: '2',
      name: 'Grunnboksutskrift',
      type: 'required',
      category: 'legal',
      status: 'uploaded',
      createdAt: '2024-01-15',
      fileSize: '1.8 MB',
      description: 'Offisiell utskrift fra grunnboken'
    },
    {
      id: '3',
      name: 'Energimerking',
      type: 'required',
      category: 'technical',
      status: 'missing',
      description: 'Energimerking av boligen utført av godkjent energirådgiver'
    },
    {
      id: '4',
      name: 'Takst/Verdsettelse',
      type: 'required',
      category: 'financial',
      status: 'uploaded',
      createdAt: '2024-01-16',
      fileSize: '3.1 MB',
      description: 'Profesjonell takst eller verdsettelse av eiendommen'
    },
    {
      id: '5',
      name: 'Salgsannonse',
      type: 'generated',
      category: 'marketing',
      status: 'generated',
      createdAt: '2024-01-18',
      fileSize: '145 KB',
      description: 'Automatisk generert salgsannonse basert på eiendomsdata'
    },
    {
      id: '6',
      name: 'Kjøpekontrakt',
      type: 'generated',
      category: 'legal',
      status: 'missing',
      description: 'Standardisert kjøpekontrakt for eiendomssalg'
    }
  ]);

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, SalesDocument[]>);

  const categoryNames = {
    legal: 'Juridiske dokumenter',
    technical: 'Tekniske dokumenter', 
    marketing: 'Markedsføring',
    financial: 'Økonomi'
  };

  const getStatusBadge = (status: SalesDocument['status']) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-green-100 text-green-800">Lastet opp</Badge>;
      case 'generated':
        return <Badge className="bg-blue-100 text-blue-800">Generert</Badge>;
      case 'verified':
        return <Badge className="bg-purple-100 text-purple-800">Verifisert</Badge>;
      case 'missing':
        return <Badge variant="destructive">Mangler</Badge>;
      default:
        return <Badge variant="outline">Ukjent</Badge>;
    }
  };

  const getTypeBadge = (type: SalesDocument['type']) => {
    switch (type) {
      case 'required':
        return <Badge variant="outline" className="border-red-200 text-red-700">Påkrevd</Badge>;
      case 'optional':
        return <Badge variant="outline">Valgfri</Badge>;
      case 'generated':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Auto-generert</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salgsdokumenter</CardTitle>
              <CardDescription>
                Administrer alle dokumenter knyttet til boligsalget
              </CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Last opp dokument
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {Object.entries(groupedDocuments).map(([category, categoryDocs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{categoryNames[category as keyof typeof categoryNames]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryDocs.map((doc, index) => (
                  <div key={doc.id}>
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <FileIcon className="w-8 h-8 text-muted-foreground mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{doc.name}</h4>
                            {getTypeBadge(doc.type)}
                            {getStatusBadge(doc.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {doc.description}
                          </p>
                          {doc.createdAt && doc.fileSize && (
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Opprettet: {new Date(doc.createdAt).toLocaleDateString('no-NO')}</span>
                              <span>Størrelse: {doc.fileSize}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {doc.status === 'missing' && doc.type === 'generated' ? (
                          <Button size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Generer
                          </Button>
                        ) : doc.status === 'missing' ? (
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Last opp
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Vis
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Last ned
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {index < categoryDocs.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatisk dokumentgenerering</CardTitle>
          <CardDescription>
            Generer standarddokumenter basert på eiendomsinformasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generer salgsannonse
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generer kjøpekontrakt
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generer budskjema
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generer salgsoversikt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}