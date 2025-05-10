
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Sample data for demonstration
const SAMPLE_BUILDINGS = [
  { id: '1', name: 'Garasje', description: 'Frittstående garasje' },
  { id: '2', name: 'Uthus', description: 'Standard uthus' },
  { id: '3', name: 'Anneks', description: 'Anneks med overnatting' },
  { id: '4', name: 'Carport', description: 'Åpen carport' },
  { id: '5', name: 'Redskapsbod', description: 'Bod til hageredskaper' },
];

// Form schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(2, { message: 'Navnet må være minst 2 tegn' })
    .max(50, { message: 'Navnet kan ikke være mer enn 50 tegn' }),
  description: z.string()
    .min(2, { message: 'Beskrivelsen må være minst 2 tegn' })
    .max(200, { message: 'Beskrivelsen kan ikke være mer enn 200 tegn' }),
});

export const AdminDetachedBuildingsPage = () => {
  const [buildings, setBuildings] = useState(SAMPLE_BUILDINGS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.id) {
      // Edit existing building
      setBuildings(buildings.map(building => 
        building.id === values.id 
          ? { ...building, name: values.name, description: values.description }
          : building
      ));
      toast.success('Bygningstype oppdatert');
    } else {
      // Add new building
      const newBuilding = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
      };
      setBuildings([...buildings, newBuilding]);
      toast.success('Bygningstype lagt til');
    }
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEdit = (building: typeof SAMPLE_BUILDINGS[0]) => {
    form.reset({
      id: building.id,
      name: building.name,
      description: building.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne bygningstypen?')) {
      setBuildings(buildings.filter(building => building.id !== id));
      toast.success('Bygningstype slettet');
    }
  };

  const handleAddNew = () => {
    form.reset({
      id: undefined,
      name: '',
      description: '',
    });
    setIsDialogOpen(true);
  };

  // Filter buildings based on search term
  const filteredBuildings = buildings.filter(building => 
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrer frittstående bygninger</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Legg til ny bygningstype
        </Button>
      </div>
      
      <div className="mb-6">
        <Input 
          placeholder="Søk etter bygningstyper..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableCaption>Liste over tilgjengelige bygningstyper for forsikring</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Beskrivelse</TableHead>
            <TableHead className="w-[150px]">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBuildings.map((building) => (
            <TableRow key={building.id}>
              <TableCell className="font-medium">{building.name}</TableCell>
              <TableCell>{building.description}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(building)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(building.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredBuildings.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Ingen bygningstyper funnet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.getValues().id ? 'Rediger bygningstype' : 'Legg til ny bygningstype'}
            </DialogTitle>
            <DialogDescription>
              Fyll ut informasjonen under og klikk på lagre for å fortsette.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn</FormLabel>
                    <FormControl>
                      <Input placeholder="f.eks. Garasje" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse</FormLabel>
                    <FormControl>
                      <Input placeholder="Kort beskrivelse av bygningstypen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">
                  {form.getValues().id ? 'Oppdater' : 'Legg til'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
