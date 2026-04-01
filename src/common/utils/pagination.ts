import type { PaginationQuery } from '../dto/pagination.query';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function normalizePagination(
  query: PaginationQuery,
  options?: {
    defaultLimit?: number;
    maxLimit?: number;
  },
) {
  const defaultLimit = options?.defaultLimit ?? 20;
  const maxLimit = options?.maxLimit ?? 100;
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(Math.max(1, query.limit ?? defaultLimit), maxLimit);
  const skip = (page - 1) * limit;
  const take = limit;
  return { page, limit, skip, take };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}
