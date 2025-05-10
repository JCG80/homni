
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  useInsuranceCompanies,
  useCreateInsuranceCompany,
  useUpdateInsuranceCompany,
  useDeleteInsuranceCompany
} from '../hooks/useInsuranceQueries';
import { InsuranceCompany } from '../types/insurance-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, Plus, Trash2, Edit, Star, Award, X, Check, Search 
} from 'lucide-react';

export const AdminInsuranceCompaniesPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: companies = [], isLoading } = useInsuranceCompanies();
  const createCompany = useCreateInsuranceCompany();
  const updateCompany = useUpdateInsuranceCompany();
  const deleteCompany = useDeleteInsuranceCompany();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    is_featured: false
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      description: '',
      is_featured: false
    });
    setEditingCompany(null);
  };
  
  const handleOpenDialog = (company?: InsuranceCompany) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        logo_url: company.logo_url || '',
        description: company.description || '',
        is_featured: company.is_featured || false
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_featured: checked
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      await updateCompany.mutateAsync({
        id: editingCompany.id,
        updates: formData
      });
    } else {
      await createCompany.mutateAsync(formData);
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteClick = (companyId: string) => {
    setCompanyToDelete(companyId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (companyToDelete) {
      await deleteCompany.mutateAsync(companyToDelete);
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };
  
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // If not admin, show unauthorized message
  if (!authLoading && !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ingen tilgang</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Du har ikke tilgang til å administrere forsikringsselskaper.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Building className="h-8 w-8 mr-2 text-primary" />
          Administrer forsikringsselskaper
        </h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nytt selskap
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk selskaper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Anmeldelser</TableHead>
                  <TableHead>Anbefalt</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Ingen forsikringsselskaper funnet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {company.customer_rating?.toFixed(1) || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{company.review_count || 0}</TableCell>
                      <TableCell>
                        {company.is_featured ? (
                          <Badge className="bg-primary/20 text-primary flex items-center">
                            <Award className="h-3 w-3 mr-1" /> Ja
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <X className="h-3 w-3 mr-1" /> Nei
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenDialog(company)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Rediger
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(company.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Slett
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Company Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? `Rediger ${editingCompany.name}` : 'Nytt forsikringsselskap'}
            </DialogTitle>
            <DialogDescription>
              Fyll inn informasjon om forsikringsselskapet.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Selskapsnavn"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Beskriv forsikringsselskapet"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_featured">Vis som anbefalt</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                Avbryt
              </Button>
              <Button type="submit">
                {editingCompany ? 'Lagre endringer' : 'Opprett selskap'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette forsikringsselskapet og alle tilknyttede data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
