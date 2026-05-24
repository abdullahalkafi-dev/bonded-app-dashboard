import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import type { ApiSuccessResponse, LoginResponse } from "@/types/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: [],
  endpoints: (builder) => ({
    login: builder.mutation<ApiSuccessResponse<LoginResponse>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    refreshToken: builder.mutation<
      ApiSuccessResponse<{ accessToken: string; refreshToken: string }>,
      RefreshTokenRequest
    >({
      query: (body) => ({
        url: "/auth/refresh-access-token",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRefreshTokenMutation } = authApi;
