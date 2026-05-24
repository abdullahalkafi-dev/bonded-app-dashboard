import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import type { ApiSuccessResponse, Circle, PaginationMeta } from "@/types/api";

interface ListCirclesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  visibility?: string;
  isActive?: string;
  isDeleted?: string;
}

interface ListCirclesResponse {
  data: Circle[];
  meta: PaginationMeta;
}

interface CreateCircleRequest {
  name: string;
  description?: string;
  coverImage: string;
  interestSlugs: string[];
  hashtags?: string[];
  tier?: "global" | "local";
  isPaid?: boolean;
  price?: number;
  city?: string;
}

interface UpdateCircleRequest extends Partial<CreateCircleRequest> {
  id: string;
}

export const circlesApi = createApi({
  reducerPath: "circlesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Circle"],
  endpoints: (builder) => ({
    getCircles: builder.query<ApiSuccessResponse<ListCirclesResponse>, ListCirclesParams>({
      query: (params) => ({
        url: "/admin/circles",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          search: params.search,
          category: params.category,
          visibility: params.visibility,
          isActive: params.isActive,
          isDeleted: params.isDeleted,
        },
      }),
      providesTags: ["Circle"],
    }),
    createCircle: builder.mutation<ApiSuccessResponse<Circle>, CreateCircleRequest>({
      query: (body) => ({
        url: "/admin/circles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Circle"],
    }),
    updateCircle: builder.mutation<ApiSuccessResponse<Circle>, UpdateCircleRequest>({
      query: ({ id, ...body }) => ({
        url: `/admin/circles/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Circle"],
    }),
    deleteCircle: builder.mutation<ApiSuccessResponse<Circle>, string>({
      query: (id) => ({
        url: `/admin/circles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Circle"],
    }),
  }),
});

export const {
  useGetCirclesQuery,
  useCreateCircleMutation,
  useUpdateCircleMutation,
  useDeleteCircleMutation,
} = circlesApi;
