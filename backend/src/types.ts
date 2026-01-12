import { User } from "@cineconnect/shared";

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Request with User
export interface AuthenticatedRequest {
  user?: User;
  userId?: string;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}

// Pagination Query
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}
