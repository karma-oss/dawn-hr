import { createClient } from '@/lib/supabase/server'
import { getStaffWithOrg } from '@/lib/auth'
import { AttendanceClient } from './attendance-client'

export default async function AttendancePage() {
  const staff = await getStaffWithOrg()
  const supabase = await createClient()
  const orgId = staff.organization_id

  const today = new Date().toISOString().split('T')[0]

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', orgId)
    .order('name')

  const { data: todayLogs } = await supabase
    .from('attendance_logs')
    .select('*, employees(*)')
    .eq('date', today)
    .order('clock_in', { ascending: false })

  // filter to only this org's employees
  const orgLogs = (todayLogs ?? []).filter(
    (log: Record<string, unknown>) => {
      const emp = log.employees as Record<string, unknown> | null
      return emp && emp.organization_id === orgId
    }
  )

  return (
    <AttendanceClient
      employees={employees ?? []}
      todayLogs={orgLogs}
      organizationId={orgId}
    />
  )
}
