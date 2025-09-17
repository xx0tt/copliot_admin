<template>
  <div class="employee-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>员工管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddEmployee = true">
          <el-icon><Plus /></el-icon>
          新增员工
        </el-button>
        <el-button @click="showDepartmentManagement = true">
          <el-icon><OfficeBuilding /></el-icon>
          部门管理
        </el-button>
        <el-button @click="showAttendanceManagement = true">
          <el-icon><Clock /></el-icon>
          考勤管理
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalEmployees }}</div>
          <div class="stat-label">总员工数</div>
        </div>
        <el-icon class="stat-icon total"><UserFilled /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeEmployees }}</div>
          <div class="stat-label">在职员工</div>
        </div>
        <el-icon class="stat-icon active"><User /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.newHires }}</div>
          <div class="stat-label">本月新入职</div>
        </div>
        <el-icon class="stat-icon new"><CirclePlus /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.attendanceRate }}%</div>
          <div class="stat-label">出勤率</div>
        </div>
        <el-icon class="stat-icon attendance"><Clock /></el-icon>
      </el-card>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="员工姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入员工姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择部门" clearable>
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位">
          <el-select v-model="searchForm.position" placeholder="请选择职位" clearable>
            <el-option
              v-for="pos in positions"
              :key="pos.id"
              :label="pos.name"
              :value="pos.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="主管" value="supervisor" />
            <el-option label="员工" value="employee" />
            <el-option label="实习生" value="intern" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="休假" value="on_leave" />
            <el-option label="离职" value="terminated" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadEmployees">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 员工列表 -->
    <el-card>
      <template #header>
        <span>员工列表</span>
      </template>
      
      <el-table
        :data="employees"
        :loading="loading"
        row-key="id"
        stripe
      >
        <el-table-column prop="employeeNumber" label="工号" width="100" />
        <el-table-column label="员工信息" min-width="200">
          <template #default="{ row }">
            <div class="employee-info">
              <el-avatar :src="row.avatar" :size="40">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
                <div class="contact">{{ row.phone }} | {{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)" size="small">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hireDate" label="入职日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text @click="viewEmployee(row)">
              详情
            </el-button>
            <el-button type="success" text @click="editEmployee(row)">
              编辑
            </el-button>
            <el-dropdown @command="handleEmployeeAction">
              <el-button type="info" text>
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'reset', employee: row }">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'leave', employee: row }">
                    请假申请
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'performance', employee: row }">
                    绩效评估
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="{ action: 'delete', employee: row }"
                    divided
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadEmployees"
          @current-change="loadEmployees"
        />
      </div>
    </el-card>

    <!-- 新增/编辑员工对话框 -->
    <el-dialog
      v-model="showAddEmployee"
      :title="editingEmployee ? '编辑员工' : '新增员工'"
      width="700px"
      top="5vh"
    >
      <el-form
        ref="employeeFormRef"
        :model="employeeForm"
        :rules="employeeRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="employeeNumber">
              <el-input v-model="employeeForm.employeeNumber" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="employeeForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="employeeForm.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="employeeForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="employeeForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                v-model="employeeForm.hireDate"
                type="date"
                placeholder="请选择入职日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="employeeForm.department" placeholder="请选择部门" style="width: 100%">
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-select v-model="employeeForm.position" placeholder="请选择职位" style="width: 100%">
                <el-option
                  v-for="pos in positions"
                  :key="pos.id"
                  :label="pos.name"
                  :value="pos.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="employeeForm.role" placeholder="请选择角色" style="width: 100%">
                <el-option label="管理员" value="admin" />
                <el-option label="经理" value="manager" />
                <el-option label="主管" value="supervisor" />
                <el-option label="员工" value="employee" />
                <el-option label="实习生" value="intern" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="employeeForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="在职" value="active" />
                <el-option label="停用" value="inactive" />
                <el-option label="休假" value="on_leave" />
                <el-option label="离职" value="terminated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工作地点">
          <el-input v-model="employeeForm.workLocation" placeholder="请输入工作地点" />
        </el-form-item>
        <el-form-item label="基本薪资">
          <el-input-number
            v-model="employeeForm.salary"
            :min="0"
            :step="1000"
            placeholder="请输入基本薪资"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="紧急联系人">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input v-model="employeeForm.emergencyContact.name" placeholder="姓名" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="employeeForm.emergencyContact.relationship" placeholder="关系" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="employeeForm.emergencyContact.phone" placeholder="电话" />
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddEmployee = false">取消</el-button>
        <el-button type="primary" @click="saveEmployee" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 部门管理对话框 -->
    <el-dialog
      v-model="showDepartmentManagement"
      title="部门管理"
      width="80%"
      top="5vh"
    >
      <div class="department-management">
        <div class="department-actions">
          <el-button type="primary" @click="showAddDepartment = true">
            <el-icon><Plus /></el-icon>
            新增部门
          </el-button>
        </div>
        
        <el-table :data="departments" row-key="id" default-expand-all>
          <el-table-column prop="name" label="部门名称" min-width="200" />
          <el-table-column prop="managerName" label="部门经理" width="120" />
          <el-table-column prop="employeeCount" label="员工数量" width="100" />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" text @click="editDepartment(row)">
                编辑
              </el-button>
              <el-button type="danger" text @click="deleteDepartment(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 考勤管理对话框 -->
    <el-dialog
      v-model="showAttendanceManagement"
      title="考勤管理"
      width="90%"
      top="5vh"
    >
      <div class="attendance-management">
        <!-- 考勤搜索 -->
        <el-form :inline="true" :model="attendanceSearch" class="attendance-search">
          <el-form-item label="员工">
            <el-select v-model="attendanceSearch.employeeId" placeholder="请选择员工" clearable filterable>
              <el-option
                v-for="emp in employees"
                :key="emp.id"
                :label="emp.name"
                :value="emp.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="attendanceSearch.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="attendanceSearch.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="present" />
              <el-option label="缺勤" value="absent" />
              <el-option label="迟到" value="late" />
              <el-option label="早退" value="early_leave" />
              <el-option label="请假" value="vacation" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadAttendance">搜索</el-button>
          </el-form-item>
        </el-form>

        <!-- 考勤记录表格 -->
        <el-table :data="attendanceRecords" :loading="attendanceLoading">
          <el-table-column prop="employeeName" label="员工姓名" width="120" />
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="checkInTime" label="签到时间" width="120" />
          <el-table-column prop="checkOutTime" label="签退时间" width="120" />
          <el-table-column prop="workHours" label="工作时长" width="100">
            <template #default="{ row }">
              {{ row.workHours }}小时
            </template>
          </el-table-column>
          <el-table-column prop="overtimeHours" label="加班时长" width="100">
            <template #default="{ row }">
              {{ row.overtimeHours }}小时
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getAttendanceStatusType(row.status)" size="small">
                {{ getAttendanceStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus, Search, UserFilled, User, CirclePlus, Clock, OfficeBuilding, ArrowDown
} from '@element-plus/icons-vue'
import { 
  getEmployees, createEmployee, updateEmployee, deleteEmployee as deleteEmployeeApi,
  getDepartments, getAttendance, getEmployeeStats
} from '@/api/employee'
import type { 
  Employee, Department, Position, Attendance, EmployeeRole, EmployeeStatus 
} from '@/types/employee'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const attendanceLoading = ref(false)

// 数据列表
const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const positions = ref<Position[]>([])
const attendanceRecords = ref<Attendance[]>([])

// 对话框显示状态
const showAddEmployee = ref(false)
const showDepartmentManagement = ref(false)
const showAttendanceManagement = ref(false)
const showAddDepartment = ref(false)

// 编辑状态
const editingEmployee = ref<Employee | null>(null)

// 统计数据
const stats = reactive({
  totalEmployees: 0,
  activeEmployees: 0,
  newHires: 0,
  departures: 0,
  attendanceRate: 0,
  avgPerformanceScore: 0
})

// 搜索表单
const searchForm = reactive({
  name: '',
  department: '',
  position: '',
  role: '',
  status: ''
})

const attendanceSearch = reactive({
  employeeId: '',
  dateRange: [] as string[],
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 员工表单
const employeeForm = reactive({
  employeeNumber: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  role: 'employee' as EmployeeRole,
  status: 'active' as EmployeeStatus,
  hireDate: '',
  salary: 0,
  workLocation: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  }
})

// 表单引用和验证规则
const employeeFormRef = ref<FormInstance>()
const employeeRules: FormRules = {
  employeeNumber: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  hireDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ]
}

// 初始化数据
onMounted(() => {
  loadEmployees()
  loadDepartments()
  loadStats()
})

// 加载员工列表
const loadEmployees = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    const response = await getEmployees(params)
    employees.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载员工列表失败')
  } finally {
    loading.value = false
  }
}

// 加载部门列表
const loadDepartments = async () => {
  try {
    const response = await getDepartments()
    departments.value = response.data
  } catch (error) {
    ElMessage.error('加载部门列表失败')
  }
}

// 加载考勤记录
const loadAttendance = async () => {
  try {
    attendanceLoading.value = true
    const params = {
      employeeId: attendanceSearch.employeeId,
      status: attendanceSearch.status,
      startDate: attendanceSearch.dateRange[0],
      endDate: attendanceSearch.dateRange[1]
    }
    const response = await getAttendance(params)
    attendanceRecords.value = response.data.list
  } catch (error) {
    ElMessage.error('加载考勤记录失败')
  } finally {
    attendanceLoading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await getEmployeeStats()
    Object.assign(stats, response.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    department: '',
    position: '',
    role: '',
    status: ''
  })
  loadEmployees()
}

// 查看员工详情
const viewEmployee = (employee: Employee) => {
  // 跳转到员工详情页面
  console.log('查看员工详情:', employee)
}

// 编辑员工
const editEmployee = (employee: Employee) => {
  editingEmployee.value = employee
  Object.assign(employeeForm, employee)
  showAddEmployee.value = true
}

// 处理员工操作
const handleEmployeeAction = (command: { action: string, employee: Employee }) => {
  const { action, employee } = command
  
  switch (action) {
    case 'reset':
      resetEmployeePassword(employee)
      break
    case 'leave':
      createLeaveRequest(employee)
      break
    case 'performance':
      createPerformanceReview(employee)
      break
    case 'delete':
      deleteEmployee(employee)
      break
  }
}

// 重置员工密码
const resetEmployeePassword = async (employee: Employee) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置员工"${employee.name}"的密码吗？`,
      '重置密码确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 这里调用重置密码API
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败')
    }
  }
}

// 创建请假申请
const createLeaveRequest = (employee: Employee) => {
  console.log('创建请假申请:', employee)
}

// 创建绩效评估
const createPerformanceReview = (employee: Employee) => {
  console.log('创建绩效评估:', employee)
}

// 保存员工
const saveEmployee = async () => {
  if (!employeeFormRef.value) return
  
  try {
    await employeeFormRef.value.validate()
    saving.value = true
    
    if (editingEmployee.value) {
      await updateEmployee(editingEmployee.value.id, employeeForm)
      ElMessage.success('更新员工成功')
    } else {
      await createEmployee(employeeForm)
      ElMessage.success('创建员工成功')
    }
    
    showAddEmployee.value = false
    resetEmployeeForm()
    loadEmployees()
  } catch (error) {
    ElMessage.error('保存员工失败')
  } finally {
    saving.value = false
  }
}

// 删除员工
const deleteEmployee = async (employee: Employee) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除员工"${employee.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteEmployeeApi(employee.id)
    ElMessage.success('删除员工成功')
    loadEmployees()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除员工失败')
    }
  }
}

// 编辑部门
const editDepartment = (department: Department) => {
  console.log('编辑部门:', department)
}

// 删除部门
const deleteDepartment = (department: Department) => {
  console.log('删除部门:', department)
}

// 重置员工表单
const resetEmployeeForm = () => {
  Object.assign(employeeForm, {
    employeeNumber: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'employee',
    status: 'active',
    hireDate: '',
    salary: 0,
    workLocation: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  })
  editingEmployee.value = null
  employeeFormRef.value?.resetFields()
}

// 获取角色类型
const getRoleType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    manager: 'warning',
    supervisor: 'success',
    employee: '',
    intern: 'info'
  }
  return types[role] || ''
}

// 获取角色文本
const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    supervisor: '主管',
    employee: '员工',
    intern: '实习生'
  }
  return texts[role] || '未知'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    on_leave: 'warning',
    terminated: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '在职',
    inactive: '停用',
    on_leave: '休假',
    terminated: '离职'
  }
  return texts[status] || '未知'
}

// 获取考勤状态类型
const getAttendanceStatusType = (status: string) => {
  const types: Record<string, string> = {
    present: 'success',
    absent: 'danger',
    late: 'warning',
    early_leave: 'warning',
    holiday: 'info',
    sick_leave: 'info',
    vacation: 'info'
  }
  return types[status] || 'info'
}

// 获取考勤状态文本
const getAttendanceStatusText = (status: string) => {
  const texts: Record<string, string> = {
    present: '正常',
    absent: '缺勤',
    late: '迟到',
    early_leave: '早退',
    holiday: '节假日',
    sick_leave: '病假',
    vacation: '年假'
  }
  return texts[status] || '未知'
}
</script>

<style lang="scss" scoped>
.employee-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      position: relative;

      .stat-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }

      .stat-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 40px;
        opacity: 0.3;

        &.total {
          color: #409eff;
        }

        &.active {
          color: #67c23a;
        }

        &.new {
          color: #e6a23c;
        }

        &.attendance {
          color: #f56c6c;
        }
      }
    }
  }

  .search-card {
    margin-bottom: 20px;

    .search-form {
      margin: 0;
    }
  }

  .employee-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .info-text {
      flex: 1;

      .name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .contact {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }

  .department-management {
    .department-actions {
      margin-bottom: 20px;
    }
  }

  .attendance-management {
    .attendance-search {
      margin-bottom: 20px;
    }
  }
}
</style>
