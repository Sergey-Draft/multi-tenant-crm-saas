/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import "../../../app/globals.css";
import useGetLeads from "../hooks/use-get-leads";
import LeadCard from "./lead-card";
import useChangeLeadSytatus from "../hooks/use-change-lead-status";
import { LeadDetailModal } from "./lead-detail-modal";
import SimpleDialog from "@/components/confirmationModal/simple-modal";
import { LEAD_STATUS_VALUES } from "@/lib/options";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LeadStatus = keyof typeof LEAD_STATUS_VALUES

const LeadsKanban = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const leadIdFromQuery = searchParams.get("leadId");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [highlightedLeadId, setHighlightedLeadId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: LeadStatus;
  } | null>(null);

  const { data, isLoading } = useGetLeads();
  const mutation = useChangeLeadSytatus();

  useEffect(() => {
    if (!leadIdFromQuery || !data?.length) return;
    const target = data.find((lead: any) => lead.id === leadIdFromQuery);
    if (!target) return;

    setSelectedLead(target);
    setHighlightedLeadId(target.id);
    router.replace(pathname);

    const timer = window.setTimeout(() => setHighlightedLeadId(null), 3000);
    return () => window.clearTimeout(timer);
  }, [leadIdFromQuery, data, pathname, router]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    const id = e.dataTransfer.getData("id");
    setPendingAction({ id, status });
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!pendingAction) return;
  
    mutation.mutate({
      id: pendingAction.id,
      data: { status: pendingAction.status as LeadStatus },
    });
  
    setPendingAction(null);
    setOpen(false);
  };

  const getDescription = () => {
    if (!pendingAction) {
      return "Вы действительно хотите изменить статус лида?"
    }
    
    const statusText = LEAD_STATUS_VALUES[pendingAction.status]
    return `Вы действительно хотите изменить статус лида на "${statusText}"?`
  }

  const COLUMNS: { status: string; label: string; colorClass: string }[] = [
    { status: "NEW", label: "Новый", colorClass: "bg-kanban-new" },
    {
      status: "IN_PROGRESS",
      label: "В работе",
      colorClass: "bg-kanban-progress",
    },
    { status: "DONE", label: "Обработан", colorClass: "bg-kanban-won" },
    { status: "REJECTED", label: "Отказ/Отмена", colorClass: "bg-kanban-lost" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin width-[1440px]">
      {COLUMNS.map((item: any) => (
        <div
          className="flex flex-col min-w-[260px] w-[20vw] max-w-[320px] shrink-0"
          key={item.status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, item.status)}
        >
          <div className="flex items-center gap-2 mb-3 ml-2">
            <div className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
            <h3 className="text-lx font-semibold text-foreground">
              {item.label.toUpperCase()}
            </h3>
            <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-0.5">
              {data?.filter((data: any) => data.status === item.status).length}
            </span>
          </div>

          <div className="flex-1 space-y-2 p-2 rounded-lg transition-colors min-h-[80vh] bg-muted/60">
            {data
              ?.filter((data: any) => data.status === item.status)
              ?.map((data: any) => (
                <div
                  key={data?.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, data?.id)}
                >
                  <LeadCard
                    lead={data}
                    onOpen={setSelectedLead}
                    highlighted={highlightedLeadId === data.id}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
      <SimpleDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Подтвердите действие"
        description={getDescription()}
        onSuccess={handleConfirm}
      />
    </div>
  );
};

export default LeadsKanban;
