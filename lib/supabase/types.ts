export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          onboarding_completed: boolean
          focus_area: string | null
          income_goal: number | null
          target_deadline: string | null
          obstacles: string[] | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
          onboarding_completed?: boolean
          focus_area?: string | null
          income_goal?: number | null
          target_deadline?: string | null
          obstacles?: string[] | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          onboarding_completed?: boolean
          focus_area?: string | null
          income_goal?: number | null
          target_deadline?: string | null
          obstacles?: string[] | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          status: "active" | "completed" | "paused"
          progress: number
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          status?: "active" | "completed" | "paused"
          progress?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          status?: "active" | "completed" | "paused"
          progress?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      steps: {
        Row: {
          id: string
          goal_id: string
          title: string
          completed: boolean
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          title: string
          completed?: boolean
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          title?: string
          completed?: boolean
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          content: string
          sender: "user" | "assistant"
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          content: string
          sender: "user" | "assistant"
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          content?: string
          sender?: "user" | "assistant"
          role?: string | null
          created_at?: string
        }
      }
    }
  }
}
