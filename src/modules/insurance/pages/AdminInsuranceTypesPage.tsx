
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  useInsuranceTypes,
  useCreateInsuranceType,
  useUpdateInsuranceType,
  useDeleteInsuranceType
} from '../hooks/useInsuranceQueries';
import { InsuranceType } from '../types/insurance-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tag, Plus, Trash2, Edit, Search 
} from 'lucide-react';
import { InsuranceTypeTag } from '../components/InsuranceTypeTag';

export const AdminInsuranceTypesPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: types = [], isLoading } = useInsuranceTypes();
  const createType = useCreateInsuranceType();
  const updateType = useUpdateInsuranceType();
  const deleteType = useDeleteInsuranceType();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<InsuranceType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: ''
    });
    setEditingType(null);
  };
  
  const handleOpenDialog = (type?: InsuranceType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        slug: type.slug,
        description: type.description || ''
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
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
      // Auto-generate slug from name if it's not being edited directly
      ...(e.target.name === 'name' && !editingType ? {
        slug: value.toLowerCase()
          .replace(/[æå]/g, 'a')
          .replace(/ø/g, 'o')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      } : {})
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType) {
      await updateType.mutateAsync({
        id: editingType.id,
        updates: formData
      });
    } else {
      await createType.mutateAsync(formData);
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteClick = (typeId: string) => {
    setTypeToDelete(typeId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (typeToDelete) {
      await deleteType.mutateAsync(typeToDelete);
      setIsDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };
  
  const filteredTypes = types.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.slug.includes(searchQuery.toLowerCase())
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
            <p>Du har ikke tilgang til å administrere forsikringstyper.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Tag className="h-8 w-8 mr-2 text-primary" />
          Administrer forsikringstyper
        </h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ny forsikringstype
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk forsikringstyper..."
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
                  <TableHead>Type</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Ingen forsikringstyper funnet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <InsuranceTypeTag type={type} />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{type.slug}</TableCell>
                      <TableCell className="max-w-xs truncate">{type.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenDialog(type)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Rediger
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(type.id)}
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

      {/* Insurance Type Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingType ? `Rediger ${editingType.name}` : 'Ny forsikringstype'}
            </DialogTitle>
            <DialogDescription>
              Fyll inn informasjon om forsikringstypen.
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
                  placeholder="Forsikringstype"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="forsikringstype-slug"
                  required
                  className="font-mono text-sm"
                  disabled={!!editingType}
                />
                {!editingType && (
                  <p className="text-xs text-muted-foreground">
                    Slug genereres automatisk fra navn, men kan tilpasses.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Beskriv forsikringstypen"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                Avbryt
              </Button>
              <Button type="submit">
                {editingType ? 'Lagre endringer' : 'Opprett type'}
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
              Dette vil permanent slette forsikringstypen og fjerne all tilknytning til forsikringsselskaper.
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
