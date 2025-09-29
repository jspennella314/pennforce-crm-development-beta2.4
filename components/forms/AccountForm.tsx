"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";
import { PermissionField, PermissionInput, PermissionFormSection } from "./PermissionField";
import { useAuth } from "@/hooks/useAuth";

interface Account {
  id: string;
  name: string;
  type: string;
  industry: string;
  revenue: number | null;
  employees: number | null;
  owner: string;
  description: string;
  phone: string;
  email: string;
  website: string;
}

interface AccountFormProps {
  account: Account;
  onSave?: (data: Partial<Account>) => void;
}

const ACCOUNT_TYPE_COLORS = {
  OWNER: "bg-green-100 text-green-800",
  OPERATOR: "bg-blue-100 text-blue-800",
  MRO: "bg-purple-100 text-purple-800",
  BROKER: "bg-orange-100 text-orange-800",
  CHARTER_CUSTOMER: "bg-pink-100 text-pink-800",
  VENDOR: "bg-gray-100 text-gray-800",
};

export default function AccountForm({ account, onSave }: AccountFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(account);
  const { canEdit } = useAuth();

  const canEditAccount = canEdit("account");

  const handleSave = () => {
    onSave?.(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(account);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Account Information
            {canEditAccount && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PermissionFormSection
            objectName="account"
            fields={["name", "type", "industry", "revenue", "employees", "owner"]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PermissionField objectName="account" fieldName="name">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Account Name</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="name"
                    readOnlyFallback={<div className="text-sm text-gray-900">{formData.name}</div>}
                  >
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formData.name}</div>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="type">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                  <Badge className={ACCOUNT_TYPE_COLORS[formData.type as keyof typeof ACCOUNT_TYPE_COLORS]}>
                    {formData.type}
                  </Badge>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="industry">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Industry</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="industry"
                    readOnlyFallback={<div className="text-sm text-gray-900">{formData.industry}</div>}
                  >
                    {isEditing ? (
                      <Input
                        value={formData.industry || ""}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formData.industry}</div>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="revenue" hideIfNoAccess>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Annual Revenue</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="revenue"
                    readOnlyFallback={
                      <div className="text-sm text-gray-900">
                        {formData.revenue ? formatCurrency(formData.revenue) : "—"}
                      </div>
                    }
                  >
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.revenue || ""}
                        onChange={(e) => setFormData({...formData, revenue: Number(e.target.value) || null})}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formData.revenue ? formatCurrency(formData.revenue) : "—"}
                      </div>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="employees">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Employees</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="employees"
                    readOnlyFallback={
                      <div className="text-sm text-gray-900">{formData.employees?.toLocaleString() || "—"}</div>
                    }
                  >
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.employees || ""}
                        onChange={(e) => setFormData({...formData, employees: Number(e.target.value) || null})}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formData.employees?.toLocaleString() || "—"}</div>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="owner">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Account Owner</label>
                  <div className="text-sm text-gray-900">{formData.owner}</div>
                </div>
              </PermissionField>
            </div>

            <Separator />

            <PermissionField objectName="account" fieldName="description">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <PermissionInput
                  objectName="account"
                  fieldName="description"
                  readOnlyFallback={<div className="text-sm text-gray-900">{formData.description}</div>}
                >
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full"
                      rows={3}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{formData.description}</div>
                  )}
                </PermissionInput>
              </div>
            </PermissionField>
          </PermissionFormSection>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PermissionFormSection
            objectName="account"
            fields={["phone", "email", "website"]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PermissionField objectName="account" fieldName="phone">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="phone"
                    readOnlyFallback={<div className="text-sm text-gray-900">{formData.phone}</div>}
                  >
                    {isEditing ? (
                      <Input
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formData.phone}</div>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="email">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="email"
                    readOnlyFallback={<div className="text-sm text-gray-900">{formData.email}</div>}
                  >
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formData.email}</div>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>

              <PermissionField objectName="account" fieldName="website">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                  <PermissionInput
                    objectName="account"
                    fieldName="website"
                    readOnlyFallback={
                      <a
                        href={`https://${formData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {formData.website}
                      </a>
                    }
                  >
                    {isEditing ? (
                      <Input
                        value={formData.website || ""}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <a
                        href={`https://${formData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {formData.website}
                      </a>
                    )}
                  </PermissionInput>
                </div>
              </PermissionField>
            </div>
          </PermissionFormSection>
        </CardContent>
      </Card>
    </div>
  );
}