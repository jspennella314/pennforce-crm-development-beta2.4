"use client";
import { useEffect, useState } from "react";

export function ListViewBar({ objectName, onApply }:{
  objectName: string; onApply:(filters:any[])=>void;
}) {
  const [views, setViews] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/listviews?object=${objectName}`).then(r=>r.json()).then(setViews);
  }, [objectName]);

  function addFilter(){ setFilters(f=>[...f,{field:"name",op:"contains",value:""}]); }
  async function saveView(){
    const name = prompt("Save as view name?");
    if (!name) return;
    await fetch("/api/listviews",{method:"POST",headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({ objectName, name, filtersJson: filters })});
    const v = await (await fetch(`/api/listviews?object=${objectName}`)).json();
    setViews(v);
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <select className="rounded border px-2 py-1" onChange={(e)=>{
        const v = views.find(x=>x.id===e.target.value); if (v) onApply(v.filtersJson);
      }}>
        <option>-- Select view --</option>
        {views.map(v=> <option key={v.id} value={v.id}>{v.isPinned ? "📌 " : ""}{v.name}</option>)}
      </select>
      <button className="rounded border px-2 py-1" onClick={addFilter}>+ Filter</button>
      <button className="rounded border px-2 py-1" onClick={saveView}>Save as view</button>
      <div className="ml-auto text-xs text-muted-foreground">List Views</div>
    </div>
  );
}