import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";
import type {
  ApiSuccessResponse,
  BondedEvent,
  PaginationMeta,
} from "@/types/api";

interface ListBondedEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

interface ListBondedEventsResponse {
  data: BondedEvent[];
  meta: PaginationMeta;
}

interface CreateBondedEventRequest {
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventTime: string;
  totalSeats: number;
  isPaid?: boolean;
  ticketPrice?: number;
  coverImage?: string;
  city?: string;
  country?: string;
  venueName?: string;
  address: string;
  location: {
    longitude: number;
    latitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
  phoneCountryCode?: string;
  phoneNumber?: string;
  showPhoneToAttendees?: boolean;
  facebookLink?: string;
  twitterLink?: string;
  showSocialLinksToAttendees?: boolean;
}

interface UpdateBondedEventRequest extends Partial<CreateBondedEventRequest> {
  eventId: string;
  status?: string;
}

export const bondedEventsApi = createApi({
  reducerPath: "bondedEventsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["BondedEvent"],
  endpoints: (builder) => ({
    getBondedEvents: builder.query<
      ApiSuccessResponse<ListBondedEventsResponse>,
      ListBondedEventsParams
    >({
      query: (params) => ({
        url: "/admin/events/bonded",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          search: params.search,
          category: params.category,
          status: params.status,
        },
      }),
      providesTags: ["BondedEvent"],
    }),
    getBondedEventById: builder.query<
      ApiSuccessResponse<BondedEvent>,
      string
    >({
      query: (eventId) => ({
        url: `/admin/events/bonded/${eventId}`,
      }),
      providesTags: ["BondedEvent"],
    }),
    createBondedEvent: builder.mutation<
      ApiSuccessResponse<BondedEvent>,
      CreateBondedEventRequest
    >({
      query: (body) => ({
        url: "/admin/events/bonded",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BondedEvent"],
    }),
    updateBondedEvent: builder.mutation<
      ApiSuccessResponse<BondedEvent>,
      UpdateBondedEventRequest
    >({
      query: ({ eventId, ...body }) => ({
        url: `/admin/events/bonded/${eventId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BondedEvent"],
    }),
    deleteBondedEvent: builder.mutation<
      ApiSuccessResponse<BondedEvent>,
      string
    >({
      query: (eventId) => ({
        url: `/admin/events/bonded/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BondedEvent"],
    }),
  }),
});

export const {
  useGetBondedEventsQuery,
  useGetBondedEventByIdQuery,
  useCreateBondedEventMutation,
  useUpdateBondedEventMutation,
  useDeleteBondedEventMutation,
} = bondedEventsApi;
