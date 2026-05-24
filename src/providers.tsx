"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const store: AppStore = useMemo(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}
