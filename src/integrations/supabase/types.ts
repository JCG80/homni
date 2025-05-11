export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      company_insurance_types: {
        Row: {
          company_id: string
          created_at: string
          id: string
          type_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          type_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_insurance_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_insurance_types_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "insurance_types"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          modules_access: string[] | null
          name: string
          phone: string | null
          status: string | null
          subscription_plan: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          modules_access?: string[] | null
          name: string
          phone?: string | null
          status?: string | null
          subscription_plan?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          modules_access?: string[] | null
          name?: string
          phone?: string | null
          status?: string | null
          subscription_plan?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      company_reviews: {
        Row: {
          company_id: string
          content: string
          created_at: string
          id: string
          is_verified: boolean | null
          rating: number
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating: number
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          body: string | null
          created_at: string | null
          created_by: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      detached_buildings: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_companies: {
        Row: {
          created_at: string
          customer_rating: number | null
          description: string | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          name: string
          review_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_rating?: number | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_rating?: number | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          review_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      insurance_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          method: string
          new_status: string | null
          previous_status: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          method: string
          new_status?: string | null
          previous_status?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          method?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_settings: {
        Row: {
          agents_paused: boolean
          auto_distribute: boolean | null
          budget: number | null
          company_id: string | null
          daily_budget: number | null
          filters: Json
          global_pause: boolean
          globally_paused: boolean
          id: string
          monthly_budget: number | null
          strategy: string
          updated_at: string
        }
        Insert: {
          agents_paused?: boolean
          auto_distribute?: boolean | null
          budget?: number | null
          company_id?: string | null
          daily_budget?: number | null
          filters?: Json
          global_pause?: boolean
          globally_paused?: boolean
          id?: string
          monthly_budget?: number | null
          strategy?: string
          updated_at?: string
        }
        Update: {
          agents_paused?: boolean
          auto_distribute?: boolean | null
          budget?: number | null
          company_id?: string | null
          daily_budget?: number | null
          filters?: Json
          global_pause?: boolean
          globally_paused?: boolean
          id?: string
          monthly_budget?: number | null
          strategy?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          category: string
          company_id: string | null
          created_at: string
          description: string
          id: string
          lead_type: string | null
          metadata: Json | null
          status: string
          submitted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          lead_type?: string | null
          metadata?: Json | null
          status?: string
          submitted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          lead_type?: string | null
          metadata?: Json | null
          status?: string
          submitted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_docs: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          doc_type: string
          id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          doc_type: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          doc_type?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          purchase_date: string | null
          size: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          purchase_date?: string | null
          size?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          purchase_date?: string | null
          size?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_documents: {
        Row: {
          created_at: string
          document_type: string
          file_path: string | null
          id: string
          name: string
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_path?: string | null
          id?: string
          name: string
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_path?: string | null
          id?: string
          name?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          name: string
          property_id: string
          recurring: boolean | null
          recurring_frequency: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          name: string
          property_id: string
          recurring?: boolean | null
          recurring_frequency?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          name?: string
          property_id?: string
          recurring?: boolean | null
          recurring_frequency?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_transfers: {
        Row: {
          id: string
          new_owner_id: string
          notes: string | null
          previous_owner_id: string
          property_id: string
          transfer_date: string
        }
        Insert: {
          id?: string
          new_owner_id: string
          notes?: string | null
          previous_owner_id: string
          property_id: string
          transfer_date?: string
        }
        Update: {
          id?: string
          new_owner_id?: string
          notes?: string | null
          previous_owner_id?: string
          property_id?: string
          transfer_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_transfers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lead_filters: {
        Row: {
          created_at: string
          filter_data: Json
          filter_name: string | null
          id: string
          is_default: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_data?: Json
          filter_name?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_data?: Json
          filter_name?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          metadata: Json
          phone: string | null
          preferences: Json | null
          profile_picture_url: string | null
          region: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          metadata?: Json
          phone?: string | null
          preferences?: Json | null
          profile_picture_url?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json
          phone?: string | null
          preferences?: Json | null
          profile_picture_url?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_profile: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          full_name: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }[]
      }
      list_all_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }[]
      }
      update_user_profile: {
        Args: {
          user_id: string
          full_name: string
          email: string
          phone: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
