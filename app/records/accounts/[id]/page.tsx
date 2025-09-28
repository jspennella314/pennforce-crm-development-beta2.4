"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SalesforceAppShell from "@/components/layout/SalesforceAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  DollarSign,
  Users,
  Calendar,
  Activity,
  FileText,
  Plus,
  Edit,
  MoreHorizontal,
  Star,
  ChevronLeft,
  TrendingUp,
  Briefcase,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Archive,
  Trash2,
  Share,
  Download,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useRecordTab } from "@/hooks/useRecordTab";

interface Account {
  id: string;
  name: string;
  type: string;
  industry?: string;
  phone?: string;
  email?: string;
  website?: string;
  revenue?: number;
  employees?: number;
  owner: string;
  createdAt: string;
  status: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  amount: number;
  closeDate: string;
  probability: number;
}

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "task";
  subject: string;
  description?: string;
  dueDate: string;
  status: "completed" | "in_progress" | "not_started";
  owner: string;
}

const ACCOUNT_TYPE_COLORS = {
  "OWNER": "bg-blue-100 text-blue-800",
  "OPERATOR": "bg-green-100 text-green-800",
  "MRO": "bg-purple-100 text-purple-800",
  "VENDOR": "bg-orange-100 text-orange-800",
  "PARTNER": "bg-indigo-100 text-indigo-800"
};

const STAGE_COLORS = {
  "Prospecting": "bg-gray-100 text-gray-800",
  "Qualification": "bg-yellow-100 text-yellow-800",
  "Needs Analysis": "bg-blue-100 text-blue-800",
  "Proposal": "bg-purple-100 text-purple-800",
  "Negotiation": "bg-orange-100 text-orange-800",
  "Closed Won": "bg-green-100 text-green-800",
  "Closed Lost": "bg-red-100 text-red-800"
};

const ACTIVITY_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle
};

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canAccess } = useAuth();
  const { openContactTab, openOpportunityTab, openAccountTab } = useRecordTab();
  const [account, setAccount] = useState<Account | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAccountData(params.id as string);
    }
  }, [params.id]);

  const fetchAccountData = async (accountId: string) => {
    try {
      // Mock Salesforce-style data
      const mockAccount: Account = {
        id: accountId,
        name: "Samike Corp.",
        type: "OWNER",
        industry: "Aviation Services",
        phone: "+1-555-0123",
        email: "info@samikecorp.com",
        website: "www.samikecorp.com",
        revenue: 5000000,
        employees: 45,
        owner: "John Admin",
        createdAt: "2024-01-15T10:00:00Z",
        status: "Active",
        description: "Leading provider of aviation services specializing in private jet operations and maintenance. Family-owned business with over 25 years of experience in the aviation industry.",
        address: {
          street: "123 Aviation Blvd",
          city: "Teterboro",
          state: "NJ",
          zipCode: "07608",
          country: "United States"
        }
      };

      const mockContacts: Contact[] = [
        {
          id: "1",
          name: "Michael Samike",
          title: "CEO",
          email: "msamike@samikecorp.com",
          phone: "+1-555-0123",
          isPrimary: true
        },
        {
          id: "2",
          name: "Sarah Johnson",
          title: "Operations Manager",
          email: "sjohnson@samikecorp.com",
          phone: "+1-555-0124",
          isPrimary: false
        }
      ];

      const mockOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Gulfstream G650 Purchase",
          stage: "Needs Analysis",
          amount: 65000000,
          closeDate: "2024-06-30",
          probability: 60
        },
        {
          id: "2",
          name: "Annual Maintenance Contract",
          stage: "Proposal",
          amount: 850000,
          closeDate: "2024-04-15",
          probability: 85
        }
      ];

      const mockActivities: Activity[] = [
        {
          id: "1",
          type: "call",
          subject: "Follow-up on Gulfstream inquiry",
          description: "Discussed timeline and financing options",
          dueDate: "2024-03-20",
          status: "completed",
          owner: "John Admin"
        },
        {
          id: "2",
          type: "meeting",
          subject: "Maintenance contract review",
          dueDate: "2024-03-25",
          status: "in_progress",
          owner: "John Admin"
        }
      ];

      setAccount(mockAccount);
      setContacts(mockContacts);
      setOpportunities(mockOpportunities);
      setActivities(mockActivities);

      // Auto-open this record as a tab
      if (params.id && mockAccount.name) {
        openAccountTab(params.id as string, mockAccount.name);
      }
    } catch (error) {
      console.error("Failed to fetch account data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <ProtectedRoute resource="accounts" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Loading account details...</div>
          </div>
        </SalesforceAppShell>
      </ProtectedRoute>
    );
  }

  if (!account) {
    return (
      <ProtectedRoute resource="accounts" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Account not found</div>
          </div>
        </SalesforceAppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="accounts" action="read">
      <SalesforceAppShell>
        <div className="bg-gray-50 min-h-screen">
          {/* Salesforce Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900">{account.name}</h1>
                    <Badge className={ACCOUNT_TYPE_COLORS[account.type as keyof typeof ACCOUNT_TYPE_COLORS]}>
                      {account.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Account • {account.owner}</span>
                    <span>•</span>
                    <span>Created {formatDate(account.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                {canAccess("accounts", "update") && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      window.open(window.location.href, '_blank');
                    }}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Path Indicator */}
          <div className="bg-white border-b border-gray-200 px-6 py-2">
            <div className="text-sm text-gray-600">
              <Link href="/records/accounts" className="text-blue-600 hover:text-blue-800">
                Accounts
              </Link>
              {" > "}
              <span className="text-gray-900">{account.name}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Account Details</span>
                      {isEditing && (
                        <div className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button size="sm">Save</Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Account Name</label>
                        {isEditing ? (
                          <Input value={account.name} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{account.name}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                        <Badge className={ACCOUNT_TYPE_COLORS[account.type as keyof typeof ACCOUNT_TYPE_COLORS]}>
                          {account.type}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Industry</label>
                        {isEditing ? (
                          <Input value={account.industry} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{account.industry}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Annual Revenue</label>
                        {isEditing ? (
                          <Input value={account.revenue} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{account.revenue ? formatCurrency(account.revenue) : "—"}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Employees</label>
                        {isEditing ? (
                          <Input value={account.employees} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{account.employees?.toLocaleString()}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Account Owner</label>
                        <div className="text-sm text-gray-900">{account.owner}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                      {isEditing ? (
                        <Textarea value={account.description} className="w-full" rows={3} />
                      ) : (
                        <div className="text-sm text-gray-900">{account.description}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Phone</div>
                          <div className="text-sm text-gray-900">{account.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Email</div>
                          <div className="text-sm text-gray-900">{account.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Website</div>
                          <a
                            href={`https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {account.website}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Address</div>
                          <div className="text-sm text-gray-900">
                            {account.address?.street}<br />
                            {account.address?.city}, {account.address?.state} {account.address?.zipCode}<br />
                            {account.address?.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Records Tabs */}
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="contacts" className="w-full">
                      <div className="border-b border-gray-200 px-6">
                        <TabsList className="bg-transparent p-0 h-auto">
                          <TabsTrigger
                            value="contacts"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
                          >
                            Contacts ({contacts.length})
                          </TabsTrigger>
                          <TabsTrigger
                            value="opportunities"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
                          >
                            Opportunities ({opportunities.length})
                          </TabsTrigger>
                          <TabsTrigger
                            value="activities"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
                          >
                            Activities ({activities.length})
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="contacts" className="p-6 mt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Related Contacts</h3>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              New Contact
                            </Button>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Primary</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                  <TableCell>
                                    <button
                                      onClick={() => openContactTab(contact.id, contact.name)}
                                      className="font-medium text-blue-600 hover:text-blue-800 text-left"
                                    >
                                      {contact.name}
                                    </button>
                                  </TableCell>
                                  <TableCell>{contact.title}</TableCell>
                                  <TableCell>{contact.email}</TableCell>
                                  <TableCell>{contact.phone}</TableCell>
                                  <TableCell>
                                    {contact.isPrimary && (
                                      <Badge variant="default">Primary</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Remove</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="opportunities" className="p-6 mt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Related Opportunities</h3>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              New Opportunity
                            </Button>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Opportunity Name</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Close Date</TableHead>
                                <TableHead>Probability</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {opportunities.map((opportunity) => (
                                <TableRow key={opportunity.id}>
                                  <TableCell>
                                    <button
                                      onClick={() => openOpportunityTab(opportunity.id, opportunity.name)}
                                      className="font-medium text-blue-600 hover:text-blue-800 text-left"
                                    >
                                      {opportunity.name}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]}>
                                      {opportunity.stage}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {formatCurrency(opportunity.amount)}
                                  </TableCell>
                                  <TableCell>{formatDate(opportunity.closeDate)}</TableCell>
                                  <TableCell>{opportunity.probability}%</TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Remove</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="activities" className="p-6 mt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Recent Activities</h3>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Log Activity
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {activities.map((activity) => {
                              const IconComponent = ACTIVITY_ICONS[activity.type];
                              return (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border">
                                    <IconComponent className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-gray-900">{activity.subject}</div>
                                      <div className="text-sm text-gray-500">{formatDate(activity.dueDate)}</div>
                                    </div>
                                    {activity.description && (
                                      <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                                    )}
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge
                                        variant={activity.status === "completed" ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        {activity.status.replace("_", " ")}
                                      </Badge>
                                      <span className="text-xs text-gray-500">by {activity.owner}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.amount, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Pipeline Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{opportunities.length}</div>
                        <div className="text-sm text-gray-600">Open Opps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{contacts.length}</div>
                        <div className="text-sm text-gray-600">Contacts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{activities.length}</div>
                        <div className="text-sm text-gray-600">Activities</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Engagement Score</span>
                        <span className="text-sm font-medium text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Last contact: 2 days ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-600">Contract renewal due in 60 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">JA</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{account.owner}</div>
                          <div className="text-xs text-gray-600">Account Owner</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SalesforceAppShell>
    </ProtectedRoute>
  );
}