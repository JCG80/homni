
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, LayoutTemplate, Image, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ContentEditorDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Content Editor Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-primary" />
              <span>Rediger innhold</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Administrer og oppdater nettsideinnhold
            </p>
            <Button asChild>
              <Link to="/admin/content">Åpne innholdsredigering</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              <span>Sidemaler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Administrer og rediger sidemaler
            </p>
            <Button variant="outline">Åpne maler</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <span>Mediabibliotek</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Administrer bilder og mediefiler
            </p>
            <Button variant="outline">Åpne mediabibliotek</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContentEditorDashboard;
