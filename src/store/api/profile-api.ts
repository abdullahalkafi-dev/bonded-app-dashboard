import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse, AdminProfile } from "@/types/api";

interface UpdateProfileRequest {
  fullName?: string;
  username?: string;
  bio?: string;
  phone?: string;
  phoneCountryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  city?: string;
  address?: string;
  location?: {
    longitude: number;
    latitude: number;
  };
  connectionType?: string[];
  interests?: string[];
  avatar?: string;
  coverImage?: string;
}

interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    user: AdminProfile;
    isCompleteProfile?: boolean;
  };
}

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<ApiSuccessResponse<AdminProfile>, void>({
      query: () => ({
        url: "/admin/profile",
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      ApiSuccessResponse<AdminProfile>,
      UpdateProfileRequest
    >({
      query: (body) => ({
        url: "/admin/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    uploadAvatar: builder.mutation<UploadImageResponse, File>({
      queryFn: async (file) => {
        try {
          const formData = new FormData();
          formData.append("image", file);
          const data = await apiClient<UploadImageResponse>("/user/me/avatar", {
            method: "PATCH",
            body: formData,
          });
          return { data };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              data: error instanceof Error ? error.message : "Upload failed",
            },
          };
        }
      },
      invalidatesTags: ["Profile"],
    }),
    uploadCover: builder.mutation<UploadImageResponse, File>({
      queryFn: async (file) => {
        try {
          const formData = new FormData();
          formData.append("image", file);
          const data = await apiClient<UploadImageResponse>("/user/me/cover", {
            method: "PATCH",
            body: formData,
          });
          return { data };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              data: error instanceof Error ? error.message : "Upload failed",
            },
          };
        }
      },
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCoverMutation,
} = profileApi;
