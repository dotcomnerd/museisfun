"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AddTrackDialog() {
    const [youtubeLink, setYoutubeLink] = useState<string>("");
    const [open, setOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeLink(e.target.value);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="mb-4">
          Add Track
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new track</DialogTitle>
          <DialogDescription>
            Enter the YouTube video link below:
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="YouTube video link"
          value={youtubeLink}
          onChange={handleInputChange}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddTrackDialog;
