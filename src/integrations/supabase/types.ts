export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      address: {
        Row: {
          address_id: string
          city: string
          country: string
          created_at: string
          latitude: number | null
          longitude: number | null
          postal_code: string | null
          state_province: string | null
          street_address: string
          updated_at: string
        }
        Insert: {
          address_id?: string
          city: string
          country?: string
          created_at?: string
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          state_province?: string | null
          street_address: string
          updated_at?: string
        }
        Update: {
          address_id?: string
          city?: string
          country?: string
          created_at?: string
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          state_province?: string | null
          street_address?: string
          updated_at?: string
        }
        Relationships: []
      }
      backup_audit_logs: {
        Row: {
          action_type: string | null
          custom_fields: Json | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          ip_address: unknown | null
          log_id: number | null
          metadata: Json | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          custom_fields?: Json | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          ip_address?: unknown | null
          log_id?: number | null
          metadata?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          custom_fields?: Json | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          ip_address?: unknown | null
          log_id?: number | null
          metadata?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_brand: {
        Row: {
          brand_id: string | null
          brand_nm: string | null
          created_at: string | null
          details: string | null
          franchisor_id: string | null
          logo_url: string | null
          marketing_data: Json | null
          metadata: Json | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          brand_nm?: string | null
          created_at?: string | null
          details?: string | null
          franchisor_id?: string | null
          logo_url?: string | null
          marketing_data?: Json | null
          metadata?: Json | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          brand_nm?: string | null
          created_at?: string | null
          details?: string | null
          franchisor_id?: string | null
          logo_url?: string | null
          marketing_data?: Json | null
          metadata?: Json | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_franchisee: {
        Row: {
          brand_id: string | null
          contact_email: string | null
          contact_first_nm: string | null
          contact_last_nm: string | null
          created_at: string | null
          franchisee_id: string | null
          legal_nm: string | null
          metadata: Json | null
          onboarding_status: string | null
          op_nm: string | null
          phone_no: string | null
          preferences: Json | null
          status: Database["public"]["Enums"]["user_status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          contact_email?: string | null
          contact_first_nm?: string | null
          contact_last_nm?: string | null
          created_at?: string | null
          franchisee_id?: string | null
          legal_nm?: string | null
          metadata?: Json | null
          onboarding_status?: string | null
          op_nm?: string | null
          phone_no?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          contact_email?: string | null
          contact_first_nm?: string | null
          contact_last_nm?: string | null
          created_at?: string | null
          franchisee_id?: string | null
          legal_nm?: string | null
          metadata?: Json | null
          onboarding_status?: string | null
          op_nm?: string | null
          phone_no?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_franchisor: {
        Row: {
          city: string | null
          company_nm: string | null
          contact_email: string | null
          country: string | null
          created_at: string | null
          franchisor_id: string | null
          legal_nm: string | null
          phone_no: string | null
          postal_code: string | null
          state_prov: string | null
          status: Database["public"]["Enums"]["user_status_enum"] | null
          street_addr: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          company_nm?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          franchisor_id?: string | null
          legal_nm?: string | null
          phone_no?: string | null
          postal_code?: string | null
          state_prov?: string | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          street_addr?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          company_nm?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          franchisor_id?: string | null
          legal_nm?: string | null
          phone_no?: string | null
          postal_code?: string | null
          state_prov?: string | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          street_addr?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_location: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          franchisee_id: string | null
          location_id: string | null
          location_nm: string | null
          metadata: Json | null
          opening_date: string | null
          operating_hours: Json | null
          phone_no: string | null
          postal_code: string | null
          region: string | null
          state_prov: string | null
          status: Database["public"]["Enums"]["user_status_enum"] | null
          street_addr: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          franchisee_id?: string | null
          location_id?: string | null
          location_nm?: string | null
          metadata?: Json | null
          opening_date?: string | null
          operating_hours?: Json | null
          phone_no?: string | null
          postal_code?: string | null
          region?: string | null
          state_prov?: string | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          street_addr?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          franchisee_id?: string | null
          location_id?: string | null
          location_nm?: string | null
          metadata?: Json | null
          opening_date?: string | null
          operating_hours?: Json | null
          phone_no?: string | null
          postal_code?: string | null
          region?: string | null
          state_prov?: string | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          street_addr?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_product: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string | null
          custom_attributes: Json | null
          details: string | null
          is_active: boolean | null
          metadata: Json | null
          product_id: string | null
          product_nm: string | null
          sku: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string | null
          custom_attributes?: Json | null
          details?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          product_id?: string | null
          product_nm?: string | null
          sku?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string | null
          custom_attributes?: Json | null
          details?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          product_id?: string | null
          product_nm?: string | null
          sku?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_sales_transaction: {
        Row: {
          created_at: string | null
          custom_data: Json | null
          customer_id: string | null
          location_id: string | null
          metadata: Json | null
          payment_method: string | null
          status: Database["public"]["Enums"]["transaction_status_enum"] | null
          total_amt: number | null
          txn_date: string | null
          txn_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_data?: Json | null
          customer_id?: string | null
          location_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"] | null
          total_amt?: number | null
          txn_date?: string | null
          txn_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_data?: Json | null
          customer_id?: string | null
          location_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"] | null
          total_amt?: number | null
          txn_date?: string | null
          txn_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_user_profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          brand_name: string | null
          company_name: string | null
          created_at: string | null
          first_name: string | null
          first_nm: string | null
          franchisor_id: string | null
          last_name: string | null
          last_nm: string | null
          metadata: Json | null
          phone: string | null
          phone_no: string | null
          preferences: Json | null
          status: Database["public"]["Enums"]["user_status_enum"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          brand_name?: string | null
          company_name?: string | null
          created_at?: string | null
          first_name?: string | null
          first_nm?: string | null
          franchisor_id?: string | null
          last_name?: string | null
          last_nm?: string | null
          metadata?: Json | null
          phone?: string | null
          phone_no?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          brand_name?: string | null
          company_name?: string | null
          created_at?: string | null
          first_name?: string | null
          first_nm?: string | null
          franchisor_id?: string | null
          last_name?: string | null
          last_nm?: string | null
          metadata?: Json | null
          phone?: string | null
          phone_no?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status_enum"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand: {
        Row: {
          brand_id: string
          brand_name: string
          created_at: string
          description: string | null
          franchisor_id: string
          industry: string | null
          logo_url: string | null
          status: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string
          brand_name: string
          created_at?: string
          description?: string | null
          franchisor_id: string
          industry?: string | null
          logo_url?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          brand_name?: string
          created_at?: string
          description?: string | null
          franchisor_id?: string
          industry?: string | null
          logo_url?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_new_franchisor_id_fkey"
            columns: ["franchisor_id"]
            isOneToOne: false
            referencedRelation: "franchisor"
            referencedColumns: ["franchisor_id"]
          },
        ]
      }
      contact_info: {
        Row: {
          contact_id: string
          created_at: string
          email: string | null
          fax: string | null
          mobile: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_id?: string
          created_at?: string
          email?: string | null
          fax?: string | null
          mobile?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          email?: string | null
          fax?: string | null
          mobile?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contract: {
        Row: {
          contract_id: string
          contract_type: string
          created_at: string
          document_path: string | null
          end_date: string | null
          franchisee_id: string
          franchisee_signer_id: string | null
          franchisor_signer_id: string | null
          signed_date: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          contract_id?: string
          contract_type: string
          created_at?: string
          document_path?: string | null
          end_date?: string | null
          franchisee_id: string
          franchisee_signer_id?: string | null
          franchisor_signer_id?: string | null
          signed_date?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          contract_type?: string
          created_at?: string
          document_path?: string | null
          end_date?: string | null
          franchisee_id?: string
          franchisee_signer_id?: string | null
          franchisor_signer_id?: string | null
          signed_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contract_version: {
        Row: {
          changes_summary: string | null
          contract_id: string
          created_at: string
          created_by_user_id: string | null
          document_path: string
          version_id: string
          version_no: number
        }
        Insert: {
          changes_summary?: string | null
          contract_id: string
          created_at?: string
          created_by_user_id?: string | null
          document_path: string
          version_id?: string
          version_no: number
        }
        Update: {
          changes_summary?: string | null
          contract_id?: string
          created_at?: string
          created_by_user_id?: string | null
          document_path?: string
          version_id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_version_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      customer: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          first_nm: string | null
          franchisor_id: string
          last_nm: string | null
          loyalty_member: boolean
          phone_no: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string
          email?: string | null
          first_nm?: string | null
          franchisor_id: string
          last_nm?: string | null
          loyalty_member?: boolean
          phone_no?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          first_nm?: string | null
          franchisor_id?: string
          last_nm?: string | null
          loyalty_member?: boolean
          phone_no?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_sales_report: {
        Row: {
          created_at: string
          file_path: string | null
          franchisee_id: string
          location_id: string
          notes: string | null
          report_date: string
          report_id: string
          status: string
          submitted_by: string | null
          total_sales: number
          total_transactions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          franchisee_id: string
          location_id: string
          notes?: string | null
          report_date: string
          report_id?: string
          status?: string
          submitted_by?: string | null
          total_sales?: number
          total_transactions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          franchisee_id?: string
          location_id?: string
          notes?: string | null
          report_date?: string
          report_id?: string
          status?: string
          submitted_by?: string | null
          total_sales?: number
          total_transactions?: number
          updated_at?: string
        }
        Relationships: []
      }
      file_maintenance: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          franchisee_id: string | null
          franchisor_id: string
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_id?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          franchisee_id?: string | null
          franchisor_id: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          franchisee_id?: string | null
          franchisor_id?: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      franchisee: {
        Row: {
          brand_id: string
          business_name: string
          contact_id: string | null
          created_at: string
          franchisee_id: string
          legal_name: string | null
          onboarding_status: string
          status: string
          tax_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          brand_id: string
          business_name: string
          contact_id?: string | null
          created_at?: string
          franchisee_id?: string
          legal_name?: string | null
          onboarding_status?: string
          status?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          brand_id?: string
          business_name?: string
          contact_id?: string | null
          created_at?: string
          franchisee_id?: string
          legal_name?: string | null
          onboarding_status?: string
          status?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_new_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "franchisee_new_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_info"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "franchisee_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      franchisor: {
        Row: {
          address_id: string | null
          company_name: string
          contact_id: string | null
          created_at: string
          franchisor_id: string
          legal_name: string | null
          status: string
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          company_name: string
          contact_id?: string | null
          created_at?: string
          franchisor_id?: string
          legal_name?: string | null
          status?: string
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          company_name?: string
          contact_id?: string | null
          created_at?: string
          franchisor_id?: string
          legal_name?: string | null
          status?: string
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchisor_new_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "franchisor_new_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_info"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          created_at: string
          date_from: string | null
          date_to: string | null
          file_path: string | null
          file_size: number | null
          franchisee_id: string | null
          franchisor_id: string
          generated_by: string | null
          parameters: Json | null
          report_id: string
          report_name: string
          report_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          file_path?: string | null
          file_size?: number | null
          franchisee_id?: string | null
          franchisor_id: string
          generated_by?: string | null
          parameters?: Json | null
          report_id?: string
          report_name: string
          report_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          file_path?: string | null
          file_size?: number | null
          franchisee_id?: string | null
          franchisor_id?: string
          generated_by?: string | null
          parameters?: Json | null
          report_id?: string
          report_name?: string
          report_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          current_stock: number
          inventory_id: string
          location_id: string
          min_stock_level: number
          product_id: string
          updated_at: string
        }
        Insert: {
          current_stock?: number
          inventory_id?: string
          location_id: string
          min_stock_level?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          current_stock?: number
          inventory_id?: string
          location_id?: string
          min_stock_level?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      inventory_order: {
        Row: {
          created_at: string
          franchisee_id: string
          location_id: string
          notes: string | null
          order_date: string
          order_id: string
          status: Database["public"]["Enums"]["order_status_enum"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          franchisee_id: string
          location_id: string
          notes?: string | null
          order_date?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status_enum"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          franchisee_id?: string
          location_id?: string
          notes?: string | null
          order_date?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status_enum"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory_order_item: {
        Row: {
          order_id: string
          order_item_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          order_id: string
          order_item_id?: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          order_id?: string
          order_item_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_order_item_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "inventory_order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "inventory_order_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      invoice: {
        Row: {
          created_at: string
          due_date: string | null
          franchisee_id: string
          invoice_date: string | null
          invoice_id: string
          invoice_no: string | null
          status: string
          subscription_id: string | null
          total_amt: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          franchisee_id: string
          invoice_date?: string | null
          invoice_id?: string
          invoice_no?: string | null
          status?: string
          subscription_id?: string | null
          total_amt: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          franchisee_id?: string
          invoice_date?: string | null
          invoice_id?: string
          invoice_no?: string | null
          status?: string
          subscription_id?: string | null
          total_amt?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription"
            referencedColumns: ["subscription_id"]
          },
        ]
      }
      kpi: {
        Row: {
          brand_id: string
          created_at: string
          details: string | null
          kpi_id: string
          kpi_nm: string
          target_value: number | null
          unit_of_measure: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          details?: string | null
          kpi_id?: string
          kpi_nm: string
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          details?: string | null
          kpi_id?: string
          kpi_nm?: string
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kpi_data: {
        Row: {
          actual_value: number
          created_at: string
          data_id: string
          kpi_id: string
          location_id: string | null
          recorded_date: string
        }
        Insert: {
          actual_value: number
          created_at?: string
          data_id?: string
          kpi_id: string
          location_id?: string | null
          recorded_date: string
        }
        Update: {
          actual_value?: number
          created_at?: string
          data_id?: string
          kpi_id?: string
          location_id?: string | null
          recorded_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_data_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi"
            referencedColumns: ["kpi_id"]
          },
        ]
      }
      location: {
        Row: {
          address_id: string
          closing_date: string | null
          contact_id: string | null
          created_at: string
          franchisee_id: string
          location_id: string
          location_name: string
          opening_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_id: string
          closing_date?: string | null
          contact_id?: string | null
          created_at?: string
          franchisee_id: string
          location_id?: string
          location_name: string
          opening_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_id?: string
          closing_date?: string | null
          contact_id?: string | null
          created_at?: string
          franchisee_id?: string
          location_id?: string
          location_name?: string
          opening_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_new_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "location_new_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_info"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "location_new_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisee"
            referencedColumns: ["franchisee_id"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number
          gateway_txn_id: string | null
          invoice_id: string
          payment_date: string
          payment_id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["transaction_status_enum"]
        }
        Insert: {
          amount: number
          gateway_txn_id?: string | null
          invoice_id: string
          payment_date?: string
          payment_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"]
        }
        Update: {
          amount?: number
          gateway_txn_id?: string | null
          invoice_id?: string
          payment_date?: string
          payment_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["invoice_id"]
          },
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
          action?: string
          created_at?: string
          details?: string | null
          permission_id?: string
          permission_nm: string
          resource?: string
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
      plan: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle_enum"]
          brand_id: string
          created_at: string
          details: string | null
          features_included: Json | null
          is_active: boolean
          plan_id: string
          plan_nm: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle_enum"]
          brand_id: string
          created_at?: string
          details?: string | null
          features_included?: Json | null
          is_active?: boolean
          plan_id?: string
          plan_nm: string
          price: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle_enum"]
          brand_id?: string
          created_at?: string
          details?: string | null
          features_included?: Json | null
          is_active?: boolean
          plan_id?: string
          plan_nm?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          brand_id: string
          category_id: string | null
          created_at: string
          custom_attributes: Json | null
          details: string | null
          is_active: boolean
          metadata: Json | null
          product_id: string
          product_nm: string
          sku: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          brand_id: string
          category_id?: string | null
          created_at?: string
          custom_attributes?: Json | null
          details?: string | null
          is_active?: boolean
          metadata?: Json | null
          product_id?: string
          product_nm: string
          sku: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category_id?: string | null
          created_at?: string
          custom_attributes?: Json | null
          details?: string | null
          is_active?: boolean
          metadata?: Json | null
          product_id?: string
          product_nm?: string
          sku?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      product_category: {
        Row: {
          brand_id: string
          cat_nm: string
          category_id: string
          created_at: string
          details: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          cat_nm: string
          category_id?: string
          created_at?: string
          details?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          cat_nm?: string
          category_id?: string
          created_at?: string
          details?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order: {
        Row: {
          created_at: string
          location_id: string
          order_date: string
          order_id: string
          status: string
          supplier_id: string
          total_amt: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          location_id: string
          order_date?: string
          order_id?: string
          status?: string
          supplier_id: string
          total_amt?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          location_id?: string
          order_date?: string
          order_id?: string
          status?: string
          supplier_id?: string
          total_amt?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      purchase_order_item: {
        Row: {
          order_id: string
          order_item_id: string
          order_price: number
          product_id: string
          qty_ordered: number
        }
        Insert: {
          order_id: string
          order_item_id?: string
          order_price: number
          product_id: string
          qty_ordered: number
        }
        Update: {
          order_id?: string
          order_item_id?: string
          order_price?: number
          product_id?: string
          qty_ordered?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_item_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "purchase_order_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      role: {
        Row: {
          created_at: string
          details: string | null
          franchisor_id: string
          role_id: string
          role_nm: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          franchisor_id: string
          role_id?: string
          role_nm: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          franchisor_id?: string
          role_id?: string
          role_nm?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_item: {
        Row: {
          discount_amt: number | null
          product_id: string
          qty_sold: number
          sale_price: number
          sales_item_id: string
          txn_id: string
        }
        Insert: {
          discount_amt?: number | null
          product_id: string
          qty_sold: number
          sale_price: number
          sales_item_id?: string
          txn_id: string
        }
        Update: {
          discount_amt?: number | null
          product_id?: string
          qty_sold?: number
          sale_price?: number
          sales_item_id?: string
          txn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_item_txn_id_fkey"
            columns: ["txn_id"]
            isOneToOne: false
            referencedRelation: "sales_transaction"
            referencedColumns: ["txn_id"]
          },
        ]
      }
      sales_transaction: {
        Row: {
          created_at: string
          custom_data: Json | null
          customer_id: string | null
          location_id: string
          metadata: Json | null
          payment_method: string | null
          status: Database["public"]["Enums"]["transaction_status_enum"]
          total_amt: number
          txn_date: string
          txn_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom_data?: Json | null
          customer_id?: string | null
          location_id: string
          metadata?: Json | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"]
          total_amt: number
          txn_date?: string
          txn_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom_data?: Json | null
          customer_id?: string | null
          location_id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"]
          total_amt?: number
          txn_date?: string
          txn_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_transaction_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      shipment: {
        Row: {
          carrier: string | null
          created_at: string
          from_location_id: string | null
          inventory_order_id: string | null
          purchase_order_id: string | null
          shipment_id: string
          status: string
          to_location_id: string | null
          tracking_no: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          from_location_id?: string | null
          inventory_order_id?: string | null
          purchase_order_id?: string | null
          shipment_id?: string
          status?: string
          to_location_id?: string | null
          tracking_no?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          from_location_id?: string | null
          inventory_order_id?: string | null
          purchase_order_id?: string | null
          shipment_id?: string
          status?: string
          to_location_id?: string | null
          tracking_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_inventory_order_id_fkey"
            columns: ["inventory_order_id"]
            isOneToOne: false
            referencedRelation: "inventory_order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "shipment_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["order_id"]
          },
        ]
      }
      subscription: {
        Row: {
          created_at: string
          end_date: string | null
          franchisee_id: string
          next_billing_date: string | null
          plan_id: string
          start_date: string
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          franchisee_id: string
          next_billing_date?: string | null
          plan_id: string
          start_date: string
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          franchisee_id?: string
          next_billing_date?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      supplier: {
        Row: {
          city: string | null
          contact_first_nm: string | null
          contact_last_nm: string | null
          country: string | null
          created_at: string
          email: string | null
          franchisor_id: string
          phone_no: string | null
          postal_code: string | null
          state_prov: string | null
          status: Database["public"]["Enums"]["user_status_enum"]
          street_addr: string | null
          supplier_id: string
          supplier_nm: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          contact_first_nm?: string | null
          contact_last_nm?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          franchisor_id: string
          phone_no?: string | null
          postal_code?: string | null
          state_prov?: string | null
          status?: Database["public"]["Enums"]["user_status_enum"]
          street_addr?: string | null
          supplier_id?: string
          supplier_nm: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          contact_first_nm?: string | null
          contact_last_nm?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          franchisor_id?: string
          phone_no?: string | null
          postal_code?: string | null
          state_prov?: string | null
          status?: Database["public"]["Enums"]["user_status_enum"]
          street_addr?: string | null
          supplier_id?: string
          supplier_nm?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_module: {
        Row: {
          brand_id: string
          content_path: string | null
          created_at: string
          details: string | null
          is_mandatory: boolean
          module_id: string
          module_type: Database["public"]["Enums"]["module_type_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          content_path?: string | null
          created_at?: string
          details?: string | null
          is_mandatory?: boolean
          module_id?: string
          module_type?: Database["public"]["Enums"]["module_type_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          content_path?: string | null
          created_at?: string
          details?: string | null
          is_mandatory?: boolean
          module_id?: string
          module_type?: Database["public"]["Enums"]["module_type_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          contact_id: string | null
          created_at: string
          first_name: string
          franchisor_id: string | null
          last_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          avatar_url?: string | null
          contact_id?: string | null
          created_at?: string
          first_name: string
          franchisor_id?: string | null
          last_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          contact_id?: string | null
          created_at?: string
          first_name?: string
          franchisor_id?: string | null
          last_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_new_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_info"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "user_profiles_new_franchisor_id_fkey"
            columns: ["franchisor_id"]
            isOneToOne: false
            referencedRelation: "franchisor"
            referencedColumns: ["franchisor_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_franchisor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      billing_cycle_enum: "monthly" | "annually" | "one-time"
      module_type_enum: "document" | "video" | "quiz"
      order_status_enum:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      transaction_status_enum: "pending" | "completed" | "failed" | "refunded"
      user_status_enum: "active" | "inactive" | "pending"
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
      billing_cycle_enum: ["monthly", "annually", "one-time"],
      module_type_enum: ["document", "video", "quiz"],
      order_status_enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      transaction_status_enum: ["pending", "completed", "failed", "refunded"],
      user_status_enum: ["active", "inactive", "pending"],
    },
  },
} as const
