import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Search, Star, Building2 } from 'lucide-react';
import { InsuranceCompany } from '../types/insurance-types';

const fetchPublishedInsuranceCompanies = async (): Promise<InsuranceCompany[]> => {
  const { data, error } = await supabase
    .from('insurance_companies')
    .select('*')
    .eq('is_published', true)
    .order('sort_index', { ascending: true })
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const PublicCompaniesDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: companies, isLoading } = useQuery({
    queryKey: ['publicInsuranceCompanies'],
    queryFn: fetchPublishedInsuranceCompanies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredCompanies = companies?.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[500px] mx-auto mb-8" />
          <Skeleton className="h-10 w-full max-w-md mx-auto mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Forsikringsselskaper</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Utforsk og sammenlign forsikringsselskaper i Norge. Finn riktig forsikring for dine behov.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Søk etter forsikringsselskap..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Viser {filteredCompanies.length} av {companies?.length || 0} forsikringsselskaper
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{company.name}</h3>
                  {company.is_featured && (
                    <Badge variant="secondary" className="text-xs">
                      Anbefalt
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                {/* Company Logo Placeholder */}
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="w-16 h-16 object-contain mb-4 rounded-lg bg-muted/50 p-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {company.description || `${company.name} tilbyr forsikringsløsninger for privatpersoner og bedrifter.`}
                </p>

                {/* Rating */}
                {company.customer_rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{company.customer_rating}</span>
                    {company.review_count && (
                      <span className="text-muted-foreground">
                        ({company.review_count} anmeldelser)
                      </span>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  asChild
                >
                  <a 
                    href={company.website_url || `https://${company.name.toLowerCase()}.no`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Gå til nettside
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredCompanies.length === 0 && companies && companies.length > 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Ingen forsikringsselskaper funnet for "{searchTerm}"
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Tilbakestill søk
            </Button>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Informasjonen er hentet fra offentlige kilder. Vi anbefaler at du kontakter forsikringsselskapet direkte for oppdaterte priser og vilkår.
          </p>
        </div>
      </div>
    </div>
  );
};