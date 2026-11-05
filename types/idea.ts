export type IdeaCategory = 'web' | 'mobile' | 'ai' | 'cli' | 'hardware' | 'extension';
export type IdeaDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CollabStatus = 'open' | 'seeking_cofounder';

export interface IdeaAuthor {
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  github_url?: string;
  twitter_url?: string;
  discord_url?: string;
  website_url?: string;
  location?: string;
  joined_date?: string;
  reputation_score?: number;
  badges?: string[];
}

export interface FeatureRequest {
  id: string;
  idea_id: string;
  proposer: IdeaAuthor;
  action_type: 'add_feature' | 'remove_feature';
  feature_text: string;
  rationale?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface IdeaBuild {
  id: string;
  idea_id: string;
  builder: IdeaAuthor;
  status: 'building' | 'shipped';
  repo_url: string;
  live_url?: string;
  notes?: string;
  created_at: string;
}

export interface IdeaComment {
  id: string;
  idea_id: string;
  user: IdeaAuthor;
  content: string;
  created_at: string;
  parent_comment_id?: string | null;
  likes_count?: number;
  user_liked?: boolean;
}

export interface UserProfileData {
  author: IdeaAuthor;
  specs: Idea[];
  forks: Idea[];
  builds: IdeaBuild[];
  prs: FeatureRequest[];
  starred?: Idea[];
  stats: {
    totalSpecs: number;
    totalForks: number;
    totalBuilds: number;
    totalStars: number;
    reputation: number;
    rankTitle: string;
  };
}

export interface Idea {
  id?: string;
  title: string;
  slug: string;
  hook: string;
  problem_statement: string;
  mvp_features: string[];
  category: IdeaCategory;
  difficulty: IdeaDifficulty;
  target_region: string;
  collab_status: CollabStatus;
  suggested_stack: string[];
  upvotes_count?: number;
  forks_count?: number;
  builds_count?: number;
  parent_idea_id?: string | null;
  parent_slug?: string | null;
  is_seeded?: boolean;
  created_at?: string;
  author?: IdeaAuthor;
  feature_requests?: FeatureRequest[];
  builds?: IdeaBuild[];
  comments?: IdeaComment[];
}