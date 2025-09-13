import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MessageSquare, Briefcase, Star, Plus } from 'lucide-react';
import { ReviewsCard } from '@/components/account/ReviewsCard';
import { OffersCard } from '@/components/account/OffersCard';
import { MessagesCard } from '@/components/account/MessagesCard';
import { Link } from 'react-router-dom';
import { LeadsNavigationBar } from '@/components/leads/LeadsNavigationBar';

const LeadsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mine Forespørsler - Homni</title>
        <meta 
          name="description" 
          content="Administrer forespørsler, meldinger, tilbud og omtaler. Hold oversikt over all kommunikasjon med tjenesteleverandører." 
        />
        <meta name="keywords" content="forespørsler, leads, meldinger, tilbud, omtaler, tjenesteleverandører" />
        <meta property="og:title" content="Mine Forespørsler - Homni" />
        <meta property="og:description" content="Din oversikt over alle forespørsler og kommunikasjon" />
        <link rel="canonical" href="https://homni.no/leads" />
      </Helmet>

      <LeadsNavigationBar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Mine Forespørsler
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hold oversikt over forespørsler, meldinger, tilbud og omtaler
            </p>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Hurtighandlinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button asChild className="h-auto flex-col gap-2 p-4">
                  <Link to="/">
                    <Plus className="h-5 w-5" />
                    <span>Send ny forespørsel</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Link to="/leads?tab=messages">
                    <MessageSquare className="h-5 w-5" />
                    <span>Se alle meldinger</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Link to="/leads?tab=offers">
                    <Briefcase className="h-5 w-5" />
                    <span>Sammenlign tilbud</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                Oversikt
              </TabsTrigger>
              <TabsTrigger value="messages">
                Meldinger
              </TabsTrigger>
              <TabsTrigger value="offers">
                Tilbud
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Omtaler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MessagesCard />
                <OffersCard />
                <ReviewsCard />
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="max-w-2xl mx-auto">
                <MessagesCard />
              </div>
            </TabsContent>

            <TabsContent value="offers">
              <div className="max-w-2xl mx-auto">
                <OffersCard />
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="max-w-2xl mx-auto">
                <ReviewsCard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;