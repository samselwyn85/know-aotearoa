import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Link,
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
import { Login } from "@/routes/login";
import { AppErrorComponent } from "@/lib/error-component";
import "./styles.css";

function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center text-ink">
      <div>
        <p className="font-display text-sm tracking-wide text-lagoon">Know Aotearoa</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Not Found</h1>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-lagoon underline-offset-4 hover:underline">
          Back to the map
        </Link>
      </div>
    </main>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <AppToaster />
    </>
  ),
  errorComponent: AppErrorComponent,
  notFoundComponent: NotFound,
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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  placeRoute,
  profileIndexRoute,
  profileSlugRoute,
  loginRoute,
]);

const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: false,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: AppErrorComponent,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
