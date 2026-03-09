/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useUsers from "../hooks/use-users";

export default function UsersList() {
  const { data, isLoading, error } = useUsers();

  console.log("data", data);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error loading users</div>;
  }

  return (
    <ul>
      {data.map((user: any) => {
        return <li key={user.id}>{user.email}{"  "}{user.role}</li>;
      })}
    </ul>
  );
}
