import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";

export const productCatalogApi = createApi({
  reducerPath: "productCatalogApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getApprovedPriceTiers: builder.query<number[], void>({
      query: () => "/store-products/tiers",
      transformResponse: (response: { data: number[] }) => response.data,
    }),
  }),
});

export const { useGetApprovedPriceTiersQuery } = productCatalogApi;
