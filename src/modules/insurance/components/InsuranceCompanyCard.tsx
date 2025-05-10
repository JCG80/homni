
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Info, Building, Award } from "lucide-react";
import { InsuranceCompany } from '../types/insurance-types';

interface InsuranceCompanyCardProps {
  company: InsuranceCompany;
  onClick?: () => void;
}

export const InsuranceCompanyCard = ({ company, onClick }: InsuranceCompanyCardProps) => {
  return (
    <Card 
      className="hover:shadow-md transition-all duration-300 cursor-pointer" 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{company.name}</CardTitle>
          {company.is_featured && (
            <Badge className="bg-primary/20 text-primary">
              <Award className="h-3 w-3 mr-1" /> Anbefalt
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {company.logo_url && (
          <div className="flex justify-center mb-4">
            <img 
              src={company.logo_url} 
              alt={`${company.name} logo`}
              className="h-16 object-contain" 
            />
          </div>
        )}
        {company.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {company.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>{company.customer_rating?.toFixed(1) || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {company.review_count} {company.review_count === 1 ? 'anmeldelse' : 'anmeldelser'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
