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
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Activity,
  Plus,
  Edit,
  MoreHorizontal,
  Star,
  ChevronLeft,
  Target,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Share,
  Download,
  Copy,
  Archive,
  Trash2,
  MessageSquare,
  Video,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  department?: string;
  accountId: string;
  accountName: string;
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
  linkedIn?: string;
  twitter?: string;
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

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canAccess } = useAuth();
  const [contact, setContact] = useState<Contact | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchContactData(params.id as string);
    }
  }, [params.id]);

  const fetchContactData = async (contactId: string) => {
    try {
      // Mock Salesforce-style data
      const mockContact: Contact = {
        id: contactId,
        firstName: "Michael",
        lastName: "Samike",
        title: "Chief Executive Officer",
        email: "msamike@samikecorp.com",
        phone: "+1-555-0123",
        mobilePhone: "+1-555-0124",
        department: "Executive",
        accountId: "1",
        accountName: "Samike Corp.",
        owner: "John Admin",
        createdAt: "2024-01-15T10:00:00Z",
        status: "Active",
        description: "CEO and founder of Samike Corp. with over 25 years of experience in the aviation industry. Key decision maker for all major aircraft purchases and strategic partnerships.",
        address: {
          street: "123 Aviation Blvd",
          city: "Teterboro",
          state: "NJ",
          zipCode: "07608",
          country: "United States"
        },
        linkedIn: "linkedin.com/in/msamike",
        twitter: "@msamike"
      };

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
          description: "Discussed timeline and financing options with Michael",
          dueDate: "2024-03-20",
          status: "completed",
          owner: "John Admin"
        },
        {
          id: "2",
          type: "email",
          subject: "Proposal documentation sent",
          description: "Sent comprehensive proposal for maintenance services",
          dueDate: "2024-03-18",
          status: "completed",
          owner: "John Admin"
        },
        {
          id: "3",
          type: "meeting",
          subject: "Contract negotiation meeting",
          dueDate: "2024-03-25",
          status: "in_progress",
          owner: "John Admin"
        }
      ];

      setContact(mockContact);
      setOpportunities(mockOpportunities);
      setActivities(mockActivities);
    } catch (error) {
      console.error("Failed to fetch contact data:", error);
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
      <ProtectedRoute resource="contacts" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Loading contact details...</div>
          </div>
        </SalesforceAppShell>
      </ProtectedRoute>
    );
  }

  if (!contact) {
    return (
      <ProtectedRoute resource="contacts" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Contact not found</div>
          </div>
        </SalesforceAppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="contacts" action="read">
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
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </h1>
                    <Badge variant="default">{contact.status}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Contact • {contact.owner}</span>
                    <span>•</span>
                    <span>Created {formatDate(contact.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                {canAccess("contacts", "update") && (
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
              <Link href="/records/contacts" className="text-blue-600 hover:text-blue-800">
                Contacts
              </Link>
              {" > "}
              <span className="text-gray-900">{contact.firstName} {contact.lastName}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Contact Details</span>
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
                        <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                        {isEditing ? (
                          <Input value={contact.firstName} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{contact.firstName}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                        {isEditing ? (
                          <Input value={contact.lastName} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{contact.lastName}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                        {isEditing ? (
                          <Input value={contact.title} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{contact.title}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
                        {isEditing ? (
                          <Input value={contact.department} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{contact.department}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Account</label>
                        <Link
                          href={`/records/accounts/${contact.accountId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Building2 className="h-4 w-4 mr-1" />
                          {contact.accountName}
                        </Link>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Owner</label>
                        <div className="text-sm text-gray-900">{contact.owner}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                      {isEditing ? (
                        <Textarea value={contact.description} className="w-full" rows={3} />
                      ) : (
                        <div className="text-sm text-gray-900">{contact.description}</div>
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
                          <div className="text-sm font-medium text-gray-700">Business Phone</div>
                          <div className="text-sm text-gray-900">{contact.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Mobile Phone</div>
                          <div className="text-sm text-gray-900">{contact.mobilePhone}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Email</div>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Mailing Address</div>
                          <div className="text-sm text-gray-900">
                            {contact.address?.street}<br />
                            {contact.address?.city}, {contact.address?.state} {contact.address?.zipCode}<br />
                            {contact.address?.country}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">LinkedIn</div>
                          <a
                            href={`https://${contact.linkedIn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {contact.linkedIn}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Twitter</div>
                          <a
                            href={`https://twitter.com/${contact.twitter?.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {contact.twitter}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Records Tabs */}
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="opportunities" className="w-full">
                      <div className="border-b border-gray-200 px-6">
                        <TabsList className="bg-transparent p-0 h-auto">
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
                                    <Link
                                      href={`/records/opportunities/${opportunity.id}`}
                                      className="font-medium text-blue-600 hover:text-blue-800"
                                    >
                                      {opportunity.name}
                                    </Link>
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
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call {contact.firstName}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Insights</CardTitle>
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
                        <div className="text-2xl font-bold text-purple-600">{activities.filter(a => a.status === "completed").length}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{activities.filter(a => a.status !== "completed").length}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Score</span>
                        <span className="text-sm font-medium text-green-600">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">High engagement</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Last contact: 1 day ago</span>
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