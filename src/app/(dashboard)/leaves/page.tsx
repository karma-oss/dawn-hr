import { createClient } from '@/lib/supabase/server'
import { getStaffWithOrg } from '@/lib/auth'
import { LeavesClient } from './leaves-client'

export default async function LeavesPage() {
  const staff = await getStaffWithOrg()
  const supabase = await createClient()
  const orgId = staff.organization_id

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', orgId)
    .order('name')

  const { data: leaves } = await supabase
    .from('leave_requests')
    .select('*, employees(*)')
    .order('start_date', { ascending: false })

  // filter to org employees only
  const orgLeaves = (leaves ?? []).filter(
    (leave: Record<string, unknown>) => {
      const emp = leave.employees as Record<string, unknown> | null
      return emp && emp.organization_id === orgId
    }
  )

  return (
    <LeavesClient
      employees={employees ?? []}
      leaves={orgLeaves}
    />
  )
}
