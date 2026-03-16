import { Badge } from "@/components/ui/badge";




const statusBorderColors = {
    NEW: 'border-l-[hsl(var(--kanban-new))]',
    IN_PROGRESS: 'border-l-[hsl(var(--kanban-progress))]',
    DONE: 'border-l-[hsl(var(--kanban-won))]',
    REJECTED: 'border-l-[hsl(var(--kanban-lost))]'
  }


const LeadCard = ({ lead }:any) => {

    console.log('LEAD', lead)
    return (
      <div   className={`
        h-[220px]
        bg-white 
        rounded-lg 
        shadow-md 
        p-[14px] 
        mb-4 
        transition-transform 
        duration-300 
        ease-in-out 
        cursor-pointer
        border-l-4
         ${statusBorderColors[lead?.status as keyof typeof statusBorderColors] || ''}
        hover:-translate-y-1
        hover:shadow-lg
      `}>
        <div className="flex-col">
          <div className="text-base font-bold mb-2 capitalize">{lead?.title}</div>
          <div className="text-base mb-[6px] text-[#555]">Description: {lead?.description}</div>
          <div className="text-base mb-[6px] text-[#555]">
            STATUS: {lead?.status}
          </div>
          <div className="text-base mb-[6px] text-[#555]">
            {lead?.dateDue}
          </div>
          <div className="text-base mb-[6px] text-[#555]">
            {lead?.dateDue}
          </div>
          {lead?.Task.length > 0 && (
          <Badge className="bg-blue-100 text-blue-700"  >
            задачи: {lead?.Task.length }
          </Badge>
          )}

        </div>
      </div>
    );

}

export default LeadCard;