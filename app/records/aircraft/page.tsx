// app/records/aircraft/page.tsx
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AircraftPage() {
  return <AircraftListClient />;
}

function AircraftListClient() {
  const { data, error } = useSWR("/api/aircraft", fetcher);

  if (error) return <div className="p-6">Error loading aircraft.</div>;
  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Aircraft</h1>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Tail #</th>
              <th className="p-2">Make/Model</th>
              <th className="p-2">Year</th>
              <th className="p-2">Status</th>
              <th className="p-2">Location</th>
              <th className="p-2">TT (hrs)</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Operator</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono">{a.tailNumber ?? "—"}</td>
                <td className="p-2">
                  {a.make} {a.model}
                  {a.variant ? ` ${a.variant}` : ""}
                </td>
                <td className="p-2">{a.year ?? "—"}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.locationIcao ?? "—"}</td>
                <td className="p-2">{a.totalTimeHrs ?? "—"}</td>
                <td className="p-2">{a.ownerAccount?.name ?? "—"}</td>
                <td className="p-2">{a.operatorAccount?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}