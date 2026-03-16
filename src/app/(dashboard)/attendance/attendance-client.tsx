'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Employee {
  id: string
  name: string
  email: string
}

interface AttendanceLog {
  id: string
  employee_id: string
  date: string
  clock_in: string | null
  clock_out: string | null
  break_minutes: number
  work_minutes: number | null
  overtime_minutes: number
  status: string
  notes: string | null
  employees: Employee | null
}

function formatTime(isoString: string | null) {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function AttendanceClient({
  employees,
  todayLogs,
}: {
  employees: Employee[]
  todayLogs: AttendanceLog[]
  organizationId: string
}) {
  const router = useRouter()
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleClockIn() {
    if (!selectedEmployee) return
    setLoading(true)
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: selectedEmployee }),
    })
    setLoading(false)
    setSelectedEmployee('')
    router.refresh()
  }

  async function handleClockOut(logId: string) {
    setLoading(true)
    await fetch(`/api/attendance/${logId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clock_out' }),
    })
    setLoading(false)
    router.refresh()
  }

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="space-y-6" data-karma-context="attendance" data-karma-entity="attendance">
      <h1 className="text-2xl font-bold">勤怠管理</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">出勤打刻 - {today}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Select value={selectedEmployee} onValueChange={(v) => setSelectedEmployee(v ?? '')}>
                <SelectTrigger className="w-full" data-karma-test-id="attendance-employee-select">
                  <SelectValue placeholder="従業員を選択" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleClockIn}
              disabled={!selectedEmployee || loading}
              data-karma-action="clock-in"
              data-karma-test-id="clock-in-btn"
            >
              出勤
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>従業員</TableHead>
              <TableHead>出勤時刻</TableHead>
              <TableHead>退勤時刻</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todayLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  本日の出勤記録はありません
                </TableCell>
              </TableRow>
            ) : (
              todayLogs.map((log) => (
                <TableRow key={log.id} data-karma-test-id={`attendance-row-${log.id}`}>
                  <TableCell className="font-medium">{log.employees?.name ?? '-'}</TableCell>
                  <TableCell>{formatTime(log.clock_in)}</TableCell>
                  <TableCell>{formatTime(log.clock_out)}</TableCell>
                  <TableCell>
                    <Badge variant={log.clock_out ? 'secondary' : 'default'}>
                      {log.clock_out ? '退勤済' : '出勤中'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!log.clock_out && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClockOut(log.id)}
                        disabled={loading}
                        data-karma-action="clock-out"
                        data-karma-test-id={`clock-out-btn-${log.id}`}
                      >
                        退勤
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
