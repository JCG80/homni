
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Content, ContentFormValues } from '../types/content-types';
import { loadAllContent, loadContentById, loadContentBySlug, loadPublishedContent } from '../api/loadContent';
import { createContent, updateContent } from '../api/saveContent';
import { deleteContent } from '../api/deleteContent';

export function useContent() {
  const queryClient = useQueryClient();

  // Get all content
  const useAllContent = () => {
    return useQuery({
      queryKey: ['content'],
      queryFn: loadAllContent,
    });
  };

  // Get content by ID
  const useContentById = (id: string | undefined) => {
    return useQuery({
      queryKey: ['content', id],
      queryFn: () => id ? loadContentById(id) : Promise.resolve(null),
      enabled: !!id,
    });
  };

  // Get content by slug
  const useContentBySlug = (slug: string | undefined) => {
    return useQuery({
      queryKey: ['content', 'slug', slug],
      queryFn: () => slug ? loadContentBySlug(slug) : Promise.resolve(null),
      enabled: !!slug,
    });
  };

  // Get published content
  const usePublishedContent = (type?: string) => {
    return useQuery({
      queryKey: ['content', 'published', type],
      queryFn: () => loadPublishedContent(type),
    });
  };

  // Create content mutation
  const useCreateContent = () => {
    return useMutation({
      mutationFn: createContent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content'] });
      },
    });
  };

  // Update content mutation
  const useUpdateContent = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ContentFormValues> }) => 
        updateContent(id, data),
      onSuccess: (data) => {
        if (data?.id) {
          queryClient.invalidateQueries({ queryKey: ['content'] });
          queryClient.invalidateQueries({ queryKey: ['content', data.id] });
          queryClient.invalidateQueries({ queryKey: ['content', 'slug', data.slug] });
        }
      },
    });
  };

  // Delete content mutation
  const useDeleteContent = () => {
    return useMutation({
      mutationFn: deleteContent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content'] });
      },
    });
  };

  return {
    useAllContent,
    useContentById,
    useContentBySlug,
    usePublishedContent,
    useCreateContent,
    useUpdateContent,
    useDeleteContent,
  };
}
