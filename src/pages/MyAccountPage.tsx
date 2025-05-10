
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, FileText, User, Edit, Plus, Mail } from 'lucide-react';
import { ProfileCard } from '@/components/account/ProfileCard';
import { ReviewsCard } from '@/components/account/ReviewsCard';
import { OffersCard } from '@/components/account/OffersCard';
import { MessagesCard } from '@/components/account/MessagesCard';
import { NewsletterSignup } from '@/components/account/NewsletterSignup';

export const MyAccountPage = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'bruker';

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-medium text-foreground">
          Hei, <span className="text-gradient font-semibold">{userName}</span>! Hva ønsker du å gjøre i dag?
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <ReviewsCard />
        <OffersCard />
        <MessagesCard />
        <ProfileCard />
      </div>

      <div className="space-y-8">
        <div className="warm-card p-8">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-primary" />
            Motta våre beste sparetips
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              className="soft-input"
              placeholder="Din e-postadresse"
              type="email"
            />
            <Button className="warm-button">
              Motta tips
            </Button>
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <span className="w-2 h-6 bg-primary rounded-full mr-2"></span>
            Våre samarbeidspartnere
          </h2>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="text-primary hover:underline">Boliglånspartner</a>
            <a href="#" className="text-primary hover:underline">Forsikringspartner</a>
            <a href="#" className="text-primary hover:underline">Energi-partner</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
