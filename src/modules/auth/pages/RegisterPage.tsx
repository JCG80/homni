
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Registrer deg</h1>
          <p className="text-muted-foreground mt-2">
            Opprett en ny konto hos Homni
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
};
