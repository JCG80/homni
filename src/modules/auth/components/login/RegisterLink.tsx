
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RegisterLinkProps {
  userType: 'private' | 'business';
}

export const RegisterLink = ({ userType }: RegisterLinkProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
      }} 
      className="text-center text-sm"
    >
      <span className="text-muted-foreground">Har du ikke konto?</span>{' '}
      <Button 
        variant="link" 
        className="p-0" 
        onClick={() => navigate(userType === 'business' ? '/register?type=business' : '/register')}
        type="button"
      >
        Registrer deg
      </Button>
    </motion.div>
  );
};
