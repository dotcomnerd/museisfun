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
            <Toaster richColors closeButton position="bottom-center" />
        </BrowserRouter>
    </HelmetProvider>
);
