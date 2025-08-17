import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Calculator, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PropertyPurchasePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Boligkjøp</h1>
            <p className="text-muted-foreground">Råd og verktøy for boligkjøp</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Lånekalkulatorer</CardTitle>
              </div>
              <CardDescription>
                Beregn hvor mye du kan låne og månedlige kostnader
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Kommer snart
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Kjøpsguide</CardTitle>
              </div>
              <CardDescription>
                Steg-for-steg guide til boligkjøp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Kommer snart
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <CardTitle>Boligsøk</CardTitle>
              </div>
              <CardDescription>
                Søk etter boliger som passer ditt budsjett
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Kommer snart
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Ekspertrådgivning</CardTitle>
              </div>
              <CardDescription>
                Få hjelp fra erfarne boligkjøpsrådgivere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Kommer snart
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Om Boligkjøp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Boligkjøp er en av de største investeringene du gjør i livet. Her finner du verktøy og 
                ressurser som hjelper deg å ta informerte beslutninger gjennom hele kjøpsprosessen.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Planlegging</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Budsjettkalkulatorer</li>
                    <li>• Lånemuligheter</li>
                    <li>• Kostnadsoversikt</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Gjennomføring</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Boligsøk og sammenligning</li>
                    <li>• Bud og forhandling</li>
                    <li>• Kontraktshjelp</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};