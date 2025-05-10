
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { devLogin } from '../utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../types/types';

export const LoginPage = () => {
  // Updated to use correct UserRole types
  const handleDevLogin = async (role: UserRole) => {
    const result = await devLogin(role);
    if (result.error) {
      toast({
        title: 'Login failed',
        description: result.error.message,
        variant: 'destructive',
      });
    }
    // Success notifications are already handled in devLogin
  };

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
        
        <div className="text-center space-y-1 text-sm">
          <p>
            Etter innlogging kan du:
          </p>
          <ul className="text-muted-foreground">
            <li>Se din brukerprofil</li>
            <li>Administrere dine eiendommer</li>
            <li>Få oversikt over utgifter</li>
          </ul>
        </div>

        {import.meta.env.MODE === 'development' && (
          <div className="mt-8 text-center space-x-2">
            <button 
              onClick={() => handleDevLogin('member')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as User
            </button>
            <button 
              onClick={() => handleDevLogin('company')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Company
            </button>
            <button 
              onClick={() => handleDevLogin('admin')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Admin
            </button>
            <button 
              onClick={() => handleDevLogin('master_admin')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Master Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
