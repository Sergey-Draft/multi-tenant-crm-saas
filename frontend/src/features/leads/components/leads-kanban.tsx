"use client";

import React, { useState } from "react";
// import PrizeDetailsDialog from "../Dialogs/PrizeDetailsDialog";
// import { drawalApi } from "../../api";
// import KanbanCard from "../KanbanCard/KanbanCard";
// import { showErrorToast, showSuccessToast } from "../CustomToast/CustomToast";
import useGetLeads from "../hooks/use-get-leads";
import LeadCard from "./lead-card";
import useChangeLeadSytatus from "../hooks/use-change-lead-status";

type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED";

const LeadsKanban = () => {
  const [open, setOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const { data, isLoading } = useGetLeads();
  const mutation = useChangeLeadSytatus()
  console.log('Data', data)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    const id = e.dataTransfer.getData("id");
    const confirmChange = window.confirm(
      `Are you sure you want to move this withdrawal to the "${status}" column?`
    );
    console.log("confirmChange", confirmChange);
    if(confirmChange) {
        mutation.mutate({ 
            id, 
            data: { status } 
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

  return (
    <div className="flex text-center overflow-auto w-full">
      {kanbanColumns.map((status: any) => (
        <div
          className="w-[25%] shadow divide-gray-400 rounded my-3 p-2 h-auto"
          key={status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h3>{status}</h3>
          {data?.filter((data: any) => data.status === status)
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
