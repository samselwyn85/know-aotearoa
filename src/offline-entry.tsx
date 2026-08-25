import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Explorer } from "@/components/explorer";
import { EconPicker, EconProfile } from "@/components/econ-profile";
import { TABS, type ProfileTab } from "@/lib/economy";
import { AppToaster } from "@/components/app-toaster";
import "./styles.css";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <AppToaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Explorer />,
});

const placeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/place/$slug",
  component: function PlacePage() {
    const { slug } = placeRoute.useParams();
    return <Explorer initialSlug={slug} />;
  },
});

const profileIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/",
  component: () => <EconPicker />,
});

const profileSlugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$slug",
  validateSearch: (search: Record<string, unknown>): { room?: ProfileTab } => {
    const room = search.room;
    if (typeof room === "string" && TABS.some((t) => t.id === room)) {
      return { room: room as ProfileTab };
    }
    return {};
  },
  component: function ProfilePage() {
    const { slug } = profileSlugRoute.useParams();
    const { room } = profileSlugRoute.useSearch();
    return <EconProfile slug={slug} initialTab={room} />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, placeRoute, profileIndexRoute, profileSlugRoute]);

const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: false,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
