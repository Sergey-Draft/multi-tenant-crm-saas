import { useQuery } from "@tanstack/react-query";
import { getClients } from "../api/get-clients";


export default function UseClients () {
    return useQuery({
        queryKey: ['clients'],
        queryFn: getClients
    })
}