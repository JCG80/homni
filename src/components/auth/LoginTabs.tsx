
import { Tabs, TabsList } from '@/components/ui/tabs';
import { useLoginTabs } from './hooks/useLoginTabs';
import { TabsTriggers } from './login/TabsTriggers';
import { LoginTabsContent } from './login/LoginTabsContent';
import { motion } from 'framer-motion';

interface LoginTabsProps {
  defaultTab?: string;
}

export const LoginTabs = ({ defaultTab = 'private' }: LoginTabsProps) => {
  const { activeTab, handleTabChange } = useLoginTabs(defaultTab);

  const tabAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={tabAnimation}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-card">
          <TabsTriggers activeTab={activeTab} />
        </TabsList>
        
        <LoginTabsContent activeTab={activeTab} />
      </Tabs>
    </motion.div>
  );
};
