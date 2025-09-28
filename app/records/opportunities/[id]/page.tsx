"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  DollarSign,
  Calendar,
  Building2,
  User,
  Plane,
  Edit,
  MoreHorizontal,
  ArrowRight,
  CheckCircle,
  Circle
} from "lucide-react";
import Link from "next/link";

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  amount: number;
  currency: string;
  closeDate: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    name: string;
    type: string;
  };
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  aircraft?: {
    id: string;
    make: string;
    model: string;
    tailNumber: string;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

const STAGE_ORDER = ["PROSPECT", "QUALIFY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const STAGE_LABELS = {
  PROSPECT: "Prospecting",
  QUALIFY: "Qualification",
  PROPOSAL: "Proposal/Price Quote",
  NEGOTIATION: "Negotiation/Review",
  WON: "Closed Won",
  LOST: "Closed Lost"
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const { canAccess } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOpportunity(params.id as string);
    }
  }, [params.id]);

  const fetchOpportunity = async (id: string) => {
    try {
      // For demo purposes, using the seeded opportunity data
      const mockOpportunity: Opportunity = {
        id: "1",
        name: "Hawker 400XP Share (25%)",
        stage: "PROPOSAL",
        amount: 350000,
        currency: "USD",
        closeDate: "2024-12-31",
        source: "Referral",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
        account: {
          id: "1",
          name: "Samike Corp.",
          type: "OWNER"
        },
        contact: {
          id: "1",
          firstName: "John",
          lastName: "Smith"
        },
        aircraft: {
          id: "1",
          make: "Beechcraft",
          model: "400XP",
          tailNumber: "N400HH"
        },
        owner: {
          id: "1",
          name: "PennForce Admin",
          email: "admin@pennjets.com"
        }
      };
      setOpportunity(mockOpportunity);
    } catch (error) {
      console.error("Failed to fetch opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStageIndex = () => {
    if (!opportunity) return 0;
    return STAGE_ORDER.indexOf(opportunity.stage);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No date set";
    return new Date(dateStr).toLocaleDateString();
  };

  const StagePath = () => {
    const currentIndex = getCurrentStageIndex();

    return (
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Sales Process</h3>
          <Badge variant={opportunity?.stage === "WON" ? "default" : "secondary"}>
            {opportunity?.stage}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {STAGE_ORDER.slice(0, -1).map((stage, index) => { // Exclude LOST from path
            const isCompleted = index < currentIndex || opportunity?.stage === "WON";
            const isCurrent = index === currentIndex && opportunity?.stage !== "LOST";
            const isWon = opportunity?.stage === "WON";

            return (
              <div key={stage} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${isCompleted || isCurrent
                      ? isWon
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`
                    mt-2 text-xs text-center max-w-20
                    ${isCurrent ? 'font-medium text-blue-600' : 'text-gray-600'}
                  `}>
                    {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
                  </div>
                </div>

                {index < STAGE_ORDER.length - 2 && (
                  <ArrowRight className={`
                    w-4 h-4 mx-3 mt-[-20px]
                    ${isCompleted ? 'text-blue-600' : 'text-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {opportunity?.stage === "LOST" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs">✕</span>
              </div>
              <span className="text-red-800 font-medium">Opportunity Closed Lost</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute resource="opportunities" action="read">
        <AppShell>
          <div className="p-6">
            <div className="text-center">Loading opportunity...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!opportunity) {
    return (
      <ProtectedRoute resource="opportunities" action="read">
        <AppShell>
          <div className="p-6">
            <div className="text-center">Opportunity not found</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="opportunities" action="read">
      <AppShell>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{opportunity.name}</h1>
              <p className="text-gray-600">{opportunity.account.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              {canAccess("opportunities", "update") && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stage Path */}
          <StagePath />

          {/* Content */}
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Information */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opportunity Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Amount</label>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(opportunity.amount, opportunity.currency)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Close Date</label>
                          <div className="text-sm">{formatDate(opportunity.closeDate)}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Stage</label>
                          <div>
                            <Badge variant="secondary">{opportunity.stage}</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Lead Source</label>
                          <div className="text-sm">{opportunity.source || "Not specified"}</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Created Date</label>
                          <div className="text-sm">{formatDate(opportunity.createdAt)}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Modified</label>
                          <div className="text-sm">{formatDate(opportunity.updatedAt)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Related Records */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Related Records</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          Account
                        </label>
                        <Link
                          href={`/records/accounts/${opportunity.account.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {opportunity.account.name}
                        </Link>
                        <div className="text-xs text-gray-500">{opportunity.account.type}</div>
                      </div>

                      {opportunity.contact && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Primary Contact
                          </label>
                          <Link
                            href={`/records/contacts/${opportunity.contact.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {opportunity.contact.firstName} {opportunity.contact.lastName}
                          </Link>
                        </div>
                      )}

                      {opportunity.aircraft && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <Plane className="h-4 w-4 mr-1" />
                            Aircraft
                          </label>
                          <Link
                            href={`/records/aircraft/${opportunity.aircraft.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {opportunity.aircraft.make} {opportunity.aircraft.model}
                          </Link>
                          <div className="text-xs text-gray-500">{opportunity.aircraft.tailNumber}</div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">Owner</label>
                        <div className="text-sm">{opportunity.owner.name}</div>
                        <div className="text-xs text-gray-500">{opportunity.owner.email}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Track all interactions and updates for this opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No activities yet. Activities will appear here as they are logged.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="related">
              <Card>
                <CardHeader>
                  <CardTitle>Related Items</CardTitle>
                  <CardDescription>
                    Files, tasks, and other items related to this opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No related items yet.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}