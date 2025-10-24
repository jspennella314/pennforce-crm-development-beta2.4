"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, StickyNote, LayoutPanelLeft } from "lucide-react";
import LogActivitySheet from "@/components/activities/LogActivitySheet";
import NewTaskDrawer from "@/components/tasks/NewTaskDrawer";

export default function UtilityBar() {
  const [openActivity, setOpenActivity] = useState(false);
  const [openTask, setOpenTask] = useState(false);

  return (
    <div className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center gap-3 p-2">
        <Button variant="secondary" onClick={() => setOpenActivity(true)}>
          <StickyNote className="mr-2 h-4 w-4" /> Log Activity
        </Button>
        <Button variant="secondary" onClick={() => setOpenTask(true)}>
          <ClipboardList className="mr-2 h-4 w-4" /> New Task
        </Button>
        <Button variant="outline" onClick={() => document.getElementById("kanban-toggle")?.click()}>
          <LayoutPanelLeft className="mr-2 h-4 w-4" /> Kanban
        </Button>
      </div>
      <LogActivitySheet open={openActivity} onOpenChange={setOpenActivity} />
      <NewTaskDrawer open={openTask} onOpenChange={setOpenTask} />
    </div>
  );
}
