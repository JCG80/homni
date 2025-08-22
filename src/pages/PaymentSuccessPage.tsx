import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. Welcome to Homni!",
      });
    }
  }, [sessionId]);

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="warm-card shadow-xl">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="h-20 w-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-gradient">
              Payment Successful!
            </CardTitle>
            
            <p className="text-muted-foreground mt-2">
              Welcome to Homni! Your subscription is now active and ready to use.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-success">Subscription Active</p>
                  <p className="text-sm text-muted-foreground">
                    You now have access to all premium features
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">What's next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Set up your first property
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Explore advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Access premium support
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleContinueToDashboard}
              className="w-full warm-button gap-2"
            >
              Continue to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};