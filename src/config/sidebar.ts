import {
  LayoutDashboard,
  Circle,
  Calendar,
  ShoppingBag,
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
  { label: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
];
