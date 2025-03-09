import { ThemeProvider } from "@/components/theme-provider";
import "@/index.css";
import { MuseRouting } from '@/pages/routes';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { TooltipProvider } from './components/ui/tooltip';

const queryClient = new QueryClient();

if (import.meta.env.PROD) {
    console.log = () => { }
    console.error = () => { }
    console.debug = () => { }
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <BrowserRouter>
            <ThemeProvider defaultTheme="dark" storageKey="theme">
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <MuseRouting />
                    </TooltipProvider>
                </QueryClientProvider>
            </ThemeProvider>
            <Toaster richColors closeButton toastOptions={{
                classNames: {
                    loading: 'bg-background border border-primary/50 text-primary rounded-lg text-base',
                    loader: 'scale-150',
                    success: 'bg-background border border-primary/50 text-primary rounded-lg text-base',
                    error: 'bg-background border border-destructive/50 text-destructive rounded-lg text-base',
                    closeButton: 'text-foreground',
                    cancelButton: 'text-foreground',
                    default: 'bg-background border border-border/50 text-foreground rounded-lg text-base',
                }
            }} />
        </BrowserRouter>
    </HelmetProvider>
);
