
import { UserRole } from '@/modules/auth/types/types';
import { TEST_USERS } from '@/modules/auth/utils/devLogin';
import { Loader2 } from 'lucide-react';
import { useTestUserVerification } from './hooks/useTestUserVerification';
import { TestUserWarning } from './TestUserWarning';
import { TestUserButton } from './TestUserButton';
import { TestInstructions } from './TestInstructions';

interface TestUserManagerProps {
  onLoginClick: (role: UserRole) => Promise<void>;
}

export const TestUserManager = ({ onLoginClick }: TestUserManagerProps) => {
  const {
    missingUsers,
    isVerifying,
    loadingRole,
    setLoadingRole,
    runSetupTestUsers
  } = useTestUserVerification();

  const handleDevLogin = async (role: UserRole) => {
    setLoadingRole(role);
    await onLoginClick(role);
    setLoadingRole(null);
  };

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span>Verifiserer testbrukere...</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-center mb-4">Testbrukere for utvikling</p>
      
      <TestUserWarning missingUsers={missingUsers} onSetupClick={runSetupTestUsers} />
      
      <div className="space-y-2">
        {TEST_USERS.map((user) => (
          <TestUserButton 
            key={user.email}
            name={user.name}
            role={user.role}
            email={user.email}
            isMissing={missingUsers.includes(user.email)}
            isLoading={loadingRole === user.role}
            onClick={() => handleDevLogin(user.role)}
          />
        ))}
      </div>

      <div className="mt-4 text-xs text-center">
        <TestInstructions />
      </div>
    </div>
  );
};
