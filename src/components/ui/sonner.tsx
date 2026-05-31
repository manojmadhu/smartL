import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      closeButton
      richColors
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "rounded-lg border bg-card text-card-foreground shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground"
        }
      }}
    />
  );
}
