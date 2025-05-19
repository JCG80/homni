
import { User, Building } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabIconProps {
  userType: string;
}

export const TabIcon = ({ userType }: TabIconProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-4 w-4 text-primary"
    >
      {userType === 'business' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </motion.div>
  );
};
