
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { GuestAccessCTA } from '@/components/cta/GuestAccessCTA';
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PageBreadcrumb 
          items={[{ label: 'Ingen tilgang' }]} 
          className="mb-8"
        />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-6 bg-card p-8 rounded-lg shadow-sm border">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Ingen tilgang</h1>
              <p className="text-lg text-muted-foreground">
                Du har ikke tilgang til denne siden.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
                  Gå til forsiden
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)} 
                  className="w-full sm:w-auto"
                >
                  Gå tilbake
                </Button>
              </div>
            </div>
            
            <GuestAccessCTA 
              title="Prøv våre tjenester"
              description="Du trenger ikke innlogging for å utforske våre sammenligningsverktøy."
              buttonText="Utforsk tjenester"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
