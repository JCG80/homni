
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById } from '../api'; // Updated import
import { getPropertyExpenses, getPropertyDocuments } from '../api'; // Updated imports
import { Property, PropertyExpense, PropertyDocument } from '../types/propertyTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, House, Calendar } from 'lucide-react';
import { formatDate, formatCurrency, getPropertyTypeLabel } from '../utils/propertyUtils';

export const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [expenses, setExpenses] = useState<PropertyExpense[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyId) return;
      
      setIsLoading(true);
      try {
        const propertyData = await getPropertyById(propertyId);
        if (propertyData) {
          setProperty(propertyData);
          
          // Load related data
          const [expensesData, documentsData] = await Promise.all([
            getPropertyExpenses(propertyId),
            getPropertyDocuments(propertyId)
          ]);
          
          setExpenses(expensesData);
          setDocuments(documentsData);
        } else {
          // Property not found, redirect back to list
          navigate('/properties');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPropertyData();
  }, [propertyId, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Eiendom ikke funnet</h1>
          <Button onClick={() => navigate('/properties')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til mine eiendommer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/properties')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbake til oversikten
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <House className="h-5 w-5 mr-2" />
            <h1 className="text-2xl font-bold">{property.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {property.address || 'Ingen adresse registrert'} • {getPropertyTypeLabel(property.type)}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center text-muted-foreground text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Registrert: {formatDate(property.created_at)}</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="expenses">Utgifter</TabsTrigger>
          <TabsTrigger value="documents">Dokumenter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Eiendomsinformasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                    <dd className="mt-1">{getPropertyTypeLabel(property.type)}</dd>
                  </div>
                  
                  {property.size && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Størrelse</dt>
                      <dd className="mt-1">{property.size} m²</dd>
                    </div>
                  )}
                  
                  {property.address && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Adresse</dt>
                      <dd className="mt-1">{property.address}</dd>
                    </div>
                  )}
                  
                  {property.purchase_date && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Kjøpsdato</dt>
                      <dd className="mt-1">{formatDate(property.purchase_date)}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sammendrag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Totale utgifter</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dokumenter</p>
                    <p className="text-2xl font-bold">{documents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Utgifter</CardTitle>
              <CardDescription>
                Oversikt over utgifter knyttet til eiendommen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Ingen utgifter registrert for denne eiendommen.</p>
                  <Button className="mt-4">Legg til utgift</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <div>Beskrivelse</div>
                    <div>Dato</div>
                    <div className="text-right">Beløp</div>
                  </div>
                  
                  {expenses.map((expense) => (
                    <div key={expense.id} className="grid grid-cols-3 text-sm py-2">
                      <div>{expense.name}</div>
                      <div>{formatDate(expense.date)}</div>
                      <div className="text-right font-medium">{formatCurrency(expense.amount)}</div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t mt-6">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumenter</CardTitle>
              <CardDescription>
                Viktige dokumenter knyttet til eiendommen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Ingen dokumenter registrert for denne eiendommen.</p>
                  <Button className="mt-4">Last opp dokument</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <div>Navn</div>
                    <div>Type</div>
                    <div>Dato</div>
                  </div>
                  
                  {documents.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-3 text-sm py-2">
                      <div>{doc.name}</div>
                      <div>{doc.document_type}</div>
                      <div>{formatDate(doc.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
