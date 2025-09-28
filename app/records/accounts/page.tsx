"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Phone,
  Mail,
  Plus,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

interface Account {
  id: string;
  name: string;
  type: string;
  website?: string;
  phone?: string;
  email?: string;
  billingAddr?: string;
  shippingAddr?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  contacts: any[];
  aircraft: any[];
  operatedAircraft: any[];
}

const ACCOUNT_TYPE_COLORS = {
  OWNER: "bg-blue-100 text-blue-800",
  OPERATOR: "bg-green-100 text-green-800",
  MRO: "bg-purple-100 text-purple-800",
  BROKER: "bg-orange-100 text-orange-800",
  CHARTER_CUSTOMER: "bg-pink-100 text-pink-800",
  VENDOR: "bg-gray-100 text-gray-800"
};

export default function AccountsPage() {
  const { canAccess } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        console.error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <ProtectedRoute resource="accounts" action="read">
        <AppShell>
          <div className="p-6">
            <div className="text-center">Loading accounts...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="accounts" action="read">
      <AppShell>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
              <p className="text-gray-600">Manage your business relationships</p>
            </div>
            <div className="flex items-center space-x-3">
              {canAccess("accounts", "create") && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </Button>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {filteredAccounts.length} of {accounts.length} accounts
            </div>
          </div>

          {/* Accounts Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active business relationships
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aircraft Owners</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accounts.filter(a => a.type === "OWNER").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Own aircraft in portfolio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operators</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accounts.filter(a => a.type === "OPERATOR").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage aircraft operations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accounts.filter(a => ["MRO", "VENDOR"].includes(a.type)).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  MRO and vendor partners
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accounts Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Accounts</CardTitle>
              <CardDescription>
                A list of all accounts in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Aircraft</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/records/accounts/${account.id}`}
                            className="font-medium hover:text-blue-600"
                          >
                            {account.name}
                          </Link>
                          {account.website && (
                            <div className="text-sm text-gray-500">{account.website}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ACCOUNT_TYPE_COLORS[account.type as keyof typeof ACCOUNT_TYPE_COLORS]}>
                          {account.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {account.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {account.email}
                            </div>
                          )}
                          {account.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {account.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {account.aircraft.length + account.operatedAircraft.length > 0 ? (
                            <span>
                              {account.aircraft.length} owned, {account.operatedAircraft.length} operated
                            </span>
                          ) : (
                            <span className="text-gray-400">No aircraft</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {account.owner ? account.owner.name : "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(account.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredAccounts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? `No accounts found matching "${searchQuery}"` : "No accounts found"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}