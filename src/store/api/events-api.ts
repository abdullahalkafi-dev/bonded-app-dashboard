import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import type { ApiSuccessResponse, ExternalEvent, PaginationMeta } from "@/types/api";

interface ListEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  sourceName?: string;
  isActive?: string;
  eventType?: string;
}

interface ListEventsResponse {
  data: ExternalEvent[];
  meta: PaginationMeta;
}

interface CreateEventRequest {
  title: string;
  category: string;
  city?: string;
  location?: string;
  country?: string;
  date: string;
  time: string;
  image?: string;
  externalLink: string;
  sourceName: string;
  eventType: "physical" | "virtual" | "in-person" | "in_person" | "bonded_live";
  ctaText?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  priceText?: string;
  ticketPrice?: number;
  isPaid?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
  externalEventId: string;
}

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    getEvents: builder.query<ApiSuccessResponse<ListEventsResponse>, ListEventsParams>({
      query: (params) => ({
        url: "/admin/events/external",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          search: params.search,
          category: params.category,
          city: params.city,
          sourceName: params.sourceName,
          isActive: params.isActive,
          eventType: params.eventType,
        },
      }),
      providesTags: ["Event"],
    }),
    createEvent: builder.mutation<ApiSuccessResponse<ExternalEvent>, CreateEventRequest>({
      query: (body) => ({
        url: "/admin/events/external",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Event"],
    }),
    updateEvent: builder.mutation<ApiSuccessResponse<ExternalEvent>, UpdateEventRequest>({
      query: ({ externalEventId, ...body }) => ({
        url: `/admin/events/external/${externalEventId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Event"],
    }),
    deleteEvent: builder.mutation<ApiSuccessResponse<ExternalEvent>, string>({
      query: (externalEventId) => ({
        url: `/admin/events/external/${externalEventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;
