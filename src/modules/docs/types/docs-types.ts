
export interface ProjectDoc {
  id: string;
  title: string;
  content: string;
  doc_type: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProjectDocFormValues {
  id?: string;
  title: string;
  content: string;
  doc_type: string;
  status: 'active' | 'archived';
}

export type ProjectDocStatus = 'Planlagt' | 'Påbegynt' | 'Nesten ferdig' | 'Ferdig';
