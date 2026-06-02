"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog, type CrudField } from "@/components/crud-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SearchFilterBar } from "@/components/search-filter-bar";
import {
  useGetBondedEventsQuery,
  useCreateBondedEventMutation,
  useUpdateBondedEventMutation,
  useDeleteBondedEventMutation,
} from "@/store/api/bonded-events-api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, DollarSign, Users, Ticket } from "lucide-react";
import type { BondedEvent } from "@/types/api";
import type { LocationResult } from "@/components/location-search";

const EVENT_CATEGORIES = [
  { label: "Music & Entertainment", value: "Music & Entertainment" },
  { label: "Food & Drinks", value: "Food & Drinks" },
  { label: "Networking & Professional", value: "Networking & Professional" },
  { label: "Social", value: "Social" },
  { label: "Fitness & Wellness", value: "Fitness & Wellness" },
  { label: "Travel & Adventure", value: "Travel & Adventure" },
  { label: "Arts & Culture", value: "Arts & Culture" },
  { label: "Nightlife", value: "Nightlife" },
  { label: "Celebrations", value: "Celebrations" },
  { label: "Education & Workshops", value: "Education & Workshops" },
  { label: "Dating & Singles", value: "Dating & Singles" },
  { label: "Community & Causes", value: "Community & Causes" },
  { label: "Graduation", value: "Graduation" },
  { label: "Religious/Faith-based", value: "Religious/Faith-based" },
  { label: "Other", value: "Other" },
];

function formatDdMmYyyy(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const fields: CrudField[] = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "Event title" },
  { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Event description" },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: EVENT_CATEGORIES,
  },
  { name: "eventDate", label: "Event Date", type: "date-picker", required: true },
  { name: "eventTime", label: "Event Time", type: "time-range", required: true },
  { name: "coverImage", label: "Cover Image", type: "image-upload" },
  { name: "totalSeats", label: "Total Seats", type: "number", required: true, placeholder: "100" },
  { name: "isPaid", label: "Paid Event", type: "switch" },
  {
    name: "ticketPrice",
    label: "Ticket Price",
    type: "number",
    placeholder: "0",
    visibleWhen: { fieldName: "isPaid", fieldValue: true },
  },
  { name: "location", label: "Location", type: "location-search", required: true, placeholder: "Search for a venue or address..." },
  { name: "phoneCountryCode", label: "Phone Country Code", type: "text", placeholder: "+1" },
  { name: "phoneNumber", label: "Phone Number", type: "text", placeholder: "555-1234" },
  { name: "showPhoneToAttendees", label: "Show Phone to Attendees", type: "switch" },
  { name: "facebookLink", label: "Facebook Link", type: "text", placeholder: "https://facebook.com/..." },
  { name: "twitterLink", label: "Twitter Link", type: "text", placeholder: "https://twitter.com/..." },
  { name: "showSocialLinksToAttendees", label: "Show Social Links to Attendees", type: "switch" },
];

export default function BondedEventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BondedEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<BondedEvent | null>(null);

  const { data, isLoading } = useGetBondedEventsQuery({
    page,
    search,
    category: categoryFilter,
  });
  const [createEvent, { isLoading: isCreating }] = useCreateBondedEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateBondedEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteBondedEventMutation();

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.coverImage ? (
            <img
              src={item.coverImage as string}
              alt=""
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted" />
          )}
          <div>
            <p className="font-medium">{String(item.title)}</p>
            <p className="text-xs text-muted-foreground">{String(item.category)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "eventDate",
      header: "Date",
      render: (item) => (
        <span className="text-sm">
          {String(item.eventDate)} {String(item.eventTime)}
        </span>
      ),
    },
    {
      key: "city",
      header: "Location",
      render: (item) => {
        const city = item.city as string | null;
        const country = item.country as string | null;
        return <span>{city ? `${city}${country ? `, ${country}` : ""}` : "—"}</span>;
      },
    },
    {
      key: "totalTicketsSold",
      header: "Tickets Sold",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Ticket className="h-3 w-3 text-muted-foreground" />
          <span>{Number(item.totalTicketsSold ?? 0)}</span>
        </div>
      ),
    },
    {
      key: "totalIncome",
      header: "Income",
      render: (item) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span>{Number(item.totalIncome ?? 0).toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "attendeeCount",
      header: "Attendees",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span>{Number(item.attendeeCount ?? 0)}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge
          variant={
            item.status === "active"
              ? "default"
              : item.status === "cancelled"
              ? "destructive"
              : "secondary"
          }
        >
          {String(item.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem(item as unknown as BondedEvent);
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingItem(item as unknown as BondedEvent);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  async function handleSubmit(values: Record<string, unknown>) {
    try {
      const loc = values.location as LocationResult | undefined;

      if (!loc || !loc.latitude || !loc.longitude) {
        toast.error("Please select a location from the search results");
        return;
      }

      const eventDate = values.eventDate as Date;
      if (!eventDate || !(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
        toast.error("Please select a valid event date");
        return;
      }

      const payload = {
        title: String(values.title),
        description: String(values.description),
        category: String(values.category),
        eventDate: formatDdMmYyyy(eventDate),
        eventTime: String(values.eventTime),
        totalSeats: Number(values.totalSeats),
        coverImage: values.coverImage ? String(values.coverImage) : undefined,
        isPaid: values.isPaid === true,
        ticketPrice: values.isPaid === true && values.ticketPrice ? Number(values.ticketPrice) : undefined,
        address: loc.address,
        venueName: loc.venueName ?? undefined,
        city: loc.city ?? undefined,
        country: loc.country ?? undefined,
        location: {
          longitude: loc.longitude,
          latitude: loc.latitude,
          address: loc.address,
          city: loc.city ?? undefined,
          country: loc.country ?? undefined,
        },
        phoneCountryCode: values.phoneCountryCode ? String(values.phoneCountryCode) : undefined,
        phoneNumber: values.phoneNumber ? String(values.phoneNumber) : undefined,
        showPhoneToAttendees: values.showPhoneToAttendees === true,
        facebookLink: values.facebookLink ? String(values.facebookLink) : undefined,
        twitterLink: values.twitterLink ? String(values.twitterLink) : undefined,
        showSocialLinksToAttendees: values.showSocialLinksToAttendees === true,
      };

      if (editingItem) {
        await updateEvent({
          eventId: editingItem._id,
          ...payload,
        }).unwrap();
        toast.success("Bonded event updated");
      } else {
        await createEvent(payload).unwrap();
        toast.success("Bonded event created");
      }
      setDialogOpen(false);
      setEditingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await deleteEvent(deletingItem._id).unwrap();
      toast.success("Bonded event deleted");
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  }

  const totalPages = data?.meta?.totalPage ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonded Events</h1>
          <p className="text-muted-foreground">
            Manage your bonded events. Track tickets, attendees, and income.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Bonded Event
        </Button>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search bonded events..."
        filters={[
          {
            name: "category",
            label: "Category",
            options: EVENT_CATEGORIES,
            value: categoryFilter,
            onChange: (val) => {
              setCategoryFilter(val);
              setPage(1);
            },
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={(data?.data as unknown as Record<string, unknown>[]) ?? []}
        isLoading={isLoading}
        emptyMessage="No bonded events found. Create your first bonded event."
        pagination={{ page, totalPages, onPageChange: setPage }}
        onRowClick={(item) => {
          router.push(`/dashboard/bonded-events/${item._id}`);
        }}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        title={editingItem ? "Edit Bonded Event" : "Create Bonded Event"}
        fields={fields}
        defaultValues={editingItem ? (editingItem as unknown as Record<string, unknown>) : undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingItem(null);
        }}
        title="Delete Bonded Event"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This will cancel the event.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
