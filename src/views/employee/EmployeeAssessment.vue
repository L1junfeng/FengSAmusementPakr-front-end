<template>
    <div class="employee-assessment">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <div class="header-left">
                        <h2 class="title">员工考核任务进度</h2>
                        <div class="statistics">
                            <div class="stat-item">
                                <span class="label">总任务数</span>
                                <span class="value">{{ getTotalTasks() }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">已完成</span>
                                <span class="value success">{{ getCompletedTasks() }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">进行中</span>
                                <span class="value warning">{{ getInProgressTasks() }}</span>
                            </div>
                        </div>
                    </div>
                    <el-input
                        v-model="searchQuery"
                        placeholder="搜索员工姓名"
                        class="search-input"
                        clearable
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>
            </template>

            <div class="employee-grid">
                <el-row :gutter="20">
                    <el-col 
                        v-for="employee in filteredEmployees" 
                        :key="employee.employeeName"
                        :xs="24" 
                        :sm="12" 
                        :md="8" 
                        :lg="6"
                    >
                        <el-card 
                            class="employee-card"
                            :body-style="{ padding: '0px' }"
                            @click="openTaskTimeline(employee)"
                        >
                            <div class="employee-card-header">
                                <el-avatar 
                                    :size="60" 
                                    :src="employee.avatar"
                                    class="employee-avatar"
                                    :fit="'cover'"
                                >
                                    {{ employee.employeeName?.charAt(0) }}
                                </el-avatar>
                                <div class="employee-info">
                                    <h3>{{ employee.employeeName }}</h3>
                                    <p>{{ employee.department }} - {{ employee.position }}</p>
                                    <p class="employee-details">
                                        <span>工号: {{ employee.jobNumber }}</span>
                                        <span>性别: {{ employee.sex }}</span>
                                        <span>政治面貌: {{ employee.polityStatus }}</span>
                                    </p>
                                </div>
                                <div class="task-progress">
                                    <el-progress 
                                        type="circle" 
                                        :percentage="getEmployeeProgress(employee)"
                                        :width="40"
                                        :stroke-width="8"
                                        :status="getProgressStatus(getEmployeeProgress(employee))"
                                    />
                                </div>
                            </div>
                            <div class="employee-card-content">
                                <div class="task-stats">
                                    <div class="stat">
                                        <span class="number">{{ employee.tasks?.length || 0 }}</span>
                                        <span class="label">总任务</span>
                                    </div>
                                    <div class="stat">
                                        <span class="number success">{{ getCompletedTaskCount(employee) }}</span>
                                        <span class="label">已完成</span>
                                    </div>
                                    <div class="stat">
                                        <span class="number warning">{{ getPendingTaskCount(employee) }}</span>
                                        <span class="label">进行中</span>
                                    </div>
                                </div>
                                <div v-if="!employee.tasks?.length" class="no-tasks-hint">
                                    暂无培训任务
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 在employee-grid下方添加分页组件 -->
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="pageNum"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handlePageChange"
                />
            </div>
        </el-card>

        <!-- 任务时间轴对话框 -->
        <el-dialog 
            v-model="taskDialogVisible" 
            title="任务时间轴"
            width="600px"
            class="task-dialog"
        >
            <div class="timeline-container">
                <template v-if="selectedEmployee?.tasks?.length">
                    <el-timeline>
                        <el-timeline-item
                            v-for="task in selectedEmployee.tasks"
                            :key="task.id"
                            :type="getTimelineItemType(task.status)"
                            :timestamp="task.deadline"
                            :hollow="task.status === 'pending'"
                        >
                            <el-card class="task-card">
                                <template #header>
                                    <div class="task-header">
                                        <h4>{{ task.title }}</h4>
                                        <el-tag :type="getTaskStatusType(task.status)">
                                            {{ getTaskStatusText(task.status) }}
                                        </el-tag>
                                    </div>
                                </template>
                                <p class="task-description">{{ task.description }}</p>
                                <div class="task-details">
                                    <p><strong>培训讲师:</strong> {{ task.trainer }}</p>
                                    <p><strong>培训地点:</strong> {{ task.location }}</p>
                                    <p><strong>培训时长:</strong> {{ task.duration }}小时</p>
                                    <p><strong>培训进度:</strong> {{ task.progress }}%</p>
                                    <p v-if="task.score"><strong>培训成绩:</strong> {{ task.score }}分</p>
                                    <p v-if="task.feedback"><strong>学员反馈:</strong> {{ task.feedback }}</p>
                                    <p v-if="task.trainerComments"><strong>讲师评语:</strong> {{ task.trainerComments }}</p>
                                </div>
                                <div class="task-footer">
                                    <span class="priority">
                                        <el-tag 
                                            size="small" 
                                            :type="getTaskPriorityType(task.priority)"
                                        >
                                            {{ task.priority === '高' ? '必修课程' : '选修课程' }}
                                        </el-tag>
                                    </span>
                                    <span class="time-info">
                                        <div>开始时间: {{ formatDate(task.startDate) }}</div>
                                        <div>结束时间: {{ formatDate(task.deadline) }}</div>
                                    </span>
                                </div>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </template>
                <template v-else>
                    <el-empty 
                        description="暂无培训任务" 
                        :image-size="80"
                    >
                        <template #description>
                            <p class="no-tasks-text">该员工暂未参加任何培训课程</p>
                        </template>
                    </el-empty>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { getAllEmployeeTask } from '@/api/employee'
import { ElMessage } from 'element-plus'

// 搜索功能
const searchQuery = ref('');

// 分页参数
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 修改员工数据的定义
const employees = ref([])

// 获取员工任务数据
const fetchEmployeeData = async () => {
    try {
        const response = await getAllEmployeeTask(pageNum.value, pageSize.value)
        console.log('Raw API Response:', response)

        if (!response) {
            console.error('No response received')
            return
        }

        // 检查响应码是否为字符串 "200"
        if (response.code === "200") {  // 修改这里，使用字符串比较
            const data = response.data
            console.log('Response data structure:', data)

            if (!data || !Array.isArray(data.list)) {
                console.warn('Invalid data structure:', data)
                return
            }

            employees.value = data.list.map(item => {
                const mappedEmployee = {
                    employeeName: item.name,
                    jobNumber: item.jobNumber,
                    department: item.department,
                    position: item.employeeGraduate || '未设置职位',
                    sex: item.employeeSex ? '男' : '女',
                    polityStatus: item.employeePolityStatus,
                    avatar: '',
                    tasks: []
                }

                // 检查是否有培训课程数据
                if (Array.isArray(item.oneEmployeeTrainingCourseVos)) {
                    mappedEmployee.tasks = item.oneEmployeeTrainingCourseVos.map(task => ({
                        id: task.trainingId,
                        title: task.courseName,
                        description: task.courseDesc,
                        status: mapTaskStatus(task.completionStatus),
                        priority: mapPriority(task.isMandatory),
                        deadline: task.endDate,
                        progress: task.progressPercentage || 0,
                        score: task.score,
                        feedback: task.feedback,
                        trainerComments: task.trainerComments,
                        location: task.location,
                        trainer: task.trainerName,
                        startDate: task.startDate,
                        duration: task.durationHours
                    }))
                }

                return mappedEmployee
            })

            total.value = data.total
            console.log('Processed employees:', employees.value)
        } else {
            console.error('API error:', response.message)
            ElMessage.error(response.message || '获取数据失败')
        }
    } catch (error) {
        console.error('Error details:', error)
        ElMessage.error('获取数据失败')
    }
}

// 在组件挂载时获取数据
onMounted(() => {
    fetchEmployeeData()
})

// 添加分页处理
const handlePageChange = (newPage) => {
    pageNum.value = newPage
    fetchEmployeeData()
}

const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    pageNum.value = 1
    fetchEmployeeData()
}

// 过滤员工列表
const filteredEmployees = computed(() => {
    if (!searchQuery.value) return employees.value;
    return employees.value.filter(emp => 
        emp.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// 对话框控制
const taskDialogVisible = ref(false);
const selectedEmployee = ref(null);

// 打开任务时间轴
const openTaskTimeline = (employee) => {
    selectedEmployee.value = employee;
    taskDialogVisible.value = true;
};

// 获取员工任务进度
const getEmployeeProgress = (employee) => {
    if (!employee.tasks?.length) return 0
    const completedTasks = employee.tasks.filter(task => task.status === 'completed').length
    return Math.round((completedTasks / employee.tasks.length) * 100)
}

// 获取进度状态
const getProgressStatus = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'warning';
    return 'exception';
};

// 获取任务状态类型
const getTaskStatusType = (status) => {
    const typeMap = {
        'completed': 'success',
        'in-progress': 'warning',
        'pending': 'info'
    };
    return typeMap[status] || 'info';
};

// 获取任务状态文本
const getTaskStatusText = (status) => {
    const textMap = {
        'completed': '已完成',
        'in-progress': '进行中',
        'pending': '待开始'
    };
    return textMap[status] || '未知';
};

// 获取任务优先级类型
const getTaskPriorityType = (priority) => {
    const typeMap = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
    };
    return typeMap[priority] || 'info';
};

// 获取时间轴项目类型
const getTimelineItemType = (status) => {
    const typeMap = {
        'completed': 'success',
        'in-progress': 'warning',
        'pending': 'info'
    };
    return typeMap[status] || 'info';
};

// 格式化日期
const formatDate = (date) => {
    if (!date) return '未设置'
    return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 统计函数
const getTotalTasks = () => {
    return employees.value.reduce((total, emp) => total + (emp.tasks?.length || 0), 0);
};

const getCompletedTasks = () => {
    return employees.value.reduce((total, emp) => 
        total + (emp.tasks?.filter(task => task.status === 'completed').length || 0), 0
    );
};

const getInProgressTasks = () => {
    return employees.value.reduce((total, emp) => 
        total + (emp.tasks?.filter(task => task.status === 'in-progress').length || 0), 0
    );
};

const getCompletedTaskCount = (employee) => {
    return employee.tasks?.filter(task => task.status === 'completed').length || 0
}

const getPendingTaskCount = (employee) => {
    return employee.tasks?.filter(task => task.status === 'in-progress' || task.status === 'pending').length || 0
}

// 状态映射函数
const mapTaskStatus = (status) => {
    const statusMap = {
        0: 'pending',    // 退出
        1: 'in-progress', // 未完成
        2: 'completed'    // 已完成
    }
    return statusMap[status] || 'pending'
}

// 优先级映射函数
const mapPriority = (isMandatory) => {
    return isMandatory ? '高' : '中'
}
</script>

<style scoped>
.employee-assessment {
    padding: 20px;
    background: linear-gradient(135deg, #f6f8fb 0%, #f0f4f8 100%);
    min-height: 100vh;
    max-width: 1400px;
    margin: 0 auto;
}

.box-card {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95);
    width: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;  /* 添加左右内边距 */
}

.header-left {
    display: flex;
    align-items: center;
    gap: 50px;
}

.title {
    margin: 0;
    font-size: 24px;
    color: #2c3e50;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.statistics {
    display: flex;
    gap: 30px;
    min-width: 300px;
    background: linear-gradient(to right, #f8f9fa, #ffffff);
    padding: 15px 20px;
    border-radius: 8px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 15px;
    border-right: 1px solid #ebeef5;
    flex: 1;            /* 平均分配空间 */
}

.stat-item:last-child {
    border-right: none;
}

.stat-item .label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 5px;
}

.stat-item .value {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    background: linear-gradient(45deg, #36d1dc, #5b86e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.value.success { 
    background: linear-gradient(45deg, #42b883, #42d392);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.value.warning { 
    background: linear-gradient(45deg, #ffb347, #ffcc33);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.search-input {
    width: 250px;
    margin-left: 20px;  /* 与左侧保持距离 */
    :deep(.el-input__wrapper) {
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        padding: 0 15px;
    }
    
    :deep(.el-input__inner) {
        height: 36px;
    }
}

.employee-grid {
    margin-top: 20px;
    padding: 0 20px;    /* 统一左右内边距 */
}

.employee-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.employee-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    border-color: rgba(0, 0, 0, 0);
}

.employee-card-header {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    position: relative;
    border-bottom: 1px solid #ebeef5;
}

.employee-info {
    flex-grow: 1;
    padding-right: 50px;
    min-width: 0;  /* 防止文本溢出 */
}

.employee-info h3 {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
    letter-spacing: 0.3px;
}

.employee-info p {
    margin: 5px 0 0;
    color: #909399;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.task-progress {
    position: absolute;
    top: 10px;
    right: 10px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.employee-card-content {
    padding: 15px 20px;  /* 调整内边距使其更协调 */
}

.task-stats {
    display: flex;
    justify-content: space-around;
    text-align: center;
    padding: 15px 0;
    background: linear-gradient(to right, #ffffff, #f8f9fa);
    border-radius: 8px;
    min-height: 80px;  /* 确保高度一致 */
}

.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 10px;
    justify-content: center;  /* 确保垂直居中 */
}

.stat .number {
    font-size: 20px;
    font-weight: bold;
    background: linear-gradient(45deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
}

.stat .number.success { color: #67C23A; }
.stat .number.warning { color: #E6A23C; }

.stat .label {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

.timeline-container {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
    background-color: #fff;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.task-card {
    margin-bottom: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.task-header h4 {
    margin: 0;
    font-size: 16px;
}

.task-description {
    color: #606266;
    margin: 10px 0;
}

.task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    font-size: 14px;
    color: #909399;
}

:deep(.el-timeline-item__node) {
    width: 12px;
    height: 12px;
}

:deep(.el-timeline-item__tail) {
    left: 5px;
}

:deep(.el-card) {
    border-radius: 8px;
    overflow: hidden;
}

:deep(.el-progress-circle) {
    width: 40px !important;
    height: 40px !important;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 0 0 12px 12px;
}

.employee-details {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.employee-details span {
    background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    color: #5c6b7c;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-details {
    margin: 15px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #ebeef5;
}

.task-details p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.5;
}

.time-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
}

/* 时间轴对话框样式优化 */
.task-dialog {
    :deep(.el-dialog) {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    :deep(.el-dialog__header) {
        padding: 20px;
        margin: 0;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
}

/* 响应式布局优化 */
@media screen and (max-width: 1200px) {
    .employee-assessment {
        max-width: 100%;
        padding: 15px;
    }
}

@media screen and (max-width: 768px) {
    .header-left {
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
    }
    
    .statistics {
        width: 100%;
        justify-content: space-between;
        min-width: auto;
    }
    
    .search-input {
        width: 100%;
        margin-top: 15px;
        margin-left: 0;
    }

    .employee-grid {
        padding: 0 10px;
    }
}

.no-tasks-hint {
    text-align: center;
    color: #909399;
    font-size: 13px;
    margin-top: 10px;
    padding: 8px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 8px;
    border: 1px dashed #e0e3e7;
}

.employee-avatar {
    flex-shrink: 0;  /* 防止头像被压缩 */
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
}

:deep(.el-avatar) {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #5c6b7c;
    font-weight: 600;
}
</style> 