
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md w-full bg-card p-8 rounded-lg shadow-md border border-border">
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
    </div>
  );
};
