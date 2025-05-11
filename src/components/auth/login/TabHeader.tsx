
import { motion } from 'framer-motion';
import { TabIcon } from './TabIcon';

interface TabHeaderProps {
  title: string;
  subtitle: string;
  userType: 'private' | 'business';
}

export const TabHeader = ({ title, subtitle, userType }: TabHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center mb-4"
    >
      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
        <TabIcon userType={userType} />
      </div>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};
