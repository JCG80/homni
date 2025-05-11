
import { TabsContent as UiTabsContent } from '@/components/ui/tabs';
import { LoginTabContent } from '../LoginTabContent';
import { motion } from 'framer-motion';

interface LoginTabsContentProps {
  activeTab: string;
}

export const LoginTabsContent = ({ activeTab }: LoginTabsContentProps) => {
  const tabAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tabAnimation}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <UiTabsContent value="private">
        <LoginTabContent 
          title="Logg inn som privatperson"
          subtitle="Velkommen tilbake til Homni"
          userType="private"
        />
      </UiTabsContent>
      
      <UiTabsContent value="business">
        <LoginTabContent 
          title="Logg inn som bedrift"
          subtitle="Logg inn på din bedriftskonto hos Homni"
          userType="business"
        />
      </UiTabsContent>
    </motion.div>
  );
};
