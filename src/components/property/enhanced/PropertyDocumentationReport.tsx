import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  TrendingUp,
  Download,
  Calendar,
  Target
} from 'lucide-react';

interface PropertyDocumentationReportProps {
  propertyId: string;
  report: any;
}

export const PropertyDocumentationReport = ({ propertyId, report }: PropertyDocumentationReportProps) => {
  if (!report) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold mb-2">Genererer rapport...</h4>
          <p className="text-muted-foreground text-center">
            Vennligst vent mens vi analyserer eiendomsdataene.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" />
                <span>Eiendomsdokumentasjon Rapport</span>
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Generert {new Date(report.generated_at).toLocaleDateString('nb-NO')}
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Last ned rapport
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Documentation Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Dokumentasjonsgrad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {report.documentation_completeness}%
                </span>
                {getScoreIcon(report.documentation_completeness)}
              </div>
              
              <Progress 
                value={report.documentation_completeness} 
                className="h-2"
              />
              
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Kategorier dokumentert:</span>
                  <span>{report.categories_covered}/{report.total_categories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Totalt dokumenter:</span>
                  <span>{report.total_documents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <span>Vedlikeholdsaktivitet</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {report.maintenance_score}%
                </span>
                {getScoreIcon(report.maintenance_score)}
              </div>
              
              <Progress 
                value={report.maintenance_score} 
                className="h-2"
              />
              
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Oppgaver siste 6 mnd:</span>
                  <span>{report.recent_maintenance_tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anbefalt minimum:</span>
                  <span>4 oppgaver</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Documents Alert */}
      {report.missing_required_documents.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Manglende påkrevde dokumenter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                Følgende dokumentkategorier mangler og bør prioriteres:
              </p>
              <div className="flex flex-wrap gap-2">
                {report.missing_required_documents.map((docType: string) => (
                  <Badge key={docType} variant="destructive">
                    {docType}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Anbefalinger for forbedring</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Documentation Recommendations */}
            {report.documentation_completeness < 80 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📄 Dokumentasjon</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Last opp manglende påkrevde dokumenter</li>
                  <li>• Organiser eksisterende dokumenter i riktige kategorier</li>
                  <li>• Legg til beskrivelser og stikkord for bedre søkbarhet</li>
                </ul>
              </div>
            )}

            {/* Maintenance Recommendations */}
            {report.maintenance_score < 80 && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">🔧 Vedlikehold</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Opprett en vedlikeholdsplan for eiendommen</li>
                  <li>• Registrer gjennomførte vedlikeholdsoppgaver</li>
                  <li>• Sett opp påminnelser for regelmessig vedlikehold</li>
                </ul>
              </div>
            )}

            {/* General Recommendations */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">💡 Generelle tips</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Scan papirdokumenter og lagre digitalt</li>
                <li>• Oppbevar viktige originaldokumenter på trygt sted</li>
                <li>• Opprett sikkerhetskopier av alle digitale dokumenter</li>
                <li>• Gjennomgå og oppdater dokumentasjonen årlig</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Sammendrag og neste steg</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.total_documents}</div>
                <div className="text-sm text-muted-foreground">Dokumenter totalt</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.categories_covered}</div>
                <div className="text-sm text-muted-foreground">Kategorier dekket</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{report.recent_maintenance_tasks}</div>
                <div className="text-sm text-muted-foreground">Vedlikehold siste 6 mnd</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Samlet vurdering:</strong> Eiendommen har en{' '}
                <span className={report.documentation_completeness >= 80 ? 'text-green-600 font-medium' : 
                                report.documentation_completeness >= 60 ? 'text-yellow-600 font-medium' : 
                                'text-red-600 font-medium'}>
                  {report.documentation_completeness >= 80 ? 'meget god' : 
                   report.documentation_completeness >= 60 ? 'god' : 'mangelfull'}
                </span>{' '}
                dokumentasjonsstandard og{' '}
                <span className={report.maintenance_score >= 80 ? 'text-green-600 font-medium' : 
                                report.maintenance_score >= 60 ? 'text-yellow-600 font-medium' : 
                                'text-red-600 font-medium'}>
                  {report.maintenance_score >= 80 ? 'utmerket' : 
                   report.maintenance_score >= 60 ? 'tilfredsstillende' : 'utilstrekkelig'}
                </span>{' '}
                vedlikeholdsaktivitet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};