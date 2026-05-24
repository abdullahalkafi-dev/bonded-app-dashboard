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
