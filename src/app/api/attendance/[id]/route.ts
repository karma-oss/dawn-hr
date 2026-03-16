import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (body.action === 'clock_out') {
    const now = new Date().toISOString()

    // Get the log to calculate work minutes
    const { data: log } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('id', id)
      .single()

    let workMinutes: number | null = null
    if (log?.clock_in) {
      const clockIn = new Date(log.clock_in)
      const clockOut = new Date(now)
      const totalMinutes = Math.round((clockOut.getTime() - clockIn.getTime()) / 60000)
      workMinutes = Math.max(0, totalMinutes - (log.break_minutes ?? 0))
    }

    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out: now,
        work_minutes: workMinutes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('attendance_logs')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
