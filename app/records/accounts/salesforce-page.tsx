"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SalesforceAppShell from "@/components/layout/SalesforceAppShell";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Download,
  Upload,
  Settings,
  RefreshCw,
  Grid3X3,
  List,
  Star,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRecordTab } from "@/hooks/useRecordTab";

interface Account {
  id: string;
  name: string;
  type: string;
  industry?: string;
  phone?: string;
  website?: string;
  revenue?: number;
  employees?: number;
  owner: string;
  createdAt: string;
  status: string;
}

const ACCOUNT_TYPE_COLORS = {
  "OWNER": "bg-blue-100 text-blue-800",
  "OPERATOR": "bg-green-100 text-green-800",
  "MRO": "bg-purple-100 text-purple-800",
  "VENDOR": "bg-orange-100 text-orange-800",
  "PARTNER": "bg-indigo-100 text-indigo-800"
};

export default function SalesforceAccountsPage() {
  const { canAccess } = useAuth();
  const { openAccountTab } = useRecordTab();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      // Mock Salesforce-style data
      const mockAccounts: Account[] = [
        {
          id: "1",
          name: "Samike Corp.",
          type: "OWNER",
          industry: "Aviation Services",
          phone: "+1-555-0123",
          website: "www.samikecorp.com",
          revenue: 5000000,
          employees: 45,
          owner: "John Admin",
          createdAt: "2024-01-15T10:00:00Z",
          status: "Active"
        },
        {
          id: "2",
          name: "KLM Aviation Services",
          type: "OPERATOR",
          industry: "Aircraft Operations",
          phone: "+1-973-868-8425",
          website: "www.klmaviation.com",
          revenue: 12000000,
          employees: 120,
          owner: "John Admin",
          createdAt: "2024-01-10T09:00:00Z",
          status: "Active"
        },
        {
          id: "3",
          name: "Premier Jet Maintenance",
          type: "MRO",
          industry: "Aircraft Maintenance",
          phone: "+1-555-0987",
          website: "www.premierjetmro.com",
          revenue: 3000000,
          employees: 28,
          owner: "John Admin",
          createdAt: "2024-01-08T14:30:00Z",
          status: "Active"
        },
        {
          id: "4",
          name: "AeroTech Solutions",
          type: "VENDOR",
          industry: "Aviation Technology",
          phone: "+1-555-0456",
          website: "www.aerotech.com",
          revenue: 8000000,
          employees: 85,
          owner: "John Admin",
          createdAt: "2024-01-05T11:15:00Z",
          status: "Prospect"
        },
      ];
      setAccounts(mockAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || account.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(account => account.id));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute resource="accounts" action="read">
        <SalesforceAppShell>
          <div className="p-6">
            <div className="text-center">Loading accounts...</div>
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
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
                  <p className="text-sm text-gray-600">{filteredAccounts.length} items • Updated 2 min ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                {canAccess("accounts", "create") && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Account
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Filters and Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search accounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Type Filter */}
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="OPERATOR">Operator</SelectItem>
                        <SelectItem value="MRO">MRO</SelectItem>
                        <SelectItem value="VENDOR">Vendor</SelectItem>
                        <SelectItem value="PARTNER">Partner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View Toggle */}
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-r-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-l-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedAccounts.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions ({selectedAccounts.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Selected
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accounts Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={() => handleSelectAccount(account.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <button
                                onClick={() => openAccountTab(account.id, account.name)}
                                className="font-medium text-blue-600 hover:text-blue-800 text-left"
                              >
                                {account.name}
                              </button>
                              <div className="text-sm text-gray-500">
                                {account.phone && (
                                  <div className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {account.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ACCOUNT_TYPE_COLORS[account.type as keyof typeof ACCOUNT_TYPE_COLORS]}>
                            {account.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {account.industry || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {account.revenue ? formatCurrency(account.revenue) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {account.employees ? `${account.employees.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {account.owner}
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.status === "Active" ? "default" : "secondary"}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openAccountTab(account.id, account.name)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                Add to Favorites
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 text-lg font-medium mb-2">No accounts found</div>
                    <div className="text-gray-400 mb-4">
                      {searchQuery ? `No accounts match "${searchQuery}"` : "Get started by creating your first account"}
                    </div>
                    {!searchQuery && canAccess("accounts", "create") && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Account
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{accounts.length}</div>
                      <div className="text-sm text-gray-600">Total Accounts</div>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(accounts.reduce((sum, acc) => sum + (acc.revenue || 0), 0))}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {accounts.filter(acc => acc.status === "Active").length}
                      </div>
                      <div className="text-sm text-gray-600">Active Accounts</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {accounts.reduce((sum, acc) => sum + (acc.employees || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Employees</div>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SalesforceAppShell>
    </ProtectedRoute>
  );
}