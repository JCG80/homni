
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Logg inn</h1>
          <p className="text-muted-foreground mt-2">
            Velkommen tilbake til Homni
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};
