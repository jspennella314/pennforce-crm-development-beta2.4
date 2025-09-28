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
import { Progress } from "@/components/ui/progress";
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
  Target,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  User,
  Phone,
  Mail,
  Plus,
  Edit,
  MoreHorizontal,
  Star,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Share,
  Download,
  Copy,
  Archive,
  Trash2,
  FileText,
  Activity,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  contactId: string;
  contactName: string;
  stage: string;
  amount: number;
  closeDate: string;
  probability: number;
  description?: string;
  type: string;
  leadSource: string;
  owner: string;
  createdAt: string;
  nextStep?: string;
  competitorInfo?: string;
  expectedRevenue: number;
}

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "task" | "proposal";
  subject: string;
  description?: string;
  dueDate: string;
  status: "completed" | "in_progress" | "not_started";
  owner: string;
}

interface StageHistory {
  id: string;
  stage: string;
  changedDate: string;
  changedBy: string;
  probability: number;
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

const STAGE_PROGRESS = {
  "Prospecting": 10,
  "Qualification": 25,
  "Needs Analysis": 50,
  "Proposal": 75,
  "Negotiation": 90,
  "Closed Won": 100,
  "Closed Lost": 0
};

const ACTIVITY_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle,
  proposal: FileText
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canAccess } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOpportunityData(params.id as string);
    }
  }, [params.id]);

  const fetchOpportunityData = async (opportunityId: string) => {
    try {
      // Mock Salesforce-style data
      const mockOpportunity: Opportunity = {
        id: opportunityId,
        name: "Gulfstream G650 Purchase",
        accountId: "1",
        accountName: "Samike Corp.",
        contactId: "1",
        contactName: "Michael Samike",
        stage: "Needs Analysis",
        amount: 65000000,
        closeDate: "2024-06-30",
        probability: 60,
        description: "Potential purchase of Gulfstream G650 for corporate fleet expansion. Client is evaluating multiple aircraft options and financing alternatives. This is a strategic acquisition to support their growing international operations.",
        type: "New Business",
        leadSource: "Referral",
        owner: "John Admin",
        createdAt: "2024-01-15T10:00:00Z",
        nextStep: "Present financing options and delivery timeline",
        competitorInfo: "Competing against Bombardier Global 7500 and Dassault Falcon 8X",
        expectedRevenue: 39000000
      };

      const mockActivities: Activity[] = [
        {
          id: "1",
          type: "call",
          subject: "Initial needs assessment call",
          description: "Discussed client requirements, mission profile, and budget parameters",
          dueDate: "2024-03-10",
          status: "completed",
          owner: "John Admin"
        },
        {
          id: "2",
          type: "meeting",
          subject: "Aircraft demonstration at facility",
          description: "On-site visit to showcase G650 capabilities and features",
          dueDate: "2024-03-15",
          status: "completed",
          owner: "John Admin"
        },
        {
          id: "3",
          type: "proposal",
          subject: "Send formal proposal with financing options",
          description: "Comprehensive proposal including aircraft specifications, pricing, and financing alternatives",
          dueDate: "2024-03-20",
          status: "completed",
          owner: "John Admin"
        },
        {
          id: "4",
          type: "call",
          subject: "Follow-up on proposal questions",
          description: "Address technical questions and discuss delivery timeline",
          dueDate: "2024-03-25",
          status: "in_progress",
          owner: "John Admin"
        },
        {
          id: "5",
          type: "meeting",
          subject: "Final negotiation meeting",
          dueDate: "2024-04-01",
          status: "not_started",
          owner: "John Admin"
        }
      ];

      const mockStageHistory: StageHistory[] = [
        {
          id: "1",
          stage: "Prospecting",
          changedDate: "2024-01-15",
          changedBy: "John Admin",
          probability: 10
        },
        {
          id: "2",
          stage: "Qualification",
          changedDate: "2024-02-01",
          changedBy: "John Admin",
          probability: 25
        },
        {
          id: "3",
          stage: "Needs Analysis",
          changedDate: "2024-03-10",
          changedBy: "John Admin",
          probability: 60
        }
      ];

      setOpportunity(mockOpportunity);
      setActivities(mockActivities);
      setStageHistory(mockStageHistory);
    } catch (error) {
      console.error("Failed to fetch opportunity data:", error);
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

  const getDaysToClose = (closeDate: string) => {
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <ProtectedRoute resource="opportunities" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Loading opportunity details...</div>
          </div>
        </SalesforceAppShell>
      </ProtectedRoute>
    );
  }

  if (!opportunity) {
    return (
      <ProtectedRoute resource="opportunities" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Opportunity not found</div>
          </div>
        </SalesforceAppShell>
      </ProtectedRoute>
    );
  }

  const daysToClose = getDaysToClose(opportunity.closeDate);
  const stageProgress = STAGE_PROGRESS[opportunity.stage as keyof typeof STAGE_PROGRESS];

  return (
    <ProtectedRoute resource="opportunities" action="read">
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
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900">{opportunity.name}</h1>
                    <Badge className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]}>
                      {opportunity.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Opportunity • {opportunity.owner}</span>
                    <span>•</span>
                    <span>Created {formatDate(opportunity.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                {canAccess("opportunities", "update") && (
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
              <Link href="/records/opportunities" className="text-blue-600 hover:text-blue-800">
                Opportunities
              </Link>
              {" > "}
              <span className="text-gray-900">{opportunity.name}</span>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(opportunity.amount)}</div>
                <div className="text-sm text-gray-600">Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{opportunity.probability}%</div>
                <div className="text-sm text-gray-600">Probability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(opportunity.expectedRevenue)}</div>
                <div className="text-sm text-gray-600">Expected Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {daysToClose > 0 ? daysToClose : 'Overdue'}
                </div>
                <div className="text-sm text-gray-600">Days to Close</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stageProgress}%</div>
                <div className="text-sm text-gray-600">Stage Progress</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sales Path */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Path</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{opportunity.stage}</span>
                        <span className="text-gray-600">{stageProgress}% Complete</span>
                      </div>
                      <Progress value={stageProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Prospecting</span>
                        <span>Qualification</span>
                        <span>Needs Analysis</span>
                        <span>Proposal</span>
                        <span>Negotiation</span>
                        <span>Closed Won</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunity Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Opportunity Details</span>
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
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Opportunity Name</label>
                        {isEditing ? (
                          <Input value={opportunity.name} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{opportunity.name}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Stage</label>
                        <Badge className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]}>
                          {opportunity.stage}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Account</label>
                        <Link
                          href={`/records/accounts/${opportunity.accountId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Building2 className="h-4 w-4 mr-1" />
                          {opportunity.accountName}
                        </Link>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Contact</label>
                        <Link
                          href={`/records/contacts/${opportunity.contactId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <User className="h-4 w-4 mr-1" />
                          {opportunity.contactName}
                        </Link>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
                        {isEditing ? (
                          <Input value={opportunity.amount} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900 font-medium">{formatCurrency(opportunity.amount)}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Close Date</label>
                        {isEditing ? (
                          <Input type="date" value={opportunity.closeDate} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{formatDate(opportunity.closeDate)}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Probability</label>
                        {isEditing ? (
                          <Input value={opportunity.probability} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{opportunity.probability}%</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                        {isEditing ? (
                          <Input value={opportunity.type} className="w-full" />
                        ) : (
                          <div className="text-sm text-gray-900">{opportunity.type}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Lead Source</label>
                        <div className="text-sm text-gray-900">{opportunity.leadSource}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Opportunity Owner</label>
                        <div className="text-sm text-gray-900">{opportunity.owner}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                      {isEditing ? (
                        <Textarea value={opportunity.description} className="w-full" rows={3} />
                      ) : (
                        <div className="text-sm text-gray-900">{opportunity.description}</div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Next Step</label>
                      {isEditing ? (
                        <Input value={opportunity.nextStep} className="w-full" />
                      ) : (
                        <div className="text-sm text-gray-900">{opportunity.nextStep}</div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Competitor Information</label>
                      {isEditing ? (
                        <Textarea value={opportunity.competitorInfo} className="w-full" rows={2} />
                      ) : (
                        <div className="text-sm text-gray-900">{opportunity.competitorInfo}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Related Records Tabs */}
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="activities" className="w-full">
                      <div className="border-b border-gray-200 px-6">
                        <TabsList className="bg-transparent p-0 h-auto">
                          <TabsTrigger
                            value="activities"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
                          >
                            Activities ({activities.length})
                          </TabsTrigger>
                          <TabsTrigger
                            value="history"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
                          >
                            Stage History ({stageHistory.length})
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="activities" className="p-6 mt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Activity Timeline</h3>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Log Activity
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {activities.map((activity) => {
                              const IconComponent = ACTIVITY_ICONS[activity.type];
                              return (
                                <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                    <IconComponent className="h-5 w-5 text-gray-600" />
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
                                        variant={activity.status === "completed" ? "default" : activity.status === "in_progress" ? "secondary" : "outline"}
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

                      <TabsContent value="history" className="p-6 mt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Stage History</h3>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Stage</TableHead>
                                <TableHead>Probability</TableHead>
                                <TableHead>Changed Date</TableHead>
                                <TableHead>Changed By</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stageHistory.map((history) => (
                                <TableRow key={history.id}>
                                  <TableCell>
                                    <Badge className={STAGE_COLORS[history.stage as keyof typeof STAGE_COLORS]}>
                                      {history.stage}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{history.probability}%</TableCell>
                                  <TableCell>{formatDate(history.changedDate)}</TableCell>
                                  <TableCell>{history.changedBy}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
                      Call Contact
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Proposal
                    </Button>
                  </CardContent>
                </Card>

                {/* Opportunity Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Opportunity Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className="text-sm font-medium text-green-600">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">Active engagement</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">Budget confirmed</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-gray-600">Competition present</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600">Decision timeline tight</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Stakeholders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Stakeholders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">MS</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{opportunity.contactName}</div>
                          <div className="text-xs text-gray-600">Decision Maker</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Deal Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deal Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{activities.filter(a => a.status === "completed").length}</div>
                        <div className="text-xs text-gray-600">Completed Activities</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{Math.round((opportunity.amount * opportunity.probability) / 1000000)}M</div>
                        <div className="text-xs text-gray-600">Weighted Value</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{stageHistory.length}</div>
                        <div className="text-xs text-gray-600">Stage Changes</div>
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