"use client";
import { useState, useTransition } from "react";
import { updateOpportunity } from "../actions";

interface HighlightsProps {
  opp: {
    id: string;
    stage: string;
    amount: number | null;
    closeDate: Date | string | null;
  };
}

export default function Highlights({ opp }: HighlightsProps) {
  const [editing, setEditing] = useState<null | "stage" | "amount" | "closeDate">(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 md:grid-cols-3 p-4 bg-white rounded-lg border">
      {/* Stage */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase text-muted-foreground">Stage</span>
        {editing === "stage" ? (
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateOpportunity(formData);
                setEditing(null);
              });
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={opp.id} />
            <select
              name="stage"
              defaultValue={opp.stage}
              className="border rounded px-2 py-1 text-sm flex-1"
            >
              <option value="PROSPECT">Prospecting</option>
              <option value="QUALIFY">Qualification</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Closed Won</option>
              <option value="LOST">Closed Lost</option>
            </select>
            <button
              type="submit"
              className="px-2 py-1 rounded-md border text-sm bg-blue-600 text-white hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm underline text-gray-600"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">{opp.stage}</span>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setEditing("stage")}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase text-muted-foreground">Amount</span>
        {editing === "amount" ? (
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateOpportunity(formData);
                setEditing(null);
              });
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={opp.id} />
            <input
              name="amount"
              type="number"
              step="0.01"
              defaultValue={opp.amount ?? 0}
              className="border rounded px-2 py-1 text-sm w-32"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded-md border text-sm bg-blue-600 text-white hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm underline text-gray-600"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">${opp.amount?.toLocaleString() ?? 0}</span>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setEditing("amount")}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Close Date */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase text-muted-foreground">Close Date</span>
        {editing === "closeDate" ? (
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateOpportunity(formData);
                setEditing(null);
              });
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={opp.id} />
            <input
              name="closeDate"
              type="date"
              defaultValue={
                opp.closeDate
                  ? new Date(opp.closeDate).toISOString().slice(0, 10)
                  : ""
              }
              className="border rounded px-2 py-1 text-sm"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded-md border text-sm bg-blue-600 text-white hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm underline text-gray-600"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {opp.closeDate
                ? new Date(opp.closeDate).toLocaleDateString()
                : "-"}
            </span>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setEditing("closeDate")}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
