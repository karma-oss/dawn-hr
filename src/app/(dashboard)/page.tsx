import { createClient } from '@/lib/supabase/server'
import { getStaffWithOrg } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const staff = await getStaffWithOrg()
  const supabase = await createClient()
  const orgId = staff.organization_id

  const today = new Date().toISOString().split('T')[0]

  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  const { count: attendanceCount } = await supabase
    .from('attendance_logs')
    .select('*, employees!inner(*)', { count: 'exact', head: true })
    .eq('employees.organization_id', orgId)
    .eq('date', today)

  const { count: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*, employees!inner(*)', { count: 'exact', head: true })
    .eq('employees.organization_id', orgId)
    .eq('status', 'pending')

  return (
    <div className="space-y-6" data-karma-context="hr-dashboard" data-karma-entity="dashboard">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-karma-test-id="employee-count-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">従業員数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employeeCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">登録済み従業員</p>
          </CardContent>
        </Card>

        <Card data-karma-test-id="attendance-count-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本日の出勤</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendanceCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">出勤記録</p>
          </CardContent>
        </Card>

        <Card data-karma-test-id="pending-leaves-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">休暇申請（未承認）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingLeaves ?? 0}</div>
            <p className="text-xs text-muted-foreground">承認待ち</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
