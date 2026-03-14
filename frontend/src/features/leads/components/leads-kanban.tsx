"use client";

import React, { useState } from "react";
// import PrizeDetailsDialog from "../Dialogs/PrizeDetailsDialog";
// import { drawalApi } from "../../api";
// import KanbanCard from "../KanbanCard/KanbanCard";
// import { showErrorToast, showSuccessToast } from "../CustomToast/CustomToast";
import "../../../app/globals.css";
import useGetLeads from "../hooks/use-get-leads";
import LeadCard from "./lead-card";
import useChangeLeadSytatus from "../hooks/use-change-lead-status";

type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED";

const LeadsKanban = () => {
  const [open, setOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const { data, isLoading } = useGetLeads();
  const mutation = useChangeLeadSytatus();
  console.log("Data", data);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    const id = e.dataTransfer.getData("id");
    const confirmChange = window.confirm(
      `Are you sure you want to move this withdrawal to the "${status}" column?`
    );
    console.log("confirmChange", confirmChange);
    if (confirmChange) {
      mutation.mutate({
        id,
        data: { status },
      });
    }
    //     if (confirmChange) {
    //       drawalApi
    //         .updateStatus(status, id)
    //         .then((data : any) => {
    //           if (data.status === 200) {
    //             const updatedUsers = data.map((item) => {
    //               if (item.id === parseInt(id, 10)) {
    //                 item.status = status;
    //               }
    //               return item;
    //             });
    //             setWithdrawal(updatedUsers);
    //             showSuccessToast(`Status changed to ${status}`);
    //           } else {
    //             throw new Error(`Unexpected response status: ${data.status}`);
    //           }
    //         })
    //         .catch((error: any) => {
    //           console.error("Error updating status:", error);
    //           showErrorToast(
    //             `Status was not changed due to an error: ${error.response.data.detail || error.message}`
    //           );
    //         });
    //     }
  };

  //   const handleWithdrawalOpen = (withdrawal) => {
  //     setSelectedWithdrawal(withdrawal);
  //     setOpen(true);
  //   };

  //   const handleClose = () => {
  //     setOpen(false);
  //     setSelectedWithdrawal(null);
  //   };

  const kanbanColumns = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];

  const COLUMNS: { status: string; label: string; colorClass: string }[] = [
    { status: "NEW", label: "Новый", colorClass: "bg-kanban-new" },
    { status: "IN_PROGRESS", label: "В работе", colorClass: "bg-kanban-progress" },
    { status: "DONE", label: "Обработан", colorClass: "bg-kanban-won" },
    { status: "REJECTED", label: "Отказ/Отмена", colorClass: "bg-kanban-lost" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin width-[1440px]">
      {COLUMNS.map((item: any) => (
        <div
          className="flex flex-col min-w-[20vw] w-[20vw] shrink-0"
          key={item.status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, item.status)}
        >

          <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
        <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
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
                  onDoubleClick={() => {
                    //   handleWithdrawalOpen(data);
                  }}
                >
                  <LeadCard lead={data} />
                </div>
              ))}
          </div>
        </div>
      ))}
      {/* <PrizeDetailsDialog
        open={open}
        onClose={handleClose}
        withdrawal={selectedWithdrawal}
      /> */}
    </div>
  );
};

export default LeadsKanban;
