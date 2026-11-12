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
          headline: string | null;
          availability: string | null;
          preferred_stack: string[] | null;
          avatar_url: string | null;
          bio: string | null;
          github_url: string | null;
          twitter_url: string | null;
          discord_url: string | null;
          website_url: string | null;
          contact_email: string | null;
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
          headline?: string | null;
          availability?: string | null;
          preferred_stack?: string[] | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          discord_url?: string | null;
          website_url?: string | null;
          contact_email?: string | null;
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
          headline?: string | null;
          availability?: string | null;
          preferred_stack?: string[] | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          discord_url?: string | null;
          website_url?: string | null;
          contact_email?: string | null;
          location?: string | null;
          reputation_score?: number;
          badges?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          category: "web" | "mobile" | "ai" | "cli" | "hardware" | "extension";
          difficulty: "beginner" | "intermediate" | "advanced";
          target_region: string;
          collab_status: "open" | "seeking_cofounder";
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
          category: "web" | "mobile" | "ai" | "cli" | "hardware" | "extension";
          difficulty: "beginner" | "intermediate" | "advanced";
          target_region?: string;
          collab_status?: "open" | "seeking_cofounder";
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
          category?: "web" | "mobile" | "ai" | "cli" | "hardware" | "extension";
          difficulty?: "beginner" | "intermediate" | "advanced";
          target_region?: string;
          collab_status?: "open" | "seeking_cofounder";
          suggested_stack?: string[];
          upvotes_count?: number;
          forks_count?: number;
          builds_count?: number;
          is_seeded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      feature_requests: {
        Row: {
          id: string;
          idea_id: string;
          proposer_id: string;
          action_type: "add_feature" | "remove_feature";
          feature_text: string;
          rationale: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          proposer_id: string;
          action_type: "add_feature" | "remove_feature";
          feature_text: string;
          rationale?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          proposer_id?: string;
          action_type?: "add_feature" | "remove_feature";
          feature_text?: string;
          rationale?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };
      idea_builds: {
        Row: {
          id: string;
          idea_id: string;
          builder_id: string;
          status: "building" | "shipped";
          repo_url: string;
          live_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          builder_id: string;
          status?: "building" | "shipped";
          repo_url: string;
          live_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          builder_id?: string;
          status?: "building" | "shipped";
          repo_url?: string;
          live_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      bookmarks: {
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
        Relationships: [];
      };
      collaboration_requests: {
        Row: {
          id: string;
          idea_id: string;
          applicant_id: string;
          role: string;
          availability: string;
          contact_handle: string;
          pitch: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          applicant_id: string;
          role: string;
          availability: string;
          contact_handle: string;
          pitch: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          applicant_id?: string;
          role?: string;
          availability?: string;
          contact_handle?: string;
          pitch?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string | null;
          type: "pr" | "fork" | "build" | "comment" | "collab" | "star" | "system";
          title: string;
          message: string;
          idea_slug: string;
          idea_title: string;
          target_tab: "spec" | "prs" | "builds" | "lineage" | "discussions" | "team" | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id?: string | null;
          type: "pr" | "fork" | "build" | "comment" | "collab" | "star" | "system";
          title: string;
          message: string;
          idea_slug: string;
          idea_title: string;
          target_tab?: "spec" | "prs" | "builds" | "lineage" | "discussions" | "team" | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          actor_id?: string | null;
          type?: "pr" | "fork" | "build" | "comment" | "collab" | "star" | "system";
          title?: string;
          message?: string;
          idea_slug?: string;
          idea_title?: string;
          target_tab?: "spec" | "prs" | "builds" | "lineage" | "discussions" | "team" | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
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
export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];
export type CollaborationRequestRow = Database["public"]["Tables"]["collaboration_requests"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
