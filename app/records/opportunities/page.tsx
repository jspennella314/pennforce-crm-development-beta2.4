"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  DollarSign,
  Calendar,
  Building2,
  Plus,
  Filter,
  MoreHorizontal
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
  account: {
    id: string;
    name: string;
    type: string;
  };
  aircraft?: {
    id: string;
    make: string;
    model: string;
    tailNumber: string;
  } | null;
}

const STAGE_ORDER = ["PROSPECT", "QUALIFY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const STAGE_COLORS = {
  PROSPECT: "bg-gray-100 text-gray-800",
  QUALIFY: "bg-blue-100 text-blue-800",
  PROPOSAL: "bg-yellow-100 text-yellow-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800"
};

export default function OpportunitiesPage() {
  const { canAccess } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities');
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      } else {
        console.error("Failed to fetch opportunities");
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
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

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              <Link href={`/records/opportunities/${opportunity.id}`} className="hover:text-blue-600">
                {opportunity.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">
              {opportunity.account.name}
            </CardDescription>
          </div>
          <Badge variant="secondary" className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]}>
            {opportunity.stage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <DollarSign className="h-3 w-3 mr-1 text-green-600" />
            {formatCurrency(opportunity.amount, opportunity.currency)}
          </div>
          {opportunity.closeDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-3 w-3 mr-1" />
              Close: {formatDate(opportunity.closeDate)}
            </div>
          )}
          {opportunity.aircraft && (
            <div className="flex items-center text-sm text-gray-600">
              <Target className="h-3 w-3 mr-1" />
              {opportunity.aircraft.make} {opportunity.aircraft.model}
            </div>
          )}
          {opportunity.source && (
            <div className="text-xs text-gray-500">
              Source: {opportunity.source}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-6 gap-4 h-full">
      {STAGE_ORDER.map((stage) => {
        const stageOpps = getOpportunitiesByStage(stage);
        const totalValue = stageOpps.reduce((sum, opp) => sum + opp.amount, 0);

        return (
          <div key={stage} className="flex flex-col">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{stage}</h3>
                <Badge variant="outline" className="text-xs">
                  {stageOpps.length}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                {formatCurrency(totalValue, "USD")}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {stageOpps.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 grid grid-cols-5 gap-4">
                  <div>
                    <Link href={`/records/opportunities/${opportunity.id}`} className="font-medium hover:text-blue-600">
                      {opportunity.name}
                    </Link>
                    <div className="text-sm text-gray-500">{opportunity.account.name}</div>
                  </div>
                  <div>
                    <Badge className={STAGE_COLORS[opportunity.stage as keyof typeof STAGE_COLORS]}>
                      {opportunity.stage}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    {formatCurrency(opportunity.amount, opportunity.currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(opportunity.closeDate)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {opportunity.source}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute resource="opportunities" action="read">
        <AppShell>
          <div className="p-6">
            <div className="text-center">Loading opportunities...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
              <p className="text-gray-600">Manage your sales pipeline</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              {canAccess("opportunities", "create") && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Opportunity
                </Button>
              )}
            </div>
          </div>

          {/* View Tabs */}
          <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")}>
            <TabsList>
              <TabsTrigger value="kanban">Pipeline View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="kanban" className="mt-6">
              <KanbanView />
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <ListView />
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}