import React from 'react'
import { Kanban } from "@/components/ui/kanban";
import ProtectedRoute from "@/components/protected-route";

const page = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full justify-center items-center">
      <Kanban />
    </div>
    </ProtectedRoute>
    
  )
}

export default page