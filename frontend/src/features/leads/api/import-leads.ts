import { api } from "@/lib/api-client"

export interface  jobTypes {
  name: string,
  leadIds: number[]
} 

export const startImportLeadsDemo = async (job:jobTypes) => {
  const res = await api.post('/imports/jobs', job )
  return res.data
}