"use client";

import { Lights } from "@/components/ux/lights";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function LandingPage() {
  return (
    <div className="bg-black w-full h-screen block">
      <div className={"w-full h-full relative  bg-grid-white/[0.03] px-4"}>
        <div
          className={
            "w-full h-full flex flex-col sm:items-center items-start justify-center relative z-[1] animate-moveUp"
          }
        >
          <div className="relative w-full">
            <div className=" rounded-lg p-1 aspect-square overflow-hidden absolute left-0 sm:left-1/2 sm:-translate-x-1/2 -top-12">
              <span
                className={twMerge(
                  "text-xl",
                  "text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-yellow-400 -mb-2"
                )}
              >
                ✨
              </span>
            </div>
          </div>
          <div
            className={
              "text-transparent sm:text-center text-start font-bold sm:text-5xl text-4xl bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-black/[0.6]"
            }
          >
            Welcome to Muse
          </div>
          <div className="text-white/[0.7] sm:text-center text-start max-w-md">
            Stream your favorite content without worrying about deletion.
          </div>
          <div className="mt-5 w-full flex max-sm:flex-col justify-center sm:gap-10 gap-4 text-white">
            <Link href="/login">Get Started</Link>
            <Link href={"https://github.com/Nyumat/muse"} passHref target="_blank">
              Learn More
            </Link>
          </div>
        </div>
        <div
          className={
            "absolute bottom-0 left-0 w-full h-full z-0 animate-appear opacity-0"
          }
        >
          <Lights />
        </div>
      </div>
    </div>
  );
}
