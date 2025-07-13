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
      audit_logs: {
        Row: {
          action_type: string
          custom_fields: Json | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          ip_address: unknown | null
          log_id: number
          metadata: Json | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          custom_fields?: Json | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          ip_address?: unknown | null
          log_id?: number
          metadata?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          custom_fields?: Json | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          ip_address?: unknown | null
          log_id?: number
          metadata?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      brand: {
        Row: {
          brand_id: string
          brand_nm: string
          created_at: string
          custom_fields: Json | null
          franchisor_id: string
          marketing_data: Json | null
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          brand_id?: string
          brand_nm: string
          created_at?: string
          custom_fields?: Json | null
          franchisor_id: string
          marketing_data?: Json | null
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          brand_nm?: string
          created_at?: string
          custom_fields?: Json | null
          franchisor_id?: string
          marketing_data?: Json | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_franchisor_id_fkey"
            columns: ["franchisor_id"]
            isOneToOne: false
            referencedRelation: "franchisor"
            referencedColumns: ["franchisor_id"]
          }
        ]
      }
      franchisor: {
        Row: {
          company_nm: string
          created_at: string
          custom_fields: Json | null
          franchisor_id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          company_nm: string
          created_at?: string
          custom_fields?: Json | null
          franchisor_id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          company_nm?: string
          created_at?: string
          custom_fields?: Json | null
          franchisor_id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      kpi: {
        Row: {
          brand_id: string
          created_at: string
          custom_fields: Json | null
          kpi_id: string
          kpi_nm: string
          metadata: Json | null
          target_value: number
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          custom_fields?: Json | null
          kpi_id?: string
          kpi_nm: string
          metadata?: Json | null
          target_value: number
          unit_of_measure: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          custom_fields?: Json | null
          kpi_id?: string
          kpi_nm?: string
          metadata?: Json | null
          target_value?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand"
            referencedColumns: ["brand_id"]
          }
        ]
      }
      permission: {
        Row: {
          action: string
          created_at: string
          details: string | null
          permission_id: string
          permission_nm: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          permission_id?: string
          permission_nm: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          permission_id?: string
          permission_nm?: string
          resource?: string
        }
        Relationships: []
      }
      role: {
        Row: {
          created_at: string
          custom_fields: Json | null
          details: string | null
          franchisor_id: string
          metadata: Json | null
          role_id: string
          role_nm: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          details?: string | null
          franchisor_id: string
          metadata?: Json | null
          role_id?: string
          role_nm: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          details?: string | null
          franchisor_id?: string
          metadata?: Json | null
          role_id?: string
          role_nm?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_franchisor_id_fkey"
            columns: ["franchisor_id"]
            isOneToOne: false
            referencedRelation: "franchisor"
            referencedColumns: ["franchisor_id"]
          }
        ]
      }
      role_permission: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
          role_permission_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
          role_permission_id?: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
          role_permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permission_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permission"
            referencedColumns: ["permission_id"]
          },
          {
            foreignKeyName: "role_permission_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["role_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status_enum: "active" | "inactive" | "pending"
      module_type_enum: "document" | "video" | "quiz"
      transaction_status_enum: "pending" | "completed" | "failed" | "refunded"
      order_status_enum: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
      billing_cycle_enum: "monthly" | "annually" | "one-time"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
