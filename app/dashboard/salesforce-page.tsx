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

export default function SalesforceDashboard() {
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
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <SalesforceAppShell>
        <div className="bg-gray-50 min-h-screen">
          {/* Salesforce Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-sm text-gray-600">Here's what's happening with your aviation business today</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/records/accounts/new">Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/records/contacts/new">Contact</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/records/aircraft/new">Aircraft</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/records/opportunities/new">Opportunity</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pipeline</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">$2.4M</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from last quarter
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Aircraft</CardTitle>
                  <Plane className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">4</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <Activity className="h-3 w-3 mr-1" />
                    All operational
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Open Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="flex items-center text-xs text-orange-600 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    3 due today
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Flight Hours</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">1,247</div>
                  <div className="flex items-center text-xs text-purple-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +45 hours this month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Items */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Recent Items</CardTitle>
                    <CardDescription>Your most recently viewed records</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: "Account",
                        name: "Samike Corp.",
                        icon: Building2,
                        color: "bg-blue-100 text-blue-700",
                        time: "2 hours ago",
                        status: "Active"
                      },
                      {
                        type: "Aircraft",
                        name: "N400HH - Beechcraft 400XP",
                        icon: Plane,
                        color: "bg-green-100 text-green-700",
                        time: "4 hours ago",
                        status: "Operational"
                      },
                      {
                        type: "Opportunity",
                        name: "Aircraft Share Partnership",
                        icon: Target,
                        color: "bg-orange-100 text-orange-700",
                        time: "1 day ago",
                        status: "Proposal"
                      },
                      {
                        type: "Contact",
                        name: "John Smith",
                        icon: User,
                        color: "bg-purple-100 text-purple-700",
                        time: "2 days ago",
                        status: "Active"
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.type} • {item.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tasks & Notes */}
              <div className="space-y-6">
                {/* My Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
                    <CardDescription>Today's priorities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "Review maintenance proposal", due: "Today", priority: "High" },
                        { title: "Follow up with KLM Aviation", due: "Tomorrow", priority: "Medium" },
                        { title: "Schedule N400HH inspection", due: "This week", priority: "Low" },
                      ].map((task, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{task.title}</div>
                            <div className="text-xs text-gray-500">Due: {task.due}</div>
                          </div>
                          <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "secondary"} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Notes</CardTitle>
                    <CardDescription>Quick thoughts and reminders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <textarea
                        placeholder="Add a quick note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full p-3 border rounded-lg resize-none h-20 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={saveNote}
                        disabled={isLoading || !newNote.trim()}
                      >
                        {isLoading ? "Saving..." : "Save Note"}
                      </Button>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {notesLoading ? (
                          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                            Loading notes...
                          </div>
                        ) : notes.length > 0 ? (
                          notes.slice(0, 3).map((note) => (
                            <div key={note.id} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
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
              </div>
            </div>

            {/* Calendar & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Activity Feed</CardTitle>
                  <CardDescription>Recent updates and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: "opportunity",
                        message: "Opportunity \"Aircraft Share Partnership\" moved to Proposal stage",
                        time: "2 hours ago",
                        icon: Target,
                        color: "text-orange-600"
                      },
                      {
                        type: "aircraft",
                        message: "N400HH completed annual inspection - all systems operational",
                        time: "1 day ago",
                        icon: Plane,
                        color: "text-green-600"
                      },
                      {
                        type: "contact",
                        message: "New contact John Smith added to Samike Corp.",
                        time: "2 days ago",
                        icon: User,
                        color: "text-blue-600"
                      },
                      {
                        type: "task",
                        message: "Task \"Review maintenance quote\" completed",
                        time: "3 days ago",
                        icon: CheckSquare,
                        color: "text-purple-600"
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 ${activity.color}`}>
                          <activity.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{activity.message}</div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
                  <CardDescription>Your schedule for the next few days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Client Meeting - KLM Aviation",
                        time: "Today, 2:00 PM",
                        type: "Meeting",
                        color: "bg-blue-100 text-blue-700"
                      },
                      {
                        title: "Aircraft Delivery - N500XX",
                        time: "Tomorrow, 10:00 AM",
                        type: "Delivery",
                        color: "bg-green-100 text-green-700"
                      },
                      {
                        title: "Maintenance Review Meeting",
                        time: "Friday, 3:00 PM",
                        type: "Review",
                        color: "bg-orange-100 text-orange-700"
                      },
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.time}</div>
                          </div>
                        </div>
                        <Badge className={event.color} variant="secondary">
                          {event.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SalesforceAppShell>
    </ProtectedRoute>
  );
}