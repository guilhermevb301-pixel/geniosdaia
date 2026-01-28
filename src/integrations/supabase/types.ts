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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          download_url: string | null
          duration: string | null
          id: string
          module_id: string
          order_index: number
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_url?: string | null
          duration?: string | null
          id?: string
          module_id: string
          order_index?: number
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_url?: string | null
          duration?: string | null
          id?: string
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_todos: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string | null
          id: string
          mentee_id: string
          order_index: number | null
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          mentee_id: string
          order_index?: number | null
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          mentee_id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_todos_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentees"
            referencedColumns: ["id"]
          },
        ]
      }
      mentees: {
        Row: {
          community_url: string | null
          created_at: string | null
          display_name: string
          id: string
          mentor_id: string | null
          plan_tag: string | null
          scheduling_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          community_url?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          mentor_id?: string | null
          plan_tag?: string | null
          scheduling_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          community_url?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          mentor_id?: string | null
          plan_tag?: string | null
          scheduling_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      mentorship_meetings: {
        Row: {
          created_at: string | null
          id: string
          meeting_date: string
          mentee_id: string
          notes: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_date: string
          mentee_id: string
          notes?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_date?: string
          mentee_id?: string
          notes?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_meetings_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentees"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          order_index: number | null
          stage_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          stage_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_notes_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "mentorship_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_pillars: {
        Row: {
          created_at: string | null
          icon: string | null
          icon_color: string | null
          id: string
          mentee_id: string
          order_index: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          mentee_id: string
          order_index?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          mentee_id?: string
          order_index?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_pillars_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentees"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_stages: {
        Row: {
          created_at: string | null
          icon: string | null
          icon_color: string | null
          id: string
          mentee_id: string
          objective: string | null
          order_index: number | null
          pillar_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          mentee_id: string
          objective?: string | null
          order_index?: number | null
          pillar_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          mentee_id?: string
          objective?: string | null
          order_index?: number | null
          pillar_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_stages_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_stages_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "mentorship_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_tasks: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string | null
          id: string
          is_subtask: boolean | null
          order_index: number | null
          stage_id: string
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          is_subtask?: boolean | null
          order_index?: number | null
          stage_id: string
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          is_subtask?: boolean | null
          order_index?: number | null
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "mentorship_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_variations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          order_index: number | null
          prompt_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          prompt_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_variations_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          category: string
          content: string
          created_at: string | null
          description: string | null
          example_images: string[] | null
          example_video_url: string | null
          id: string
          tags: string[] | null
          thumbnail_focus: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          description?: string | null
          example_images?: string[] | null
          example_video_url?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_focus?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          description?: string | null
          example_images?: string[] | null
          example_video_url?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_focus?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          author_name: string | null
          created_at: string
          description: string | null
          downloads_count: number
          id: string
          image_url: string | null
          json_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          zip_url: string | null
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number
          id?: string
          image_url?: string | null
          json_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          zip_url?: string | null
        }
        Update: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number
          id?: string
          image_url?: string | null
          json_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          zip_url?: string | null
        }
        Relationships: []
      }
      user_role_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          previous_role: Database["public"]["Enums"]["app_role"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          previous_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          previous_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          mentee_id: string
          mentee_status: string
          roles: Database["public"]["Enums"]["app_role"][]
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_mentee: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "mentor"
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
      app_role: ["admin", "user", "mentor"],
    },
  },
} as const
