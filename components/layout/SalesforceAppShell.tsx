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
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  FileText,
  ChevronDown,
  Grid3X3,
  HelpCircle,
  Zap,
  Calendar,
  BarChart3,
  MessageSquare,
  Star,
  TrendingUp,
  Globe,
} from "lucide-react";

interface SalesforceAppShellProps {
  children: React.ReactNode;
}

export default function SalesforceAppShell({ children }: SalesforceAppShellProps) {
  const { user, canAccess } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
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
      title: "Home",
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
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
      resource: "documents"
    },
  ].filter(item => item.resource === "dashboard" || item.resource === "documents" || canAccess(item.resource));

  const solutionNavItems = [
    {
      title: "Sales",
      items: [
        { title: "Leads", href: "/leads", icon: TrendingUp },
        { title: "Opportunities", href: "/records/opportunities", icon: Target },
        { title: "Accounts", href: "/records/accounts", icon: Building2 },
        { title: "Contacts", href: "/records/contacts", icon: User },
      ]
    },
    {
      title: "Service",
      items: [
        { title: "Cases", href: "/cases", icon: MessageSquare },
        { title: "Work Orders", href: "/work-orders", icon: CheckSquare },
      ]
    },
    {
      title: "Aviation",
      items: [
        { title: "Aircraft", href: "/records/aircraft", icon: Plane },
        { title: "Maintenance", href: "/maintenance", icon: Settings },
      ]
    },
  ];

  const userInitials = user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Salesforce Lightning Header */}
      <header className="bg-white border-b border-gray-200 h-12 flex items-center px-4 relative z-50">
        <div className="flex items-center space-x-4 flex-1">
          {/* App Launcher */}
          <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="bg-slate-900 text-white h-full">
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-lg font-semibold">App Launcher</h2>
                </div>
                <div className="p-4 space-y-6">
                  {solutionNavItems.map((section) => (
                    <div key={section.title}>
                      <h3 className="text-sm font-medium text-slate-300 mb-3">{section.title}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800 transition-colors"
                            onClick={() => setIsNavOpen(false)}
                          >
                            <item.icon className="h-6 w-6 mb-2" />
                            <span className="text-xs text-center">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">PF</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">PennForce</span>
          </div>

          {/* Global Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Salesforce..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              className="pl-10 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            <SearchResults
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              query={searchQuery}
              onQueryChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Help */}
          <Button variant="ghost" size="sm" className="p-2">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Setup */}
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
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
                <Link href="/profile">My Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">Help & Training</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-600"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Salesforce Lightning Navigation */}
      <nav className="bg-white border-b border-gray-200 h-10 flex items-center px-4 overflow-x-auto">
        <div className="flex items-center space-x-6">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}