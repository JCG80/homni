
export interface DetachedBuilding {
  id: string;
  name: string;
  description: string;
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
