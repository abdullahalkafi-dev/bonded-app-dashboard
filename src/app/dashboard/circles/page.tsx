"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog, type CrudField } from "@/components/crud-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SearchFilterBar } from "@/components/search-filter-bar";
import {
  useGetCirclesQuery,
  useCreateCircleMutation,
  useUpdateCircleMutation,
  useDeleteCircleMutation,
} from "@/store/api/circles-api";
import { useGetInterestsQuery } from "@/store/api/interests-api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Circle, Interest } from "@/types/api";

const CATEGORIES = [
  { label: "Social & Lifestyle", value: "social-lifestyle" },
  { label: "Sports & Fitness", value: "sports-fitness" },
  { label: "Music & Entertainment", value: "music-entertainment" },
  { label: "Travel & Adventure", value: "travel-adventure" },
  { label: "Professional Growth", value: "professional-growth" },
  { label: "Arts & Creativity", value: "arts-creativity" },
  { label: "Community & Values", value: "community-values" },
  { label: "Tech & Gaming", value: "tech-gaming" },
];

export default function CirclesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Circle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Circle | null>(null);

  const { data, isLoading } = useGetCirclesQuery({
    page,
    search,
    category: categoryFilter,
  });
  const [createCircle, { isLoading: isCreating }] = useCreateCircleMutation();
  const [updateCircle, { isLoading: isUpdating }] = useUpdateCircleMutation();
  const [deleteCircle, { isLoading: isDeleting }] = useDeleteCircleMutation();

  const { data: interestsResult } = useGetInterestsQuery();
  const interestsList: Interest[] = interestsResult?.data ?? [];
  const interestOptions = interestsList.map((item: Interest) => ({
    label: item.name,
    value: item.slug,
  }));

  const fields: CrudField[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Circle name" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
    { name: "coverImage", label: "Cover Image", type: "image-upload", required: true },
    {
      name: "interestSlugs",
      label: "Interests",
      type: "multi-select",
      required: true,
      options: interestOptions,
      placeholder: "Search and select interests...",
    },
    { name: "hashtags", label: "Hashtags", type: "text", placeholder: "Comma-separated: food, brunch" },
    {
      name: "tier",
      label: "Tier",
      type: "select",
      options: [
        { label: "Global", value: "global" },
        { label: "Local", value: "local" },
      ],
    },
    { name: "city", label: "City", type: "text", placeholder: "e.g. New York", visibleWhen: { fieldName: "tier", fieldValue: "local" } },
    { name: "isPaid", label: "Paid Circle", type: "switch" },
    { name: "price", label: "Price (USD)", type: "number", placeholder: "0", visibleWhen: { fieldName: "isPaid", fieldValue: true } },
  ];

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.coverImage as string}
            alt=""
            className="h-8 w-8 rounded-md object-cover"
          />
          <div>
            <p className="font-medium">{String(item.name)}</p>
            <p className="text-xs text-muted-foreground">
              {String(item.memberCount)} members
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      render: (item) => (
        <Badge variant="secondary">{String(item.tier)}</Badge>
      ),
    },
    {
      key: "isPaid",
      header: "Price",
      render: (item) =>
        item.isPaid ? (
          <Badge>${String(item.price)}</Badge>
        ) : (
          <Badge variant="outline">Free</Badge>
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
              setEditingItem(item as unknown as Circle);
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
              setDeletingItem(item as unknown as Circle);
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
      const hashtags = typeof values.hashtags === "string"
        ? values.hashtags.split(",").map((h: string) => h.trim()).filter(Boolean)
        : [];

      const payload = {
        name: String(values.name),
        description: values.description ? String(values.description) : undefined,
        coverImage: String(values.coverImage),
        interestSlugs: (values.interestSlugs as string[]) ?? [],
        hashtags,
        tier: String(values.tier || "global") as "global" | "local",
        isPaid: Boolean(values.isPaid),
        price: Number(values.price) || 0,
        city: values.city ? String(values.city) : undefined,
      };

      if (editingItem) {
        const originalHashtags = editingItem.hashtags ?? [];
        const originalInterestSlugs = editingItem.interests?.map((i) => i.slug) ?? [];
        const changes: Record<string, unknown> = {};
        if (payload.name !== editingItem.name) changes.name = payload.name;
        if (payload.description !== (editingItem.description ?? undefined)) changes.description = payload.description;
        if (payload.coverImage !== editingItem.coverImage) changes.coverImage = payload.coverImage;
        if (JSON.stringify(payload.interestSlugs) !== JSON.stringify(originalInterestSlugs)) changes.interestSlugs = payload.interestSlugs;
        if (JSON.stringify(payload.hashtags) !== JSON.stringify(originalHashtags)) changes.hashtags = payload.hashtags;
        if (payload.tier !== editingItem.tier) changes.tier = payload.tier;
        if (payload.isPaid !== editingItem.isPaid) changes.isPaid = payload.isPaid;
        if (payload.price !== editingItem.price) changes.price = payload.price;
        if (payload.city !== (editingItem.city ?? undefined)) changes.city = payload.city;

        if (Object.keys(changes).length === 0) {
          toast.info("No changes to save");
          setDialogOpen(false);
          setEditingItem(null);
          return;
        }

        await updateCircle({ id: editingItem._id, ...changes }).unwrap();
        toast.success("Circle updated");
      } else {
        await createCircle(payload).unwrap();
        toast.success("Circle created");
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
      await deleteCircle(deletingItem._id).unwrap();
      toast.success("Circle deleted");
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
          <h1 className="text-2xl font-bold tracking-tight">Circles</h1>
          <p className="text-muted-foreground">Manage public circles.</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Circle
        </Button>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search circles..."
        filters={[
          {
            name: "category",
            label: "Category",
            options: CATEGORIES,
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
        emptyMessage="No circles found. Create your first circle."
        pagination={{ page, totalPages, onPageChange: setPage }}
        onRowClick={(item) => {
          setEditingItem(item as unknown as Circle);
          setDialogOpen(true);
        }}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        title={editingItem ? "Edit Circle" : "Create Circle"}
        fields={fields}
        defaultValues={
          editingItem
            ? {
                ...editingItem,
                interestSlugs: editingItem.interests?.map((i) => i.slug) ?? [],
                hashtags: editingItem.hashtags?.join(", ") ?? "",
                city: editingItem.city ?? "",
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingItem(null);
        }}
        title="Delete Circle"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
