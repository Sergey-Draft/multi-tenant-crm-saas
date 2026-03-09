/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/get-users";

export default function UsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });


  console.log('data', data)


  if (isLoading) {
    return <div>Loading users...</div>
  }

  if (error) {
    return <div>Error loading users</div>
  }


  return (
    <ul>
        {data.map ((user: any) => {
           return <li key={user.id}>{user.email}</li>
        } )}
    </ul>
  )

}
