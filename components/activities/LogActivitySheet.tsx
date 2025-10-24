"use client";
import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function LogActivitySheet({ open, onOpenChange }:{
  open:boolean; onOpenChange:(v:boolean)=>void;
}) {
  const [type, setType] = React.useState<"CALL"|"EMAIL"|"NOTE">("NOTE");
  const [body, setBody] = React.useState("");
  async function submit() {
    await fetch("/api/activities", { method:"POST", body: JSON.stringify({ type, body }) });
    onOpenChange(false); setBody("");
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh]">
        <SheetHeader><SheetTitle>Log Activity</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            {(["NOTE","CALL","EMAIL"] as const).map(t => (
              <Button key={t} variant={t===type?"default":"outline"} onClick={()=>setType(t)}>{t}</Button>
            ))}
          </div>
          <Textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Add notes…" />
          <div className="flex justify-end"><Button onClick={submit}>Save</Button></div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
