"use client";

import { useNavigationStore } from "@/stores/nav";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { AuthButtons } from "./auth";

export function Header() {
  const { navigationHistory, goBack } = useNavigationStore();

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex gap-x-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={goBack}
          disabled={navigationHistory.length <= 1}
        >
          <ChevronLeft size={24} />
        </Button>
      </div>
      <AuthButtons />
    </header>
  );
}
