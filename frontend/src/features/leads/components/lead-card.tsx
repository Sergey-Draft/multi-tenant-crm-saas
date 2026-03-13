



const statusBorderColors = {
    NEW: 'border-l-[#f44336]',
    IN_PROGRESS: 'border-l-[#2196f3]',
    DONE: 'border-l-[#3ca712]',
    REJECTED: 'border-l-[#999999]'
  }


const LeadCard = ({ lead }:any) => {

    console.log('LEAD', lead)
    return (
      <div   className={`
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
        </div>
      </div>
    );

}

export default LeadCard;