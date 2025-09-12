export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          session_context: Json | null
          target_id: string
          target_kind: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_context?: Json | null
          target_id: string
          target_kind: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_context?: Json | null
          target_id?: string
          target_kind?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          properties: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_metrics: {
        Row: {
          created_at: string
          date_recorded: string
          dimensions: Json | null
          id: string
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_recorded?: string
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      bi_reports: {
        Row: {
          generated_at: string
          generated_by: string | null
          id: string
          report_data: Json
          report_name: string
          report_type: string
          status: string
        }
        Insert: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          report_data: Json
          report_name: string
          report_type: string
          status?: string
        }
        Update: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          report_data?: Json
          report_name?: string
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      buyer_accounts: {
        Row: {
          auto_recharge: boolean | null
          billing_address: Json | null
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          current_budget: number | null
          daily_budget: number | null
          geographical_scope: string[] | null
          id: string
          monthly_budget: number | null
          pause_when_budget_exceeded: boolean | null
          preferred_categories: string[] | null
          updated_at: string | null
        }
        Insert: {
          auto_recharge?: boolean | null
          billing_address?: Json | null
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          current_budget?: number | null
          daily_budget?: number | null
          geographical_scope?: string[] | null
          id?: string
          monthly_budget?: number | null
          pause_when_budget_exceeded?: boolean | null
          preferred_categories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          auto_recharge?: boolean | null
          billing_address?: Json | null
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          current_budget?: number | null
          daily_budget?: number | null
          geographical_scope?: string[] | null
          id?: string
          monthly_budget?: number | null
          pause_when_budget_exceeded?: boolean | null
          preferred_categories?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      buyer_package_subscriptions: {
        Row: {
          auto_buy: boolean | null
          auto_renew: boolean | null
          buyer_id: string
          created_at: string | null
          daily_cap_cents: number | null
          end_date: string | null
          id: string
          monthly_cap_cents: number | null
          package_id: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auto_buy?: boolean | null
          auto_renew?: boolean | null
          buyer_id: string
          created_at?: string | null
          daily_cap_cents?: number | null
          end_date?: string | null
          id?: string
          monthly_cap_cents?: number | null
          package_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_buy?: boolean | null
          auto_renew?: boolean | null
          buyer_id?: string
          created_at?: string | null
          daily_cap_cents?: number | null
          end_date?: string | null
          id?: string
          monthly_cap_cents?: number | null
          package_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_package_subscriptions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_package_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "lead_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_spend_ledger: {
        Row: {
          amount: number
          assignment_id: string | null
          balance_after: number
          buyer_id: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          transaction_type: string
        }
        Insert: {
          amount: number
          assignment_id?: string | null
          balance_after: number
          buyer_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type: string
        }
        Update: {
          amount?: number
          assignment_id?: string | null
          balance_after?: number
          buyer_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_spend_ledger_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "lead_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_spend_ledger_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      company_budget_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_budget_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_budget_transactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
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
          auto_accept_leads: boolean | null
          budget_alerts_enabled: boolean | null
          contact_name: string | null
          created_at: string | null
          current_budget: number | null
          daily_budget: number | null
          deleted_at: string | null
          email: string | null
          feature_overrides: Json
          id: string
          industry: string | null
          lead_cost_per_unit: number | null
          low_budget_threshold: number | null
          metadata: Json | null
          modules_access: string[] | null
          monthly_budget: number | null
          name: string
          notification_preferences: Json
          phone: string | null
          status: string | null
          subscription_plan: string | null
          tags: string[] | null
          ui_preferences: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_accept_leads?: boolean | null
          budget_alerts_enabled?: boolean | null
          contact_name?: string | null
          created_at?: string | null
          current_budget?: number | null
          daily_budget?: number | null
          deleted_at?: string | null
          email?: string | null
          feature_overrides?: Json
          id?: string
          industry?: string | null
          lead_cost_per_unit?: number | null
          low_budget_threshold?: number | null
          metadata?: Json | null
          modules_access?: string[] | null
          monthly_budget?: number | null
          name: string
          notification_preferences?: Json
          phone?: string | null
          status?: string | null
          subscription_plan?: string | null
          tags?: string[] | null
          ui_preferences?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_accept_leads?: boolean | null
          budget_alerts_enabled?: boolean | null
          contact_name?: string | null
          created_at?: string | null
          current_budget?: number | null
          daily_budget?: number | null
          deleted_at?: string | null
          email?: string | null
          feature_overrides?: Json
          id?: string
          industry?: string | null
          lead_cost_per_unit?: number | null
          low_budget_threshold?: number | null
          metadata?: Json | null
          modules_access?: string[] | null
          monthly_budget?: number | null
          name?: string
          notification_preferences?: Json
          phone?: string | null
          status?: string | null
          subscription_plan?: string | null
          tags?: string[] | null
          ui_preferences?: Json
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
      document_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_required: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      error_tracking: {
        Row: {
          created_at: string
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          session_id: string | null
          severity: string
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          rollout_percentage: number | null
          target_roles: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          rollout_percentage?: number | null
          target_roles?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          rollout_percentage?: number | null
          target_roles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          completed_at: string
          created_at: string
          failed_records: number
          id: string
          import_type: string
          successful_records: number
          total_records: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          failed_records?: number
          id?: string
          import_type: string
          successful_records?: number
          total_records?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          failed_records?: number
          id?: string
          import_type?: string
          successful_records?: number
          total_records?: number
          user_id?: string
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
          is_published: boolean | null
          logo_url: string | null
          name: string
          review_count: number | null
          slug: string | null
          sort_index: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          customer_rating?: number | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          logo_url?: string | null
          name: string
          review_count?: number | null
          slug?: string | null
          sort_index?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          customer_rating?: number | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          logo_url?: string | null
          name?: string
          review_count?: number | null
          slug?: string | null
          sort_index?: number | null
          updated_at?: string
          website_url?: string | null
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
      lead_assignment_history: {
        Row: {
          assignment_id: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_stage: string | null
          notes: string | null
          previous_stage: string | null
        }
        Insert: {
          assignment_id: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_stage?: string | null
          notes?: string | null
          previous_stage?: string | null
        }
        Update: {
          assignment_id?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_stage?: string | null
          notes?: string | null
          previous_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignment_history_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "lead_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          auto_purchased_at: string | null
          buyer_id: string
          buyer_notes: string | null
          completed_at: string | null
          cost: number
          created_at: string | null
          expires_at: string | null
          id: string
          lead_id: string
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"] | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          auto_purchased_at?: string | null
          buyer_id: string
          buyer_notes?: string | null
          completed_at?: string | null
          cost: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id: string
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          auto_purchased_at?: string | null
          buyer_id?: string
          buyer_notes?: string | null
          completed_at?: string | null
          cost?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_history: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
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
      lead_packages: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          lead_cap_per_day: number | null
          lead_cap_per_month: number | null
          monthly_price: number | null
          name: string
          price_per_lead: number
          priority_level: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          lead_cap_per_day?: number | null
          lead_cap_per_month?: number | null
          monthly_price?: number | null
          name: string
          price_per_lead: number
          priority_level?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          lead_cap_per_day?: number | null
          lead_cap_per_month?: number | null
          monthly_price?: number | null
          name?: string
          price_per_lead?: number
          priority_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
          anonymous_email: string | null
          attributed_at: string | null
          category: string
          company_id: string | null
          confirmation_email_sent_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string
          id: string
          lead_type: string | null
          metadata: Json | null
          session_id: string | null
          smart_start_submission_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          anonymous_email?: string | null
          attributed_at?: string | null
          category: string
          company_id?: string | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description: string
          id?: string
          lead_type?: string | null
          metadata?: Json | null
          session_id?: string | null
          smart_start_submission_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          anonymous_email?: string | null
          attributed_at?: string | null
          category?: string
          company_id?: string | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string
          id?: string
          lead_type?: string | null
          metadata?: Json | null
          session_id?: string | null
          smart_start_submission_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_smart_start_submission_id_fkey"
            columns: ["smart_start_submission_id"]
            isOneToOne: false
            referencedRelation: "smart_start_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_access: {
        Row: {
          created_at: string | null
          id: string
          internal_admin: boolean | null
          system_module_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          internal_admin?: boolean | null
          system_module_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          internal_admin?: boolean | null
          system_module_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_access_system_module_id_fkey"
            columns: ["system_module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_access_audit: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          module_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      module_dependencies: {
        Row: {
          created_at: string
          dependency_id: string
          id: string
          module_id: string
          relationship_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependency_id: string
          id?: string
          module_id: string
          relationship_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependency_id?: string
          id?: string
          module_id?: string
          relationship_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_dependencies_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_dependencies_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_metadata: {
        Row: {
          active: boolean
          created_at: string
          dependencies: string[]
          description: string | null
          feature_flags: Json
          id: string
          name: string
          updated_at: string
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dependencies?: string[]
          description?: string | null
          feature_flags?: Json
          id?: string
          name: string
          updated_at?: string
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dependencies?: string[]
          description?: string | null
          feature_flags?: Json
          id?: string
          name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at: string | null
          service_name: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string
          metric_value: number
          recorded_at?: string | null
          service_name?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string | null
          service_name?: string
        }
        Relationships: []
      }
      performance_monitoring: {
        Row: {
          created_at: string
          cumulative_layout_shift: number | null
          device_type: string | null
          first_contentful_paint: number | null
          first_input_delay: number | null
          id: string
          largest_contentful_paint: number | null
          load_time_ms: number
          metadata: Json | null
          network_type: string | null
          page_route: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          cumulative_layout_shift?: number | null
          device_type?: string | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time_ms: number
          metadata?: Json | null
          network_type?: string | null
          page_route: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          cumulative_layout_shift?: number | null
          device_type?: string | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time_ms?: number
          metadata?: Json | null
          network_type?: string | null
          page_route?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plugin_manifests: {
        Row: {
          author: string | null
          created_at: string | null
          dependencies: Json | null
          description: string | null
          entry_point: string
          homepage: string | null
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          name: string
          repository: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          entry_point: string
          homepage?: string | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name: string
          repository?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          entry_point?: string
          homepage?: string | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name?: string
          repository?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      plugin_settings: {
        Row: {
          created_at: string | null
          id: string
          plugin_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plugin_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plugin_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_settings_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: true
            referencedRelation: "plugin_manifests"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_user_settings: {
        Row: {
          created_at: string | null
          id: string
          plugin_id: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plugin_id: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plugin_id?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_user_settings_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugin_manifests"
            referencedColumns: ["id"]
          },
        ]
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
          current_value: number | null
          description: string | null
          id: string
          name: string
          purchase_date: string | null
          size: number | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          name: string
          purchase_date?: string | null
          size?: number | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          name?: string
          purchase_date?: string | null
          size?: number | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_document_access: {
        Row: {
          access_level: string
          created_at: string | null
          document_id: string
          expires_at: string | null
          granted_by: string
          granted_to: string | null
          id: string
        }
        Insert: {
          access_level: string
          created_at?: string | null
          document_id: string
          expires_at?: string | null
          granted_by: string
          granted_to?: string | null
          id?: string
        }
        Update: {
          access_level?: string
          created_at?: string | null
          document_id?: string
          expires_at?: string | null
          granted_by?: string
          granted_to?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_document_access_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "property_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      property_document_versions: {
        Row: {
          created_at: string | null
          document_id: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          upload_metadata: Json | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          document_id: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          upload_metadata?: Json | null
          uploaded_by?: string | null
          version_number?: number
        }
        Update: {
          created_at?: string | null
          document_id?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          upload_metadata?: Json | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "property_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          category_id: string | null
          created_at: string
          current_version: number | null
          description: string | null
          document_type: string
          expires_at: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          name: string
          property_id: string
          tags: string[] | null
          thumbnail_path: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_version?: number | null
          description?: string | null
          document_type: string
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          name: string
          property_id: string
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_version?: number | null
          description?: string | null
          document_type?: string
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          property_id?: string
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
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
      property_maintenance_tasks: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          id: string
          priority: string
          property_id: string
          recurring_frequency: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          category: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          priority: string
          property_id: string
          recurring_frequency?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string
          property_id?: string
          recurring_frequency?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_maintenance_tasks_property_id_fkey"
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
      role_grants: {
        Row: {
          context: string | null
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          metadata: Json
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_switch_audit: {
        Row: {
          created_at: string
          id: string
          new_mode: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_mode: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_mode?: string
          user_id?: string
        }
        Relationships: []
      }
      service_modules: {
        Row: {
          created_at: string
          id: string
          module_id: string
          service_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          service_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          service_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_start_submissions: {
        Row: {
          converted_at: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          flow_data: Json | null
          id: string
          ip_address: unknown | null
          is_company: boolean
          lead_created: boolean | null
          lead_id: string | null
          metadata: Json
          postcode: string
          property_type: string | null
          requested_services: string[]
          search_query: string | null
          selected_category: string | null
          session_id: string | null
          source: string
          step_completed: number
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          flow_data?: Json | null
          id?: string
          ip_address?: unknown | null
          is_company?: boolean
          lead_created?: boolean | null
          lead_id?: string | null
          metadata?: Json
          postcode: string
          property_type?: string | null
          requested_services?: string[]
          search_query?: string | null
          selected_category?: string | null
          session_id?: string | null
          source?: string
          step_completed?: number
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          flow_data?: Json | null
          id?: string
          ip_address?: unknown | null
          is_company?: boolean
          lead_created?: boolean | null
          lead_id?: string | null
          metadata?: Json
          postcode?: string
          property_type?: string | null
          requested_services?: string[]
          search_query?: string | null
          selected_category?: string | null
          session_id?: string | null
          source?: string
          step_completed?: number
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_start_submissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string
          status: string
          threshold_config: Json | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string
          status?: string
          threshold_config?: Json | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string
          status?: string
          threshold_config?: Json | null
        }
        Relationships: []
      }
      system_modules: {
        Row: {
          category: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          plugin_id: string | null
          route: string | null
          sort_order: number | null
          ui_component: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          plugin_id?: string | null
          route?: string | null
          sort_order?: number | null
          ui_component?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          plugin_id?: string | null
          route?: string | null
          sort_order?: number | null
          ui_component?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_modules_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugin_manifests"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean | null
          task: string | null
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_summaries: {
        Row: {
          conversion_events: number | null
          created_at: string
          date_summary: string
          features_used: Json | null
          id: string
          session_count: number | null
          time_spent_minutes: number | null
          total_events: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversion_events?: number | null
          created_at?: string
          date_summary?: string
          features_used?: Json | null
          id?: string
          session_count?: number | null
          time_spent_minutes?: number | null
          total_events?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversion_events?: number | null
          created_at?: string
          date_summary?: string
          features_used?: Json | null
          id?: string
          session_count?: number | null
          time_spent_minutes?: number | null
          total_events?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_company_roles: {
        Row: {
          company_id: string
          created_at: string | null
          is_default: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          is_default?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          is_default?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_filters: {
        Row: {
          created_at: string
          filter_data: Json
          filter_name: string | null
          id: string
          is_default: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_data?: Json
          filter_name?: string | null
          id?: string
          is_default?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_data?: Json
          filter_name?: string | null
          id?: string
          is_default?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_modules: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          module_id: string
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_id: string
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_id?: string
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_type: string | null
          address: string | null
          company_id: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          email: string | null
          feature_overrides: Json
          full_name: string | null
          id: string
          metadata: Json
          notification_preferences: Json
          phone: string | null
          preferences: Json | null
          profile_picture_url: string | null
          region: string | null
          role: string | null
          role_enum: Database["public"]["Enums"]["app_role"]
          ui_preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string | null
          address?: string | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          feature_overrides?: Json
          full_name?: string | null
          id: string
          metadata?: Json
          notification_preferences?: Json
          phone?: string | null
          preferences?: Json | null
          profile_picture_url?: string | null
          region?: string | null
          role?: string | null
          role_enum?: Database["public"]["Enums"]["app_role"]
          ui_preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string | null
          address?: string | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          feature_overrides?: Json
          full_name?: string | null
          id?: string
          metadata?: Json
          notification_preferences?: Json
          phone?: string | null
          preferences?: Json | null
          profile_picture_url?: string | null
          region?: string | null
          role?: string | null
          role_enum?: Database["public"]["Enums"]["app_role"]
          ui_preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_service_preferences: {
        Row: {
          created_at: string
          id: string
          selected: boolean
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          selected?: boolean
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          selected?: boolean
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          lead_id: string | null
          payload: Json
          processed_at: string
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string | null
          payload: Json
          processed_at?: string
          source: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string | null
          payload?: Json
          processed_at?: string
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_user_daily_activity: {
        Args: { target_date?: string }
        Returns: undefined
      }
      assign_lead_with_budget: {
        Args: { p_company_id: string; p_lead_id: string }
        Returns: Json
      }
      bulk_check_module_access: {
        Args: { module_names: string[]; user_id?: string }
        Returns: {
          has_access: boolean
          module_name: string
        }[]
      }
      bulk_update_user_module_access: {
        Args: {
          admin_id?: string
          enable_access: boolean
          module_ids: string[]
          reason?: string
          target_user_id: string
        }
        Returns: undefined
      }
      check_admin_role: {
        Args: { user_id: string }
        Returns: boolean
      }
      clear_company_context: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_anonymous_lead_and_distribute: {
        Args: {
          p_anonymous_email: string
          p_category: string
          p_description: string
          p_metadata: Json
          p_session_id: string
          p_title: string
        }
        Returns: string
      }
      create_smart_start_submission: {
        Args: {
          p_email?: string
          p_flow_data?: Json
          p_is_company?: boolean
          p_postcode: string
          p_requested_services: string[]
          p_search_query?: string
          p_selected_category?: string
          p_session_id: string
          p_step_completed?: number
          p_user_id?: string
        }
        Returns: string
      }
      delete_user_profile: {
        Args: { profile_user_id: string }
        Returns: undefined
      }
      distribute_new_lead: {
        Args: { lead_id_param: string }
        Returns: {
          assignment_id: string
          buyer_id: string
          cost: number
        }[]
      }
      distribute_new_lead_v2: {
        Args: { lead_id_param: string }
        Returns: {
          assignment_cost: number
          company_id: string
        }[]
      }
      distribute_new_lead_v3: {
        Args: { lead_id_param: string }
        Returns: {
          assignment_cost: number
          company_id: string
          success: boolean
        }[]
      }
      ensure_user_profile: {
        Args: { p_company_id?: string; p_role?: string; p_user_id: string }
        Returns: {
          account_type: string | null
          address: string | null
          company_id: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          email: string | null
          feature_overrides: Json
          full_name: string | null
          id: string
          metadata: Json
          notification_preferences: Json
          phone: string | null
          preferences: Json | null
          profile_picture_url: string | null
          region: string | null
          role: string | null
          role_enum: Database["public"]["Enums"]["app_role"]
          ui_preferences: Json
          updated_at: string
          user_id: string
        }
      }
      execute_auto_purchase: {
        Args: {
          p_buyer_id: string
          p_cost: number
          p_lead_id: string
          p_package_id: string
        }
        Returns: {
          assignment_id: string
          buyer_id: string
          cost: number
        }[]
      }
      get_active_mode: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_company_context: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_enabled_plugins: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          entry_point: string
          id: string
          metadata: Json
          name: string
          version: string
        }[]
      }
      get_internal_admins: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          metadata: Json
        }[]
      }
      get_role_default_modules: {
        Args: { user_role: string }
        Returns: string[]
      }
      get_user_effective_roles: {
        Args: { _user_id?: string }
        Returns: string[]
      }
      get_user_enabled_modules: {
        Args: { user_id?: string }
        Returns: {
          description: string
          id: string
          name: string
          route: string
          settings: Json
        }[]
      }
      get_user_modules_with_category: {
        Args: { user_id?: string }
        Returns: {
          category: string
          description: string
          icon: string
          id: string
          is_enabled: boolean
          name: string
          route: string
          sort_order: number
        }[]
      }
      get_user_profile: {
        Args: { profile_user_id: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_level: {
        Args: { _user_id: string }
        Returns: number
      }
      grant_role: {
        Args: {
          _context?: string
          _expires_at?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: {
          context: string | null
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          metadata: Json
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
      }
      has_module_access: {
        Args: { module_name: string; user_id?: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_grant: {
        Args: {
          _context?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id?: string
        }
        Returns: boolean
      }
      has_role_level: {
        Args: { _min_level: number; _user_id: string }
        Returns: boolean
      }
      initialize_user_module_access: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_feature_enabled: {
        Args: { flag_name: string; user_id?: string }
        Returns: boolean
      }
      is_internal_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_master_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_plugin_enabled: {
        Args: { plugin_name: string }
        Returns: boolean
      }
      link_anonymous_leads_to_user: {
        Args: { user_email_param: string; user_id_param: string }
        Returns: {
          linked_count: number
        }[]
      }
      list_all_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }[]
      }
      log_admin_action: {
        Args:
          | {
              action_param: string
              metadata_param?: Json
              target_id_param: string
              target_kind_param: string
            }
          | {
              p_action: string
              p_new_values?: Json
              p_old_values?: Json
              p_target_id?: string
              p_target_type: string
            }
        Returns: string
      }
      revoke_role: {
        Args: {
          _context?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      set_company_context: {
        Args: { company_uuid: string }
        Returns: undefined
      }
      set_internal_admin_status: {
        Args: { is_admin?: boolean; user_email: string }
        Returns: string
      }
      track_analytics_event: {
        Args: {
          p_event_name: string
          p_event_type: string
          p_properties?: Json
          p_session_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      update_user_profile: {
        Args: {
          profile_email: string
          profile_full_name: string
          profile_phone: string
          profile_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "member"
        | "company"
        | "content_editor"
        | "admin"
        | "master_admin"
        | "user"
        | "guest"
      lead_status:
        | "new"
        | "qualified"
        | "contacted"
        | "negotiating"
        | "converted"
        | "lost"
        | "paused"
      pipeline_stage: "new" | "in_progress" | "won" | "lost"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "member",
        "company",
        "content_editor",
        "admin",
        "master_admin",
        "user",
        "guest",
      ],
      lead_status: [
        "new",
        "qualified",
        "contacted",
        "negotiating",
        "converted",
        "lost",
        "paused",
      ],
      pipeline_stage: ["new", "in_progress", "won", "lost"],
    },
  },
} as const
