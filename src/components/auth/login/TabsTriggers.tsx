
import { TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { TabIcon } from './TabIcon';

interface TabsTriggersProps {
  activeTab: string;
}

export const TabsTriggers = ({ activeTab }: TabsTriggersProps) => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="grid w-full grid-cols-2"
    >
      <TabsTrigger 
        value="private" 
        className={`flex items-center gap-1.5 transition-all ${activeTab === 'private' ? 'font-medium' : ''}`}
      >
        <TabIcon userType="private" />
        <span>Privatperson</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="business" 
        className={`flex items-center gap-1.5 transition-all ${activeTab === 'business' ? 'font-medium' : ''}`}
      >
        <TabIcon userType="business" />
        <span>Bedrift</span>
      </TabsTrigger>
    </motion.div>
  );
};
