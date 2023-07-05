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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Board: {
        Row: {
          createdAt: string
          description: string | null
          id: number
          jiraId: string | null
          title: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id?: number
          jiraId?: string | null
          title: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: number
          jiraId?: string | null
          title?: string
          updatedAt?: string | null
        }
        Relationships: []
      }
      Column: {
        Row: {
          boardId: number
          createdAt: string
          id: number
          title: string
          updatedAt: string | null
        }
        Insert: {
          boardId: number
          createdAt?: string
          id?: number
          title: string
          updatedAt?: string | null
        }
        Update: {
          boardId?: number
          createdAt?: string
          id?: number
          title?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Column_boardId_fkey"
            columns: ["boardId"]
            referencedRelation: "Board"
            referencedColumns: ["id"]
          }
        ]
      }
      Comment: {
        Row: {
          content: string
          createdAt: string
          id: number
          parentId: number | null
          taskId: number
          toDoId: number | null
          updatedAt: string | null
          userId: number
        }
        Insert: {
          content: string
          createdAt?: string
          id?: number
          parentId?: number | null
          taskId: number
          toDoId?: number | null
          updatedAt?: string | null
          userId: number
        }
        Update: {
          content?: string
          createdAt?: string
          id?: number
          parentId?: number | null
          taskId?: number
          toDoId?: number | null
          updatedAt?: string | null
          userId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Comment_parentId_fkey"
            columns: ["parentId"]
            referencedRelation: "Comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Comment_taskId_fkey"
            columns: ["taskId"]
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Comment_toDoId_fkey"
            columns: ["toDoId"]
            referencedRelation: "ToDo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Comment_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Task: {
        Row: {
          boardId: number
          columnId: number
          content: string
          createdAt: string
          id: number
          title: string
          updatedAt: string | null
        }
        Insert: {
          boardId: number
          columnId: number
          content: string
          createdAt?: string
          id?: number
          title: string
          updatedAt?: string | null
        }
        Update: {
          boardId?: number
          columnId?: number
          content?: string
          createdAt?: string
          id?: number
          title?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Task_boardId_fkey"
            columns: ["boardId"]
            referencedRelation: "Board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Task_columnId_fkey"
            columns: ["columnId"]
            referencedRelation: "Column"
            referencedColumns: ["id"]
          }
        ]
      }
      ToDo: {
        Row: {
          boardId: number
          content: string
          createdAt: string
          id: number
          isDone: boolean
          taskId: number
          updatedAt: string | null
        }
        Insert: {
          boardId: number
          content: string
          createdAt?: string
          id?: number
          isDone: boolean
          taskId: number
          updatedAt?: string | null
        }
        Update: {
          boardId?: number
          content?: string
          createdAt?: string
          id?: number
          isDone?: boolean
          taskId?: number
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ToDo_taskId_fkey"
            columns: ["taskId"]
            referencedRelation: "Task"
            referencedColumns: ["id"]
          }
        ]
      }
      User: {
        Row: {
          createdAt: string
          id: number
          name: string | null
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          name?: string | null
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          name?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

