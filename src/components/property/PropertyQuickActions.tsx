import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Settings, Heart, Plus, TrendingUp } from 'lucide-react';

export const PropertyQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hurtighandlinger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 p-3">
            <Link to="/property/new">
              <Plus className="h-4 w-4" />
              <span className="text-xs">Ny eiendom</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 p-3">
            <Link to="?tab=documents">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Dokumenter</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 p-3">
            <Link to="?tab=maintenance">
              <Settings className="h-4 w-4" />
              <span className="text-xs">Vedlikehold</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 p-3">
            <Link to="?tab=propr">
              <Heart className="h-4 w-4" />
              <span className="text-xs">DIY Salg</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 p-3">
            <Link to="/property/analytics">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Analyser</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};