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

interface ForgotPasswordRequest {
  email: string;
}

interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
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
    forgotPassword: builder.mutation<
      ApiSuccessResponse<null>,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyResetOtp: builder.mutation<
      ApiSuccessResponse<{ resetToken: string }>,
      VerifyResetOtpRequest
    >({
      query: (body) => ({
        url: "/auth/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ApiSuccessResponse<null>,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<
      ApiSuccessResponse<null>,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
