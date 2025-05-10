
export interface DetachedBuilding {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDetachedBuildingInput {
  name: string;
  description: string;
}

export interface UpdateDetachedBuildingInput {
  id: string;
  name: string;
  description: string;
}
