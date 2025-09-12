
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { logger } from '@/utils/logger';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.error("404 Error: User attempted to access non-existent route", {
      pathname: location.pathname
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md w-full bg-card p-8 rounded-lg shadow-md border border-border">
        <div className="flex justify-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">404</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Beklager, siden du leter etter finnes ikke
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

export default NotFound;
