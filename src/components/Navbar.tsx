"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    const loadRandomAvatar = async () => {
      const randomId = Math.floor(Math.random() * 1000);
      try {
        const response = await fetch(`https://picsum.photos/id/${randomId}/info`);
        if (!response.ok) throw new Error("Failed to fetch image info");
        const data = await response.json();
        setAvatarUrl(data.download_url);
      } catch (error) {
        console.error("Error fetching avatar:", error);
        // Fallback in case of error
        setAvatarUrl("https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Taskboard");
      }
    };

    loadRandomAvatar();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center mr-4 space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative overflow-hidden rounded-lg">
            <Image
              src="https://pbs.twimg.com/profile_banners/1554658280399462400/1678295595/1080x360"
              alt="Taskboard Logo"
              fill
              sizes="(max-width: 640px) 40px, 48px"
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground hidden sm:block">Taskboard</h1>
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2 text-sm font-medium hover:bg-muted/50"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>Dashboard</DropdownMenuItem>
                <DropdownMenuItem>Projects</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    try {
                      // Sign out from Firebase
                      await firebaseSignOut(auth);
                      // Clear session storage
                      sessionStorage.clear();
                      // Redirect to home
                      window.location.href = '/';
                    } catch (error) {
                      console.error("Logout error:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Logout"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/profile" className="hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt="User Avatar" />
                <AvatarFallback>TB</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
