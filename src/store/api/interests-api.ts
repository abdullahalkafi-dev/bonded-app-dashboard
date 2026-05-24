import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import type { ApiSuccessResponse, Interest } from "@/types/api";

export const interestsApi = createApi({
  reducerPath: "interestsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Interest"],
  endpoints: (builder) => ({
    getInterests: builder.query<ApiSuccessResponse<Interest[]>, void>({
      query: () => ({ url: "/interests" }),
      providesTags: ["Interest"],
    }),
  }),
});

export const { useGetInterestsQuery } = interestsApi;
