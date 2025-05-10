
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      toast({
        title: "Takk for påmeldingen!",
        description: "Du vil nå motta våre beste sparetips.",
      });
    }, 1000);
  };

  return (
    <Card className="bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-800">Få våre beste sparetips</h3>
            <p className="text-blue-700 mt-1">
              Meld deg på vårt nyhetsbrev og få tilgang til eksklusive sparetips og tilbud.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="email"
                placeholder="Din e-postadresse"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sender...' : 'Motta tips'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
