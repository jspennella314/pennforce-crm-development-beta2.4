"use client";
import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewTaskDrawer({ open, onOpenChange }:{
  open:boolean; onOpenChange:(v:boolean)=>void;
}) {
  const [title, setTitle] = React.useState("");
  const [due, setDue] = React.useState("");
  async function createTask(){
    await fetch("/api/tasks",{ method:"POST", body: JSON.stringify({ title, dueDate: due }) });
    onOpenChange(false); setTitle(""); setDue("");
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>New Task</DrawerTitle></DrawerHeader>
        <div className="space-y-3 p-4">
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" />
          <Input type="date" value={due} onChange={e=>setDue(e.target.value)} />
          <div className="flex justify-end"><Button onClick={createTask}>Create</Button></div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
