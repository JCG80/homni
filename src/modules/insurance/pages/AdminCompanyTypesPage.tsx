
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  useInsuranceCompany,
  useInsuranceTypes,
  useCompanyTypes,
  useAssociateCompanyWithType,
  useRemoveCompanyTypeAssociation
} from '../hooks/useInsuranceQueries';
import { InsuranceType } from '../types/insurance-types';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsuranceTypeTag } from '../components/InsuranceTypeTag';
import { 
  Building, ArrowLeft, Plus, Tag 
} from 'lucide-react';

export const AdminCompanyTypesPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading: companyLoading } = useInsuranceCompany(companyId || '');
  const { data: allTypes = [], isLoading: typesLoading } = useInsuranceTypes();
  const { data: companyTypes = [], isLoading: companyTypesLoading } = useCompanyTypes(companyId || '');
  const associateType = useAssociateCompanyWithType();
  const removeType = useRemoveCompanyTypeAssociation();
  
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [availableTypes, setAvailableTypes] = useState<InsuranceType[]>([]);
  
  useEffect(() => {
    if (allTypes.length > 0 && companyTypes) {
      // Filter out types that are already associated with the company
      const companyTypeIds = companyTypes.map(type => type.id);
      const filteredTypes = allTypes.filter(type => !companyTypeIds.includes(type.id));
      setAvailableTypes(filteredTypes);
      
      // Reset selected type if none available
      if (filteredTypes.length > 0 && !filteredTypes.find(t => t.id === selectedTypeId)) {
        setSelectedTypeId(filteredTypes[0].id);
      }
    }
  }, [allTypes, companyTypes, selectedTypeId]);
  
  const handleAddType = async () => {
    if (companyId && selectedTypeId) {
      await associateType.mutateAsync({ 
        companyId, 
        typeId: selectedTypeId 
      });
    }
  };
  
  const handleRemoveType = async (typeId: string) => {
    if (companyId) {
      await removeType.mutateAsync({
        companyId,
        typeId
      });
    }
  };
  
  // If not admin, show unauthorized message
  if (!authLoading && !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ingen tilgang</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Du har ikke tilgang til å administrere forsikringstilbud.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isLoading = companyLoading || typesLoading || companyTypesLoading;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/admin/insurance/companies')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            {companyLoading ? (
              "Laster..."
            ) : (
              <>
                <Building className="h-8 w-8 mr-2 text-primary" />
                Administrer forsikringstyper for {company?.name}
              </>
            )}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Legg til forsikringstype
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select
                    value={selectedTypeId}
                    onValueChange={setSelectedTypeId}
                    disabled={availableTypes.length === 0}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Velg forsikringstype" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                      {availableTypes.length === 0 && (
                        <SelectItem value="none" disabled>
                          Ingen flere typer tilgjengelig
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddType}
                    disabled={!selectedTypeId || availableTypes.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Nåværende forsikringstyper
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companyTypes.length === 0 ? (
                  <p className="text-muted-foreground">
                    Ingen forsikringstyper er tilknyttet dette selskapet ennå.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {companyTypes.map(type => (
                      <InsuranceTypeTag
                        key={type.id}
                        type={type}
                        onRemove={() => handleRemoveType(type.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
