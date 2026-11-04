export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          github_url: string | null;
          twitter_url: string | null;
          website_url: string | null;
          location: string | null;
          reputation_score: number;
          badges: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          website_url?: string | null;
          location?: string | null;
          reputation_score?: number;
          badges?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          website_url?: string | null;
          location?: string | null;
          reputation_score?: number;
          badges?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      ideas: {
        Row: {
          id: string;
          author_id: string | null;
          parent_idea_id: string | null;
          parent_slug: string | null;
          title: string;
          slug: string;
          hook: string;
          problem_statement: string;
          mvp_features: Json;
          category: 'web' | 'mobile' | 'ai' | 'cli' | 'hardware' | 'extension';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          target_region: string;
          collab_status: 'open' | 'seeking_cofounder';
          suggested_stack: string[];
          upvotes_count: number;
          forks_count: number;
          builds_count: number;
          is_seeded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          parent_idea_id?: string | null;
          parent_slug?: string | null;
          title: string;
          slug: string;
          hook: string;
          problem_statement: string;
          mvp_features?: Json;
          category: 'web' | 'mobile' | 'ai' | 'cli' | 'hardware' | 'extension';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          target_region?: string;
          collab_status?: 'open' | 'seeking_cofounder';
          suggested_stack?: string[];
          upvotes_count?: number;
          forks_count?: number;
          builds_count?: number;
          is_seeded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          parent_idea_id?: string | null;
          parent_slug?: string | null;
          title?: string;
          slug?: string;
          hook?: string;
          problem_statement?: string;
          mvp_features?: Json;
          category?: 'web' | 'mobile' | 'ai' | 'cli' | 'hardware' | 'extension';
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          target_region?: string;
          collab_status?: 'open' | 'seeking_cofounder';
          suggested_stack?: string[];
          upvotes_count?: number;
          forks_count?: number;
          builds_count?: number;
          is_seeded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      feature_requests: {
        Row: {
          id: string;
          idea_id: string;
          proposer_id: string;
          action_type: 'add_feature' | 'remove_feature';
          feature_text: string;
          rationale: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          proposer_id: string;
          action_type: 'add_feature' | 'remove_feature';
          feature_text: string;
          rationale?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          proposer_id?: string;
          action_type?: 'add_feature' | 'remove_feature';
          feature_text?: string;
          rationale?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
      idea_builds: {
        Row: {
          id: string;
          idea_id: string;
          builder_id: string;
          status: 'building' | 'shipped';
          repo_url: string;
          live_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          builder_id: string;
          status?: 'building' | 'shipped';
          repo_url: string;
          live_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          builder_id?: string;
          status?: 'building' | 'shipped';
          repo_url?: string;
          live_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      idea_upvotes: {
        Row: {
          user_id: string;
          idea_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          idea_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          idea_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          idea_id: string;
          user_id: string;
          parent_comment_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          user_id: string;
          parent_comment_id?: string | null;
          content: string;
          likes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          user_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          likes_count?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type IdeaRow = Database["public"]["Tables"]["ideas"]["Row"];
export type FeatureRequestRow = Database["public"]["Tables"]["feature_requests"]["Row"];
export type IdeaBuildRow = Database["public"]["Tables"]["idea_builds"]["Row"];
export type IdeaUpvoteRow = Database["public"]["Tables"]["idea_upvotes"]["Row"];
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
