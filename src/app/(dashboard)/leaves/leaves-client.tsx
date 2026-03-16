'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
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

interface Employee {
  id: string
  name: string
  email: string
}

interface LeaveRequest {
  id: string
  employee_id: string
  type: string
  start_date: string
  end_date: string
  reason: string | null
  status: string
  employees: Employee | null
}

const leaveTypeLabels: Record<string, string> = {
  paid: '有給',
  unpaid: '無給',
  sick: '病欠',
  special: '特別休暇',
}

const statusLabels: Record<string, string> = {
  pending: '承認待ち',
  approved: '承認済み',
  rejected: '却下',
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved': return 'secondary'
    case 'rejected': return 'destructive'
    default: return 'outline'
  }
}

export function LeavesClient({
  employees,
  leaves: initialLeaves,
}: {
  employees: Employee[]
  leaves: LeaveRequest[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setEmployeeId('')
    setLeaveType('')
    setStartDate('')
    setEndDate('')
    setReason('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: employeeId,
        type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
      }),
    })

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  async function handleAction(leaveId: string, action: 'approved' | 'rejected') {
    await fetch(`/api/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6" data-karma-context="leaves" data-karma-entity="leave-request">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">休暇管理</h1>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm() }}>
          <DialogTrigger
            render={
              <Button data-karma-action="add-leave" data-karma-test-id="add-leave-btn" />
            }
          >
            休暇申請
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>休暇申請</DialogTitle>
              <DialogDescription>新しい休暇申請を作成します。</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>従業員</Label>
                <Select value={employeeId} onValueChange={(v) => setEmployeeId(v ?? '')}>
                  <SelectTrigger className="w-full" data-karma-test-id="leave-employee-select">
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
              <div className="space-y-2">
                <Label>休暇種別</Label>
                <Select value={leaveType} onValueChange={(v) => setLeaveType(v ?? '')}>
                  <SelectTrigger className="w-full" data-karma-test-id="leave-type-select">
                    <SelectValue placeholder="種別を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">有給</SelectItem>
                    <SelectItem value="unpaid">無給</SelectItem>
                    <SelectItem value="sick">病欠</SelectItem>
                    <SelectItem value="special">特別休暇</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-start">開始日</Label>
                  <Input id="leave-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required data-karma-test-id="leave-start-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leave-end">終了日</Label>
                  <Input id="leave-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required data-karma-test-id="leave-end-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-reason">理由</Label>
                <Textarea id="leave-reason" value={reason} onChange={(e) => setReason(e.target.value)} data-karma-test-id="leave-reason-input" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={loading || !employeeId || !leaveType} data-karma-test-id="leave-submit-btn">
                  {loading ? '申請中...' : '申請'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>従業員</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>期間</TableHead>
              <TableHead>理由</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialLeaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  休暇申請はありません
                </TableCell>
              </TableRow>
            ) : (
              initialLeaves.map((leave) => (
                <TableRow key={leave.id} data-karma-test-id={`leave-row-${leave.id}`}>
                  <TableCell className="font-medium">{leave.employees?.name ?? '-'}</TableCell>
                  <TableCell>{leaveTypeLabels[leave.type] ?? leave.type}</TableCell>
                  <TableCell>{leave.start_date} ~ {leave.end_date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{leave.reason ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(leave.status)}>
                      {statusLabels[leave.status] ?? leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {leave.status === 'pending' && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(leave.id, 'approved')}
                          data-karma-action="approve-leave"
                          data-karma-test-id={`approve-btn-${leave.id}`}
                        >
                          承認
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleAction(leave.id, 'rejected')}
                          data-karma-action="reject-leave"
                          data-karma-test-id={`reject-btn-${leave.id}`}
                        >
                          却下
                        </Button>
                      </div>
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
