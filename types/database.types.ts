export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string
          name: string
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: 'admin' | 'qa' | 'store'
          description: string | null
        }
        Insert: {
          id?: string
          name: 'admin' | 'qa' | 'store'
          description?: string | null
        }
        Update: {
          id?: string
          name?: 'admin' | 'qa' | 'store'
          description?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          plant_id: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          plant_id: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          plant_id?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          address: string | null
          gst_number: string | null
          contact_person: string | null
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          gst_number?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          gst_number?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      items: {
        Row: {
          id: string
          item_code: string
          description: string | null
          unit: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          item_code: string
          description?: string | null
          unit?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          item_code?: string
          description?: string | null
          unit?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      standards: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      standard_parameters: {
        Row: {
          id: string
          standard_id: string
          parameter_name: string
          category: 'chemical' | 'mechanical' | 'dimensional'
          unit: string | null
          min_value: number | null
          max_value: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          standard_id: string
          parameter_name: string
          category: 'chemical' | 'mechanical' | 'dimensional'
          unit?: string | null
          min_value?: number | null
          max_value?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          standard_id?: string
          parameter_name?: string
          category?: 'chemical' | 'mechanical' | 'dimensional'
          unit?: string | null
          min_value?: number | null
          max_value?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      purchase_orders: {
        Row: {
          id: string
          plant_id: string
          po_number: string
          customer_id: string | null
          order_date: string | null
          status: 'draft' | 'approved' | 'closed'
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          po_number: string
          customer_id?: string | null
          order_date?: string | null
          status?: 'draft' | 'approved' | 'closed'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          po_number?: string
          customer_id?: string | null
          order_date?: string | null
          status?: 'draft' | 'approved' | 'closed'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      work_orders: {
        Row: {
          id: string
          plant_id: string
          wo_number: string
          po_id: string | null
          item_id: string | null
          quantity: number | null
          status: 'draft' | 'approved' | 'in_production' | 'lab_pending' | 'completed' | 'closed' | 'rejected' | 'on_hold' | 'reopened'
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          wo_number: string
          po_id?: string | null
          item_id?: string | null
          quantity?: number | null
          status?: 'draft' | 'approved' | 'in_production' | 'lab_pending' | 'completed' | 'closed' | 'rejected' | 'on_hold' | 'reopened'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          wo_number?: string
          po_id?: string | null
          item_id?: string | null
          quantity?: number | null
          status?: 'draft' | 'approved' | 'in_production' | 'lab_pending' | 'completed' | 'closed' | 'rejected' | 'on_hold' | 'reopened'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      heats: {
        Row: {
          id: string
          plant_id: string
          heat_number: string
          supplier_name: string | null
          material_grade: string | null
          received_date: string | null
          initial_quantity: number | null
          available_quantity: number | null
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          heat_number: string
          supplier_name?: string | null
          material_grade?: string | null
          received_date?: string | null
          initial_quantity?: number | null
          available_quantity?: number | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          heat_number?: string
          supplier_name?: string | null
          material_grade?: string | null
          received_date?: string | null
          initial_quantity?: number | null
          available_quantity?: number | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      inventory_movements: {
        Row: {
          id: string
          plant_id: string
          heat_id: string | null
          work_order_id: string | null
          movement_type: 'allocation' | 'adjustment'
          quantity: number
          movement_date: string
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          heat_id?: string | null
          work_order_id?: string | null
          movement_type: 'allocation' | 'adjustment'
          quantity: number
          movement_date?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          heat_id?: string | null
          work_order_id?: string | null
          movement_type?: 'allocation' | 'adjustment'
          quantity?: number
          movement_date?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      lab_results: {
        Row: {
          id: string
          plant_id: string
          work_order_id: string | null
          tested_at: string | null
          tested_by: string | null
          validation_status: 'pending' | 'passed' | 'failed' | 'override'
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          work_order_id?: string | null
          tested_at?: string | null
          tested_by?: string | null
          validation_status?: 'pending' | 'passed' | 'failed' | 'override'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          work_order_id?: string | null
          tested_at?: string | null
          tested_by?: string | null
          validation_status?: 'pending' | 'passed' | 'failed' | 'override'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      lab_result_parameters: {
        Row: {
          id: string
          plant_id: string
          lab_result_id: string | null
          parameter_id: string | null
          observed_value: number
          validation_status: 'pending' | 'passed' | 'failed' | 'override'
          override_flag: boolean
          override_reason: string | null
          validated_at: string | null
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          lab_result_id?: string | null
          parameter_id?: string | null
          observed_value: number
          validation_status?: 'pending' | 'passed' | 'failed' | 'override'
          override_flag?: boolean
          override_reason?: string | null
          validated_at?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          lab_result_id?: string | null
          parameter_id?: string | null
          observed_value?: number
          validation_status?: 'pending' | 'passed' | 'failed' | 'override'
          override_flag?: boolean
          override_reason?: string | null
          validated_at?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      test_certificates: {
        Row: {
          id: string
          plant_id: string
          work_order_id: string | null
          current_version: number
          tc_type: string | null
          status: 'prepared' | 'approved' | 'issued'
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          work_order_id?: string | null
          current_version?: number
          tc_type?: string | null
          status?: 'prepared' | 'approved' | 'issued'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          work_order_id?: string | null
          current_version?: number
          tc_type?: string | null
          status?: 'prepared' | 'approved' | 'issued'
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      test_certificate_versions: {
        Row: {
          id: string
          plant_id: string
          tc_id: string | null
          version_number: number
          pdf_url: string | null
          generated_at: string | null
          generated_by: string | null
          approval_status: 'prepared' | 'approved' | 'issued'
          approved_by: string | null
          approved_at: string | null
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          tc_id?: string | null
          version_number: number
          pdf_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          approval_status?: 'prepared' | 'approved' | 'issued'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          tc_id?: string | null
          version_number?: number
          pdf_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          approval_status?: 'prepared' | 'approved' | 'issued'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      override_logs: {
        Row: {
          id: string
          plant_id: string
          table_name: string | null
          record_id: string | null
          reason: string | null
          performed_by: string | null
          performed_at: string | null
          created_at: string
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          plant_id: string
          table_name?: string | null
          record_id?: string | null
          reason?: string | null
          performed_by?: string | null
          performed_at?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          plant_id?: string
          table_name?: string | null
          record_id?: string | null
          reason?: string | null
          performed_by?: string | null
          performed_at?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          is_deleted?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          plant_id: string | null
          table_name: string | null
          record_id: string | null
          operation: 'INSERT' | 'UPDATE' | 'DELETE' | null
          changed_by: string | null
          changed_at: string | null
          old_data: Json | null
          new_data: Json | null
        }
        Insert: {
          id?: string
          plant_id?: string | null
          table_name?: string | null
          record_id?: string | null
          operation?: 'INSERT' | 'UPDATE' | 'DELETE' | null
          changed_by?: string | null
          changed_at?: string | null
          old_data?: Json | null
          new_data?: Json | null
        }
        Update: {
          id?: string
          plant_id?: string | null
          table_name?: string | null
          record_id?: string | null
          operation?: 'INSERT' | 'UPDATE' | 'DELETE' | null
          changed_by?: string | null
          changed_at?: string | null
          old_data?: Json | null
          new_data?: Json | null
        }
      }
    }
  }
}
