"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog, type CrudField } from "@/components/crud-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SearchFilterBar } from "@/components/search-filter-bar";
import {
  useGetMarketplaceProductsQuery,
  useCreateMarketplaceProductsMutation,
  useUpdateMarketplaceProductMutation,
  useDeleteMarketplaceProductMutation,
} from "@/store/api/marketplace-api";
import { useGetInterestsQuery } from "@/store/api/interests-api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { MarketplaceProduct, Interest } from "@/types/api";

const SOURCES = [
  { label: "Amazon", value: "amazon" },
  { label: "eBay", value: "ebay" },
  { label: "Walmart", value: "walmart" },
  { label: "Etsy", value: "etsy" },
  { label: "Other", value: "other" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MarketplaceProduct | null>(null);

  const { data, isLoading } = useGetMarketplaceProductsQuery();
  const [createProducts, { isLoading: isCreating }] =
    useCreateMarketplaceProductsMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateMarketplaceProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteMarketplaceProductMutation();

  const { data: interestsResult } = useGetInterestsQuery();
  const interestsList: Interest[] = interestsResult?.data ?? [];
  const interestOptions = interestsList.map((item: Interest) => ({
    label: `${item.name} (${item.slug})`,
    value: item._id,
  }));

  const createFields: CrudField[] = [
    {
      name: "interestIds",
      label: "Interest",
      type: "multi-select",
      required: true,
      options: interestOptions,
      placeholder: "Search and select interests...",
    },
    {
      name: "source",
      label: "Source",
      type: "select",
      required: true,
      options: SOURCES,
    },
    { name: "productUrl", label: "Product URL", type: "text", required: true, placeholder: "https://..." },
    { name: "imageUrl", label: "Image", type: "image-upload", required: true },
    { name: "priceRange", label: "Price Range", type: "text", required: true, placeholder: "$19.99 - $49.99" },
    { name: "ctaLabel", label: "CTA Label", type: "text", required: true, placeholder: "Shop Now" },
  ];

  const editFields: CrudField[] = [
    {
      name: "source",
      label: "Source",
      type: "select",
      options: SOURCES,
    },
    { name: "productUrl", label: "Product URL", type: "text", placeholder: "https://..." },
    { name: "imageUrl", label: "Image", type: "image-upload" },
    { name: "priceRange", label: "Price Range", type: "text", placeholder: "$19.99 - $49.99" },
    { name: "ctaLabel", label: "CTA Label", type: "text", placeholder: "Shop Now" },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "interest",
      header: "Interest",
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.imageUrl as string}
            alt=""
            className="h-8 w-8 rounded-md object-cover"
          />
          <div>
            <p className="font-medium">{String(item.interest)}</p>
            <p className="text-xs text-muted-foreground">
              {String(item.interestSlug)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (item) => (
        <Badge variant="secondary" className="capitalize">
          {String(item.source)}
        </Badge>
      ),
    },
    {
      key: "priceRange",
      header: "Price",
      render: (item) => <span className="text-sm">{String(item.priceRange)}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {String(item.category)}
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
              setEditingItem(item as unknown as MarketplaceProduct);
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
              setDeletingItem(item as unknown as MarketplaceProduct);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  async function handleCreate(values: Record<string, unknown>) {
    try {
      await createProducts({
        interestIds: (values.interestIds as string[]) ?? [],
        source: String(values.source) as MarketplaceProduct["source"],
        productUrl: String(values.productUrl),
        imageUrl: String(values.imageUrl),
        priceRange: String(values.priceRange),
        ctaLabel: String(values.ctaLabel),
      }).unwrap();
      toast.success("Products created");
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Creation failed";
      toast.error(message);
    }
  }

  async function handleUpdate(values: Record<string, unknown>) {
    if (!editingItem) return;
    try {
      const payload: Record<string, unknown> = {};
      if (values.source) payload.source = values.source;
      if (values.productUrl) payload.productUrl = values.productUrl;
      if (values.imageUrl) payload.imageUrl = values.imageUrl;
      if (values.priceRange) payload.priceRange = values.priceRange;
      if (values.ctaLabel) payload.ctaLabel = values.ctaLabel;
      if (values.isActive !== undefined) payload.isActive = values.isActive;

      await updateProduct({ id: editingItem._id, ...payload }).unwrap();
      toast.success("Product updated");
      setDialogOpen(false);
      setEditingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await deleteProduct(deletingItem._id).unwrap();
      toast.success("Product deleted");
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  }

  const allProducts: MarketplaceProduct[] = data?.data?.products ?? [];
  const filteredProducts = allProducts.filter((p: MarketplaceProduct) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.interest.toLowerCase().includes(q) ||
      p.interestSlug.toLowerCase().includes(q) ||
      p.source.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Manage marketplace products.</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
      />

      <DataTable
        columns={columns}
        data={filteredProducts as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No products found. Add your first product."
        onRowClick={(item) => {
          setEditingItem(item as unknown as MarketplaceProduct);
          setDialogOpen(true);
        }}
      />

      {editingItem ? (
        <CrudDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingItem(null);
          }}
          title="Edit Product"
          fields={editFields}
          defaultValues={editingItem ? (editingItem as unknown as Record<string, unknown>) : undefined}
          onSubmit={handleUpdate}
          isLoading={isUpdating}
        />
      ) : (
        <CrudDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Product"
          fields={createFields}
          onSubmit={handleCreate}
          isLoading={isCreating}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingItem(null);
        }}
        title="Delete Product"
        description={`Are you sure you want to delete the product for "${deletingItem?.interest}"? This cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
