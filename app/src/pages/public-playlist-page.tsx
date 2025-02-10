import { MiniPlayer } from "@/components/mini-player";
import { PublicPlaylistView } from "./public-playlist";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MiniPlayer />
      {children}
    </>
  );
}

export function PublicPlaylistPage() {
  return (
    <PublicLayout>
      <PublicPlaylistView />
    </PublicLayout>
  );
}
