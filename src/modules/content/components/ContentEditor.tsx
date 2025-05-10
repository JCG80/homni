
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ContentFormValues, ContentType } from '../types/content-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ContentEditorProps {
  initialValues?: Partial<ContentFormValues>;
  onSubmit: (data: ContentFormValues) => void;
  isLoading?: boolean;
}

const formSchema = z.object({
  title: z.string().min(2, { message: 'Tittel må være minst 2 tegn' }),
  slug: z.string().min(2, { message: 'Slug må være minst 2 tegn' }).regex(/^[a-z0-9-]+$/, {
    message: 'Slug kan kun inneholde små bokstaver, tall og bindestrek',
  }),
  body: z.string(),
  type: z.enum(['article', 'news', 'guide']),
  published: z.boolean(),
  published_at: z.string().nullable(),
});

export const ContentEditor: React.FC<ContentEditorProps> = ({ initialValues, onSubmit, isLoading }) => {
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title || '',
      slug: initialValues?.slug || '',
      body: initialValues?.body || '',
      type: initialValues?.type || 'article',
      published: initialValues?.published || false,
      published_at: initialValues?.published_at || null,
    },
  });

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')    // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-');   // Replace multiple - with single -
  };

  const onTitleChange = (title: string) => {
    if (!form.getValues('slug') || form.getValues('slug') === slugify(form.getValues('title'))) {
      form.setValue('slug', slugify(title));
    }
  };

  const handleSubmit = (data: ContentFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tittel</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Skriv inn tittel" 
                  onChange={(e) => {
                    field.onChange(e);
                    onTitleChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="din-artikkel-slug" 
                />
              </FormControl>
              <FormDescription>
                Dette blir URL-en til innholdet, f.eks. /innhold/din-artikkel-slug
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="article">Artikkel</SelectItem>
                  <SelectItem value="news">Nyhet</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Innhold</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Skriv innholdet her..." 
                  className="min-h-[250px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row space-x-6">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Publisér innhold</FormLabel>
              </FormItem>
            )}
          />

          {form.watch('published') && (
            <FormField
              control={form.control}
              name="published_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publiseringsdato</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local"
                      {...field}
                      value={field.value || new Date().toISOString().slice(0, 16)}
                      onChange={(e) => {
                        field.onChange(e.target.value || null);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Lagrer...' : 'Lagre innhold'}
        </Button>
      </form>
    </Form>
  );
};
