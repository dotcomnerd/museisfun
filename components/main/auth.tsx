"use client";
import { login, signup } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-x-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            Sign up
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign up</DialogTitle>
            <DialogDescription>
              Create your account to start listening.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input id="password" type="password" className="col-span-3" />
            </div>
          </div>
          <Button type="submit" className="w-full" formAction={signup}>
            Sign up
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-white text-black hover:bg-gray-100">
            Log in
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log in</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="login-email" className="text-right">
                Email
              </Label>
              <Input id="login-email" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="login-password" className="text-right">
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                className="col-span-3"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" formAction={login}>
            Log in
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
