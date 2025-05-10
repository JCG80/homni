
import React, { useState } from 'react';
import { useContent } from '../hooks/useContent';
import { ContentCard } from '../components/ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const ContentDashboard: React.FC = () => {
  const { useAllContent, useDeleteContent } = useContent();
  const { data: contents = [], isLoading } = useAllContent();
  const { mutate: deleteContentMutation } = useDeleteContent();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const { role } = useAuth();
  
  const isMasterAdmin = role === 'master-admin' || role === 'admin';

  const handleDelete = (id: string) => {
    if (window.confirm('Er du sikker på at du vil slette dette innholdet?')) {
      deleteContentMutation(id);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(search.toLowerCase()) || 
                          content.body?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || content.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Innholdsoversikt</h1>
        <Button asChild>
          <Link to="/admin/content/new">Lag nytt innhold</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="md:w-2/3">
          <Input
            placeholder="Søk etter innhold..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:w-1/3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Alle typer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle typer</SelectItem>
              <SelectItem value="article">Artikler</SelectItem>
              <SelectItem value="news">Nyheter</SelectItem>
              <SelectItem value="guide">Guider</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Ingen innhold funnet</p>
          <Button asChild className="mt-4">
            <Link to="/admin/content/new">Lag nytt innhold</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => (
            <ContentCard 
              key={content.id} 
              content={content} 
              onDelete={isMasterAdmin ? handleDelete : undefined} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
