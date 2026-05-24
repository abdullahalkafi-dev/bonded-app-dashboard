import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import type { ApiSuccessResponse, MarketplaceProduct } from "@/types/api";

interface ListMarketplaceResponse {
  totalProducts: number;
  products: MarketplaceProduct[];
}

interface CreateMarketplaceRequest {
  interestIds: string[];
  source: "amazon" | "ebay" | "walmart" | "etsy" | "other";
  productUrl: string;
  imageUrl: string;
  priceRange: string;
  ctaLabel: string;
  isActive?: boolean;
}

interface UpdateMarketplaceRequest {
  id: string;
  interest?: string;
  interestSlug?: string;
  category?: string;
  source?: "amazon" | "ebay" | "walmart" | "etsy" | "other";
  productUrl?: string;
  imageUrl?: string;
  priceRange?: string;
  ctaLabel?: string;
  isActive?: boolean;
}

export const marketplaceApi = createApi({
  reducerPath: "marketplaceApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Marketplace"],
  endpoints: (builder) => ({
    getMarketplaceProducts: builder.query<
      ApiSuccessResponse<ListMarketplaceResponse>,
      void
    >({
      query: () => ({
        url: "/admin/marketplace",
      }),
      providesTags: ["Marketplace"],
    }),
    createMarketplaceProducts: builder.mutation<
      ApiSuccessResponse<{ count: number; products: MarketplaceProduct[] }>,
      CreateMarketplaceRequest
    >({
      query: (body) => ({
        url: "/admin/marketplace",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Marketplace"],
    }),
    updateMarketplaceProduct: builder.mutation<
      ApiSuccessResponse<MarketplaceProduct>,
      UpdateMarketplaceRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/marketplace/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Marketplace"],
    }),
    deleteMarketplaceProduct: builder.mutation<
      ApiSuccessResponse<void>,
      string
    >({
      query: (id) => ({
        url: `/admin/marketplace/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Marketplace"],
    }),
  }),
});

export const {
  useGetMarketplaceProductsQuery,
  useCreateMarketplaceProductsMutation,
  useUpdateMarketplaceProductMutation,
  useDeleteMarketplaceProductMutation,
} = marketplaceApi;
