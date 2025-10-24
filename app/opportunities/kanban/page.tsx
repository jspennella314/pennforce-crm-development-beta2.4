'use client';

import { useState, useEffect, useTransition } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';
import KanbanBoard from '../../components/opportunity/KanbanBoard';
import { updateStage } from '../serverActions';

interface Opportunity {
  id: string;
  name: string;
  amount: string;
  probability: number;
  stage: string;
  kanbanIndex: number;
  account?: { id: string; name: string };
  contact?: { id: string; firstName: string; lastName: string };
  aircraft?: { id: string; make: string; model: string; tailNumber: string };
}

export default function OpportunitiesKanbanPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelineFilter, setPipelineFilter] = useState('Sales');
  const [isPending, startTransition] = useTransition();

  const stages = [
    { id: 'QUALIFICATION', label: 'Qualification', color: 'bg-gray-100' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'bg-blue-100' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-100' },
    { id: 'WON', label: 'Won', color: 'bg-green-100' },
  ];

  useEffect(() => {
    fetchOpportunities();
  }, [pipelineFilter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pipelineFilter) params.append('pipeline', pipelineFilter);
      // Only show active opportunities (not WON or LOST)
      params.append('excludeStages', 'LOST');

      const response = await fetch(`/api/opportunities?${params}`);
      const data = await response.json();

      // Filter out LOST opportunities and sort by kanbanIndex
      const filtered = data
        .filter((opp: Opportunity) => opp.stage !== 'LOST')
        .sort((a: Opportunity, b: Opportunity) => a.kanbanIndex - b.kanbanIndex);

      setOpportunities(filtered);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter((opp) => opp.stage === stage);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const oppId = draggableId;
    const newStage = destination.droppableId;
    const newPosition = destination.index;

    // Save previous state for rollback
    const previousOpportunities = [...opportunities];

    // Optimistic update
    const updatedOpportunities = [...opportunities];
    const oppIndex = updatedOpportunities.findIndex((opp) => opp.id === oppId);

    if (oppIndex === -1) return;

    // Remove from old position
    const [movedOpp] = updatedOpportunities.splice(oppIndex, 1);

    // Update stage
    movedOpp.stage = newStage;

    // Find opportunities in the destination stage
    const stageOpps = updatedOpportunities.filter(o => o.stage === newStage);

    // Calculate insert position
    const insertAt = Math.min(newPosition, stageOpps.length);

    // Find the actual array index to insert at
    const firstStageOppIndex = updatedOpportunities.findIndex(o => o.stage === newStage);
    const insertIndex = firstStageOppIndex >= 0
      ? firstStageOppIndex + insertAt
      : updatedOpportunities.length;

    // Insert at new position
    updatedOpportunities.splice(insertIndex, 0, movedOpp);

    // Update positions for all opportunities in the destination stage
    updatedOpportunities
      .filter(o => o.stage === newStage)
      .forEach((opp, idx) => {
        opp.kanbanIndex = idx;
      });

    setOpportunities(updatedOpportunities);

    // Persist to backend with server action
    startTransition(async () => {
      try {
        const result = await updateStage({
          id: oppId,
          stage: newStage,
          position: newPosition
        });

        if (!result.ok) {
          // WIP limit hit - show error and revert
          console.error('Failed to update opportunity:', result.error);
          alert(result.error || 'Failed to move opportunity');
          setOpportunities(previousOpportunities);
        }
      } catch (error) {
        console.error('Error updating opportunity:', error);
        // Revert on error
        setOpportunities(previousOpportunities);
      }
    });
  };

  const prepareKanbanColumns = () => {
    return stages.map(stage => ({
      id: stage.id,
      title: stage.label,
      opportunities: getOpportunitiesByStage(stage.id).map(opp => ({
        id: opp.id,
        name: opp.name,
        stage: opp.stage,
        amount: parseFloat(opp.amount),
        probability: opp.probability,
        closeDate: undefined, // Add if available in data
        account: opp.account,
      })),
    }));
  };

  const pipelines = ['Sales', 'Management', 'Charter', 'Maintenance'];

  const calculateStageValue = (stage: string) => {
    const stageOpps = getOpportunitiesByStage(stage);
    return stageOpps.reduce((sum, opp) => sum + parseFloat(opp.amount), 0);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading kanban board...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Opportunities Kanban</h1>
              <p className="text-sm text-gray-600 mt-1">{opportunities.length} active opportunities</p>
            </div>
            <Link
              href="/opportunities/new"
              className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
            >
              + New Opportunity
            </Link>
          </div>
        </div>

        {/* Pipeline Filter */}
        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Pipeline:</label>
            <div className="flex gap-2">
              {pipelines.map((pipeline) => (
                <button
                  key={pipeline}
                  onClick={() => setPipelineFilter(pipeline)}
                  className={`
                    px-3 py-1.5 rounded text-sm font-medium transition-colors
                    ${pipelineFilter === pipeline
                      ? 'bg-[#0176d3] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {pipeline}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden bg-[#f3f3f3]">
          <KanbanBoard
            columns={prepareKanbanColumns()}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
    </AppLayout>
  );
}
