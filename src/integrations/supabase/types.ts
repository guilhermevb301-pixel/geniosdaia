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
      badges: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_code: string
          id: string
          issued_at: string
          module_duration: string | null
          module_id: string
          module_title: string
          user_id: string
          user_name: string
        }
        Insert: {
          certificate_code: string
          id?: string
          issued_at?: string
          module_duration?: string | null
          module_id: string
          module_title: string
          user_id: string
          user_name: string
        }
        Update: {
          certificate_code?: string
          id?: string
          issued_at?: string
          module_duration?: string | null
          module_id?: string
          module_title?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          assets: string[] | null
          challenge_id: string
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_winner: boolean
          link_url: string | null
          proof_links: string[] | null
          time_spent_minutes: number | null
          title: string
          track: string | null
          user_id: string
          version: number | null
          votes_count: number
        }
        Insert: {
          assets?: string[] | null
          challenge_id: string
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_winner?: boolean
          link_url?: string | null
          proof_links?: string[] | null
          time_spent_minutes?: number | null
          title: string
          track?: string | null
          user_id: string
          version?: number | null
          votes_count?: number
        }
        Update: {
          assets?: string[] | null
          challenge_id?: string
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_winner?: boolean
          link_url?: string | null
          proof_links?: string[] | null
          time_spent_minutes?: number | null
          title?: string
          track?: string | null
          user_id?: string
          version?: number | null
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_votes: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_reward_id: string | null
          created_at: string
          deliverables_schema: Json | null
          description: string
          difficulty: string | null
          end_date: string
          id: string
          reward_badge: string | null
          reward_highlight: boolean | null
          rules: string | null
          start_date: string
          status: string
          title: string
          tracks: string[] | null
          xp_reward: number
        }
        Insert: {
          badge_reward_id?: string | null
          created_at?: string
          deliverables_schema?: Json | null
          description: string
          difficulty?: string | null
          end_date: string
          id?: string
          reward_badge?: string | null
          reward_highlight?: boolean | null
          rules?: string | null
          start_date: string
          status?: string
          title: string
          tracks?: string[] | null
          xp_reward?: number
        }
        Update: {
          badge_reward_id?: string | null
          created_at?: string
          deliverables_schema?: Json | null
          description?: string
          difficulty?: string | null
          end_date?: string
          id?: string
          reward_badge?: string | null
          reward_highlight?: boolean | null
          rules?: string | null
          start_date?: string
          status?: string
          title?: string
          tracks?: string[] | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_gpts: {
        Row: {
          created_at: string | null
          description: string | null
          gpt_url: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          gpt_url: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          gpt_url?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          checklist: Json
          created_at: string | null
          deliverable: string
          difficulty: string
          estimated_minutes: number | null
          estimated_time_unit: string | null
          id: string
          is_bonus: boolean | null
          objective: string
          steps: Json
          title: string
          track: string
        }
        Insert: {
          checklist?: Json
          created_at?: string | null
          deliverable: string
          difficulty?: string
          estimated_minutes?: number | null
          estimated_time_unit?: string | null
          id?: string
          is_bonus?: boolean | null
          objective: string
          steps?: Json
          title: string
          track: string
        }
        Update: {
          checklist?: Json
          created_at?: string | null
          deliverable?: string
          difficulty?: string
          estimated_minutes?: number | null
          estimated_time_unit?: string | null
          id?: string
          is_bonus?: boolean | null
          objective?: string
          steps?: Json
          title?: string
          track?: string
        }
        Relationships: []
      }
      dashboard_banners: {
        Row: {
          button_text: string | null
          button_url: string
          created_at: string | null
          gradient: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          order_index: number | null
          subtitle: string | null
          title: string
        }
        Insert: {
          button_text?: string | null
          button_url: string
          created_at?: string | null
          gradient?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          subtitle?: string | null
          title: string
        }
        Update: {
          button_text?: string | null
          button_url?: string
          created_at?: string | null
          gradient?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
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
      module_sections: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number
          section_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          section_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          section_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "module_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_challenge_links: {
        Row: {
          created_at: string
          daily_challenge_id: string
          id: string
          objective_item_id: string
          order_index: number | null
        }
        Insert: {
          created_at?: string
          daily_challenge_id: string
          id?: string
          objective_item_id: string
          order_index?: number | null
        }
        Update: {
          created_at?: string
          daily_challenge_id?: string
          id?: string
          objective_item_id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_challenge_links_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_challenge_links_objective_item_id_fkey"
            columns: ["objective_item_id"]
            isOneToOne: false
            referencedRelation: "objective_items"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_groups: {
        Row: {
          created_at: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      objective_items: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_infra: boolean
          label: string
          objective_key: string
          order_index: number
          requires_infra: boolean
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_infra?: boolean
          label: string
          objective_key: string
          order_index?: number
          requires_infra?: boolean
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_infra?: boolean
          label?: string
          objective_key?: string
          order_index?: number
          requires_infra?: boolean
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "objective_groups"
            referencedColumns: ["id"]
          },
        ]
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
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          daily_challenge_id: string
          deadline: string | null
          id: string
          objective_item_id: string | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          daily_challenge_id: string
          deadline?: string | null
          id?: string
          objective_item_id?: string | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          daily_challenge_id?: string
          deadline?: string | null
          id?: string
          objective_item_id?: string | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_objective_item_id_fkey"
            columns: ["objective_item_id"]
            isOneToOne: false
            referencedRelation: "objective_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          note: string | null
          prompt_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          note?: string | null
          prompt_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          note?: string | null
          prompt_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string | null
          prompt_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          prompt_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          prompt_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          goals: Json | null
          id: string
          main_track: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          goals?: Json | null
          id?: string
          main_track?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          goals?: Json | null
          id?: string
          main_track?: string | null
          updated_at?: string | null
          user_id?: string
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
      user_streaks: {
        Row: {
          activity_date: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_date: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_submission_votes: {
        Row: {
          created_at: string | null
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_submission_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
          xp: number
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          action_type: string
          amount: number
          created_at: string
          id: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          created_at?: string
          id?: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          created_at?: string
          id?: string
          reference_id?: string | null
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
