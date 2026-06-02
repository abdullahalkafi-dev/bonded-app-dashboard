export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
  isCompleteProfile: boolean;
}

export interface AdminUser {
  _id: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "superAdmin";
}

export interface Interest {
  _id: string;
  name: string;
  slug: string;
  category: string;
  image?: string;
  isActive: boolean;
}

export interface Circle {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage: string;
  category: string | null;
  hashtags: string[];
  interests: { _id: string; slug: string; name: string }[];
  visibility: "public" | "private";
  tier: "global" | "local";
  city?: string;
  joinStatus: string;
  isPaid: boolean;
  price: number;
  creator: { _id: string; name: string; email: string };
  memberCount: number;
  postCount: number;
  shareCount: number;
  maxFreeMembers: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalEvent {
  _id: string;
  title: string;
  category: string;
  city: string | null;
  location: string | null;
  country: string | null;
  date: string;
  time: string;
  image: string | null;
  externalLink: string;
  sourceName: string;
  eventType: "physical" | "virtual";
  ctaText: string;
  description: string | null;
  startsAt: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  priceText?: string | null;
  ticketPrice?: number;
  isPaid?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface BondedEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: "in-person";
  status: string;
  visibility: string;
  isBondedEvent: true;
  coverImage: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  showPhoneToAttendees: boolean;
  facebookLink: string | null;
  twitterLink: string | null;
  showSocialLinksToAttendees: boolean;
  ticketPrice: number;
  currency: string;
  isPaid: boolean;
  totalSeats: number;
  remainingSeats: number;
  eventDate: string;
  eventTime: string;
  city: string | null;
  country: string | null;
  venueName: string | null;
  address: string | null;
  location: {
    type: "Point";
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  } | null;
  host: string;
  createdAt: string;
  updatedAt: string;
  totalTicketsSold?: number;
  attendeeCount?: number;
  totalIncome?: number;
  attendees?: BondedEventAttendee[];
}

export interface BondedEventAttendee {
  userId: string;
  fullName: string;
  email: string | null;
  avatar: string | null;
  phone: string | null;
  city: string | null;
  totalTickets: number;
  lastPurchaseAt: string;
}

export interface AdminProfile {
  _id: string;
  fullName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  city?: string;
  address?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  interests: { _id: string; name: string; slug: string; category: string; image?: string }[];
  connectionType?: string[];
  profileCompleted: boolean;
}

export interface MarketplaceProduct {
  _id: string;
  interest: string;
  interestSlug: string;
  category: string;
  source: "amazon" | "ebay" | "walmart" | "etsy" | "other";
  productUrl: string;
  imageUrl: string;
  priceRange: string;
  ctaLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
