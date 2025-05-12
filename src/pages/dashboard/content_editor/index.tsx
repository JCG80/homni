
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks';
import { FileText, PenSquare, Newspaper, BookOpen, LayoutTemplate } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContentEditorDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title={`Innholdsportal - ${profile?.full_name || 'Innholdsredaktør'}`}>
      <DashboardWidget title="Innholdsredigering">
        <div className="flex items-center gap-3">
          <PenSquare className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Rediger innhold</h3>
            <p className="text-sm text-muted-foreground">Administrer og oppdater innhold på nettsiden</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm text-muted-foreground">Rediger artikler, sider og tekster</span>
          <Link to="/admin/content" className="text-sm text-primary hover:underline">Åpne redigering</Link>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Artikler">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Artikkelbibliotek</h3>
            <p className="text-sm text-muted-foreground">Administrer artikler og blogginnlegg</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Link to="/admin/content/articles" className="text-sm text-primary hover:underline">Administrer artikler</Link>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Sider">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Sideadministrasjon</h3>
            <p className="text-sm text-muted-foreground">Rediger statiske sider og landingssider</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Link to="/admin/content/pages" className="text-sm text-primary hover:underline">Administrer sider</Link>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Maler og oppsett">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Sidemalredigering</h3>
            <p className="text-sm text-muted-foreground">Rediger maler og oppsett for innhold</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Link to="/admin/content/templates" className="text-sm text-primary hover:underline">Rediger maler</Link>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default ContentEditorDashboard;
