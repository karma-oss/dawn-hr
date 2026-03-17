'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Employee {
  id: string
  name: string
  email: string
  department: string | null
  role: string | null
  employment_type: string | null
  hourly_wage: number | null
  monthly_salary: number | null
  join_date: string | null
}

const employmentTypeLabels: Record<string, string> = {
  full_time: '正社員',
  part_time: 'パートタイム',
  contract: '契約社員',
}

export function EmployeesClient({
  employees: initialEmployees,
  organizationId,
}: {
  employees: Employee[]
  organizationId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [monthlySalary, setMonthlySalary] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setName('')
    setEmail('')
    setDepartment('')
    setRole('')
    setEmploymentType('')
    setHourlyWage('')
    setMonthlySalary('')
    setJoinDate('')
    setEditingEmployee(null)
  }

  function openEdit(emp: Employee) {
    setEditingEmployee(emp)
    setName(emp.name)
    setEmail(emp.email)
    setDepartment(emp.department ?? '')
    setRole(emp.role ?? '')
    setEmploymentType(emp.employment_type ?? '')
    setHourlyWage(emp.hourly_wage?.toString() ?? '')
    setMonthlySalary(emp.monthly_salary?.toString() ?? '')
    setJoinDate(emp.join_date ?? '')
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const body = {
      name,
      email,
      department: department || null,
      role: role || null,
      employment_type: employmentType || null,
      hourly_wage: hourlyWage ? Number(hourlyWage) : null,
      monthly_salary: monthlySalary ? Number(monthlySalary) : null,
      join_date: joinDate || null,
      organization_id: organizationId,
    }

    if (editingEmployee) {
      await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('この従業員を削除しますか？')) return
    await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-6" data-karma-context="employees" data-karma-entity="employee">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">従業員</h1>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm() }}>
          <DialogTrigger
            render={
              <Button data-karma-action="add-employee" data-karma-test-id="add-employee-btn" />
            }
          >
            従業員を追加
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? '従業員を編集' : '従業員を追加'}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? '従業員情報を更新します。' : '新しい従業員を登録します。'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-name">氏名</Label>
                  <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} required data-karma-test-id="employee-name-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-email">メール</Label>
                  <Input id="emp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-karma-test-id="employee-email-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-dept">部署</Label>
                  <Input id="emp-dept" value={department} onChange={(e) => setDepartment(e.target.value)} data-karma-test-id="employee-department-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-role">役職</Label>
                  <Input id="emp-role" value={role} onChange={(e) => setRole(e.target.value)} data-karma-test-id="employee-role-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>雇用形態</Label>
                <Select value={employmentType} onValueChange={(v) => setEmploymentType(v ?? '')}>
                  <SelectTrigger className="w-full" data-karma-test-id="employment-type-select">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">正社員</SelectItem>
                    <SelectItem value="part_time">パートタイム</SelectItem>
                    <SelectItem value="contract">契約社員</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-hourly">時給</Label>
                  <Input id="emp-hourly" type="number" value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-monthly">月給</Label>
                  <Input id="emp-monthly" type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-join">入社日</Label>
                <Input id="emp-join" type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={loading} data-karma-test-id="employee-submit-btn">
                  {loading ? '保存中...' : editingEmployee ? '更新' : '追加'}
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
              <TableHead>氏名</TableHead>
              <TableHead>メール</TableHead>
              <TableHead>部署</TableHead>
              <TableHead>雇用形態</TableHead>
              <TableHead>入社日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  従業員が登録されていません
                </TableCell>
              </TableRow>
            ) : (
              initialEmployees.map((emp) => (
                <TableRow key={emp.id} data-karma-entity="employee" data-karma-test-id={`employee-row-${emp.id}`}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department ?? '-'}</TableCell>
                  <TableCell>
                    {emp.employment_type ? (
                      <Badge variant="secondary">
                        {employmentTypeLabels[emp.employment_type] ?? emp.employment_type}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{emp.join_date ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(emp)} data-karma-action="edit-employee">
                      編集
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(emp.id)} data-karma-action="delete-employee">
                      削除
                    </Button>
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
