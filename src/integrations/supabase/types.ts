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
      activity_logs: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string
          id: string
          logo_url: string | null
          name: string
          tags: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description: string
          id?: string
          logo_url?: string | null
          name: string
          tags?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string
          id?: string
          logo_url?: string | null
          name?: string
          tags?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_management: {
        Row: {
          content: string
          created_at: string | null
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          content_type: string
          created_at: string
          file_path: string
          id: string
          name: string
          property_id: string | null
          size: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content_type: string
          created_at?: string
          file_path: string
          id?: string
          name: string
          property_id?: string | null
          size: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          file_path?: string
          id?: string
          name?: string
          property_id?: string | null
          size?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_settings: {
        Row: {
          account_number: string
          allow_card_payment: boolean
          auto_payment_follow_up: boolean
          default_invoice_text: string | null
          id: string
          invoice_logo_url: string | null
          invoice_start_number: number
          late_fee_days: number
          mark_as_collection_notice: boolean
          max_card_payment_amount: number
          payment_due_days: number
          payment_system: string
          reminder_interval_days: number
          reminder1_days: number
          reminder2_days: number
          settings: Json
          updated_at: string
          use_kid: boolean
        }
        Insert: {
          account_number?: string
          allow_card_payment?: boolean
          auto_payment_follow_up?: boolean
          default_invoice_text?: string | null
          id?: string
          invoice_logo_url?: string | null
          invoice_start_number?: number
          late_fee_days?: number
          mark_as_collection_notice?: boolean
          max_card_payment_amount?: number
          payment_due_days?: number
          payment_system?: string
          reminder_interval_days?: number
          reminder1_days?: number
          reminder2_days?: number
          settings?: Json
          updated_at?: string
          use_kid?: boolean
        }
        Update: {
          account_number?: string
          allow_card_payment?: boolean
          auto_payment_follow_up?: boolean
          default_invoice_text?: string | null
          id?: string
          invoice_logo_url?: string | null
          invoice_start_number?: number
          late_fee_days?: number
          mark_as_collection_notice?: boolean
          max_card_payment_amount?: number
          payment_due_days?: number
          payment_system?: string
          reminder_interval_days?: number
          reminder1_days?: number
          reminder2_days?: number
          settings?: Json
          updated_at?: string
          use_kid?: boolean
        }
        Relationships: []
      }
      invoice_status: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          due_date: string
          id: string
          invoice_number: number
          kid_number: string | null
          notes: string | null
          payment_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          invoice_number: number
          kid_number?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: number
          kid_number?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_errors: {
        Row: {
          error_message: string
          error_type: string
          id: string
          input: Json
          metadata: Json | null
          timestamp: string
        }
        Insert: {
          error_message: string
          error_type: string
          id?: string
          input: Json
          metadata?: Json | null
          timestamp?: string
        }
        Update: {
          error_message?: string
          error_type?: string
          id?: string
          input?: Json
          metadata?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          lead_id: string
          new_state: Json | null
          previous_state: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          lead_id: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          new_state?: Json | null
          previous_state?: Json | null
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
      leads: {
        Row: {
          content: Json
          created_at: string
          deleted_at: string | null
          gdpr_deletion_date: string | null
          id: string
          internal_notes: string | null
          priority: Database["public"]["Enums"]["lead_priority"]
          property_id: string | null
          provider_id: string | null
          source_type: Database["public"]["Enums"]["lead_source_type"]
          status: Database["public"]["Enums"]["lead_status"]
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          deleted_at?: string | null
          gdpr_deletion_date?: string | null
          id?: string
          internal_notes?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          property_id?: string | null
          provider_id?: string | null
          source_type: Database["public"]["Enums"]["lead_source_type"]
          status?: Database["public"]["Enums"]["lead_status"]
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          deleted_at?: string | null
          gdpr_deletion_date?: string | null
          id?: string
          internal_notes?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          property_id?: string | null
          provider_id?: string | null
          source_type?: Database["public"]["Enums"]["lead_source_type"]
          status?: Database["public"]["Enums"]["lead_status"]
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "user_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          deleted_at: string | null
          end_date: string | null
          id: string
          importance: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          importance: string
          start_date: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          importance?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          active: boolean
          category: string | null
          dependencies: string[]
          description: string | null
          id: string
          metadata: Json | null
          name: string
          orderindex: number | null
          servicetype: string | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          dependencies?: string[]
          description?: string | null
          id: string
          metadata?: Json | null
          name: string
          orderindex?: number | null
          servicetype?: string | null
        }
        Update: {
          active?: boolean
          category?: string | null
          dependencies?: string[]
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          orderindex?: number | null
          servicetype?: string | null
        }
        Relationships: []
      }
      payment_method: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          annual_fee: number | null
          annual_fee_product_number: string | null
          calculation_type: string
          category: string
          color_code: string | null
          created_at: string
          deleted_at: string | null
          depreciation_type: string | null
          description: string | null
          guest_harbor_product_number: string | null
          id: string
          invoice_group: string | null
          length: number | null
          name: string
          rental_price: number | null
          rental_product_number: string | null
          sale_price: number | null
          sale_product_number: string | null
          updated_at: string
          width: number | null
          winter_price: number | null
          winter_product_number: string | null
          winter_rental_price: number | null
        }
        Insert: {
          annual_fee?: number | null
          annual_fee_product_number?: string | null
          calculation_type: string
          category: string
          color_code?: string | null
          created_at?: string
          deleted_at?: string | null
          depreciation_type?: string | null
          description?: string | null
          guest_harbor_product_number?: string | null
          id?: string
          invoice_group?: string | null
          length?: number | null
          name: string
          rental_price?: number | null
          rental_product_number?: string | null
          sale_price?: number | null
          sale_product_number?: string | null
          updated_at?: string
          width?: number | null
          winter_price?: number | null
          winter_product_number?: string | null
          winter_rental_price?: number | null
        }
        Update: {
          annual_fee?: number | null
          annual_fee_product_number?: string | null
          calculation_type?: string
          category?: string
          color_code?: string | null
          created_at?: string
          deleted_at?: string | null
          depreciation_type?: string | null
          description?: string | null
          guest_harbor_product_number?: string | null
          id?: string
          invoice_group?: string | null
          length?: number | null
          name?: string
          rental_price?: number | null
          rental_product_number?: string | null
          sale_price?: number | null
          sale_product_number?: string | null
          updated_at?: string
          width?: number | null
          winter_price?: number | null
          winter_product_number?: string | null
          winter_rental_price?: number | null
        }
        Relationships: []
      }
      user_properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          size: number
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
          user_id: string
          year_built: number
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          size: number
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          user_id: string
          year_built: number
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          size?: number
          title?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          user_id?: string
          year_built?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_company_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          name: string
          description: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: { record_user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: { activity_type: string; activity_details?: Json }
        Returns: undefined
      }
      record_age_days: {
        Args: { created_timestamp: string }
        Returns: number
      }
    }
    Enums: {
      lead_priority: "low" | "medium" | "high"
      lead_source_type: "user_form" | "public_tool" | "api" | "manual_entry"
      lead_status:
        | "new"
        | "assigned"
        | "in_progress"
        | "completed"
        | "archived"
        | "under_review"
      property_type: "apartment" | "house" | "cabin"
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
    Enums: {
      lead_priority: ["low", "medium", "high"],
      lead_source_type: ["user_form", "public_tool", "api", "manual_entry"],
      lead_status: [
        "new",
        "assigned",
        "in_progress",
        "completed",
        "archived",
        "under_review",
      ],
      property_type: ["apartment", "house", "cabin"],
    },
  },
} as const
