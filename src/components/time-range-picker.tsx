"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TimeRangePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

function parseTimeRange(value: string): { start: string; end: string } {
  if (!value) return { start: "", end: "" };
  const parts = value.split("-");
  if (parts.length === 2) {
    return { start: parts[0].trim(), end: parts[1].trim() };
  }
  return { start: value, end: "" };
}

export function TimeRangePicker({
  value = "",
  onChange,
  disabled,
  id,
}: TimeRangePickerProps) {
  const parsed = parseTimeRange(value);
  const [editStart, setEditStart] = useState<string | null>(null);
  const [editEnd, setEditEnd] = useState<string | null>(null);

  const start = editStart ?? parsed.start;
  const end = editEnd ?? parsed.end;

  function commitStart(val: string) {
    setEditStart(null);
    if (val && end) {
      onChange(`${val}-${end}`);
    } else if (val) {
      onChange(val);
    } else {
      onChange(end ? `-${end}` : "");
    }
  }

  function commitEnd(val: string) {
    setEditEnd(null);
    if (start && val) {
      onChange(`${start}-${val}`);
    } else if (val) {
      onChange(val);
    } else {
      onChange(start ? `${start}-` : "");
    }
  }

  return (
    <div id={id} className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          type="time"
          value={start}
          disabled={disabled}
          onChange={(e) => setEditStart(e.target.value)}
          onBlur={() => commitStart(start)}
        />
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">to</span>
      <div className="flex-1">
        <Input
          type="time"
          value={end}
          disabled={disabled}
          onChange={(e) => setEditEnd(e.target.value)}
          onBlur={() => commitEnd(end)}
        />
      </div>
    </div>
  );
}
