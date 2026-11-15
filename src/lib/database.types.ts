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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_terms_acceptances: {
        Row: {
          accepted_at: string
          student_id: string
          terms_version: string
        }
        Insert: {
          accepted_at?: string
          student_id: string
          terms_version: string
        }
        Update: {
          accepted_at?: string
          student_id?: string
          terms_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_terms_acceptances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          attended_by: string | null
          closed_at: string | null
          details: Json
          group_id: string
          id: string
          level: Database["public"]["Enums"]["alert_level"]
          opened_at: string
          origin: Database["public"]["Enums"]["alert_origin"]
          reason_code: string
          status: Database["public"]["Enums"]["alert_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          attended_by?: string | null
          closed_at?: string | null
          details?: Json
          group_id: string
          id?: string
          level: Database["public"]["Enums"]["alert_level"]
          opened_at?: string
          origin: Database["public"]["Enums"]["alert_origin"]
          reason_code: string
          status?: Database["public"]["Enums"]["alert_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          attended_by?: string | null
          closed_at?: string | null
          details?: Json
          group_id?: string
          id?: string
          level?: Database["public"]["Enums"]["alert_level"]
          opened_at?: string
          origin?: Database["public"]["Enums"]["alert_origin"]
          reason_code?: string
          status?: Database["public"]["Enums"]["alert_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_attended_by_fkey"
            columns: ["attended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_students: {
        Row: {
          assignment_id: string
          created_at: string
          student_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          student_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_students_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assigned_by: string
          class_date: string
          created_at: string
          due_date: string
          group_id: string
          id: string
          lesson_id: string
          message: string | null
          mode: Database["public"]["Enums"]["assignment_mode"]
          notify_families: boolean
          remind_day_before: boolean
          targets_all: boolean
          updated_at: string
        }
        Insert: {
          assigned_by?: string
          class_date: string
          created_at?: string
          due_date: string
          group_id: string
          id?: string
          lesson_id: string
          message?: string | null
          mode?: Database["public"]["Enums"]["assignment_mode"]
          notify_families?: boolean
          remind_day_before?: boolean
          targets_all?: boolean
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          class_date?: string
          created_at?: string
          due_date?: string
          group_id?: string
          id?: string
          lesson_id?: string
          message?: string | null
          mode?: Database["public"]["Enums"]["assignment_mode"]
          notify_families?: boolean
          remind_day_before?: boolean
          targets_all?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          code: string
          created_at: string
          description: Json | null
          icon_key: string | null
          level: Database["public"]["Enums"]["school_level"]
          name: Json
        }
        Insert: {
          code: string
          created_at?: string
          description?: Json | null
          icon_key?: string | null
          level: Database["public"]["Enums"]["school_level"]
          name: Json
        }
        Update: {
          code?: string
          created_at?: string
          description?: Json | null
          icon_key?: string | null
          level?: Database["public"]["Enums"]["school_level"]
          name?: Json
        }
        Relationships: []
      }
      cards: {
        Row: {
          code: string
          created_at: string
          description: Json | null
          image_key: string | null
          lesson_id: string
          name: Json
        }
        Insert: {
          code: string
          created_at?: string
          description?: Json | null
          image_key?: string | null
          lesson_id: string
          name: Json
        }
        Update: {
          code?: string
          created_at?: string
          description?: Json | null
          image_key?: string | null
          lesson_id?: string
          name?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cards_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      emotion_checkins: {
        Row: {
          checkin_date: string
          context: Database["public"]["Enums"]["checkin_context"]
          created_at: string
          emotion: Database["public"]["Enums"]["emotion"] | null
          id: string
          intensity: Database["public"]["Enums"]["emotion_intensity"] | null
          lesson_id: string | null
          prefers_not_to_say: boolean
          scale_1_5: number | null
          student_id: string
        }
        Insert: {
          checkin_date: string
          context?: Database["public"]["Enums"]["checkin_context"]
          created_at?: string
          emotion?: Database["public"]["Enums"]["emotion"] | null
          id?: string
          intensity?: Database["public"]["Enums"]["emotion_intensity"] | null
          lesson_id?: string | null
          prefers_not_to_say?: boolean
          scale_1_5?: number | null
          student_id: string
        }
        Update: {
          checkin_date?: string
          context?: Database["public"]["Enums"]["checkin_context"]
          created_at?: string
          emotion?: Database["public"]["Enums"]["emotion"] | null
          id?: string
          intensity?: Database["public"]["Enums"]["emotion_intensity"] | null
          lesson_id?: string | null
          prefers_not_to_say?: boolean
          scale_1_5?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_checkins_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emotion_checkins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      family_consents: {
        Row: {
          accepted: boolean
          consent_version: string
          id: string
          method: string
          recorded_at: string
          student_id: string
        }
        Insert: {
          accepted: boolean
          consent_version: string
          id?: string
          method?: string
          recorded_at?: string
          student_id: string
        }
        Update: {
          accepted?: boolean
          consent_version?: string
          id?: string
          method?: string
          recorded_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_consents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      family_sheets: {
        Row: {
          challenge_done: Database["public"]["Enums"]["family_challenge_done"]
          comment: string | null
          emotion_mentioned: Database["public"]["Enums"]["emotion"] | null
          how_responded: Database["public"]["Enums"]["family_how_responded"]
          id: string
          lesson_id: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          challenge_done: Database["public"]["Enums"]["family_challenge_done"]
          comment?: string | null
          emotion_mentioned?: Database["public"]["Enums"]["emotion"] | null
          how_responded: Database["public"]["Enums"]["family_how_responded"]
          id?: string
          lesson_id: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          challenge_done?: Database["public"]["Enums"]["family_challenge_done"]
          comment?: string | null
          emotion_mentioned?: Database["public"]["Enums"]["emotion"] | null
          how_responded?: Database["public"]["Enums"]["family_how_responded"]
          id?: string
          lesson_id?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_sheets_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_sheets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      garden_items: {
        Row: {
          emotion: Database["public"]["Enums"]["emotion"]
          lesson_id: string
          planted_at: string
          student_id: string
        }
        Insert: {
          emotion: Database["public"]["Enums"]["emotion"]
          lesson_id: string
          planted_at?: string
          student_id: string
        }
        Update: {
          emotion?: Database["public"]["Enums"]["emotion"]
          lesson_id?: string
          planted_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garden_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garden_items_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          active: boolean
          ai_chat_enabled: boolean
          class_code: string
          class_weekday: number
          created_at: string
          family_qr_token: string
          grade: number
          id: string
          language: Database["public"]["Enums"]["app_language"]
          level: Database["public"]["Enums"]["school_level"]
          school_id: string
          school_year: number
          section: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          ai_chat_enabled?: boolean
          class_code: string
          class_weekday: number
          created_at?: string
          family_qr_token?: string
          grade: number
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          level: Database["public"]["Enums"]["school_level"]
          school_id: string
          school_year: number
          section: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          ai_chat_enabled?: boolean
          class_code?: string
          class_weekday?: number
          created_at?: string
          family_qr_token?: string
          grade?: number
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          level?: Database["public"]["Enums"]["school_level"]
          school_id?: string
          school_year?: number
          section?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_resources: {
        Row: {
          active: boolean
          created_at: string
          description: Json | null
          hours: Json | null
          id: string
          kind: Database["public"]["Enums"]["help_resource_kind"]
          level: Database["public"]["Enums"]["school_level"] | null
          name: Json
          phone: string | null
          position: number
          school_id: string | null
          url: string | null
          verified_on: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: Json | null
          hours?: Json | null
          id?: string
          kind: Database["public"]["Enums"]["help_resource_kind"]
          level?: Database["public"]["Enums"]["school_level"] | null
          name: Json
          phone?: string | null
          position?: number
          school_id?: string | null
          url?: string | null
          verified_on?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: Json | null
          hours?: Json | null
          id?: string
          kind?: Database["public"]["Enums"]["help_resource_kind"]
          level?: Database["public"]["Enums"]["school_level"] | null
          name?: Json
          phone?: string | null
          position?: number
          school_id?: string | null
          url?: string | null
          verified_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_resources_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_contents: {
        Row: {
          created_at: string
          language: Database["public"]["Enums"]["app_language"]
          lesson_id: string
          package_path: string | null
          package_size_bytes: number | null
          payload: Json
          schema_version: string
          version: number
        }
        Insert: {
          created_at?: string
          language: Database["public"]["Enums"]["app_language"]
          lesson_id: string
          package_path?: string | null
          package_size_bytes?: number | null
          payload: Json
          schema_version: string
          version: number
        }
        Update: {
          created_at?: string
          language?: Database["public"]["Enums"]["app_language"]
          lesson_id?: string
          package_path?: string | null
          package_size_bytes?: number | null
          payload?: Json
          schema_version?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_contents_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          assignment_id: string | null
          completed_at: string | null
          content_version: number
          current_position: number
          device_updated_at: string | null
          lesson_id: string
          started_at: string
          status: Database["public"]["Enums"]["progress_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          completed_at?: string | null
          content_version?: number
          current_position?: number
          device_updated_at?: string | null
          lesson_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["progress_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          completed_at?: string | null
          content_version?: number
          current_position?: number
          device_updated_at?: string | null
          lesson_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["progress_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_steps: {
        Row: {
          is_private: boolean
          is_skippable: boolean
          kind: Database["public"]["Enums"]["step_kind"]
          lesson_id: string
          minigame_id: string | null
          part: number
          position: number
        }
        Insert: {
          is_private?: boolean
          is_skippable?: boolean
          kind: Database["public"]["Enums"]["step_kind"]
          lesson_id: string
          minigame_id?: string | null
          part: number
          position: number
        }
        Update: {
          is_private?: boolean
          is_skippable?: boolean
          kind?: Database["public"]["Enums"]["step_kind"]
          lesson_id?: string
          minigame_id?: string | null
          part?: number
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_steps_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_steps_minigame_fk"
            columns: ["minigame_id", "lesson_id"]
            isOneToOne: false
            referencedRelation: "minigames"
            referencedColumns: ["id", "lesson_id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          duration_min: number | null
          emotion: Database["public"]["Enums"]["emotion"] | null
          family_note: Json | null
          grade: number
          home_challenge: Json | null
          id: string
          is_month_closure: boolean
          learnings: Json | null
          level: Database["public"]["Enums"]["school_level"]
          parts_count: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          teacher_guide: Json | null
          title: Json
          updated_at: string
          version: number
          week: number
        }
        Insert: {
          created_at?: string
          duration_min?: number | null
          emotion?: Database["public"]["Enums"]["emotion"] | null
          family_note?: Json | null
          grade: number
          home_challenge?: Json | null
          id?: string
          is_month_closure?: boolean
          learnings?: Json | null
          level: Database["public"]["Enums"]["school_level"]
          parts_count: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          teacher_guide?: Json | null
          title: Json
          updated_at?: string
          version?: number
          week: number
        }
        Update: {
          created_at?: string
          duration_min?: number | null
          emotion?: Database["public"]["Enums"]["emotion"] | null
          family_note?: Json | null
          grade?: number
          home_challenge?: Json | null
          id?: string
          is_month_closure?: boolean
          learnings?: Json | null
          level?: Database["public"]["Enums"]["school_level"]
          parts_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          teacher_guide?: Json | null
          title?: Json
          updated_at?: string
          version?: number
          week?: number
        }
        Relationships: []
      }
      minigames: {
        Row: {
          achievement_rules: Json
          badge_code: string | null
          created_at: string
          duration_min: number | null
          id: string
          indicator: string
          lesson_id: string
          name: Json
          number_in_unit: number
          plan_content: string
          slug: string
          teacher_evidence: string | null
          template: Database["public"]["Enums"]["game_template"]
          updated_at: string
        }
        Insert: {
          achievement_rules: Json
          badge_code?: string | null
          created_at?: string
          duration_min?: number | null
          id?: string
          indicator: string
          lesson_id: string
          name: Json
          number_in_unit: number
          plan_content: string
          slug: string
          teacher_evidence?: string | null
          template: Database["public"]["Enums"]["game_template"]
          updated_at?: string
        }
        Update: {
          achievement_rules?: Json
          badge_code?: string | null
          created_at?: string
          duration_min?: number | null
          id?: string
          indicator?: string
          lesson_id?: string
          name?: Json
          number_in_unit?: number
          plan_content?: string
          slug?: string
          teacher_evidence?: string | null
          template?: Database["public"]["Enums"]["game_template"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minigames_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "minigames_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          id: string
          preferred_language: Database["public"]["Enums"]["app_language"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name: string
          id: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          id?: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          active: boolean
          created_at: string
          department: string
          id: string
          municipality: string
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department: string
          id?: string
          municipality: string
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string
          id?: string
          municipality?: string
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      self_assessment_items: {
        Row: {
          code: string
          id: string
          level: Database["public"]["Enums"]["school_level"]
          position: number
          statement: Json
        }
        Insert: {
          code: string
          id?: string
          level: Database["public"]["Enums"]["school_level"]
          position: number
          statement: Json
        }
        Update: {
          code?: string
          id?: string
          level?: Database["public"]["Enums"]["school_level"]
          position?: number
          statement?: Json
        }
        Relationships: []
      }
      self_assessments: {
        Row: {
          answers: Json
          group_id: string
          id: string
          month: string
          period: Database["public"]["Enums"]["assessment_period"]
          student_id: string
          updated_at: string
        }
        Insert: {
          answers: Json
          group_id: string
          id?: string
          month: string
          period: Database["public"]["Enums"]["assessment_period"]
          student_id: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          group_id?: string
          id?: string
          month?: string
          period?: Database["public"]["Enums"]["assessment_period"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_assessments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "self_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schools: {
        Row: {
          created_at: string
          profile_id: string
          school_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          school_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schools_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      step_progress: {
        Row: {
          completed_at: string | null
          device_updated_at: string | null
          difficulty: number | null
          indicator_result:
            | Database["public"]["Enums"]["indicator_result"]
            | null
          lesson_id: string
          metrics: Json
          position: number
          status: Database["public"]["Enums"]["step_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          device_updated_at?: string | null
          difficulty?: number | null
          indicator_result?:
            | Database["public"]["Enums"]["indicator_result"]
            | null
          lesson_id: string
          metrics?: Json
          position: number
          status: Database["public"]["Enums"]["step_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          device_updated_at?: string | null
          difficulty?: number | null
          indicator_result?:
            | Database["public"]["Enums"]["indicator_result"]
            | null
          lesson_id?: string
          metrics?: Json
          position?: number
          status?: Database["public"]["Enums"]["step_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_progress_lesson_progress_fk"
            columns: ["student_id", "lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_progress"
            referencedColumns: ["student_id", "lesson_id"]
          },
          {
            foreignKeyName: "step_progress_step_fk"
            columns: ["lesson_id", "position"]
            isOneToOne: false
            referencedRelation: "lesson_steps"
            referencedColumns: ["lesson_id", "position"]
          },
        ]
      }
      student_badges: {
        Row: {
          badge_code: string
          earned_at: string
          student_id: string
        }
        Insert: {
          badge_code: string
          earned_at?: string
          student_id: string
        }
        Update: {
          badge_code?: string
          earned_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "student_badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_cards: {
        Row: {
          card_code: string
          earned_at: string
          student_id: string
        }
        Insert: {
          card_code: string
          earned_at?: string
          student_id: string
        }
        Update: {
          card_code?: string
          earned_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_cards_card_code_fkey"
            columns: ["card_code"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "student_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_goal_checks: {
        Row: {
          checked_on: string
          done: boolean
          goal_id: string
        }
        Insert: {
          checked_on: string
          done: boolean
          goal_id: string
        }
        Update: {
          checked_on?: string
          done?: boolean
          goal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_goal_checks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "student_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      student_goals: {
        Row: {
          created_on: string
          id: string
          month: string
          outcome: string | null
          student_id: string
        }
        Insert: {
          created_on: string
          id: string
          month: string
          outcome?: string | null
          student_id: string
        }
        Update: {
          created_on?: string
          id?: string
          month?: string
          outcome?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tool_uses: {
        Row: {
          tool_id: string
          used_on: string
        }
        Insert: {
          tool_id: string
          used_on: string
        }
        Update: {
          tool_id?: string
          used_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tool_uses_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "student_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tools: {
        Row: {
          archived_on: string | null
          created_on: string
          id: string
          lesson_id: string
          position: number
          student_id: string
        }
        Insert: {
          archived_on?: string | null
          created_on: string
          id: string
          lesson_id: string
          position: number
          student_id: string
        }
        Update: {
          archived_on?: string | null
          created_on?: string
          id?: string
          lesson_id?: string
          position?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tools_lesson_id_position_fkey"
            columns: ["lesson_id", "position"]
            isOneToOne: false
            referencedRelation: "lesson_steps"
            referencedColumns: ["lesson_id", "position"]
          },
          {
            foreignKeyName: "student_tools_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_trusted_adults: {
        Row: {
          id: string
          kind: Database["public"]["Enums"]["trusted_adult_kind"]
          label: string | null
          position: number
          student_id: string
        }
        Insert: {
          id?: string
          kind: Database["public"]["Enums"]["trusted_adult_kind"]
          label?: string | null
          position: number
          student_id: string
        }
        Update: {
          id?: string
          kind?: Database["public"]["Enums"]["trusted_adult_kind"]
          label?: string | null
          position?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_trusted_adults_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          accessibility: Json
          active: boolean
          auth_user_id: string | null
          avatar_key: string | null
          created_at: string
          display_name: string
          group_id: string
          id: string
          language: Database["public"]["Enums"]["app_language"] | null
          updated_at: string
        }
        Insert: {
          accessibility?: Json
          active?: boolean
          auth_user_id?: string | null
          avatar_key?: string | null
          created_at?: string
          display_name: string
          group_id: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"] | null
          updated_at?: string
        }
        Update: {
          accessibility?: Json
          active?: boolean
          auth_user_id?: string | null
          avatar_key?: string | null
          created_at?: string
          display_name?: string
          group_id?: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_ai_terms: { Args: { p_version: string }; Returns: Json }
      ai_chat_context: { Args: { p_student_id: string }; Returns: Json }
      ai_chat_record: {
        Args: {
          p_assistant_message: string
          p_risk_category?: string
          p_student_id: string
          p_student_message: string
        }
        Returns: Json
      }
      assign_lesson: {
        Args: {
          p_class_date: string
          p_due_date: string
          p_group_id: string
          p_lesson_id: string
          p_message?: string
          p_notify_families?: boolean
          p_remind_day_before?: boolean
          p_student_ids?: string[]
        }
        Returns: string
      }
      assignment_progress: { Args: { p_assignment_id: string }; Returns: Json }
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
      claim_notifications: { Args: { p_limit?: number }; Returns: Json }
      create_staff_member: {
        Args: {
          p_actor_id?: string
          p_full_name: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_school_id?: string
          p_user_id: string
        }
        Returns: Json
      }
      create_student_with_pin: {
        Args: {
          p_actor_id?: string
          p_display_name: string
          p_group_id: string
          p_pin?: string
        }
        Returns: Json
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      family_week: { Args: { p_token: string }; Returns: Json }
      finish_notifications: {
        Args: { p_failed?: Json; p_invalid_tokens?: string[]; p_sent: number[] }
        Returns: Json
      }
      get_auth_user_id_by_email: { Args: { p_email: string }; Returns: string }
      group_climate: {
        Args: { p_group_id: string; p_week_start?: string }
        Returns: Json
      }
      group_overview: { Args: { p_group_id: string }; Returns: Json }
      my_chat_history: { Args: { p_limit?: number }; Returns: Json }
      my_chat_status: { Args: never; Returns: Json }
      my_help_request: { Args: never; Returns: Json }
      my_week: { Args: never; Returns: Json }
      poll_results: {
        Args: { p_group_id?: string; p_lesson_slug: string }
        Returns: Json
      }
      record_family_consent: {
        Args: { p_accepted: boolean; p_version: string }
        Returns: Json
      }
      register_push_token: {
        Args: { p_platform: string; p_token: string }
        Returns: Json
      }
      remind_pending: { Args: { p_assignment_id: string }; Returns: Json }
      request_help: { Args: { p_wants: string }; Returns: Json }
      reset_student_pin: {
        Args: { p_new_pin?: string; p_student_id: string }
        Returns: Json
      }
      resolve_class_code: { Args: { p_class_code: string }; Returns: Json }
      school_overview: {
        Args: { p_school_id: string; p_week_start?: string }
        Returns: Json
      }
      self_assessment_summary: {
        Args: { p_group_id: string; p_month?: string }
        Returns: Json
      }
      set_trusted_adults: { Args: { p_adults: Json }; Returns: Json }
      submit_family_sheet: {
        Args: {
          p_challenge_done: Database["public"]["Enums"]["family_challenge_done"]
          p_comment?: string
          p_emotion_mentioned?: Database["public"]["Enums"]["emotion"]
          p_how_responded: Database["public"]["Enums"]["family_how_responded"]
          p_lesson_slug: string
        }
        Returns: Json
      }
      submit_poll: {
        Args: { p_lesson_slug: string; p_option_id: string }
        Returns: Json
      }
      submit_self_assessment: {
        Args: {
          p_answers: Json
          p_period: Database["public"]["Enums"]["assessment_period"]
        }
        Returns: Json
      }
      sync_progress: { Args: { p_payload: Json }; Returns: Json }
      sync_toolbox: { Args: { p_payload: Json }; Returns: Json }
      unregister_push_token: { Args: { p_token: string }; Returns: Json }
      verify_student_pin: {
        Args: { p_group_id: string; p_pin: string; p_student_id: string }
        Returns: Json
      }
    }
    Enums: {
      alert_level: "support" | "risk_moderate" | "risk_high"
      alert_origin: "checkin" | "chat" | "teacher_observation" | "help_request"
      alert_status: "open" | "in_attention" | "closed"
      app_language: "es" | "en" | "miq"
      app_role: "student" | "teacher" | "counselor" | "director" | "admin"
      assessment_period: "start" | "end"
      assignment_mode: "home" | "classroom"
      checkin_context: "daily" | "lesson_start"
      content_status: "draft" | "published" | "archived"
      emotion: "joy" | "sadness" | "anger" | "fear" | "calm" | "love"
      emotion_intensity: "a_little" | "quite" | "a_lot"
      family_challenge_done: "yes" | "partly" | "no"
      family_how_responded: "interest" | "difficulty" | "declined"
      game_template:
        | "catch"
        | "drag_to_zones"
        | "classify"
        | "sequence"
        | "guided_breathing"
        | "branching_story"
        | "cooperative"
        | "builder"
        | "true_myth_trivia"
        | "compare_images"
        | "journal"
      help_resource_kind: "phone_line" | "in_school" | "website"
      indicator_result: "achieved" | "in_progress" | "needs_support"
      progress_status: "in_progress" | "completed"
      school_level: "primary" | "secondary"
      step_kind:
        | "story"
        | "concept"
        | "worked_example"
        | "minigame"
        | "quiz"
        | "poll"
        | "practice"
        | "reflection"
        | "application"
        | "card"
        | "plan"
        | "home"
        | "calm"
        | "summary"
      step_status: "in_progress" | "completed" | "skipped"
      trusted_adult_kind:
        | "mother"
        | "father"
        | "grandparent"
        | "uncle_aunt"
        | "sibling"
        | "teacher"
        | "guide_teacher"
        | "counselor"
        | "other"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      alert_level: ["support", "risk_moderate", "risk_high"],
      alert_origin: ["checkin", "chat", "teacher_observation", "help_request"],
      alert_status: ["open", "in_attention", "closed"],
      app_language: ["es", "en", "miq"],
      app_role: ["student", "teacher", "counselor", "director", "admin"],
      assessment_period: ["start", "end"],
      assignment_mode: ["home", "classroom"],
      checkin_context: ["daily", "lesson_start"],
      content_status: ["draft", "published", "archived"],
      emotion: ["joy", "sadness", "anger", "fear", "calm", "love"],
      emotion_intensity: ["a_little", "quite", "a_lot"],
      family_challenge_done: ["yes", "partly", "no"],
      family_how_responded: ["interest", "difficulty", "declined"],
      game_template: [
        "catch",
        "drag_to_zones",
        "classify",
        "sequence",
        "guided_breathing",
        "branching_story",
        "cooperative",
        "builder",
        "true_myth_trivia",
        "compare_images",
        "journal",
      ],
      help_resource_kind: ["phone_line", "in_school", "website"],
      indicator_result: ["achieved", "in_progress", "needs_support"],
      progress_status: ["in_progress", "completed"],
      school_level: ["primary", "secondary"],
      step_kind: [
        "story",
        "concept",
        "worked_example",
        "minigame",
        "quiz",
        "poll",
        "practice",
        "reflection",
        "application",
        "card",
        "plan",
        "home",
        "calm",
        "summary",
      ],
      step_status: ["in_progress", "completed", "skipped"],
      trusted_adult_kind: [
        "mother",
        "father",
        "grandparent",
        "uncle_aunt",
        "sibling",
        "teacher",
        "guide_teacher",
        "counselor",
        "other",
      ],
    },
  },
} as const
