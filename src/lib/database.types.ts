export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chat_group_members: {
        Row: {
          created_at: string;
          group_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          group_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          group_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'chat_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_group_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      chat_groups: {
        Row: {
          avatar_type: Database['public']['Enums']['group_avatar_type'] | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          org_id: string;
          owner_id: string;
        };
        Insert: {
          avatar_type?: Database['public']['Enums']['group_avatar_type'] | null;
          created_at?: string;
          description?: string | null;
          id: string;
          name: string;
          org_id: string;
          owner_id: string;
        };
        Update: {
          avatar_type?: Database['public']['Enums']['group_avatar_type'] | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          org_id?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_groups_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_groups_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      group_messages: {
        Row: {
          by_id: string;
          created_at: string;
          data: Json;
          edited_at: string | null;
          group_id: string;
          id: string;
          org_id: string;
          typ: Database['public']['Enums']['msg_type'];
        };
        Insert: {
          by_id: string;
          created_at?: string;
          data: Json;
          edited_at?: string | null;
          group_id: string;
          id: string;
          org_id: string;
          typ: Database['public']['Enums']['msg_type'];
        };
        Update: {
          by_id?: string;
          created_at?: string;
          data?: Json;
          edited_at?: string | null;
          group_id?: string;
          id?: string;
          org_id?: string;
          typ?: Database['public']['Enums']['msg_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'group_messages_by_id_fkey';
            columns: ['by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_messages_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'chat_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_messages_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          }
        ];
      };
      kanban_board_members: {
        Row: {
          board_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          board_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          board_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'kanban_board_members_board_id_fkey';
            columns: ['board_id'];
            isOneToOne: false;
            referencedRelation: 'kanban_boards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kanban_board_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      kanban_boards: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          org_id: string;
          owner_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          name: string;
          org_id: string;
          owner_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          org_id?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'kanban_boards_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kanban_boards_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      kanban_cards: {
        Row: {
          board_id: string;
          category_id: string;
          created_at: string;
          created_by: string;
          description: string | null;
          due_date: string | null;
          id: string;
          position: number;
          priority: Database['public']['Enums']['kanban_priority'] | null;
          tags: string[];
          title: string;
          updated_at: string | null;
        };
        Insert: {
          board_id: string;
          category_id: string;
          created_at?: string;
          created_by: string;
          description?: string | null;
          due_date?: string | null;
          id: string;
          position: number;
          priority?: Database['public']['Enums']['kanban_priority'] | null;
          tags?: string[];
          title: string;
          updated_at?: string | null;
        };
        Update: {
          board_id?: string;
          category_id?: string;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: Database['public']['Enums']['kanban_priority'] | null;
          tags?: string[];
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'kanban_cards_board_id_fkey';
            columns: ['board_id'];
            isOneToOne: false;
            referencedRelation: 'kanban_boards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kanban_cards_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'kanban_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kanban_cards_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      kanban_categories: {
        Row: {
          board_id: string;
          color: string;
          created_at: string;
          id: string;
          name: string;
          position: number;
        };
        Insert: {
          board_id: string;
          color: string;
          created_at?: string;
          id: string;
          name: string;
          position: number;
        };
        Update: {
          board_id?: string;
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'kanban_categories_board_id_fkey';
            columns: ['board_id'];
            isOneToOne: false;
            referencedRelation: 'kanban_boards';
            referencedColumns: ['id'];
          }
        ];
      };
      messages: {
        Row: {
          created_at: string;
          data: Json;
          edited_at: string | null;
          from_id: string;
          id: string;
          org_id: string;
          to_id: string;
          typ: Database['public']['Enums']['msg_type'];
        };
        Insert: {
          created_at?: string;
          data: Json;
          edited_at?: string | null;
          from_id: string;
          id: string;
          org_id: string;
          to_id: string;
          typ: Database['public']['Enums']['msg_type'];
        };
        Update: {
          created_at?: string;
          data?: Json;
          edited_at?: string | null;
          from_id?: string;
          id?: string;
          org_id?: string;
          to_id?: string;
          typ?: Database['public']['Enums']['msg_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'messages_from_id_fkey';
            columns: ['from_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_to_id_fkey';
            columns: ['to_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      org_invites: {
        Row: {
          created_at: string;
          invitee: string;
          message: string | null;
          org_id: string;
        };
        Insert: {
          created_at?: string;
          invitee: string;
          message?: string | null;
          org_id: string;
        };
        Update: {
          created_at?: string;
          invitee?: string;
          message?: string | null;
          org_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'org_invites_invitee_fkey';
            columns: ['invitee'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'org_invites_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          }
        ];
      };
      organisations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          link: string | null;
          name: string;
          owner_id: string;
          plan: Database['public']['Enums']['plan_enum'];
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          link?: string | null;
          name: string;
          owner_id: string;
          plan?: Database['public']['Enums']['plan_enum'];
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          link?: string | null;
          name?: string;
          owner_id?: string;
          plan?: Database['public']['Enums']['plan_enum'];
        };
        Relationships: [
          {
            foreignKeyName: 'organisations_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      organisations_users: {
        Row: {
          created_at: string;
          organisation_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          organisation_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          organisation_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisations_users_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organisations_users_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      users: {
        Row: {
          avatar_url: string;
          created_at: string;
          id: string;
          name: string;
          username: string;
        };
        Insert: {
          avatar_url: string;
          created_at?: string;
          id: string;
          name: string;
          username: string;
        };
        Update: {
          avatar_url?: string;
          created_at?: string;
          id?: string;
          name?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invite: {
        Args: { org_id: string };
        Returns: undefined;
      };
      check_if_org_exists: {
        Args: { id: string };
        Returns: boolean;
      };
      create_board: {
        Args: { id: string; board_name: string; org_id: string };
        Returns: undefined;
      };
      get_chat_overview: {
        Args: { org_id: string };
        Returns: {
          is_group: boolean;
          id: string;
          name: string;
          slug: string;
          avatar_url: string;
          unread_count: number;
          typ: Database['public']['Enums']['msg_type'];
          data: Json;
          msg_created_at: string;
          msg_edited_at: string;
          msg_read_at: string;
        }[];
      };
      get_messages: {
        Args: { slug: string };
        Returns: {
          id: string;
          from_id: string;
          to_id: string;
          org_id: string;
          typ: Database['public']['Enums']['msg_type'];
          data: Json;
          created_at: string;
          edited_at: string;
        }[];
      };
      get_user_by_email: {
        Args: { email: string };
        Returns: {
          avatar_url: string;
          created_at: string;
          id: string;
          name: string;
          username: string;
        }[];
      };
      get_user_provider: {
        Args: { email: string };
        Returns: string;
      };
    };
    Enums: {
      group_avatar_type: 'webp' | 'svg';
      kanban_priority: 'low' | 'medium' | 'high';
      msg_type: 'text' | 'attachment' | 'voice';
      plan_enum: 'free' | 'basic' | 'pro';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      group_avatar_type: ['webp', 'svg'],
      kanban_priority: ['low', 'medium', 'high'],
      msg_type: ['text', 'attachment', 'voice'],
      plan_enum: ['free', 'basic', 'pro']
    }
  }
} as const;
