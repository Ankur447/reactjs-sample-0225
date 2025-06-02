import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Menu } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { ThemeToggle } from "@/components/theme-toggle";
  
  export default function Navbar() {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 mx-auto">
          {/* Left side - Logo and Title */}
          <div className="flex items-center mr-4 space-x-3">
            <div className="bg-gradient-to-br from-primary to-primary/90 w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Taskboard</h1>
          </div>
  
          <div className="flex flex-1 items-center justify-between space-x-2">
            {/* Middle space for potential search or other elements */}
            <div className="flex-1"></div>
  
            {/* Right side - Dropdown and Avatar */}
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
                  <DropdownMenuItem>
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Projects</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
  
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Taskboard" 
                  alt="User Avatar"
                />
                <AvatarFallback>TB</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    );
  }