"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SearchResults from "@/components/search/SearchResults";
import {
  Home,
  Building2,
  Plane,
  Target,
  CheckSquare,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  Plus,
  User,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, canAccess } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsSearchOpen(value.length >= 2);
  };

  // Handle search focus
  const handleSearchFocus = () => {
    if (searchQuery.length >= 2) {
      setIsSearchOpen(true);
    }
  };

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      resource: "dashboard"
    },
    {
      title: "Accounts",
      href: "/records/accounts",
      icon: Building2,
      resource: "accounts"
    },
    {
      title: "Contacts",
      href: "/records/contacts",
      icon: User,
      resource: "contacts"
    },
    {
      title: "Aircraft",
      href: "/records/aircraft",
      icon: Plane,
      resource: "aircraft"
    },
    {
      title: "Opportunities",
      href: "/records/opportunities",
      icon: Target,
      resource: "opportunities"
    },
    {
      title: "Tasks",
      href: "/records/tasks",
      icon: CheckSquare,
      resource: "tasks"
    },
  ].filter(item => item.resource === "dashboard" || canAccess(item.resource));

  const adminNavItems = [
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      resource: "users"
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      resource: "users"
    },
  ].filter(item => canAccess(item.resource, "read"));

  const userInitials = user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Sidebar */}
        <Sidebar className="border-r bg-white">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">PF</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">PennForce</div>
                <div className="text-xs text-gray-500">CRM</div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {adminNavItems.length > 0 && (
                <>
                  <div className="px-3 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Administration
                  </div>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href} className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <header className="bg-white border-b h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />

              {/* Global Search */}
              <div ref={searchRef} className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search accounts, aircraft, opportunities..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
                <SearchResults
                  isOpen={isSearchOpen}
                  onClose={() => setIsSearchOpen(false)}
                  query={searchQuery}
                  onQueryChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/records/accounts/new">New Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/records/aircraft/new">New Aircraft</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/records/opportunities/new">New Opportunity</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/records/tasks/new">New Task</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name || ""} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-blue-600 capitalize">
                        {user?.role} • {user?.organization}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">Help & Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}