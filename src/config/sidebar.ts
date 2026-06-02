import {
  LayoutDashboard,
  Circle,
  Calendar,
  ShoppingBag,
  Ticket,
  User,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface SidebarEntry {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarNav: SidebarEntry[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Circles", href: "/dashboard/circles", icon: Circle },
  { label: "Events", href: "/dashboard/events", icon: Calendar },
  { label: "Bonded Events", href: "/dashboard/bonded-events", icon: Ticket },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Change Password", href: "/dashboard/change-password", icon: KeyRound },
];
