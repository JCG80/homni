
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInsuranceCompany, useCompanyTypes, useCompanyReviews } from '../hooks/useInsuranceQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, Star, ArrowLeft, Calendar, Award, User 
} from 'lucide-react';
import { InsuranceTypeTag } from '../components/InsuranceTypeTag';
import { PageLayout } from '@/components/layout/PageLayout';

export const CompanyDetailsPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading: companyLoading } = useInsuranceCompany(companyId || '');
  const { data: companyTypes = [], isLoading: typesLoading } = useCompanyTypes(companyId || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useCompanyReviews(companyId || '');

  const isLoading = companyLoading || typesLoading || reviewsLoading;
  
  if (isLoading) {
    return (
      <PageLayout title="Bedriftsdetaljer" description="Laster inn bedriftsinformasjon...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!company) {
    return (
      <PageLayout title="Fant ikke bedriften" description="Vi kunne ikke finne bedriften du leter etter">
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <Building className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Finner ikke selskapet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Vi kunne ikke finne forsikringsselskapet du leter etter.
            </p>
            <Button onClick={() => navigate('/insurance/companies')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til oversikten
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={company.name} 
      description={`Detaljer for forsikringsselskapet ${company.name}`}
    >
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={() => navigate('/insurance/companies')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Alle forsikringsselskaper
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left column - Logo and basic info */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={`${company.name} logo`}
                      className="h-32 object-contain mb-4" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 w-32 bg-muted rounded-lg mb-4">
                      <Building className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold text-center mb-2">{company.name}</h1>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-semibold">{company.customer_rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({company.review_count || 0} anmeldelser)
                    </span>
                  </div>
                  
                  {company.is_featured && (
                    <Badge className="bg-primary/20 text-primary mb-4">
                      <Award className="h-3 w-3 mr-1" /> Anbefalt selskap
                    </Badge>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {companyTypes.map(type => (
                      <InsuranceTypeTag key={type.id} type={type} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Description and reviews */}
          <div className="w-full md:w-2/3 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Om {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.description ? (
                  <p>{company.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Ingen beskrivelse tilgjengelig for dette selskapet.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Anmeldelser
                </CardTitle>
                <Badge variant="outline">{reviews.length} totalt</Badge>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    Ingen anmeldelser ennå for dette selskapet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map(review => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-semibold">{review.title}</h3>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm mb-2">{review.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>Anonym bruker</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(review.created_at).toLocaleDateString('nb-NO')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {reviews.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm">
                          Se alle {reviews.length} anmeldelser
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
