import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { AddPropertyForm } from '@/modules/property/components/AddPropertyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewPropertyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/dashboard/user', { 
      state: { message: 'Eiendom opprettet!' }
    });
  };

  return (
    <>
      <Helmet>
        <title>Ny Eiendom - Homni</title>
        <meta name="description" content="Registrer en ny eiendom i Homni for å holde oversikt over dokumenter og vedlikehold" />
        <meta name="keywords" content="ny eiendom, eiendomsregistrering, bolig, dokumentasjon" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">
            Registrer ny eiendom
          </h1>
          <p className="text-muted-foreground mt-1">
            Legg til en eiendom for å holde oversikt over dokumenter og vedlikehold
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Eiendomsinformasjon</CardTitle>
          </CardHeader>
          <CardContent>
            <AddPropertyForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}