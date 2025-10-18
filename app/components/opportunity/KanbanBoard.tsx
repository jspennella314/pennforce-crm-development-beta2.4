'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DollarSign, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  amount: number;
  probability?: number;
  closeDate?: Date | string;
  account?: {
    id: string;
    name: string;
  };
}

interface KanbanColumn {
  id: string;
  title: string;
  opportunities: Opportunity[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onDragEnd: (result: DropResult) => void;
}

export default function KanbanBoard({ columns, onDragEnd }: KanbanBoardProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTotalAmount = (opportunities: Opportunity[]) => {
    return opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-6 h-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-white rounded border border-gray-200 flex flex-col"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {column.title}
                </h3>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {column.opportunities.length}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Total: <span className="font-semibold text-gray-900">{formatCurrency(getTotalAmount(column.opportunities))}</span>
              </div>
            </div>

            {/* Column Content */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 space-y-3 overflow-y-auto ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                  style={{ minHeight: '200px' }}
                >
                  {column.opportunities.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">
                      No opportunities
                    </div>
                  ) : (
                    column.opportunities.map((opportunity, index) => (
                      <Draggable
                        key={opportunity.id}
                        draggableId={opportunity.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow cursor-move ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-[#0176d3]' : ''
                            }`}
                          >
                            {/* Opportunity Name */}
                            <Link
                              href={`/opportunities/${opportunity.id}`}
                              className="text-sm font-medium text-[#0176d3] hover:underline block mb-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {opportunity.name}
                            </Link>

                            {/* Account */}
                            {opportunity.account && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                <Building2 className="w-3 h-3" />
                                <span className="truncate">{opportunity.account.name}</span>
                              </div>
                            )}

                            {/* Amount and Probability */}
                            <div className="flex items-center justify-between text-xs mb-2">
                              <div className="flex items-center gap-1 font-semibold text-gray-900">
                                <DollarSign className="w-3 h-3" />
                                {formatCurrency(opportunity.amount)}
                              </div>
                              {opportunity.probability !== undefined && (
                                <div className="text-gray-600">
                                  {opportunity.probability}%
                                </div>
                              )}
                            </div>

                            {/* Close Date */}
                            {opportunity.closeDate && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(opportunity.closeDate)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
