
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LeadOverviewWidget: React.FC = () => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Lead Overview
        </CardTitle>
        <CardDescription>Recent leads and activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold">12</h3>
            <p className="text-sm text-muted-foreground">New leads</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold">5</h3>
            <p className="text-sm text-muted-foreground">In progress</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold">4</h3>
            <p className="text-sm text-muted-foreground">Converted</p>
          </div>
        </div>
        
        <div className="rounded-lg border border-muted p-4">
          <h4 className="font-medium mb-3">Recent activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
              <span className="text-sm">Anders Pedersen - Home insurance</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
              <span className="text-sm">Mia Hansen - Property listing</span>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
              <span className="text-sm">Lars Johansen - Mortgage quote</span>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link to="/leads/kanban">
              View Kanban <Calendar className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link to="/leads">
              View all leads <Activity className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
