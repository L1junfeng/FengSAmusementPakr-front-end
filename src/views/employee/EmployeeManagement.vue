<template>
    <div class="employee-management">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span class="title">员工基础信息管理</span>
                    <el-button type="primary" @click="openAddEmployeeDialog">添加员工</el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <el-form :inline="true" class="search-form">
                <el-form-item label="员工姓名">
                    <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable />
                </el-form-item>
                <el-form-item label="部门">
                    <el-input v-model="searchForm.department" placeholder="请输入部门" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>

            <!-- 表格区域 -->
            <div class="table-container" v-loading="loading">
                <div v-if="!employees || employees.length === 0" class="empty-state">
                    <el-empty description="暂无员工数据" />
                </div>

                <el-table 
                    v-else
                    :data="employees" 
                    style="width: 100%" 
                    border
                    :max-height="tableHeight"
                    highlight-current-row
                    stripe
                    class="custom-table"
                >
                    <!-- 序号列 -->
                    <el-table-column 
                        type="index" 
                        label="序号" 
                        width="60" 
                        align="center"
                        fixed="left"
                    />
                    
                    <!-- 基本信息列 -->
                    <el-table-column label="基本信息" min-width="300" fixed="left">
                        <template #default="scope">
                            <div class="employee-info">
                                <div class="employee-avatar">
                                    <el-avatar :size="40">{{ scope.row.name?.charAt(0) }}</el-avatar>
                                </div>
                                <div class="info-content">
                                    <div class="employee-name">{{ scope.row.name }}</div>
                                    <div class="employee-details">
                                        <el-tag size="small" type="info">{{ scope.row.jobNumber }}</el-tag>
                                        <span class="department">{{ scope.row.department }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <!-- 联系方式 -->
                    <el-table-column label="联系方式" min-width="150" align="center">
                        <template #default="scope">
                            <div class="contact-info">
                                <el-icon><Phone /></el-icon>
                                <span>{{ scope.row.phoneNumber }}</span>
                            </div>
                        </template>
                    </el-table-column>

                    <!-- 个人信息 -->
                    <el-table-column label="个人信息" min-width="280">
                        <template #default="scope">
                            <div class="personal-info">
                                <el-tag 
                                    :type="scope.row.employeeSex ? 'primary' : 'success'"
                                    size="small"
                                >
                                    {{ scope.row.employeeSex ? '男' : '女' }}
                                </el-tag>
                                <el-tag type="info" size="small">{{ scope.row.age }}岁</el-tag>
                                <el-tag type="warning" size="small">{{ scope.row.employeeNation }}</el-tag>
                                <el-tag type="success" size="small">{{ scope.row.employeeGraduate }}</el-tag>
                            </div>
                        </template>
                    </el-table-column>

                    <!-- 其他信息 -->
                    <el-table-column label="其他信息" min-width="280">
                        <template #default="scope">
                            <div class="other-info">
                                <el-tag 
                                    :type="getMarriageStatusType(scope.row.employeeMarriagestatus)" 
                                    size="small"
                                >
                                    {{ scope.row.employeeMarriagestatus }}
                                </el-tag>
                                <el-tag type="warning" size="small">{{ scope.row.employeePolityStatus }}</el-tag>
                            </div>
                        </template>
                    </el-table-column>

                    <!-- 状态列 -->
                    <el-table-column label="状态" min-width="100" align="center">
                        <template #default="scope">
                            <el-tag 
                                :type="getStatusType(scope.row.status)"
                                size="small"
                            >
                                {{ getStatusText(scope.row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <!-- 操作列 -->
                    <el-table-column label="操作" width="180" fixed="right" align="center">
                        <template #default="scope">
                            <div class="operation-buttons">
                                <el-tooltip content="查看详情" placement="top">
                                    <el-button type="primary" link @click="showEmployeeDetail(scope.row)">
                                        <el-icon><View /></el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="编辑" placement="top">
                                    <el-button type="primary" link @click="openEditEmployeeDialog(scope.row)">
                                        <el-icon><Edit /></el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-dropdown @command="(command) => handleStatusChange(scope.row, command)">
                                    <el-button type="warning" link>
                                        <el-icon><Setting /></el-icon>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item 
                                                v-for="(text, status) in statusOptions" 
                                                :key="status"
                                                :command="status"
                                                :disabled="scope.row.status === parseInt(status)"
                                            >
                                                <el-tag 
                                                    :type="getStatusType(parseInt(status))" 
                                                    size="small"
                                                    style="margin-right: 8px"
                                                >
                                                    {{ text }}
                                                </el-tag>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :page-sizes="[10, 20, 30, 50]"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </div>
            </div>
        </el-card>

        <el-dialog 
            title="添加员工" 
            v-model="addEmployeeDialogVisible"
            width="600px"
        >
            <el-form :model="newEmployee" label-width="100px">
                <el-form-item label="员工姓名">
                    <el-input v-model="newEmployee.name" />
                </el-form-item>
                <el-form-item label="员工工号">
                    <el-input v-model="newEmployee.jobNumber" />
                </el-form-item>
                <el-form-item label="部门">
                    <el-input v-model="newEmployee.department" />
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="newEmployee.phoneNumber" />
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input type="number" v-model="newEmployee.age" />
                </el-form-item>
                <el-form-item label="性别">
                    <el-select v-model="newEmployee.employeeSex">
                        <el-option label="男" :value="true" />
                        <el-option label="女" :value="false" />
                    </el-select>
                </el-form-item>
                <el-form-item label="民族">
                    <el-input v-model="newEmployee.employeeNation" />
                </el-form-item>
                <el-form-item label="婚姻状况">
                    <el-input v-model="newEmployee.employeeMarriagestatus" />
                </el-form-item>
                <el-form-item label="政治面貌">
                    <el-input v-model="newEmployee.employeePolityStatus" />
                </el-form-item>
                <el-form-item label="学历">
                    <el-input v-model="newEmployee.employeeGraduate" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="newEmployee.status">
                        <el-option label="已离职" :value="0" />
                        <el-option label="在职" :value="1" />
                        <el-option label="实习期" :value="2" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="addEmployeeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addEmployee">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog 
            title="编辑员工" 
            v-model="editEmployeeDialogVisible"
            width="600px"
        >
            <el-form :model="employeeForm" label-width="100px">
                <el-form-item label="员工姓名">
                    <el-input v-model="employeeForm.name" />
                </el-form-item>
                <el-form-item label="员工工号">
                    <el-input v-model="employeeForm.jobNumber" />
                </el-form-item>
                <el-form-item label="部门">
                    <el-input v-model="employeeForm.department" />
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="employeeForm.phoneNumber" />
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input type="number" v-model="employeeForm.age" />
                </el-form-item>
                <el-form-item label="性别">
                    <el-select v-model="employeeForm.employeeSex">
                        <el-option label="男" :value="true" />
                        <el-option label="女" :value="false" />
                    </el-select>
                </el-form-item>
                <el-form-item label="民族">
                    <el-input v-model="employeeForm.employeeNation" />
                </el-form-item>
                <el-form-item label="婚姻状况">
                    <el-input v-model="employeeForm.employeeMarriagestatus" />
                </el-form-item>
                <el-form-item label="政治面貌">
                    <el-input v-model="employeeForm.employeePolityStatus" />
                </el-form-item>
                <el-form-item label="学历">
                    <el-input v-model="employeeForm.employeeGraduate" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="employeeForm.status">
                        <el-option label="已离职" :value="0" />
                        <el-option label="在职" :value="1" />
                        <el-option label="实习期" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="修改密码">
                    <el-switch
                        v-model="showPasswordFields"
                        active-text="修改密码"
                    />
                </el-form-item>
                <template v-if="showPasswordFields">
                    <el-form-item label="旧密码">
                        <el-input
                            v-model="oldPassword"
                            :type="showOldPassword ? 'text' : 'password'"
                            placeholder="请输入旧密码"
                        >
                            <template #suffix>
                                <el-icon 
                                    class="password-eye" 
                                    @click="showOldPassword = !showOldPassword"
                                >
                                    <View v-if="showOldPassword"/>
                                    <Hide v-else/>
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="新密码">
                        <el-input
                            v-model="employeeForm.password"
                            type="password"
                            show-password
                            placeholder="请输入新密码"
                        />
                    </el-form-item>
                    <el-form-item label="确认密码">
                        <el-input
                            v-model="passwordConfirm"
                            type="password"
                            show-password
                            placeholder="请再次输入新密码"
                        />
                    </el-form-item>
                </template>
            </el-form>
            <template #footer>
                <el-button @click="editEmployeeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleUpdate">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog 
            title="员工详细信息" 
            v-model="detailDialogVisible"
            width="600px"
        >
            <div class="employee-detail">
                <div class="detail-section">
                    <h3>基本信息</h3>
                    <div class="detail-item">
                        <span class="label">员工编号：</span>
                        <span>{{ selectedEmployee.employeeId }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">姓名：</span>
                        <span>{{ selectedEmployee.name }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">工号：</span>
                        <span>{{ selectedEmployee.jobNumber }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">部门：</span>
                        <span>{{ selectedEmployee.department }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">年龄：</span>
                        <span>{{ selectedEmployee.age }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">性别：</span>
                        <el-tag :type="selectedEmployee.employeeSex ? 'primary' : 'success'">
                            {{ selectedEmployee.employeeSex ? '男' : '女' }}
                        </el-tag>
                    </div>
                    <div class="detail-item">
                        <span class="label">状态：</span>
                        <el-tag :type="getStatusType(selectedEmployee.status)">
                            {{ getStatusText(selectedEmployee.status) }}
                        </el-tag>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>联系信息</h3>
                    <div class="detail-item">
                        <span class="label">手机号：</span>
                        <span>{{ selectedEmployee.phoneNumber }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">身份证号：</span>
                        <span>{{ selectedEmployee.employeeIdnum }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>个人信息</h3>
                    <div class="detail-item">
                        <span class="label">民族：</span>
                        <span>{{ selectedEmployee.employeeNation }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">婚姻状况：</span>
                        <el-tag :type="getMarriageStatusType(selectedEmployee.employeeMarriagestatus)">
                            {{ selectedEmployee.employeeMarriagestatus }}
                        </el-tag>
                    </div>
                    <div class="detail-item">
                        <span class="label">政治面貌：</span>
                        <span>{{ selectedEmployee.employeePolityStatus }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">学历：</span>
                        <span>{{ selectedEmployee.employeeGraduate }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>账号信息</h3>
                    <div class="detail-item">
                        <span class="label">账号：</span>
                        <span>{{ selectedEmployee.account }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">注册时间：</span>
                        <span>{{ formatDate(selectedEmployee.registerTime) }}</span>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="detailDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { ElMessage } from 'element-plus';
import { Edit, Delete, View, Phone, Hide, Setting } from '@element-plus/icons-vue';
import { getEmployeeList, createEmployee, editEmployee as updateEmployeeApi, deleteEmployee } from '@/api/employeeManage';

// 表格高度
const tableHeight = ref(500);

// 搜索表单
const searchForm = ref({
    name: '',
    department: ''
});

// 加载状态
const loading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 计算表格高度
const calculateTableHeight = () => {
    const windowHeight = window.innerHeight;
    tableHeight.value = windowHeight - 300; // 减去其他元素的高度
};

// 监听窗口大小变化
window.addEventListener('resize', calculateTableHeight);

onBeforeMount(() => {
    calculateTableHeight();
});

// 员工数据
const employees = ref([]);
const addEmployeeDialogVisible = ref(false);
const editEmployeeDialogVisible = ref(false);
const newEmployee = ref({ name: '', jobNumber: '', department: '', phoneNumber: '', age: null, employeeSex: true, employeeNation: '', employeeMarriagestatus: '', employeePolityStatus: '', employeeGraduate: '', status: 1 });
const employeeForm = ref({});

// 详细信息对话框
const detailDialogVisible = ref(false);
const selectedEmployee = ref({});

// 密码修改相关
const showPasswordFields = ref(false);
const oldPassword = ref('');
const passwordConfirm = ref('');
const showOldPassword = ref(true);

// 状态选项
const statusOptions = {
    0: '已离职',
    1: '在职',
    2: '实习期'
};

// 获取员工数据
const fetchEmployees = async () => {
    try {
        const response = await getEmployeeList(1, 10);
        if (response && response.data) {
            // 如果是 PageInfo 结构
            if (response.data.list) {
                employees.value = response.data.list;
            }
            // 如果数据直接在 data 中
            else if (Array.isArray(response.data)) {
                employees.value = response.data;
            }
            // 如果数据在 data.data 中
            else if (response.data.data && response.data.data.list) {
                employees.value = response.data.data.list;
            }
            else {
                ElMessage.error('数据结构异常');
                return;
            }
            
            if (employees.value.length === 0) {
                ElMessage.info('暂无员工数据');
            }
        } else {
            ElMessage.error('获取数据失败：响应格式错误');
        }
    } catch (error) {
        ElMessage.error('获取员工数据失败：' + (error.message || '未知错误'));
    }
};

// 打开添加员工对话框
const openAddEmployeeDialog = () => {
    newEmployee.value = { name: '', jobNumber: '', department: '', phoneNumber: '', age: null, employeeSex: true, employeeNation: '', employeeMarriagestatus: '', employeePolityStatus: '', employeeGraduate: '', status: 1 };
    addEmployeeDialogVisible.value = true;
};

// 添加员工
const addEmployee = async () => {
    try {
        await createEmployee(newEmployee.value);
        employees.value.push({ ...newEmployee.value, employeeId: employees.value.length + 1 });
        addEmployeeDialogVisible.value = false;
        ElMessage.success('员工添加成功');
    } catch (error) {
        ElMessage.error('添加员工失败');
    }
};

// 打开编辑员工对话框
const openEditEmployeeDialog = (employee) => {
    const { registerTime, ...employeeData } = employee;
    employeeForm.value = { ...employeeData };
    // 重置密码相关字段
    showPasswordFields.value = false;
    oldPassword.value = employeeData.password?.toString() || ''; // 转换为字符串
    showOldPassword.value = true; // 默认显示密码
    passwordConfirm.value = '';
    employeeForm.value.password = '';
    editEmployeeDialogVisible.value = true;
};

// 更新员工信息
const handleUpdate = async () => {
    try {
        // 如果开启了密码修改，验证密码
        if (showPasswordFields.value) {
            if (!oldPassword.value) {
                ElMessage.error('请输入旧密码');
                return;
            }
            if (!employeeForm.value.password) {
                ElMessage.error('请输入新密码');
                return;
            }
            if (employeeForm.value.password !== passwordConfirm.value) {
                ElMessage.error('两次输入的密码不一致');
                return;
            }
            // 添加旧密码到更新数据中
            employeeForm.value.oldPassword = oldPassword.value;
        } else {
            // 如果没有修改密码，删除密码相关字段
            delete employeeForm.value.password;
            delete employeeForm.value.oldPassword;
        }

        // 确保移除 registerTime 字段
        const { registerTime, ...updateData } = employeeForm.value;
        await updateEmployeeApi(updateData);
        
        const index = employees.value.findIndex(emp => emp.employeeId === employeeForm.value.employeeId);
        if (index !== -1) {
            // 保留原有的 registerTime
            employees.value[index] = { 
                ...employees.value[index],
                ...updateData
            };
            editEmployeeDialogVisible.value = false;
            ElMessage.success('员工信息更新成功');
        }
    } catch (error) {
        if (error.response?.data?.message) {
            ElMessage.error(error.response.data.message);
        } else {
            ElMessage.error('更新员工信息失败');
        }
    }
};

// 处理状态变更
const handleStatusChange = async (employee, newStatus) => {
    try {
        // 创建更新数据对象
        const updateData = {
            employeeId: employee.employeeId,
            status: parseInt(newStatus)
        };
        
        await updateEmployeeApi(updateData);
        
        // 更新本地数据
        const index = employees.value.findIndex(emp => emp.employeeId === employee.employeeId);
        if (index !== -1) {
            employees.value[index].status = parseInt(newStatus);
            ElMessage.success(`员工状态已更新为${statusOptions[newStatus]}`);
        }
    } catch (error) {
        ElMessage.error('更新员工状态失败');
    }
};

// 显示员工详细信息
const showEmployeeDetail = (employee) => {
    selectedEmployee.value = { ...employee };
    detailDialogVisible.value = true;
};

// 格式化日期
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
};

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        0: '已离职',
        1: '在职',
        2: '实习期'
    };
    return statusMap[status] || '未知';
};

// 获取状态标签类型
const getStatusType = (status) => {
    const typeMap = {
        0: 'danger',    // 已离职 - 红色
        1: 'success',   // 在职 - 绿色
        2: 'warning'    // 实习期 - 黄色
    };
    return typeMap[status] || 'info';
};

// 获取婚姻状况标签类型
const getMarriageStatusType = (status) => {
    const typeMap = {
        '已婚': 'success',
        '未婚': 'info',
        '离异': 'danger',
        '丧偶': 'warning'
    };
    return typeMap[status] || 'info';
};

// 在组件挂载时获取员工数据
onMounted(() => {
    fetchEmployees();
});
</script>

<style scoped>
.employee-management {
    padding: 20px;
    height: 100%;
}

.box-card {
    margin-bottom: 20px;
    height: calc(100vh - 100px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.search-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.table-container {
    position: relative;
    height: calc(100% - 180px);
}

.empty-state {
    margin: 40px 0;
    text-align: center;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-table) {
    height: calc(100% - 60px);
}

:deep(.el-table__body-wrapper) {
    overflow-y: auto;
}

:deep(.el-button--link) {
    padding: 2px 0;
    margin: 0 8px;
}

:deep(.el-tag) {
    margin: 0 4px;
}

.employee-detail {
    padding: 20px;
}

.detail-section {
    margin-bottom: 24px;
}

.detail-section h3 {
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    font-size: 16px;
}

.detail-item {
    display: flex;
    margin-bottom: 12px;
    line-height: 24px;
}

.detail-item .label {
    width: 100px;
    color: #909399;
}

.custom-table {
    --el-table-border-color: #ebeef5;
    --el-table-header-bg-color: #f5f7fa;
}

.employee-info {
    display: flex;
    align-items: center;
    padding: 4px 0;
}

.employee-avatar {
    margin-right: 12px;
}

.info-content {
    display: flex;
    flex-direction: column;
}

.employee-name {
    font-size: 14px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
}

.employee-details {
    display: flex;
    align-items: center;
    gap: 8px;
}

.department {
    color: #909399;
    font-size: 13px;
}

.contact-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.personal-info, .other-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.operation-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
}

:deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-table__header) {
    font-weight: bold;
    background-color: #f5f7fa;
}

:deep(.el-table__row) {
    transition: all 0.3s;
}

:deep(.el-table__row:hover) {
    background-color: #f5f7fa;
}

:deep(.el-tag) {
    margin: 2px;
}

:deep(.el-button--link) {
    height: 28px;
    width: 28px;
    border-radius: 4px;
    padding: 6px;
}

:deep(.el-button--link:hover) {
    background-color: #ecf5ff;
}

:deep(.el-button--link.el-button--danger:hover) {
    background-color: #fef0f0;
}

:deep(.el-switch) {
    margin-left: 8px;
}

:deep(.el-form-item) {
    margin-bottom: 20px;
}

.password-eye {
    cursor: pointer;
    color: #909399;
}

.password-eye:hover {
    color: #409EFF;
}

:deep(.el-dropdown-menu__item) {
    padding: 8px 16px;
    line-height: 1.5;
}

:deep(.el-dropdown-menu__item.is-disabled) {
    background-color: #f5f7fa;
    cursor: not-allowed;
}

:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
    background-color: #ecf5ff;
}
</style> 