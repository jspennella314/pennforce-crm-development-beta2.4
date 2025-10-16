'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';

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

  const handleDragEnd = async (result: any) => {
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
    const oldStage = source.droppableId;

    // Optimistic update
    const updatedOpportunities = [...opportunities];
    const oppIndex = updatedOpportunities.findIndex((opp) => opp.id === oppId);

    if (oppIndex === -1) return;

    // Remove from old position
    const [movedOpp] = updatedOpportunities.splice(oppIndex, 1);

    // Update stage
    movedOpp.stage = newStage;

    // Find the new position in the array
    const destinationOpps = updatedOpportunities.filter(opp => opp.stage === newStage);
    const insertIndex = updatedOpportunities.findIndex(opp => opp.stage === newStage);
    const finalIndex = insertIndex + destination.index;

    // Insert at new position
    updatedOpportunities.splice(finalIndex >= 0 ? finalIndex : updatedOpportunities.length, 0, movedOpp);

    // Update kanban indices for all opportunities in the affected stage
    updatedOpportunities.forEach((opp, idx) => {
      opp.kanbanIndex = idx;
    });

    setOpportunities(updatedOpportunities);

    // Persist to backend
    try {
      const response = await fetch(`/api/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          kanbanIndex: destination.index,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update opportunity');
      }

      // Refresh to get accurate indices from server
      await fetchOpportunities();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      // Revert on error
      await fetchOpportunities();
    }
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
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Opportunities Kanban</h1>
              <p className="text-gray-600 mt-1">{opportunities.length} active opportunities</p>
            </div>
            <Link
              href="/opportunities/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Opportunity
            </Link>
          </div>
        </div>

        {/* Pipeline Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Pipeline:</label>
            <div className="flex gap-2">
              {pipelines.map((pipeline) => (
                <button
                  key={pipeline}
                  onClick={() => setPipelineFilter(pipeline)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${pipelineFilter === pipeline
                      ? 'bg-blue-600 text-white'
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {stages.map((stage) => {
              const stageOpps = getOpportunitiesByStage(stage.id);
              const stageValue = calculateStageValue(stage.id);

              return (
                <div key={stage.id} className="flex flex-col">
                  {/* Column Header */}
                  <div className={`${stage.color} rounded-t-lg p-4 border-b-4 border-gray-300`}>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">{stage.label}</h2>
                      <span className="bg-white px-2 py-1 rounded text-sm font-medium text-gray-700">
                        {stageOpps.length}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      ${(stageValue / 1000000).toFixed(1)}M
                    </div>
                  </div>

                  {/* Droppable Column */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          flex-1 p-2 bg-gray-50 rounded-b-lg min-h-[500px]
                          ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
                        `}
                      >
                        {stageOpps.map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  bg-white rounded-lg shadow p-4 mb-3 cursor-move
                                  hover:shadow-md transition-shadow
                                  ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''}
                                `}
                              >
                                <Link href={`/opportunities/${opp.id}`} className="block">
                                  <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600">
                                    {opp.name}
                                  </h3>

                                  {opp.account && (
                                    <div className="text-sm text-gray-600 mb-2">
                                      {opp.account.name}
                                    </div>
                                  )}

                                  {opp.aircraft && (
                                    <div className="text-xs text-gray-500 mb-2">
                                      {opp.aircraft.make} {opp.aircraft.model}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-sm font-semibold text-gray-900">
                                      ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {opp.probability}% probability
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {stageOpps.length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            No opportunities
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {/* Summary Stats */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Summary</h3>
          <div className="grid grid-cols-4 gap-6">
            {stages.map((stage) => {
              const stageOpps = getOpportunitiesByStage(stage.id);
              const stageValue = calculateStageValue(stage.id);
              const weightedValue = stageOpps.reduce(
                (sum, opp) => sum + (parseFloat(opp.amount) * opp.probability / 100),
                0
              );

              return (
                <div key={stage.id} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ${(weightedValue / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stage.label} (Weighted)
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stageOpps.length} opp{stageOpps.length !== 1 ? 's' : ''} • ${(stageValue / 1000000).toFixed(1)}M total
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
