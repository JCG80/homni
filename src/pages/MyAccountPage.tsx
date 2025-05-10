
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-medium text-gray-800">
          Hei, {userName}! Hva ønsker du å gjøre i dag?
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <ReviewsCard />
        <OffersCard />
        <MessagesCard />
        <ProfileCard />
      </div>

      <div className="space-y-8">
        <NewsletterSignup />
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Våre samarbeidspartnere</h2>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="text-blue-600 hover:underline">Boliglånspartner</a>
            <a href="#" className="text-blue-600 hover:underline">Forsikringspartner</a>
            <a href="#" className="text-blue-600 hover:underline">Energi-partner</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
