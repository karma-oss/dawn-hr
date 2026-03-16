import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, employees(*)')
    .eq('date', today)
    .order('clock_in', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orgLogs = (data ?? []).filter(
    (log) => {
      const emp = log.employees as Record<string, unknown> | null
      return emp && emp.organization_id === staff.organization_id
    }
  )

  return NextResponse.json(orgLogs)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('attendance_logs')
    .insert({
      employee_id: body.employee_id,
      date: today,
      clock_in: now,
      status: 'present',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
