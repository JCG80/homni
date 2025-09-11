import React from 'react';
import { FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentStatusItem {
  category: string;
  count: number;
  total: number;
  status: 'complete' | 'partial' | 'missing';
  expiringSoon?: number;
}

const mockDocumentStatus: DocumentStatusItem[] = [
  {
    category: 'Forsikring',
    count: 2,
    total: 3,
    status: 'partial',
    expiringSoon: 1,
  },
  {
    category: 'Garantier',
    count: 5,
    total: 8,
    status: 'partial',
  },
  {
    category: 'Takst & Verdivurdering',
    count: 1,
    total: 1,
    status: 'complete',
  },
  {
    category: 'Skjøter & Kontrakter',
    count: 0,
    total: 2,
    status: 'missing',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'partial':
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    case 'missing':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete': return 'default';
    case 'partial': return 'secondary';
    case 'missing': return 'destructive';
    default: return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'complete': return 'Komplett';
    case 'partial': return 'Delvis';
    case 'missing': return 'Mangler';
    default: return status;
  }
};

export const DocumentStatus: React.FC = () => {
  const totalDocuments = mockDocumentStatus.reduce((sum, item) => sum + item.total, 0);
  const completedDocuments = mockDocumentStatus.reduce((sum, item) => sum + item.count, 0);
  const completionPercentage = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;
  const totalExpiring = mockDocumentStatus.reduce((sum, item) => sum + (item.expiringSoon || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Dokumentstatus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Totalt ferdigstilt</span>
            <span className="font-medium">{completedDocuments}/{totalDocuments}</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completionPercentage.toFixed(0)}% av dokumentene er lastet opp
          </p>
        </div>

        {/* Expiring Soon Alert */}
        {totalExpiring > 0 && (
          <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  {totalExpiring} dokument{totalExpiring > 1 ? 'er' : ''} utløper snart
                </p>
                <p className="text-xs text-orange-700">
                  Sjekk forsikring og garantier
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Kategorier</h4>
          {mockDocumentStatus.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="text-sm">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {item.count}/{item.total}
                </span>
                <Badge variant={getStatusColor(item.status)} className="text-xs">
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full">
            Last opp dokumenter
          </Button>
          <Button variant="ghost" className="w-full text-sm">
            Se alle kategorier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};