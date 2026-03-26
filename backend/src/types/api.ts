export interface ErrorResponse {
  success?: false;
  error: string;
  statusCode?: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}
