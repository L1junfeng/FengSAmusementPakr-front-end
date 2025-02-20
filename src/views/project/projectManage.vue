<template>
    <div class="page-container">
        <!-- 搜索区域 -->
        <div class="search-div" :class="{ 'search-collapsed': isCollapsed }">
            <div class="search-header">
                <span class="title">搜索条件</span>
                <el-button 
                    type="text" 
                    @click="toggleCollapse"
                    :icon="isCollapsed ? ArrowDown : ArrowUp"
                >
                    {{ isCollapsed ? '展开' : '收起' }}
                </el-button>
            </div>
            <el-form v-show="!isCollapsed" label-width="80px" size="small">
                <el-row :gutter="20"> 
                    <el-col :span="6">
                        <el-form-item label="景点名称">
                            <el-input v-model="queryDto.sceneryName" clearable placeholder="请输入景点名称"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="门票价格">
                            <el-input v-model="queryDto.sceneryFares" clearable placeholder="请输入价格范围"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="景点状态">
                            <el-select v-model="queryDto.sceneryStatus" clearable placeholder="请选择状态" style="width: 100%">
                                <el-option label="维护中" :value="0"></el-option>
                                <el-option label="运行中" :value="1"></el-option>
                                <el-option label="休息中" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6" class="search-btn-group">
                        <el-button-group>
                            <el-button type="primary" @click="searchScenerySpot">
                                <el-icon><Search /></el-icon>搜索
                            </el-button>
                            <el-button @click="resetData">
                                <el-icon><RefreshRight /></el-icon>重置
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </el-form>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
            <div class="table-header">
                <div class="left-tools">
                    <el-button-group>
                        <el-button type="success" @click="addShow">
                            <el-icon><Plus /></el-icon>添加景点
                        </el-button>
                        <el-button type="primary" @click="refreshData">
                            <el-icon><Refresh /></el-icon>刷新
                        </el-button>
                    </el-button-group>
                </div>
            </div>

            <el-table 
                :data="list" 
                style="width: 100%"
                border
                stripe
                height="calc(100vh - 230px)"
                @expand-change="handleExpand"
            >
                <el-table-column type="expand">
                    <template #default="props">
                        <el-table
                            :data="props.row.facilities"
                            style="width: 100%; background-color: #f9f9f9;"
                            border
                            v-loading="props.row.facilitiesLoading"
                        >
                            <el-table-column label="设施ID" prop="facilitiesId" width="120" />
                            <el-table-column label="购买时间" prop="buyTime" width="250">
                                <template #default="scope">
                                    {{ scope.row.buyTime }}年
                                </template>
                            </el-table-column>
                            <el-table-column label="预计使用周期" prop="expectedToUseCycle" width="250">
                                <template #default="scope">
                                    {{ scope.row.expectedToUseCycle }}年
                                </template>
                            </el-table-column>
                            <el-table-column label="损耗情况" prop="lossSituation" width="250">
                                <template #default="scope">
                                    <el-tag :type="getLossType(scope.row.lossSituation)">
                                        {{ getLossText(scope.row.lossSituation) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="维护时间" prop="maintenance" width="280">
                                <template #default="scope">
                                    {{ formatDateTime(scope.row.maintenance) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" prop="status" width="200">
                                <template #default="scope">
                                    <el-tag :type="getFacilityStatusType(scope.row.status)">
                                        {{ getFacilityStatusText(scope.row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="200" fixed="right">
                                <template #default="scope">
                                    <el-button-group>
                                        <el-button 
                                            type="primary" 
                                            size="small" 
                                            @click="editFacility(scope.row)"
                                        >
                                            修改
                                        </el-button>
                                        <el-button 
                                            type="danger" 
                                            size="small" 
                                            @click="handleDeleteFacility(scope.row.facilitiesId)"
                                        >
                                            删除
                                        </el-button>
                                    </el-button-group>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div class="facility-footer">
                            <el-button 
                                type="primary" 
                                size="small" 
                                @click="showAddFacility(props.row.sceneryId)"
                            >
                                添加设施
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="sceneryName" label="景点名称" min-width="180" />
                <el-table-column prop="sceneryAddress" label="地址" min-width="200" />
                <el-table-column prop="sceneryPhone" label="联系方式" min-width="140" />
                <el-table-column prop="sceneryFares" label="门票价格" min-width="100" />
                <el-table-column prop="sceneryBtime" label="开放时间" min-width="130" />
                <el-table-column prop="endTime" label="关闭时间" min-width="130" />
                <el-table-column label="景点状态" min-width="100">
                    <template #default="scope">
                        <el-tag :type="statusTag(scope.row.sceneryStatus)">
                            {{ statusText(scope.row.sceneryStatus) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="380">
                    <template #default="scope">
                        <el-button-group>
                            <el-button type="primary" size="small" @click="editShow(scope.row)">修改</el-button>
                            <el-button type="warning" size="small" @click="changeStatus(scope.row)">修改状态</el-button>
                            <el-button type="success" size="small" @click="createEventFromScenery(scope.row)">
                                <el-icon><Bell /></el-icon>发布事件
                            </el-button>
                            <el-button type="danger" size="small" @click="deleteById(scope.row.sceneryId)">删除</el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页器 -->
            <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="pageParams.page"
                    v-model:page-size="pageParams.limit"
                    :page-sizes="[10, 20, 50, 100]"
                    @size-change="fetchData"
                    @current-change="fetchData"
                    layout="total, sizes, prev, pager, next"
                    :total="total"
                    background
                />
            </div>
        </div>

        <el-dialog v-model="dialogVisible" title="景点信息" width="600px">
            <el-form :model="scenerySpot" label-width="100px">
                <el-form-item label="景点名称">
                    <el-input v-model="scenerySpot.sceneryName"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="scenerySpot.sceneryAddress"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="scenerySpot.sceneryDesc"></el-input>
                </el-form-item>
                <el-form-item label="联系方式">
                    <el-input v-model="scenerySpot.sceneryPhone"></el-input>
                </el-form-item>
                <el-form-item label="门票价格">
                    <el-input v-model="scenerySpot.sceneryFares" type="number"></el-input>
                </el-form-item>
                <el-form-item label="开放时间">
                    <el-time-picker
                        v-model="scenerySpot.sceneryBtime"
                        placeholder="选择开放时间"
                        format="HH:mm"
                        value-format="HH:mm"
                    />
                </el-form-item>
                <el-form-item label="关闭时间">
                    <el-time-picker
                        v-model="scenerySpot.endTime"
                        placeholder="选择关闭时间"
                        format="HH:mm"
                        value-format="HH:mm"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveScenerySpot">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="statusDialogVisible" title="修改景点状态" width="400px">
            <el-form :model="statusForm" label-width="100px">
                <el-form-item label="景点状态">
                    <el-select v-model="statusForm.sceneryStatus" placeholder="请选择状态">
                        <el-option label="维护中" :value="0"></el-option>
                        <el-option label="运行中" :value="1"></el-option>
                        <el-option label="休息中" :value="2"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="statusDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveStatus">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog 
            v-model="facilityDialogVisible" 
            :title="facilityForm.facilitiesId ? '修改设施' : '添加设施'"
            width="500px"
        >
            <el-form :model="facilityForm" label-width="100px">
                <el-form-item label="购买时间">
                    <el-input-number 
                        v-model="facilityForm.buyTime" 
                        :min="1900" 
                        :max="new Date().getFullYear()"
                    />
                </el-form-item>
                <el-form-item label="使用周期">
                    <el-input-number 
                        v-model="facilityForm.expectedToUseCycle" 
                        :min="1" 
                        :max="100"
                    />
                </el-form-item>
                <el-form-item label="损耗情况">
                    <el-select v-model="facilityForm.lossSituation">
                        <el-option label="良好" :value="0" />
                        <el-option label="轻微损耗" :value="1" />
                        <el-option label="中度损耗" :value="2" />
                        <el-option label="严重损耗" :value="3" />
                    </el-select>
                </el-form-item>
                <el-form-item label="维护时间">
                    <el-date-picker
                        v-model="facilityForm.maintenance"
                        type="datetime"
                        placeholder="选择维护时间"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="facilityForm.status">
                        <el-option label="正常使用" :value="1" />
                        <el-option label="维护中" :value="0" />
                        <el-option label="已报废" :value="2" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="facilityDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveFacility">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search, Refresh, RefreshRight, ArrowUp, ArrowDown, Plus, Bell } from '@element-plus/icons-vue';
import { GetScenerySpotListByPage, SaveScenerySpot, UpdateScenerySpot, DeleteScenerySpotById } from '@/api/projectManage';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getFacilityList, addFacility, updateFacility, deleteFacility } from '@/api/projectFacility'

const list = ref([]);
const total = ref(0);
const pageParams = ref({ page: 1, limit: 10 });
const queryDto = ref({ sceneryName: "", sceneryFares: "", sceneryBtime: "", sceneryStatus: null });
const dialogVisible = ref(false);
const scenerySpot = ref({});
const statusDialogVisible = ref(false);
const statusForm = ref({
    sceneryId: null,
    sceneryStatus: null
});
const isCollapsed = ref(false);
const router = useRouter();

// 设施相关的数据
const facilityDialogVisible = ref(false)
const facilityForm = ref({})

onMounted(() => {
    fetchData();
});

const fetchData = async () => {
    const { data } = await GetScenerySpotListByPage(pageParams.value.page, pageParams.value.limit, queryDto.value);
    list.value = data.list;
    total.value = data.total;
};

const searchScenerySpot = () => {
    fetchData();
};

const resetData = () => {
    queryDto.value.sceneryName = "";
    queryDto.value.sceneryFares = "";
    queryDto.value.sceneryBtime = "";
    queryDto.value.sceneryStatus = null;
    fetchData();
};

const addShow = () => {
    scenerySpot.value = {};
    dialogVisible.value = true;
};

const editShow = (row) => {
    scenerySpot.value = { ...row };
    dialogVisible.value = true;
};

const saveScenerySpot = async () => {
    if (scenerySpot.value.sceneryId) {
        const { sceneryId, ...updateData } = scenerySpot.value;
        await UpdateScenerySpot(updateData, sceneryId);
        ElMessage.success('修改成功');
    } else {
        await SaveScenerySpot(scenerySpot.value);
        ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    fetchData();
};

const deleteById = (sceneryId) => {
    ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await DeleteScenerySpotById(sceneryId);
        ElMessage.success('删除成功');
        fetchData();
    });
};

const changeStatus = (row) => {
    statusForm.value.sceneryId = row.sceneryId;
    statusForm.value.sceneryStatus = row.sceneryStatus;
    statusDialogVisible.value = true;
};

const saveStatus = async () => {
    try {
        const updateData = { sceneryStatus: statusForm.value.sceneryStatus };
        await UpdateScenerySpot(updateData, statusForm.value.sceneryId);
        ElMessage.success('状态修改成功');
        statusDialogVisible.value = false;
        fetchData();
    } catch (error) {
        ElMessage.error('状态修改失败');
    }
};

// 状态映射
const statusText = (status) => {
    return status === 0 ? "维护中" : status === 1 ? "运行中" : "休息中";
};

// 状态颜色映射
const statusTag = (status) => {
    return status === 0 ? "danger" : status === 1 ? "success" : "warning";
};

// 切换搜索栏折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

// 刷新数据
const refreshData = () => {
    fetchData();
    ElMessage.success('数据已刷新');
};

const createEventFromScenery = (scenery) => {
    router.push({
        path: '/projectEvent',
        query: {
            fromScenery: 'true',
            sceneryId: scenery.sceneryId,
            sceneryName: scenery.sceneryName,
            sceneryArea: scenery.sceneryArea || '',
            latitude: scenery.latitude || '',
            longitude: scenery.longitude || '',
            eventSource: '景点直接发布',
            eventPlace: scenery.sceneryName,
            eventArea: scenery.sceneryArea || ''
        }
    });
};

// 加载设施列表
const loadFacilities = async (row) => {
    if (row.facilities) return
    row.facilitiesLoading = true
    try {
        const { data } = await getFacilityList(row.sceneryId, 1, 999)
        row.facilities = data.list
    } catch (error) {
        ElMessage.error('获取设施列表失败')
    } finally {
        row.facilitiesLoading = false
    }
}

// 修改函数名以避免冲突
const showAddFacility = (sceneryId) => {
    const now = new Date()
    // 格式化当前时间为后端需要的格式
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19)
    
    facilityForm.value = {
        scenerySpotId: sceneryId,
        buyTime: new Date().getFullYear(),
        expectedToUseCycle: 10,
        lossSituation: 0,
        maintenance: formattedDate, // 使用格式化后的时间
        status: 1,
        isDeleted: 0
    }
    facilityDialogVisible.value = true
}

// 修改设施
const editFacility = (facility) => {
    facilityForm.value = { ...facility }
    facilityDialogVisible.value = true
}

// 保存设施
const saveFacility = async () => {
    try {
        // 创建一个新对象来处理数据
        const formData = { ...facilityForm.value }
        
        // 格式化维护时间
        if (formData.maintenance instanceof Date) {
            formData.maintenance = formData.maintenance.toISOString().replace('T', ' ').substring(0, 19)
        } else if (typeof formData.maintenance === 'string') {
            // 如果已经是字符串，确保格式正确
            formData.maintenance = new Date(formData.maintenance).toISOString().replace('T', ' ').substring(0, 19)
        }

        if (formData.facilitiesId) {
            await updateFacility(formData)
            ElMessage.success('修改成功')
        } else {
            await addFacility(formData)
            ElMessage.success('添加成功')
        }
        
        facilityDialogVisible.value = false
        // 刷新设施列表
        const row = list.value.find(item => item.sceneryId === formData.scenerySpotId)
        if (row) {
            delete row.facilities
            await loadFacilities(row)
        }
    } catch (error) {
        console.error('保存设施失败:', error)
        ElMessage.error('操作失败')
    }
}

// 修改删除设施的函数名
const handleDeleteFacility = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该设施吗？', '警告', {
            type: 'warning'
        })
        await deleteFacility(id)
        ElMessage.success('删除成功')
        // 刷新设施列表
        const row = list.value.find(item => 
            item.facilities?.some(f => f.facilitiesId === id)
        )
        if (row) {
            delete row.facilities
            await loadFacilities(row)
        }
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}

// 状态转换方法
const getLossText = (status) => {
    const map = {
        0: '良好',
        1: '轻微损耗',
        2: '中度损耗',
        3: '严重损耗'
    }
    return map[status] || '未知'
}

const getLossType = (status) => {
    const map = {
        0: 'success',
        1: '',
        2: 'warning',
        3: 'danger'
    }
    return map[status] || 'info'
}

const getFacilityStatusText = (status) => {
    const map = {
        0: '维护中',
        1: '正常使用',
        2: '已报废'
    }
    return map[status] || '未知'
}

const getFacilityStatusType = (status) => {
    const map = {
        0: 'warning',
        1: 'success',
        2: 'danger'
    }
    return map[status] || 'info'
}

// 格式化时间
const formatDateTime = (time) => {
    if (!time) return '-'
    // 如果时间包含 'T' 或 'Z'，需要处理
    const date = typeof time === 'string' ? new Date(time.replace(' ', 'T') + 'Z') : new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 修改表格的 expand-change 事件处理
const handleExpand = (row) => {
    loadFacilities(row);
};
</script>

<style scoped>
.page-container {
    padding: 20px;
    height: 100vh;
    background-color: #f0f2f5;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.search-div {
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #409EFF;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.search-collapsed {
    padding: 10px 15px;
}

.table-section {
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.table-header {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left-tools {
    display: flex;
    gap: 8px;
}

.pagination-wrapper {
    margin-top: 20px;
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #ebeef5;
}

:deep(.el-table) {
    flex: 1;
    margin: 0;
    border-radius: 4px;
    overflow: hidden;
}

:deep(.el-table__header-wrapper) {
    background-color: #f5f7fa;
}

:deep(.el-table__body-wrapper) {
    overflow-y: auto;
}

:deep(.el-button-group) {
    display: flex;
    align-items: center;
}

:deep(.el-button [class*=el-icon]+span) {
    margin-left: 6px;
}

.search-btn-group {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
}

.facility-footer {
    margin-top: 16px;
    padding: 10px;
    text-align: center;
    background-color: #f5f7fa;
}

.el-table__expanded-cell {
    background-color: #f9f9f9;
    padding: 20px;
}

.el-table__expand-icon {
    transition: transform 0.3s;
}

.el-table__expand-icon--expanded {
    transform: rotate(90deg);
}
</style>
