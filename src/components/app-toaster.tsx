import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className:
          "font-sans! border-hair! bg-panel! text-ink! shadow-[var(--shadow-md)]!",
      }}
    />
  );
}
