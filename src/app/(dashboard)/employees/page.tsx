import { createClient } from '@/lib/supabase/server'
import { getStaffWithOrg } from '@/lib/auth'
import { EmployeesClient } from './employees-client'

export default async function EmployeesPage() {
  const staff = await getStaffWithOrg()
  const supabase = await createClient()

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', staff.organization_id)
    .order('created_at', { ascending: false })

  return (
    <EmployeesClient
      employees={employees ?? []}
      organizationId={staff.organization_id}
    />
  )
}
