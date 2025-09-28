"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SalesforceAppShell from "@/components/layout/SalesforceAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Building2,
  Plane,
  Target,
  CheckSquare,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  MessageSquare,
  Star,
  Plus,
  MoreHorizontal,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Activity,
  Zap,
  Filter,
  RefreshCw,
  Settings,
} from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, canAccess } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        const savedNote = await response.json();
        setNotes([savedNote, ...notes]);
        setNewNote("");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNoteDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const cards = [
    {
      title: "Accounts",
      href: "/records/accounts",
      desc: "Owners, operators, MROs, vendors",
      resource: "accounts"
    },
    {
      title: "Aircraft",
      href: "/records/aircraft",
      desc: "Fleet, status, TT, MX",
      resource: "aircraft"
    },
    {
      title: "Opportunities",
      href: "/records/opportunities",
      desc: "Pipeline & deal flow",
      resource: "opportunities"
    },
    {
      title: "Tasks",
      href: "/records/tasks",
      desc: "Follow-ups & reminders",
      resource: "tasks"
    },
  ].filter(card => canAccess(card.resource));

  return (
    <ProtectedRoute>
      <SalesforceAppShell>
        <div className="p-6 space-y-6">
          {/* Personal Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]}! ✈️
            </h1>
            <p className="text-blue-100 mt-2">Your personal aviation business command center</p>
            <div className="mt-4 text-sm text-blue-100">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Aircraft</CardTitle>
                <Badge variant="secondary">1</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  +0% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
                <Badge variant="secondary">1</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$350,000</div>
                <p className="text-xs text-muted-foreground">
                  1 opportunity in pipeline
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                <Badge variant="secondary">2</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Active business relationships
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flight Hours</CardTitle>
                <Badge variant="secondary">4.6K</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,600</div>
                <p className="text-xs text-muted-foreground">
                  Total fleet hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={c.href} className="text-blue-600 hover:text-blue-800 font-medium">
                    View {c.title} →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Personal Productivity Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Notes */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Quick Notes</CardTitle>
                <CardDescription>Personal reminders and thoughts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <textarea
                    placeholder="Add a quick note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-3 border rounded-md resize-none h-24 text-sm"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={saveNote}
                    disabled={isLoading || !newNote.trim()}
                  >
                    {isLoading ? "Saving..." : "Save Note"}
                  </Button>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notesLoading ? (
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        Loading notes...
                      </div>
                    ) : notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note.id} className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                          "{note.content}" - {formatNoteDate(note.createdAt)}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        No notes yet. Add your first note above!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Your latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Opportunity Updated</div>
                      <div className="text-xs text-gray-500">Hawker 400XP Share moved to Proposal stage</div>
                      <div className="text-xs text-gray-400">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New Contact Added</div>
                      <div className="text-xs text-gray-500">John Smith from Samike Corp.</div>
                      <div className="text-xs text-gray-400">5 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Aircraft Inspection</div>
                      <div className="text-xs text-gray-500">N400HH completed annual inspection</div>
                      <div className="text-xs text-gray-400">1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Tasks & Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Focus</CardTitle>
              <CardDescription>Your priority tasks and upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm mb-3">Urgent Tasks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Review maintenance quote for N400HH</span>
                      <Badge variant="destructive" className="ml-auto text-xs">Due Today</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Follow up with Samike Corp proposal</span>
                      <Badge variant="secondary" className="ml-auto text-xs">Tomorrow</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-3">Upcoming Events</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-sm font-medium">Client Meeting</div>
                      <div className="text-xs text-gray-600">KLM Aviation - 2:00 PM</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-sm font-medium">Aircraft Delivery</div>
                      <div className="text-xs text-gray-600">Friday, 10:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin-only section */}
          {canAccess("users", "read") && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                System Administration
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">User Management</CardTitle>
                    <CardDescription>Manage users and roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium">
                      Manage Users →
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Data Backup</CardTitle>
                    <CardDescription>Export and backup your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin/backup" className="text-blue-600 hover:text-blue-800 font-medium">
                      Export Data →
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">System Reports</CardTitle>
                    <CardDescription>Analytics and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 font-medium">
                      View Reports →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </SalesforceAppShell>
    </ProtectedRoute>
  );
}