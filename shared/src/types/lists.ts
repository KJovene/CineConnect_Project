import type { Film } from "./films";

export interface List {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListResponse extends List {
  movies?: Film[];
  movieCount?: number;
}
