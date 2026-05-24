import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/auth-api";
import { interestsApi } from "./api/interests-api";
import { circlesApi } from "./api/circles-api";
import { eventsApi } from "./api/events-api";
import { marketplaceApi } from "./api/marketplace-api";

export const makeStore = () =>
  configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [interestsApi.reducerPath]: interestsApi.reducer,
      [circlesApi.reducerPath]: circlesApi.reducer,
      [eventsApi.reducerPath]: eventsApi.reducer,
      [marketplaceApi.reducerPath]: marketplaceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        interestsApi.middleware,
        circlesApi.middleware,
        eventsApi.middleware,
        marketplaceApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
