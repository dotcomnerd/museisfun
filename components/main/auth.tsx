"use client";
import { useUser } from "@/hooks/use-user";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function AuthButtons() {
  const { user, loading, signOut, signIn } = useUser();

  return (
    <div className="flex items-center gap-x-4">
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src={`https://robohash.org/${user.email}`} alt={user.email} />
              <AvatarFallback className="bg-black">{user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="ghost" onClick={() => signIn()}>
          Sign In
        </Button>
      )}
    </div>
  );
}