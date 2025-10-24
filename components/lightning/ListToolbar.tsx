"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Save } from "lucide-react";

export default function ListToolbar({
  initialName = "All",
  onSearch,
  onSave,
  onPin,
}: {
  initialName?: string;
  onSearch: (q: string) => void | Promise<void>;
  onSave: (name: string) => void | Promise<void>;
  onPin: () => void | Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [name, setName] = useState(initialName);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-background p-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search or filter…"
        className="w-64"
      />
      <Button variant="outline" onClick={() => onSearch(q)}>Apply</Button>
      <div className="ml-auto flex items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="w-44" />
        <Button onClick={() => onSave(name)}><Save className="mr-2 h-4 w-4" />Save</Button>
        <Button variant="secondary" onClick={onPin}><Star className="mr-2 h-4 w-4" />Pin</Button>
      </div>
    </div>
  );
}
