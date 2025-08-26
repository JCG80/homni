
import { TabsContent as UiTabsContent } from '@/components/ui/tabs';
import { LoginTabContent } from '../LoginTabContent';
import { EnhancedLoginForm } from '@/modules/auth/components/enhanced/EnhancedLoginForm';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LoginTabsContentProps {
  activeTab: string;
}

export const LoginTabsContent = ({ activeTab }: LoginTabsContentProps) => {
  const [useEnhancedFlow, setUseEnhancedFlow] = useState(true);
  
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
      {/* Enhanced Flow Toggle (Development) */}
      {import.meta.env.MODE === 'development' && (
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
          <Label htmlFor="enhanced-login-flow" className="text-sm">
            Bruk forbedret påloggingsflow
          </Label>
          <Switch
            id="enhanced-login-flow"
            checked={useEnhancedFlow}
            onCheckedChange={setUseEnhancedFlow}
          />
        </div>
      )}
      
      <UiTabsContent value="private">
        {useEnhancedFlow ? (
          <EnhancedLoginForm userType="private" />
        ) : (
          <LoginTabContent 
            title="Logg inn som privatperson"
            subtitle="Velkommen tilbake til Homni"
            userType="private"
          />
        )}
      </UiTabsContent>
      
      <UiTabsContent value="business">
        {useEnhancedFlow ? (
          <EnhancedLoginForm userType="business" />
        ) : (
          <LoginTabContent 
            title="Logg inn som bedrift"
            subtitle="Logg inn på din bedriftskonto hos Homni"
            userType="business"
          />
        )}
      </UiTabsContent>
    </motion.div>
  );
};
