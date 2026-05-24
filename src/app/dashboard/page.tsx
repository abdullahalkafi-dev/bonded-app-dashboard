"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Circle, Calendar, ShoppingBag } from "lucide-react";
import { useGetCirclesQuery } from "@/store/api/circles-api";
import { useGetEventsQuery } from "@/store/api/events-api";
import { useGetMarketplaceProductsQuery } from "@/store/api/marketplace-api";

export default function DashboardPage() {
  const { data: circlesData } = useGetCirclesQuery({ page: 1, limit: 1 });
  const { data: eventsData } = useGetEventsQuery({ page: 1, limit: 1 });
  const { data: marketplaceData } = useGetMarketplaceProductsQuery();

  const stats = [
    {
      title: "Total Circles",
      value: circlesData?.meta?.total ?? "—",
      icon: Circle,
      description: "Public circles created",
    },
    {
      title: "External Events",
      value: eventsData?.meta?.total ?? "—",
      icon: Calendar,
      description: "Curated events",
    },
    {
      title: "Marketplace Products",
      value: marketplaceData?.data?.totalProducts ?? "—",
      icon: ShoppingBag,
      description: "Products listed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your admin content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
