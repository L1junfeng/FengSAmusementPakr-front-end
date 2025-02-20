<template>
    <div class="scenic-area-event-management">
        <el-main class="main-content">
            <!-- 搜索区域 -->
            <el-card class="search-card">
                <template #header>
                    <div class="card-header">
                        <div class="left-tools">
                            <el-button-group size="small">
                                <el-button type="primary" @click="showAddEvent">
                                    <el-icon><Plus /></el-icon>新增
                                </el-button>
                                <el-button type="success" @click="exportEvents">
                                    <el-icon><Download /></el-icon>导出
                                </el-button>
                            </el-button-group>
                        </div>
                        <span class="page-title">景区事件管理</span>
                    </div>
                </template>
                
                <el-form :inline="true" :model="searchForm" class="search-form">
                    <el-form-item label="事件编号">
                        <el-input v-model="searchForm.eventNo" placeholder="请输入事件编号" clearable />
                    </el-form-item>
                    <el-form-item label="事件类型">
                        <el-select v-model="searchForm.eventType" placeholder="请选择类型" clearable>
                            <el-option label="安全事件" :value="1" />
                            <el-option label="服务事件" :value="2" />
                            <el-option label="设施事件" :value="3" />
                            <el-option label="其他事件" :value="4" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="事件级别">
                        <el-select v-model="searchForm.eventLevel" placeholder="请选择级别" clearable>
                            <el-option label="一般" :value="1" />
                            <el-option label="重要" :value="2" />
                            <el-option label="紧急" :value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="事件状态">
                        <el-select v-model="searchForm.eventState" placeholder="请选择状态" clearable>
                            <el-option label="待处理" :value="0" />
                            <el-option label="处理中" :value="1" />
                            <el-option label="已完成" :value="2" />
                            <el-option label="已关闭" :value="3" />
                            <el-option label="已超时" :value="4" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="时间范围">
                        <el-date-picker
                            v-model="searchForm.timeRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="YYYY-MM-DD"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">
                            <el-icon><Search /></el-icon>搜索
                        </el-button>
                        <el-button @click="resetSearch">
                            <el-icon><Refresh /></el-icon>重置
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 表格区域 -->
            <el-card class="main-card">
                <el-tabs v-model="activeView">
                    <el-tab-pane label="列表视图" name="list">
                        <el-table 
                            :data="eventList" 
                            style="width: 100%"
                            border
                            stripe
                            height="calc(100vh - 380px)"
                            v-loading="loading"
                        >
                            <el-table-column prop="eventNo" label="事件编号" width="120" show-overflow-tooltip />
                            <el-table-column prop="eventTitle" label="事件标题" min-width="180" show-overflow-tooltip />
                            <el-table-column prop="eventType" label="类型" width="100">
                                <template #default="scope">
                                    <el-tag :type="getEventTypeType(scope.row.eventType)">
                                        {{ getEventTypeText(scope.row.eventType) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="eventLevel" label="级别" width="100">
                                <template #default="scope">
                                    <el-tag :type="getEventLevelType(scope.row.eventLevel)">
                                        {{ getEventLevelText(scope.row.eventLevel) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="eventTime" label="事发时间" width="160">
                                <template #default="scope">
                                    {{ formatDateTime(scope.row.eventTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="estimateFinishTime" label="预计完成时间" width="160">
                                <template #default="scope">
                                    {{ formatDateTime(scope.row.estimateFinishTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="eventPlace" label="事发地点" min-width="150" show-overflow-tooltip />
                            <el-table-column prop="eventState" label="状态" width="100">
                                <template #default="scope">
                                    <el-tag :type="getEventStateType(scope.row.eventState)">
                                        {{ getEventStateText(scope.row.eventState) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="eventReportPerson" label="上报人" width="120" />
                            <el-table-column label="操作" width="200" fixed="right">
                                <template #default="scope">
                                    <el-button-group>
                                        <el-button size="small" type="primary" @click="viewEvent(scope.row)">
                                            <el-icon><View /></el-icon>查看
                                        </el-button>
                                        <el-button size="small" type="success" @click="editEvent(scope.row)">
                                            <el-icon><Edit /></el-icon>编辑
                                        </el-button>
                                        <el-button size="small" type="danger" @click="deleteEvent(scope.row.eventId)">
                                            <el-icon><Delete /></el-icon>删除
                                        </el-button>
                                    </el-button-group>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 分页 -->
                        <div class="pagination-container">
                            <el-pagination
                                v-model:current-page="pageParams.page"
                                v-model:page-size="pageParams.limit"
                                :page-sizes="[10, 20, 50, 100]"
                                :total="total"
                                layout="total, sizes, prev, pager, next, jumper"
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                            />
                        </div>
                    </el-tab-pane>
                    
                    <el-tab-pane label="时间线视图" name="timeline">
                        <div class="timeline-container">
                            <el-timeline>
                                <el-timeline-item
                                    v-for="event in eventList"
                                    :key="event.eventId"
                                    :type="getEventStateType(event.eventState)"
                                    :timestamp="formatDateTime(event.eventTime)"
                                    :hollow="true"
                                >
                                    <el-card class="timeline-card">
                                        <template #header>
                                            <div class="timeline-header">
                                                <h4>{{ event.eventTitle }}</h4>
                                                <div class="timeline-tags">
                                                    <el-tag :type="getEventTypeType(event.eventType)" size="small">
                                                        {{ getEventTypeText(event.eventType) }}
                                                    </el-tag>
                                                    <el-tag :type="getEventLevelType(event.eventLevel)" size="small">
                                                        {{ getEventLevelText(event.eventLevel) }}
                                                    </el-tag>
                                                    <el-tag :type="getEventStateType(event.eventState)" size="small">
                                                        {{ getEventStateText(event.eventState) }}
                                                    </el-tag>
                                                </div>
                                            </div>
                                        </template>
                                        <div class="timeline-content">
                                            <p class="event-place">
                                                <el-icon><Location /></el-icon>
                                                {{ event.eventPlace || '未设置地点' }}
                                            </p>
                                            <p class="event-content">{{ event.eventContent }}</p>
                                            <p class="event-reporter">上报人：{{ event.eventReportPerson }}</p>
                                            <p class="event-estimate-time">
                                                预计完成时间：{{ formatDateTime(event.estimateFinishTime) }}
                                            </p>
                                        </div>
                                        <div class="timeline-footer">
                                            <el-button-group>
                                                <el-button size="small" type="primary" @click="viewEvent(event)">
                                                    <el-icon><View /></el-icon>查看
                                                </el-button>
                                                <el-button size="small" type="success" @click="editEvent(event)">
                                                    <el-icon><Edit /></el-icon>编辑
                                                </el-button>
                                                <el-button 
                                                    size="small" 
                                                    type="danger" 
                                                    @click="deleteEvent(event.eventId)"
                                                    :disabled="event.eventState === 2"
                                                >
                                                    <el-icon><Delete /></el-icon>删除
                                                </el-button>
                                            </el-button-group>
                                        </div>
                                    </el-card>
                                </el-timeline-item>
                            </el-timeline>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>

            <!-- 事件详情/编辑对话框 -->
            <el-dialog 
                v-model="dialogVisible" 
                :title="dialogTitle"
                width="800px"
                destroy-on-close
                @closed="handleDialogClose"
            >
                <el-form 
                    :model="currentEvent" 
                    label-width="120px" 
                    :rules="rules" 
                    ref="eventForm"
                    :disabled="isViewMode"
                >
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="事件标题" prop="eventTitle">
                                <el-input v-model="currentEvent.eventTitle" placeholder="请输入事件标题"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="事件编号" prop="eventNo">
                                <el-input v-model="currentEvent.eventNo" placeholder="请输入事件编号"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="事件类型" prop="eventType">
                                <el-select v-model="currentEvent.eventType" placeholder="请选择类型" style="width: 100%">
                                    <el-option label="安全事件" :value="1" />
                                    <el-option label="服务事件" :value="2" />
                                    <el-option label="设施事件" :value="3" />
                                    <el-option label="其他事件" :value="4" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="事件级别" prop="eventLevel">
                                <el-select v-model="currentEvent.eventLevel" placeholder="请选择级别" style="width: 100%">
                                    <el-option label="一般" :value="1" />
                                    <el-option label="重要" :value="2" />
                                    <el-option label="紧急" :value="3" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="事件状态" prop="eventState">
                                <el-select v-model="currentEvent.eventState" placeholder="请选择状态" style="width: 100%">
                                    <el-option label="待处理" :value="0" />
                                    <el-option label="处理中" :value="1" />
                                    <el-option label="已完成" :value="2" />
                                    <el-option label="已关闭" :value="3" />
                                    <el-option label="已超时" :value="4" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="事发时间" prop="eventTime">
                                <el-date-picker
                                    v-model="currentEvent.eventTime"
                                    type="datetime"
                                    placeholder="选择事发时间"
                                    style="width: 100%"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="预计完成时间" prop="estimateFinishTime">
                                <el-date-picker
                                    v-model="currentEvent.estimateFinishTime"
                                    type="datetime"
                                    placeholder="选择预计完成时间"
                                    style="width: 100%"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="事发地点" prop="eventPlace">
                                <el-input v-model="currentEvent.eventPlace" placeholder="请输入详细地点"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="事发区域" prop="eventArea">
                                <el-input v-model="currentEvent.eventArea" placeholder="请输入事发区域"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="经度" prop="lng">
                                <el-input v-model="currentEvent.lng" placeholder="请输入经度"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="纬度" prop="lat">
                                <el-input v-model="currentEvent.lat" placeholder="请输入纬度"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="上报人" prop="eventReportPerson">
                                <el-input v-model="currentEvent.eventReportPerson" placeholder="请输入上报人姓名"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="上报人电话" prop="eventReportTel">
                                <el-input v-model="currentEvent.eventReportTel" placeholder="请输入联系电话"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="身份证号" prop="eventReportCardid">
                                <el-input v-model="currentEvent.eventReportCardid" placeholder="请输入身份证号"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="事件内容" prop="eventContent">
                        <el-input
                            v-model="currentEvent.eventContent"
                            type="textarea"
                            :rows="4"
                            placeholder="请输入事件详细内容"
                        />
                    </el-form-item>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="系统标识" prop="sysCode">
                                <el-input v-model="currentEvent.sysCode" placeholder="请输入系统标识"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="事件来源" prop="eventSource">
                                <el-input v-model="currentEvent.eventSource" placeholder="请输入事件来源"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="补单标识" prop="supplementFlag">
                                <el-radio-group v-model="currentEvent.supplementFlag">
                                    <el-radio :label="0">否</el-radio>
                                    <el-radio :label="1">是</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="审核状态" prop="auditState">
                                <el-select v-model="currentEvent.auditState" placeholder="请选择审核状态" style="width: 100%">
                                    <el-option label="待审核" :value="0" />
                                    <el-option label="已审核" :value="1" />
                                    <el-option label="已驳回" :value="2" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">{{ isViewMode ? '关闭' : '取消' }}</el-button>
                        <el-button v-if="!isViewMode" type="primary" @click="saveEvent">确定</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-main>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, Location, Download, Search, Refresh, View } from '@element-plus/icons-vue'
import { getEventList, getEventById, addEvent, updateEvent } from '@/api/projectEvent'
import { useRoute } from 'vue-router'

// 事件列表
const eventList = ref([])

// 添加表单引用
const eventForm = ref(null)
const dialogVisible = ref(false)
const isViewMode = ref(false)
const currentEvent = ref({})

// 获取对话框标题
const dialogTitle = computed(() => {
    if (isViewMode.value) return '查看事件'
    return currentEvent.value.eventId ? '编辑事件' : '添加事件'
})

const loading = ref(false)

// 获取事件列表
const fetchEventList = async () => {
    loading.value = true
    try {
        const { data } = await getEventList(pageParams.value.page, pageParams.value.limit)
        if (data && data.list) {
            eventList.value = data.list
            total.value = data.total
        }
    } catch (error) {
        ElMessage.error('获取事件列表失败')
    } finally {
        loading.value = false
    }
}

// 添加事件
const showAddEvent = () => {
    currentEvent.value = {
        eventNo: '',
        sysCode: '',
        eventSource: '',
        eventType: 1,
        eventLevel: 1,
        eventReportPerson: '',
        eventReportTel: '',
        eventReportCardid: '',
        eventTime: new Date().toISOString(),
        estimateFinishTime: '',
        eventPlace: '',
        eventArea: '',
        lat: '',
        lng: '',
        eventTitle: '',
        eventContent: '',
        eventState: 0,
        eventPageUrl: '',
        supplementFlag: 0,
        auditState: 0,
        deleted: 0,
        creator: null
    }
    dialogVisible.value = true
}

// 编辑事件
const editEvent = async (row) => {
    try {
        isViewMode.value = false
        const { data } = await getEventById(row.eventId)
        currentEvent.value = { ...data }
        dialogVisible.value = true
    } catch (error) {
        ElMessage.error('获取事件详情失败')
    }
}

// 保存事件
const saveEvent = async () => {
    if (!eventForm.value) return
    
    try {
        await eventForm.value.validate(async (valid) => {
            if (valid) {
                const saveData = {
                    ...currentEvent.value,
                    eventType: Number(currentEvent.value.eventType),
                    eventLevel: Number(currentEvent.value.eventLevel),
                    eventState: Number(currentEvent.value.eventState),
                    supplementFlag: Number(currentEvent.value.supplementFlag),
                    auditState: Number(currentEvent.value.auditState),
                    deleted: Number(currentEvent.value.deleted)
                }

                if (saveData.eventId) {
                    await updateEvent(saveData)
                    ElMessage.success('更新成功')
                } else {
                    await addEvent(saveData)
                    ElMessage.success('添加成功')
                }
                dialogVisible.value = false
                fetchEventList()
            }
        })
    } catch (error) {
        ElMessage.error(error.message || '操作失败')
    }
}

// 查看事件详情
const viewEvent = async (row) => {
    try {
        isViewMode.value = true
        const { data } = await getEventById(row.eventId)
        currentEvent.value = { ...data }
        dialogVisible.value = true
    } catch (error) {
        ElMessage.error('获取事件详情失败')
    }
}

// 删除事件
const deleteEvent = (id) => {
    ElMessageBox.confirm('确定要删除这个事件吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 实现删除逻辑
        ElMessage.success('事件删除成功')
        fetchEventList()
    }).catch(() => {
        // 取消删除
    })
}

// 获取状态标签类型
const getStatusType = (status) => {
    switch (status) {
        case '计划中': return 'warning'
        case '进行中': return 'success'
        case '已完成': return 'info'
        case '已取消': return 'danger'
        default: return ''
    }
}

// 分页参数
const pageParams = ref({
    page: 1,
    limit: 10
})
const total = ref(0)

// 搜索表单
const searchForm = ref({
    eventNo: '',
    eventType: null,
    eventLevel: null,
    eventState: null,
    timeRange: []
})

// 搜索
const handleSearch = () => {
    pageParams.value.page = 1
    fetchEventList()
}

// 重置搜索
const resetSearch = () => {
    searchForm.value = {
        eventNo: '',
        eventType: null,
        eventLevel: null,
        eventState: null,
        timeRange: []
    }
    handleSearch()
}

// 分页大小改变
const handleSizeChange = (val) => {
    pageParams.value.limit = val
    fetchEventList()
}

// 页码改变
const handleCurrentChange = (val) => {
    pageParams.value.page = val
    fetchEventList()
}

// 页面加载时获取数据
const route = useRoute()
onMounted(() => {
    const fromScenery = route.query.fromScenery
    if (fromScenery === 'true') {
        // 预填充事件信息
        currentEvent.value = {
            eventNo: '',
            sysCode: '',
            eventSource: route.query.eventSource || '景点直接发布',
            eventType: 1,
            eventLevel: 1,
            eventReportPerson: '', // 可以从用户信息中获取
            eventReportTel: '',
            eventReportCardid: '',
            eventTime: new Date().toISOString(),
            estimateFinishTime: '',
            eventPlace: route.query.sceneryName || '',
            eventArea: route.query.sceneryArea || '',
            lat: route.query.latitude || '',
            lng: route.query.longitude || '',
            eventTitle: '',
            eventContent: '',
            eventState: 0,
            eventPageUrl: '',
            supplementFlag: 0,
            auditState: 0,
            deleted: 0,
            creator: null
        }
        // 自动打开新建事件对话框
        dialogVisible.value = true
        isViewMode.value = false
    }
    
    // 获取事件列表
    fetchEventList()
})

// 状态映射方法
const getEventTypeText = (type) => {
    const map = {
        1: '安全事件',
        2: '服务事件',
        3: '设施事件',
        4: '其他事件'
    }
    return map[type] || '未知'
}

const getEventLevelType = (level) => {
    const map = {
        1: 'info',
        2: 'warning',
        3: 'danger'
    }
    return map[level] || ''
}

// ... 其他辅助方法

// 表单校验规则
const rules = {
    eventTitle: [
        { required: true, message: '请输入事件标题', trigger: 'blur' },
        { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    eventType: [
        { required: true, message: '请选择事件类型', trigger: 'change' }
    ],
    // ... 其他验证规则
}

// 格式化日期时间
const formatDateTime = (time) => {
    if (!time) return '-'
    const date = new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 事件类型映射
const getEventTypeType = (type) => {
    const map = {
        1: 'success',
        2: 'warning',
        3: 'danger',
        4: 'info'
    }
    return map[type] || ''
}

const getEventStateType = (state) => {
    const map = {
        0: 'warning',
        1: 'success',
        2: 'info',
        3: 'danger',
        4: 'info'
    }
    return map[state] || ''
}

const getEventStateText = (state) => {
    const map = {
        0: '待处理',
        1: '处理中',
        2: '已完成',
        3: '已关闭',
        4: '已超时'
    }
    return map[state] || '未知'
}

// 修改对话框关闭时的处理
const handleDialogClose = () => {
    isViewMode.value = false
    currentEvent.value = {}
    if (eventForm.value) {
        eventForm.value.resetFields()
    }
}

// 新增 activeView 和 timeline-container 样式
const activeView = ref('list')
</script>

<style scoped>
.scenic-area-event-management {
    height: 100vh;
    background-color: #f0f2f5;
    padding: 16px;
    box-sizing: border-box;
}

.main-content {
    padding: 0 !important;
    height: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    margin: 0;
}

.left-tools {
    display: flex;
    gap: 8px;
}

.page-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

.search-card {
    margin-bottom: 16px;
}

.main-card {
    margin-bottom: 16px;
}

.custom-tabs :deep(.el-tabs__nav-wrap) {
    padding: 0 20px;
}

.timeline-container {
    padding: 20px;
    height: calc(100vh - 280px);
    overflow-y: auto;
}

.timeline-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.timeline-header h4 {
    margin: 0;
    color: #303133;
    font-size: 16px;
}

.timeline-content {
    margin: 12px 0;
    color: #606266;
}

.timeline-content p {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
}

.timeline-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-button-group .el-button--small) {
    padding: 8px 16px;
}

:deep(.el-button [class*=el-icon]+span) {
    margin-left: 4px;
}

:deep(.el-timeline-item__content) {
    min-height: auto;
}

.search-form {
    padding: 12px;
}

.pagination-container {
    margin-top: 16px;
    padding: 8px 0;
}

:deep(.el-tag) {
    margin-right: 5px;
}

:deep(.el-form--inline .el-form-item) {
    margin-bottom: 10px;
}
</style>