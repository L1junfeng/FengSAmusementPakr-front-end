<template>
  <div class="employee-dispatch">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2 class="title">员工实时调度</h2>
            <div class="view-switch">
              <el-radio-group v-model="currentView">
                <el-radio-button label="list">列表视图</el-radio-button>
                <el-radio-button label="map">地图视图</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon> 新增调度任务
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="员工姓名">
            <el-input
              v-model="filterForm.employeeName"
              placeholder="请输入员工姓名"
              clearable
              @clear="handleFilter"
            />
          </el-form-item>
          <el-form-item label="调度状态">
            <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              clearable
              @clear="handleFilter"
            >
              <el-option
                v-for="(text, value) in statusOptions"
                :key="value"
                :label="text"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="调度景点">
            <el-select
              v-model="filterForm.sceneryId"
              placeholder="请选择景点"
              clearable
              @clear="handleFilter"
            >
              <el-option
                v-for="scenery in scenerySpots"
                :key="scenery.sceneryId"
                :label="scenery.sceneryName"
                :value="scenery.sceneryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetFilter">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 列表视图 -->
      <div v-show="currentView === 'list'" class="dispatch-content">
        <el-table :data="filteredScheduleList" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="员工姓名" width="100" />
          <el-table-column prop="department" label="所属部门" width="120" />
          <el-table-column prop="jobNumber" label="工号" width="100" />
          <el-table-column label="调度景点" width="150">
            <template #default="{ row }">
              <el-tag :type="row.sceneryId ? 'success' : 'info'" effect="plain">
                {{ getSceneryName(row.sceneryId) || '未指定' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="调度时间" width="200">
            <template #default="{ row }">
              <div>{{ formatDate(row.taskDate) }}</div>
              <div class="shift-time">
                {{ row.shiftStartTime }} - {{ row.shiftEndTime }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="customerFlow" label="客流量" width="100">
            <template #default="{ row }">
              {{ row.customerFlow }} 人
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priorityLevel)">
                {{ getPriorityText(row.priorityLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column 
            prop="adjustmentReason" 
            label="调整原因" 
            show-overflow-tooltip
            min-width="150"
          />
          <el-table-column label="创建/更新时间" width="200">
            <template #default="{ row }">
              <div>创建: {{ formatDateTime(row.createdAt) }}</div>
              <div class="update-time">更新: {{ formatDateTime(row.updatedAt) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button 
                  type="primary" 
                  size="small"
                  :disabled="scope.row.status !== 0"
                  @click="handleUpdateStatus(scope.row, 3)"
                >
                  开始执行
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  :disabled="scope.row.status !== 3"
                  @click="handleUpdateStatus(scope.row, 1)"
                >
                  完成
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  :disabled="scope.row.status !== 0"
                  @click="handleUpdateStatus(scope.row, 2)"
                >
                  拒绝
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  :disabled="scope.row.status !== 3"
                  @click="handleCancelSchedule(scope.row)"
                >
                  取消
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 地图视图 -->
      <div v-show="currentView === 'map'" class="map-view">
        <div class="map-container">
          <div ref="mapRef" class="map"></div>
          <div class="map-controls">
            <el-button-group>
              <el-button @click="handleZoomIn"><el-icon><ZoomIn /></el-icon></el-button>
              <el-button @click="handleZoomOut"><el-icon><ZoomOut /></el-icon></el-button>
              <el-button @click="handleResetView"><el-icon><Refresh /></el-icon></el-button>
            </el-button-group>
          </div>
        </div>
        <div class="employee-sidebar">
          <div class="search-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索员工"
              prefix-icon="Search"
              clearable
            />
          </div>
          <div class="employee-list">
            <el-scrollbar>
              <div
                v-for="employee in filteredEmployees"
                :key="employee.employeeId"
                class="employee-item"
                :class="{ active: selectedEmployee?.employeeId === employee.employeeId }"
                @click="selectEmployee(employee)"
              >
                <div class="employee-avatar">
                  <el-avatar :size="40" :class="employee.sex ? 'male' : 'female'">
                    {{ employee.employeeName.substring(0, 1) }}
                  </el-avatar>
                </div>
                <div class="employee-info">
                  <div class="employee-name">
                    {{ employee.employeeName }}
                    <span class="job-number">{{ employee.jobNumber }}</span>
                  </div>
                  <div class="employee-details">
                    <span class="department">{{ employee.department }}</span>
                    <span class="location">{{ employee.location }}</span>
                    <span class="status" :class="employee.status">
                      {{ getEmployeeStatusText(employee.status) }}
                    </span>
                  </div>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleDispatchEmployee(employee)"
                >
                  调度
                </el-button>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增调度任务对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="新增调度任务"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="scheduleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="选择员工" prop="employeeId">
          <el-select 
            v-model="scheduleForm.employeeId"
            placeholder="请选择员工"
            style="width: 100%"
          >
            <el-option
              v-for="employee in employeeList"
              :key="employee.employeeId"
              :label="employee.employeeName"
              :value="employee.employeeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调度任务" prop="scheduleName">
          <el-input v-model="scheduleForm.scheduleName" placeholder="请输入调度任务名称" />
        </el-form-item>
        <el-form-item label="调度景点" prop="sceneryId">
          <el-select
            v-model="scheduleForm.sceneryId"
            placeholder="请选择景点"
            style="width: 100%"
          >
            <el-option
              v-for="scenery in scenerySpots"
              :key="scenery.sceneryId"
              :label="scenery.sceneryName"
              :value="scenery.sceneryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班次时间" required>
          <div class="time-range-picker">
            <el-date-picker
              v-model="scheduleForm.shiftStartTime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="shortcuts"
              style="width: 200px"
            />
            <span class="mx-2">至</span>
            <el-date-picker
              v-model="scheduleForm.shiftEndTime"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
            />
          </div>
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="scheduleForm.priorityLevel">
            <el-radio :label="true">高优先级</el-radio>
            <el-radio :label="false">普通优先级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预计客流" prop="customerFlow">
          <el-input-number 
            v-model="scheduleForm.customerFlow" 
            :min="0"
            controls-position="right"
            placeholder="请输入预计客流量"
          />
        </el-form-item>
        <el-form-item label="调整原因" prop="adjustmentReason">
          <el-input 
            v-model="scheduleForm.adjustmentReason"
            type="textarea"
            placeholder="请输入调整原因"
          />
        </el-form-item>
        <el-form-item label="调度位置" prop="location">
          <el-input 
            v-model="scheduleForm.location"
            placeholder="请输入调度位置，默认为景点名称"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="scheduleForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Location, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import { getAllWorkingEmployee, addScheduleEmployee, updateScheduleEmployee, getAllEmployeeSchedule } from '@/api/employee'
import { GetScenerySpotListByPage } from '@/api/projectManage'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 数据定义
const scheduleList = ref([])
const employeeList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

// 表单数据
const scheduleForm = ref({
  employeeId: '',
  sceneryId: null,
  taskDate: '',
  shiftStartTime: null,
  shiftEndTime: null,
  customerFlow: 0,
  priorityLevel: false,
  adjustmentReason: '',
  location: '',
  status: false
})

// 表单验证规则
const rules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  sceneryId: [{ required: true, message: '请选择调度景点', trigger: 'change' }],
  shiftStartTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  shiftEndTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  adjustmentReason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }],
  customerFlow: [{ required: true, message: '请输入预计客流量', trigger: 'blur' }]
}

// 视图切换
const currentView = ref('list')
const mapRef = ref(null)
const map = ref(null)
const markers = ref([])
const selectedEmployee = ref(null)
const searchQuery = ref('')

// 分页参数
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 景点数据
const scenerySpots = ref([])

// 筛选相关
const filterForm = ref({
  employeeName: '',
  status: '',
  sceneryId: ''
})

// 状态选项
const statusOptions = {
  0: '待执行',
  1: '已完成',
  2: '已取消',
  3: '执行中'
}

// 筛选后的列表
const filteredScheduleList = computed(() => {
  // 先过滤
  const filtered = scheduleList.value.filter(item => {
    const nameMatch = !filterForm.value.employeeName || 
      item.name.toLowerCase().includes(filterForm.value.employeeName.toLowerCase())
    
    const statusMatch = !filterForm.value.status || 
      item.status === Number(filterForm.value.status)
    
    const sceneryMatch = !filterForm.value.sceneryId || 
      item.sceneryId === filterForm.value.sceneryId

    return nameMatch && statusMatch && sceneryMatch
  })
  
  // 按时间排序：先按任务日期降序，同一天的按开始时间降序
  return filtered.sort((a, b) => {
    // 先比较任务日期
    const dateCompare = new Date(b.taskDate) - new Date(a.taskDate)
    if (dateCompare !== 0) return dateCompare
    
    // 如果是同一天，比较开始时间
    const timeA = a.shiftStartTime.split(':').map(Number)
    const timeB = b.shiftStartTime.split(':').map(Number)
    
    // 转换为分钟进行比较
    const minutesA = timeA[0] * 60 + timeA[1]
    const minutesB = timeB[0] * 60 + timeB[1]
    
    return minutesB - minutesA
  })
})

// 处理筛选
const handleFilter = () => {
  pageNum.value = 1 // 重置页码
  fetchScheduleList()
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    employeeName: '',
    status: '',
    sceneryId: ''
  }
  handleFilter()
}

// 获取景点列表
const fetchScenerySpots = async () => {
  try {
    const res = await GetScenerySpotListByPage(1, 100)
    if (res.code === '200') {
      scenerySpots.value = res.data.list
      if (currentView.value === 'map' && map.value) {
        updateSceneryMarkers()
      }
    }
  } catch (error) {
    console.error('获取景点列表失败:', error)
  }
}

// 地图初始化
const initMap = () => {
  if (map.value) return
  
  if (!mapRef.value) return

  map.value = L.map(mapRef.value, {
    center: [23.3284, 113.3348], // 长隆的大致坐标
    zoom: 17,
    minZoom: 16,
    maxZoom: 19
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  if (scenerySpots.value.length > 0) {
    updateSceneryMarkers()
  }
}

// 地图控制
const handleZoomIn = () => map.value?.zoomIn()
const handleZoomOut = () => map.value?.zoomOut()
const handleResetView = () => map.value?.setView([39.9042, 116.4074], 13)

// 员工标记
const updateMarkers = () => {
  markers.value.forEach(marker => marker.remove())
  markers.value = []
  
  employeeList.value.forEach(emp => {
    if (emp.latitude && emp.longitude) {
      const marker = L.marker([emp.latitude, emp.longitude])
        .bindPopup(`
          <div class="employee-popup">
            <h3>${emp.employeeName}</h3>
            <p>${emp.department}</p>
            <button class="dispatch-btn" onclick="handleDispatch('${emp.employeeId}')">
              调度任务
            </button>
          </div>
        `)
        .addTo(map.value)
      markers.value.push(marker)
    }
  })
}

// 员工选择
const selectEmployee = (employee) => {
  selectedEmployee.value = employee
  if (employee.latitude && employee.longitude) {
    map.value?.setView([employee.latitude, employee.longitude], 15)
  }
}

// 搜索过滤
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employeeList.value
  const query = searchQuery.value.toLowerCase()
  return employeeList.value.filter(emp => 
    emp.employeeName.toLowerCase().includes(query) ||
    emp.department.toLowerCase().includes(query)
  )
})

// 监听视图切换
watch(currentView, (newView) => {
  if (newView === 'map') {
    nextTick(() => {
      initMap()
      updateSceneryMarkers()
    })
  }
})

// 获取可调度员工列表
const fetchEmployeeList = async () => {
  try {
    const res = await getAllWorkingEmployee()
    if (res.code === '200') {
      // 处理员工数据，映射状态
      employeeList.value = res.data.map(emp => ({
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        jobNumber: emp.jobNumber,
        location: emp.location,
        status: getEmployeeStatusFromCode(emp.employeeStatus),
        sex: emp.employeeSex
      }))
    }
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
  }
}

// 将状态码转换为状态标识
const getEmployeeStatusFromCode = (status) => {
  switch (status) {
    case 0: return 'standby'  // 待命
    case 1: return 'busy'     // 忙碌
    default: return 'active'  // 空闲
  }
}

// 获取调度任务列表
const fetchScheduleList = async () => {
  loading.value = true
  try {
    const res = await getAllEmployeeSchedule(pageNum.value, pageSize.value)
    if (res.code === '200') {
      scheduleList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取调度任务列表失败:', error)
    ElMessage.error('获取调度任务列表失败')
  } finally {
    loading.value = false
  }
}

// 打开新增对话框
const openAddDialog = () => {
  dialogVisible.value = true
  scheduleForm.value = {
    employeeId: '',
    sceneryId: null,
    taskDate: '',
    shiftStartTime: null,
    shiftEndTime: null,
    customerFlow: 0,
    priorityLevel: false,
    adjustmentReason: '',
    location: '',
    status: false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 从时间中分离日期和时间
    const startDateTime = new Date(scheduleForm.value.shiftStartTime)
    const endDateTime = new Date(scheduleForm.value.shiftEndTime)
    
    // 构造提交的数据
    const submitData = {
      employeeId: parseInt(scheduleForm.value.employeeId),
      sceneryId: parseInt(scheduleForm.value.sceneryId),
      taskDate: startDateTime.toISOString().split('T')[0],
      shiftStartTime: startDateTime.toTimeString().slice(0, 8),
      shiftEndTime: endDateTime.toTimeString().slice(0, 8),
      customerFlow: parseInt(scheduleForm.value.customerFlow),
      priorityLevel: scheduleForm.value.priorityLevel,
      adjustmentReason: scheduleForm.value.adjustmentReason,
      location: scheduleForm.value.location || getSceneryName(scheduleForm.value.sceneryId),
      status: false
    }

    const res = await addScheduleEmployee(submitData)
    
    if (res.code === '200') {
      ElMessage.success('添加调度任务成功')
      dialogVisible.value = false
      fetchScheduleList()
    } else {
      ElMessage.error(res.message || '添加失败')
    }
  } catch (error) {
    console.error('添加调度任务失败:', error)
    ElMessage.error('表单验证失败或提交出错')
  }
}

// 更新调度状态
const handleUpdateStatus = async (row, status) => {
  try {
    let confirmText = ''
    let successText = ''
    let statusValue = 0 // 修改为数字类型
    
    switch (status) {
      case 3: // 执行中
        confirmText = '确定开始执行该调度任务吗？'
        successText = '已开始执行调度任务'
        statusValue = 3 // 执行中
        break
      case 1: // 已完成
        confirmText = '确定完成该调度任务吗？'
        successText = '调度任务已完成'
        statusValue = 1 // 已完成
        break
      case 2: // 取消
        confirmText = '确定拒绝该调度任务吗？'
        successText = '已拒绝调度任务'
        statusValue = 2 // 已取消
        break
      default:
        return
    }

    await ElMessageBox.confirm(
      confirmText,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: status === 2 ? 'warning' : 'info'
      }
    )

    // 传入整数类型的参数
    const res = await updateScheduleEmployee(
      parseInt(row.employeeId), // 员工ID
      statusValue,              // 状态值
      parseInt(row.scheduleId)  // 调度任务ID
    )

    if (res.code === '200') {
      ElMessage.success(successText)
      fetchScheduleList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
      ElMessage.error('更新状态失败')
    }
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return date // 直接返回后端的格式，因为已经是 YYYY-MM-DD 格式
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return ''
  return datetime.replace('T', ' ').substring(0, 16)
}

// 优先级映射
const getPriorityText = (level) => {
  return level ? '高优先级' : '普通优先级'
}

const getPriorityType = (level) => {
  return level ? 'danger' : 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待执行',
    1: '已完成',
    2: '已取消',
    3: '执行中'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'danger',
    3: 'warning'
  }
  return typeMap[status] || 'info'
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  fetchScheduleList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  fetchScheduleList()
}

// 更新景点标记
const updateSceneryMarkers = () => {
  if (!map.value) return
  
  // 清除现有标记
  markers.value.forEach(marker => marker.remove())
  markers.value = []

  // 计算地图中心点
  const center = map.value.getCenter()
  
  scenerySpots.value.forEach((spot, index) => {
    // 在地图中心周围均匀分布景点
    const angle = (index / scenerySpots.value.length) * 2 * Math.PI
    const radius = 0.002 // 约200米的半径
    const lat = center.lat + radius * Math.cos(angle)
    const lng = center.lng + radius * Math.sin(angle)
    
    // 获取该景点的调度员工
    const dispatchedEmployees = scheduleList.value.filter(
      schedule => schedule.sceneryId === spot.sceneryId && schedule.status === 3
    )

    // 创建自定义图标
    const icon = L.divIcon({
      className: 'scenery-marker',
      html: `
        <div class="marker-content ${spot.sceneryStatus === 1 ? 'active' : 'inactive'}">
          <div class="el-avatar el-avatar--circle marker-icon">
            <i class="el-icon-${getSceneryIcon(spot.sceneryName)}"></i>
          </div>
          <div class="marker-info-container">
            <div class="marker-title">
              ${spot.sceneryName}
              ${dispatchedEmployees.length > 0 ?
                `<el-tag size="small" type="success" effect="dark" class="count-tag">
                  ${dispatchedEmployees.length}人在岗
                </el-tag>`
                : ''
              }
            </div>
            <div class="marker-info">
              <el-tag size="small" type="${spot.sceneryStatus === 1 ? 'success' : 'info'}" effect="light">
                ${spot.sceneryStatus === 1 ? '营业中' : '已关闭'}
              </el-tag>
              ${dispatchedEmployees.length > 0 ? `
                <div class="employee-list">
                  ${dispatchedEmployees.map(emp => `
                    <span class="employee-item">
                      <i class="el-icon-user"></i>
                      ${emp.name}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `,
      iconSize: [200, 80],
      iconAnchor: [100, 40]
    })

    // 创建标记
    const marker = L.marker([lat, lng], { icon })
      .bindPopup(`
        <div class="el-card scenery-popup">
          <div class="el-card__header">
            <div class="header-content">
              <h3>${spot.sceneryName}</h3>
              <el-tag size="small" type="${spot.sceneryStatus === 1 ? 'success' : 'info'}" effect="light">
                ${spot.sceneryStatus === 1 ? '营业中' : '已关闭'}
              </el-tag>
            </div>
          </div>
          <div class="el-card__body">
            <div class="info-list">
              <div class="info-item">
                <i class="el-icon-time"></i>
                <span>营业时间：${spot.sceneryBtime} - ${spot.endTime}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-info"></i>
                <span>游玩时长：${spot.scenerySpendtime}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-phone"></i>
                <span>联系电话：${spot.sceneryPhone}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-location"></i>
                <span>位置：${spot.sceneryAddress}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-tickets"></i>
                <span>门票：${spot.sceneryFares}元</span>
              </div>
            </div>
            ${dispatchedEmployees.length > 0 ? `
              <div class="el-divider">
                <span class="el-divider__text">在岗员工 (${dispatchedEmployees.length}人)</span>
              </div>
              <div class="employee-grid">
                ${dispatchedEmployees.map(emp => `
                  <div class="el-card employee-card">
                    <div class="employee-card__content">
                      <div class="el-avatar el-avatar--circle">
                        <i class="el-icon-user"></i>
                      </div>
                      <div class="employee-info">
                        <div class="name">${emp.name}</div>
                        <el-tag size="small" effect="plain">${emp.jobNumber}</el-tag>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <div class="action-footer">
              <button class="el-button el-button--primary el-button--small" 
                onclick="window.vueApp.handleDispatchToScenery(${spot.sceneryId})">
                调度员工到此处
              </button>
            </div>
          </div>
        </div>
      `, {
        minWidth: 350,
        maxWidth: 400
      })
      .addTo(map.value)

    markers.value.push(marker)
  })
}

// 根据景点名称返回对应的图标
const getSceneryIcon = (name) => {
  if (name.includes('入口')) return 'door'
  if (name.includes('游乐')) return 'magic-stick'
  if (name.includes('餐饮')) return 'food'
  if (name.includes('停车')) return 'van'
  if (name.includes('出口')) return 'back'
  return 'location'
}

// 处理景点调度
const handleDispatchToScenery = (sceneryId) => {
  const scenery = scenerySpots.value.find(s => s.sceneryId === sceneryId)
  if (scenery) {
    openAddDialog()
    scheduleForm.value = {
      ...scheduleForm.value,
      sceneryId: sceneryId,
      scheduleName: `${scenery.sceneryName}调度任务`,
      adjustmentReason: `调度至${scenery.sceneryName}`
    }
  }
}

// 获取员工状态文本
const getEmployeeStatusText = (status) => {
  const statusMap = {
    'active': '空闲中',
    'busy': '工作中',
    'standby': '待命中'
  }
  return statusMap[status] || '未知'
}

// 处理员工调度
const handleDispatchEmployee = (employee) => {
  openAddDialog()
  scheduleForm.value = {
    employeeId: employee.employeeId,
    scheduleName: '',
    scheduleTime: '',
    remark: '',
    sceneryId: null,
    shiftStartTime: null,
    shiftEndTime: null,
    priorityLevel: false,
    customerFlow: 0,
    adjustmentReason: '',
    location: '',
    status: false
  }
}

// 根据景点ID获取景点名称
const getSceneryName = (sceneryId) => {
  const scenery = scenerySpots.value.find(s => s.sceneryId === sceneryId)
  return scenery ? scenery.sceneryName : ''
}

// 取消调度任务
const handleCancelSchedule = (row) => {
  ElMessageBox.confirm(
    '确定要取消该调度任务吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 传入整数类型的参数
      const res = await updateScheduleEmployee(
        parseInt(row.employeeId), // 员工ID
        2,                        // 取消状态
        parseInt(row.scheduleId)  // 调度任务ID
      )
      
      if (res.code === '200') {
        ElMessage.success('已取消调度任务')
        fetchScheduleList()
      } else {
        ElMessage.error(res.message || '取消失败')
      }
    } catch (error) {
      console.error('取消失败:', error)
      ElMessage.error('取消失败：' + error.message)
    }
  }).catch(() => {})
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 禁用的时间
const disabledTime = (date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  if (date && date.getTime() === today.getTime()) {
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    return {
      disabledHours: () => Array.from({ length: hours }, (_, i) => i),
      disabledMinutes: (hour) => {
        if (hour === hours) {
          return Array.from({ length: minutes }, (_, i) => i)
        }
        return []
      }
    }
  }
  return {
    disabledHours: () => [],
    disabledMinutes: () => []
  }
}

// 快捷选项
const shortcuts = [
  {
    text: '今天',
    value: new Date()
  },
  {
    text: '明天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24)
      return date
    }
  },
  {
    text: '一周后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
      return date
    }
  }
]

onMounted(() => {
  fetchEmployeeList()
  fetchScheduleList()
  fetchScenerySpots()
  // 将方法挂载到全局
  window.vueApp = {
    handleDispatchToScenery: (sceneryId) => {
      handleDispatchToScenery(sceneryId)
    }
  }
  if (currentView.value === 'map') {
    nextTick(() => {
      initMap()
    })
  }
})

onUnmounted(() => {
  // 清理全局方法
  delete window.vueApp
})
</script>

<style scoped>
.employee-dispatch {
  padding: 20px;
  background: linear-gradient(135deg, #f6f8fb 0%, #f0f4f8 100%);
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

.box-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.title {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.dispatch-content {
  padding: 20px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.map-view {
  display: flex;
  height: calc(100vh - 200px);
  gap: 20px;
  padding: 20px;
}

.map-container {
  flex: 1;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.employee-sidebar {
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.employee-list {
  flex: 1;
  overflow: hidden;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #f0f2f5;
}

.employee-item:hover {
  background-color: #f5f7fa;
}

.employee-item.active {
  background-color: #ecf5ff;
}

.employee-avatar {
  flex-shrink: 0;
}

.male {
  background-color: #409eff;
}

.female {
  background-color: #ff69b4;
}

.employee-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-number {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.employee-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.department {
  color: #909399;
}

.location {
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.location::before {
  content: "📍";
  font-size: 14px;
}

.status {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.status.active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status.busy {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status.standby {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.view-switch {
  margin-left: 20px;
}

.shift-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.update-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}

.scenery-marker {
  background: transparent;
}

.marker-content {
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s;
  white-space: nowrap;
  background: white;
  box-shadow: var(--el-box-shadow-light);
}

.marker-icon {
  width: 40px !important;
  height: 40px !important;
  font-size: 20px !important;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.marker-info-container {
  flex: 1;
  min-width: 0;
}

.marker-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: var(--el-font-weight-bold);
}

.count-tag {
  margin: 0 !important;
}

.marker-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.employee-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.employee-item {
  font-size: 12px;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  gap: 4px;
}

.employee-item i {
  color: var(--el-color-primary);
}

/* 弹窗样式 */
.scenery-popup {
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  margin: 0;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.info-item i {
  color: var(--el-color-primary);
  font-size: 16px;
}

.el-divider {
  margin: 20px 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.employee-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  padding: 12px;
}

.employee-card__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-info .name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.action-footer {
  margin-top: 20px;
  text-align: center;
}

/* 调度状态样式 */
:deep(.el-tag--info) {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

:deep(.el-tag--success) {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

:deep(.el-tag--danger) {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

:deep(.el-tag--warning) {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.filter-container {
  margin-bottom: 20px;
  padding: 18px;
  background: var(--el-fill-color-light);
  border-radius: var(--el-border-radius-base);
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
  margin-bottom: 0;
}

:deep(.el-input) {
  width: 200px;
}

:deep(.el-select) {
  width: 200px;
}

.filter-container .el-button {
  margin-left: 8px;
}

.time-range-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-range-picker :deep(.el-date-picker) {
  width: 200px;
}

.mx-2 {
  color: var(--el-text-color-regular);
}
</style>