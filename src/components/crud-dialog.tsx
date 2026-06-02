"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { MultiSelectSearch } from "./multi-select-search";
import { LocationSearch, type LocationResult } from "./location-search";
import { DatePicker } from "./ui/date-picker";
import { TimeRangePicker } from "./time-range-picker";
import { Loader2 } from "lucide-react";

export interface CrudField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "number" | "select" | "switch" | "image-upload" | "multi-select" | "location-search" | "date-picker" | "time-range";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  accept?: string;
  visibleWhen?: { fieldName: string; fieldValue: unknown };
}

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: CrudField[];
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
}

function parseDdMmYyyy(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(date.getTime()) ? undefined : date;
}

function buildInitialValues(
  fields: CrudField[],
  defaultValues?: Record<string, unknown>
): Record<string, unknown> {
  const initial: Record<string, unknown> = {};
  fields.forEach((field) => {
    if (defaultValues && defaultValues[field.name] !== undefined) {
      if (field.type === "date-picker") {
        initial[field.name] = parseDdMmYyyy(defaultValues[field.name]) ?? null;
      } else {
        initial[field.name] = defaultValues[field.name];
      }
    } else if (field.type === "switch") {
      initial[field.name] = false;
    } else if (field.type === "multi-select") {
      initial[field.name] = [];
    } else if (field.type === "number") {
      initial[field.name] = 0;
    } else if (field.type === "location-search") {
      initial[field.name] = null;
    } else if (field.type === "date-picker") {
      initial[field.name] = null;
    } else if (field.type === "select" && field.options?.length) {
      initial[field.name] = field.options[0].value;
    } else {
      initial[field.name] = "";
    }
  });
  return initial;
}

export function CrudDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  defaultValues,
  onSubmit,
  isLoading,
}: CrudDialogProps) {
  const dialogKey = useMemo(
    () => JSON.stringify(defaultValues ?? {}),
    [defaultValues]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <CrudForm
          key={dialogKey}
          fields={fields}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CrudForm({
  fields,
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: {
  fields: CrudField[];
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
}) {
  const initialValues = useMemo(
    () => buildInitialValues(fields, defaultValues),
    [fields, defaultValues]
  );
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required) {
        const val = values[field.name];
        let isEmpty: boolean;
        if (field.type === "location-search") {
          isEmpty = val === null || val === undefined;
        } else if (field.type === "date-picker") {
          isEmpty = val === null || val === undefined;
        } else {
          isEmpty =
            val === "" || val === undefined || val === null ||
            (Array.isArray(val) && val.length === 0);
        }
        if (isEmpty) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  function updateValue(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        if (field.visibleWhen) {
          const depValue = values[field.visibleWhen.fieldName];
          if (depValue !== field.visibleWhen.fieldValue) return null;
        }
        return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={String(values[field.name] ?? "")}
              onChange={(e) => updateValue(field.name, e.target.value)}
            />
          ) : field.type === "switch" ? (
            <div className="flex items-center gap-2">
              <Switch
                id={field.name}
                checked={Boolean(values[field.name])}
                onCheckedChange={(checked) => updateValue(field.name, checked)}
              />
              <Label htmlFor={field.name} className="text-sm text-muted-foreground">
                {field.placeholder || "Enable"}
              </Label>
            </div>
          ) : field.type === "select" ? (
            <Select
              value={String(values[field.name] ?? "")}
              onValueChange={(val: string | null) => updateValue(field.name, val ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "image-upload" ? (
            <ImageUpload
              value={String(values[field.name] ?? "")}
              onChange={(url) => updateValue(field.name, url)}
            />
          ) : field.type === "multi-select" ? (
            <MultiSelectSearch
              options={field.options ?? []}
              value={(values[field.name] as string[]) ?? []}
              onChange={(val) => updateValue(field.name, val)}
              placeholder={field.placeholder || `Select ${field.label}`}
            />
          ) : field.type === "location-search" ? (
            <LocationSearch
              onSelect={(loc: LocationResult) => updateValue(field.name, loc)}
              placeholder={field.placeholder || "Search for a venue or location..."}
              defaultValue={
                values[field.name]
                  ? String((values[field.name] as LocationResult).displayName ?? "")
                  : ""
              }
            />
          ) : field.type === "date-picker" ? (
            <DatePicker
              id={field.name}
              value={values[field.name] as Date | undefined}
              onChange={(date) => updateValue(field.name, date ?? null)}
              placeholder={field.placeholder || "Pick a date"}
            />
          ) : field.type === "time-range" ? (
            <TimeRangePicker
              id={field.name}
              value={String(values[field.name] ?? "")}
              onChange={(val) => updateValue(field.name, val)}
            />
          ) : (
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={String(values[field.name] ?? "")}
              onChange={(e) =>
                updateValue(
                  field.name,
                  field.type === "number" ? Number(e.target.value) : e.target.value
                )
              }
            />
          )}
          {errors[field.name] && (
            <p className="text-sm text-destructive">{errors[field.name]}</p>
          )}
        </div>
        );
      })}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
