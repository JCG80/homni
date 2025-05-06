
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Ingen tilgang</h1>
        <p className="text-xl text-muted-foreground">
          Du har ikke tilgang til denne siden.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button onClick={() => navigate('/')}>
            Gå til forsiden
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Gå tilbake
          </Button>
        </div>
      </div>
    </div>
  );
};
