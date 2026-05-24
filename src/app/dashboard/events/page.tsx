"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog, type CrudField } from "@/components/crud-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SearchFilterBar } from "@/components/search-filter-bar";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "@/store/api/events-api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ExternalEvent } from "@/types/api";

const EVENT_TYPES = [
  { label: "Physical", value: "physical" },
  { label: "Virtual", value: "virtual" },
];

const EVENT_CATEGORIES = [
  { label: "Music & Entertainment", value: "Music & Entertainment" },
  { label: "Food & Drink", value: "Food & Drink" },
  { label: "Professional Growth", value: "Professional Growth" },
  { label: "Social & Lifestyle", value: "Social & Lifestyle" },
  { label: "Sports & Fitness", value: "Sports & Fitness" },
  { label: "Travel & Adventure", value: "Travel & Adventure" },
  { label: "Arts & Creativity", value: "Arts & Creativity" },
  { label: "Tech & Gaming", value: "Tech & Gaming" },
  { label: "Community & Values", value: "Community & Values" },
];

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("true");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExternalEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ExternalEvent | null>(null);
  const [selectedType, setSelectedType] = useState("physical");

  const { data, isLoading } = useGetEventsQuery({
    page,
    search,
    eventType: eventTypeFilter,
    isActive: isActiveFilter,
  });
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const baseFields: CrudField[] = [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Event title" },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: EVENT_CATEGORIES,
    },
    { name: "date", label: "Date", type: "text", required: true, placeholder: "DD/MM/YYYY" },
    { name: "time", label: "Time", type: "text", required: true, placeholder: "14:00-18:00 or 5:30 PM - 9:15 PM" },
    { name: "image", label: "Image", type: "image-upload" },
    {
      name: "eventType",
      label: "Event Type",
      type: "select",
      required: true,
      options: EVENT_TYPES,
    },
    { name: "externalLink", label: "External Link", type: "text", required: true, placeholder: "https://..." },
    { name: "sourceName", label: "Source Name", type: "text", required: true, placeholder: "Organizer name" },
    { name: "ctaText", label: "CTA Text", type: "text", placeholder: "View details" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Event description" },
    { name: "priceText", label: "Price Display", type: "text", placeholder: "Free / $25 / From $50" },
    { name: "ticketPrice", label: "Ticket Price", type: "text", placeholder: "0" },
    { name: "rating", label: "Rating (0-5)", type: "number", placeholder: "0" },
    { name: "reviewCount", label: "Review Count", type: "number", placeholder: "0" },
  ];

  const physicalFields: CrudField[] = [
    ...baseFields.slice(0, 2),
    { name: "city", label: "City", type: "text", placeholder: "New York" },
    { name: "location", label: "Location", type: "text", placeholder: "Central Park" },
    { name: "country", label: "Country", type: "text", placeholder: "US" },
    ...baseFields.slice(2),
  ];

  const fields = selectedType === "physical" ? physicalFields : baseFields;

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image ? (
            <img
              src={item.image as string}
              alt=""
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted" />
          )}
          <div>
            <p className="font-medium">{String(item.title)}</p>
            <p className="text-xs text-muted-foreground">{String(item.sourceName)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <Badge variant="secondary">{String(item.category)}</Badge>
      ),
    },
    {
      key: "eventType",
      header: "Type",
      render: (item) => (
        <Badge variant={item.eventType === "virtual" ? "outline" : "default"}>
          {String(item.eventType)}
        </Badge>
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
      key: "date",
      header: "Date",
      render: (item) => (
        <span className="text-sm">
          {String(item.date)} {String(item.time)}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (item) => (
        <Badge variant={item.isActive ? "default" : "destructive"}>
          {item.isActive ? "Active" : "Inactive"}
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
              setEditingItem(item as unknown as ExternalEvent);
              setSelectedType(String(item.eventType));
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
              setDeletingItem(item as unknown as ExternalEvent);
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
      const payload = {
        title: String(values.title),
        category: String(values.category),
        date: String(values.date),
        time: String(values.time),
        image: values.image ? String(values.image) : undefined,
        eventType: String(values.eventType) as ExternalEvent["eventType"],
        externalLink: String(values.externalLink),
        sourceName: String(values.sourceName),
        ctaText: values.ctaText ? String(values.ctaText) : undefined,
        description: values.description ? String(values.description) : undefined,
        city: values.city ? String(values.city) : undefined,
        location: values.location ? String(values.location) : undefined,
        country: values.country ? String(values.country) : undefined,
        priceText: values.priceText ? String(values.priceText) : undefined,
        ticketPrice: values.ticketPrice ? Number(values.ticketPrice) : undefined,
        isPaid: values.isPaid === true,
        rating: values.rating ? Number(values.rating) : undefined,
        reviewCount: values.reviewCount ? Number(values.reviewCount) : undefined,
      };

      if (editingItem) {
        await updateEvent({
          externalEventId: editingItem._id,
          ...payload,
        }).unwrap();
        toast.success("Event updated");
      } else {
        await createEvent(payload).unwrap();
        toast.success("Event created");
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
      toast.success("Event deleted");
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
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage external curated events.</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setSelectedType("physical");
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search events..."
        filters={[
          {
            name: "eventType",
            label: "Event Type",
            options: EVENT_TYPES,
            value: eventTypeFilter,
            onChange: (val) => {
              setEventTypeFilter(val);
              setPage(1);
            },
          },
          {
            name: "isActive",
            label: "Status",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ],
            value: isActiveFilter,
            onChange: (val) => {
              setIsActiveFilter(val);
              setPage(1);
            },
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={(data?.data as unknown as Record<string, unknown>[]) ?? []}
        isLoading={isLoading}
        emptyMessage="No events found. Create your first event."
        pagination={{ page, totalPages, onPageChange: setPage }}
        onRowClick={(item) => {
          setEditingItem(item as unknown as ExternalEvent);
          setSelectedType(String(item.eventType));
          setDialogOpen(true);
        }}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        title={editingItem ? "Edit Event" : "Create Event"}
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
        title="Delete Event"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This will deactivate the event.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
