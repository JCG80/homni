
import { supabase } from "@/lib/supabaseClient";
import { ApiError } from "@/utils/apiHelpers";
import { 
  DetachedBuilding,
  CreateDetachedBuildingInput,
  UpdateDetachedBuildingInput
} from "../types/detached-buildings-types";

const TABLE_NAME = 'detached_buildings';

/**
 * Fetches all detached buildings
 */
export const fetchDetachedBuildings = async (): Promise<DetachedBuilding[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new ApiError('fetchDetachedBuildings', error);
  }
};

/**
 * Fetches a detached building by ID
 */
export const fetchDetachedBuildingById = async (id: string): Promise<DetachedBuilding | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new ApiError('fetchDetachedBuildingById', error);
  }
};

/**
 * Creates a new detached building
 */
export const createDetachedBuilding = async (
  buildingData: CreateDetachedBuildingInput
): Promise<DetachedBuilding> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([buildingData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new ApiError('createDetachedBuilding', error);
  }
};

/**
 * Updates an existing detached building
 */
export const updateDetachedBuilding = async (
  buildingData: UpdateDetachedBuildingInput
): Promise<DetachedBuilding> => {
  try {
    const { id, ...updateData } = buildingData;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new ApiError('updateDetachedBuilding', error);
  }
};

/**
 * Deletes a detached building
 */
export const deleteDetachedBuilding = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    throw new ApiError('deleteDetachedBuilding', error);
  }
};
