
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, FileText, User, Bell, Mail, Heart, Home } from 'lucide-react';
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
        <h1 className="text-3xl font-medium text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Hei, <span className="text-gradient font-semibold">{userName}</span>! 
          <span className="text-muted-foreground text-lg font-normal ml-1">Hva ønsker du å gjøre i dag?</span>
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
              <Bell className="h-4 w-4 mr-2" /> Motta tips
            </Button>
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            Våre samarbeidspartnere
          </h2>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="flex items-center gap-1 text-primary hover:underline">
              <Home className="h-4 w-4" /> Boliglånspartner
            </a>
            <a href="#" className="flex items-center gap-1 text-primary hover:underline">
              <Bell className="h-4 w-4" /> Forsikringspartner
            </a>
            <a href="#" className="flex items-center gap-1 text-primary hover:underline">
              <Mail className="h-4 w-4" /> Energi-partner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
