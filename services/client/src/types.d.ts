export type Alert = {
  message: string;
  duration?: number;
  severity: "error" | "success" | "info" | "warning";
};

export type LoginParams = {
  identity: string;
  password: string;
};

export type SignupParams = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type Profile = {
  name: string;
  bio?: string;
  avatar?: string;
  dob?: Date;
  updated_on?: Date;
  created_on?: Date;
};

export type User = {
  id: number;
  email: string;
  username: string;
  profile: Profile;
  is_admin: boolean;
  is_active: boolean;
  last_sign_in_ip: string;
  current_sign_in_ip: string;
  last_sign_in_on: Date;
  current_sign_in_on: Date;
  sign_in_count: number;
  followers: { id: number }[];
  followed: { id: number }[];
};

export type Followers = {
  followers: User[];
  hasNext: boolean;
};

export type Following = {
  following: User[];
  hasNext: boolean;
};

export type Post = {
  id: number;
  body: string;
  created_on: Date;
  updated_on: Date;
  author: User;
  likes: { id: number }[];
  comments: { id: number }[];
};

export type Comment = {
  replies: Comment[];
} & Post;
