import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PropertyDocuments: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Dokumenter</h2>
        <p className="text-muted-foreground">
          Last opp og organiser alle viktige dokumenter for dine eiendommer
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Ingen dokumenter ennå</h3>
              <p className="text-muted-foreground">
                Last opp dokumenter som skjøter, forsikringer, garantier og mer
              </p>
            </div>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Last opp dokument
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};