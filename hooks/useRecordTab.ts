"use client";

import { useConsole } from '@/components/console/console-context';
import { useRouter } from 'next/navigation';

export function useRecordTab() {
  const { openTab } = useConsole();
  const router = useRouter();

  const openAccountTab = (accountId: string, accountName: string) => {
    const tab = {
      title: accountName,
      objectType: 'account' as const,
      recordId: accountId,
      url: `/records/accounts/${accountId}`,
    };
    openTab(tab);
    router.push(tab.url);
  };

  const openContactTab = (contactId: string, contactName: string) => {
    const tab = {
      title: contactName,
      objectType: 'contact' as const,
      recordId: contactId,
      url: `/records/contacts/${contactId}`,
    };
    openTab(tab);
    router.push(tab.url);
  };

  const openOpportunityTab = (opportunityId: string, opportunityName: string) => {
    const tab = {
      title: opportunityName,
      objectType: 'opportunity' as const,
      recordId: opportunityId,
      url: `/records/opportunities/${opportunityId}`,
    };
    openTab(tab);
    router.push(tab.url);
  };

  const openAircraftTab = (aircraftId: string, aircraftName: string) => {
    const tab = {
      title: aircraftName,
      objectType: 'aircraft' as const,
      recordId: aircraftId,
      url: `/records/aircraft/${aircraftId}`,
    };
    openTab(tab);
    router.push(tab.url);
  };

  const openDashboardTab = (dashboardName: string, dashboardUrl: string) => {
    const tab = {
      title: dashboardName,
      objectType: 'dashboard' as const,
      url: dashboardUrl,
    };
    openTab(tab);
    router.push(tab.url);
  };

  const openCustomTab = (title: string, url: string, objectType: 'account' | 'contact' | 'opportunity' | 'aircraft' | 'dashboard' = 'dashboard', recordId?: string) => {
    const tab = {
      title,
      objectType,
      recordId,
      url,
    };
    openTab(tab);
    router.push(tab.url);
  };

  return {
    openAccountTab,
    openContactTab,
    openOpportunityTab,
    openAircraftTab,
    openDashboardTab,
    openCustomTab,
  };
}