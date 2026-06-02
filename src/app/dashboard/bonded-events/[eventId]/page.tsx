"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetBondedEventByIdQuery } from "@/store/api/bonded-events-api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Ticket,
} from "lucide-react";

export default function BondedEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { data, isLoading, error } = useGetBondedEventByIdQuery(eventId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <p className="text-muted-foreground">Event not found or failed to load.</p>
      </div>
    );
  }

  const event = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground">{event.category}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.totalTicketsSold ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              of {event.totalSeats} total seats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.currency} {(event.totalIncome ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {event.isPaid ? `$${event.ticketPrice} per ticket` : "Free event"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.attendeeCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {event.remainingSeats} seats remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                event.status === "active"
                  ? "default"
                  : event.status === "cancelled"
                  ? "destructive"
                  : "secondary"
              }
            >
              {event.status}
            </Badge>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.eventDate} {event.eventTime}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.coverImage && (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full max-w-md rounded-lg object-cover"
            />
          )}
          <p className="text-sm">{event.description}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{event.eventDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{event.eventTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.venueName ? `${event.venueName}, ` : ""}
                {event.address}
                {event.city ? `, ${event.city}` : ""}
                {event.country ? `, ${event.country}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.isPaid ? `${event.currency} ${event.ticketPrice}` : "Free"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {event.attendees && event.attendees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.attendees.map((attendee) => (
                  <TableRow key={attendee.userId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {attendee.avatar && (
                          <img
                            src={attendee.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        )}
                        {attendee.fullName}
                      </div>
                    </TableCell>
                    <TableCell>{attendee.email ?? "—"}</TableCell>
                    <TableCell>{attendee.phone ?? "—"}</TableCell>
                    <TableCell>{attendee.city ?? "—"}</TableCell>
                    <TableCell className="text-right">{attendee.totalTickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No attendees yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
