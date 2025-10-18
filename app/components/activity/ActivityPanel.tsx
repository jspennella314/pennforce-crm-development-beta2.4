'use client';

import { useState } from 'react';
import { Phone, Calendar, CheckSquare, MoreHorizontal } from 'lucide-react';

type ActivityTab = 'task' | 'call' | 'event' | 'more';

interface ActivityPanelProps {
  recordId: string;
  recordType: 'contact' | 'account' | 'opportunity';
}

export default function ActivityPanel({ recordId, recordType }: ActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('task');
  const [taskText, setTaskText] = useState('');
  const [callSubject, setCallSubject] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [eventSubject, setEventSubject] = useState('');

  const handleCreateTask = async () => {
    if (!taskText.trim()) return;

    try {
      const result = await fetch('/api/activity/create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: recordId,
          subject: taskText,
        }),
      });

      if (result.ok) {
        setTaskText('');
        // Refresh the page to show the new task
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleLogCall = async () => {
    if (!callSubject.trim()) return;

    try {
      const result = await fetch('/api/activity/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: recordId,
          subject: callSubject,
          notes: callNotes,
        }),
      });

      if (result.ok) {
        setCallSubject('');
        setCallNotes('');
        // Refresh the page to show the logged call
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to log call:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventSubject.trim()) return;

    try {
      const result = await fetch('/api/activity/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: recordId,
          subject: eventSubject,
        }),
      });

      if (result.ok) {
        setEventSubject('');
        // Refresh the page to show the new event
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <div className="bg-white rounded border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('task')}
            className={`
              flex items-center gap-2 py-2 text-sm border-b-2 transition-colors
              ${activeTab === 'task'
                ? 'text-[#0176d3] border-[#0176d3] font-medium'
                : 'text-gray-600 border-transparent hover:text-gray-900'
              }
            `}
          >
            <CheckSquare className="w-4 h-4" />
            New Task
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`
              flex items-center gap-2 py-2 text-sm border-b-2 transition-colors
              ${activeTab === 'call'
                ? 'text-[#0176d3] border-[#0176d3] font-medium'
                : 'text-gray-600 border-transparent hover:text-gray-900'
              }
            `}
          >
            <Phone className="w-4 h-4" />
            Log a Call
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`
              flex items-center gap-2 py-2 text-sm border-b-2 transition-colors
              ${activeTab === 'event'
                ? 'text-[#0176d3] border-[#0176d3] font-medium'
                : 'text-gray-600 border-transparent hover:text-gray-900'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            New Event
          </button>
          <button
            onClick={() => setActiveTab('more')}
            className={`
              flex items-center gap-2 py-2 text-sm border-b-2 transition-colors
              ${activeTab === 'more'
                ? 'text-[#0176d3] border-[#0176d3] font-medium'
                : 'text-gray-600 border-transparent hover:text-gray-900'
              }
            `}
          >
            <MoreHorizontal className="w-4 h-4" />
            More
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* New Task Tab */}
        {activeTab === 'task' && (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Create a task..."
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateTask();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
              />
            </div>
            <button
              onClick={handleCreateTask}
              disabled={!taskText.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[#0176d3] rounded hover:bg-[#014486] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Task
            </button>
          </div>
        )}

        {/* Log a Call Tab */}
        {activeTab === 'call' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Call subject..."
                value={callSubject}
                onChange={(e) => setCallSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                placeholder="Call notes..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] resize-none"
              />
            </div>
            <button
              onClick={handleLogCall}
              disabled={!callSubject.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[#0176d3] rounded hover:bg-[#014486] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Log Call
            </button>
          </div>
        )}

        {/* New Event Tab */}
        {activeTab === 'event' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Event subject..."
                value={eventSubject}
                onChange={(e) => setEventSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateEvent();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
              />
            </div>
            <button
              onClick={handleCreateEvent}
              disabled={!eventSubject.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[#0176d3] rounded hover:bg-[#014486] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Event
            </button>
          </div>
        )}

        {/* More Tab */}
        {activeTab === 'more' && (
          <div className="text-sm text-gray-600">
            Additional activity options coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
