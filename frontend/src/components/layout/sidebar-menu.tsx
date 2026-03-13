import {
    Home,
    Users,
    ClipboardList,
    CheckSquare,
    UserCircle
   } from "lucide-react"
   
   export const menu = [
    {
     title: "Dashboard",
     href: "/dashboard",
     icon: Home,
    },
    {
     title: "Clients",
     href: "/dashboard/clients",
     icon: UserCircle,
    },
    {
     title: "Leads",
     href: "/dashboard/leads",
     icon: ClipboardList,
    },
    {
     title: "Tasks",
     href: "/dashboard/tasks",
     icon: CheckSquare,
    },
    {
     title: "Users",
     href: "/dashboard/users",
     icon: Users,
    },
   ]