<template>
    <div class="employee-training">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <div class="header-left">
                        <h2 class="title">员工培训课程管理</h2>
                        <div class="statistics">
                            <div class="stat-item">
                                <span class="label">总课程数</span>
                                <span class="value">{{ courses.length }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">进行中</span>
                                <span class="value warning">{{ getCoursesInProgress() }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">已完成</span>
                                <span class="value success">{{ getCompletedCourses() }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="button-group">
                        <el-button type="primary" @click="openAddCourseDialog">
                            <el-icon><Plus /></el-icon> 添加课程
                        </el-button>
                        <el-upload
                            class="upload-demo"
                            :http-request="handleFileUpload"
                            :show-file-list="false"
                            :before-upload="beforeFileUpload"
                        >
                            <el-button type="primary">
                                <el-icon><Upload /></el-icon> 批量导入课程
                            </el-button>
                        </el-upload>
                        <el-button type="primary" @click="exportToExcel" :disabled="!selectedItems.length">
                            <el-icon><Download /></el-icon> 导出选中课程
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 搜索和筛选区域 -->
            <div class="filter-section">
                <div class="filter-group">
                    <el-input
                        v-model="searchQuery"
                        placeholder="搜索课程名称"
                        class="filter-item search-input"
                        clearable
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                    
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :shortcuts="dateShortcuts"
                        value-format="YYYY-MM-DD"
                        class="filter-item date-picker"
                    />
                </div>
                
                <div class="filter-group">
                    <el-select 
                        v-model="filterCategory" 
                        placeholder="课程类别" 
                        clearable
                        class="filter-item"
                    >
                        <el-option
                            v-for="category in categories"
                            :key="category.value"
                            :label="category.label"
                            :value="category.value"
                        />
                    </el-select>
                    
                    <el-select 
                        v-model="filterStatus" 
                        placeholder="课程状态" 
                        clearable
                        class="filter-item"
                    >
                        <el-option label="已完成" value="0" />
                        <el-option label="进行中" value="1" />
                        <el-option label="审核中" value="2" />
                        <el-option label="已删除" value="3" />
                    </el-select>
                </div>

                <div class="filter-actions">
                    <el-button type="primary" @click="handleFilter">
                        <el-icon><Search /></el-icon> 筛选
                    </el-button>
                    <el-button @click="resetFilter">
                        <el-icon><Refresh /></el-icon> 重置
                    </el-button>
                </div>
            </div>

            <!-- 课程展示区域 -->
            <div class="courses-grid">
                <el-row :gutter="20">
                    <el-col 
                        v-for="course in filteredCourses" 
                        :key="course.id"
                        :xs="24" 
                        :sm="12" 
                        :md="8" 
                        :lg="6"
                    >
                        <el-card 
                            class="course-card"
                            :body-style="{ padding: '0px' }"
                        >
                            <div class="course-checkbox">
                                <el-checkbox 
                                    v-model="selectedItems" 
                                    :label="course"
                                    :title="''"
                                ></el-checkbox>
                            </div>
                            <div class="course-image">
                                <el-image 
                                    :src="course.coverImage" 
                                    fit="cover"
                                    :preview-src-list="[course.coverImage]"
                                >
                                    <template #error>
                                        <div class="image-placeholder">
                                            <el-icon><Picture /></el-icon>
                                        </div>
                                    </template>
                                </el-image>
                                <div class="course-category">
                                    <el-tag :type="getCategoryType(course.category)">
                                        {{ course.category }}
                                    </el-tag>
                                </div>
                            </div>
                            
                            <div class="course-content">
                                <h3 class="course-title">{{ course.courseName }}</h3>
                                <p class="course-description">{{ course.courseDesc }}</p>
                                
                                <div class="course-info">
                                    <div class="info-item">
                                        <el-icon><Timer /></el-icon>
                                        <span>{{ course.durationHours }}小时</span>
                                    </div>
                                    <div class="info-item">
                                        <el-icon><User /></el-icon>
                                        <span>{{ getActiveParticipants(course) }} 人参与</span>
                                    </div>
                                    <div class="info-item">
                                        <el-icon><Location /></el-icon>
                                        <span>{{ course.location }}</span>
                                    </div>
                                </div>

                                <el-progress 
                                    :percentage="course.progress || 0"
                                    :status="getProgressStatus(course.progress)"
                                />

                                <div class="course-status">
                                    <el-tag :type="getStatusType(course.status)">
                                        {{ getStatusText(course.status) }}
                                    </el-tag>
                                    <div class="course-dates">
                                        <div>开始：{{ formatDateTime(course.startDate) }}</div>
                                        <div>结束：{{ formatDateTime(course.endDate) }}</div>
                                    </div>
                                </div>

                                <div class="trainer-info">
                                    <span class="label">讲师：</span>
                                    <span>{{ course.trainerName }}</span>
                                    <el-tag 
                                        size="small" 
                                        :type="course.isMandatory ? 'danger' : 'info'"
                                        style="margin-left: 10px"
                                    >
                                        {{ course.isMandatory ? '必修' : '选修' }}
                                    </el-tag>
                                </div>
                            </div>

                            <div class="course-actions">
                                <el-tooltip content="查看详情" placement="top">
                                    <el-button type="primary" link @click="showCourseDetail(course.trainingId)">
                                        <el-icon><View /></el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="编辑课程" placement="top">
                                    <el-button type="primary" link @click="editCourse(course)">
                                        <el-icon><Edit /></el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="管理学员" placement="top">
                                    <el-button type="success" link @click="manageParticipants(course)">
                                        <el-icon><UserFilled /></el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="删除课程" placement="top">
                                    <el-button type="danger" link @click="deleteCourse(course)">
                                        <el-icon><Delete /></el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[8, 16, 24, 32]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 添加/编辑课程对话框 -->
        <el-dialog 
            :title="dialogType === 'add' ? '添加课程' : '编辑课程'"
            v-model="courseDialogVisible"
            width="650px"
        >
            <el-form :model="courseForm" label-width="100px">
                <el-form-item label="课程名称" required>
                    <el-input v-model="courseForm.courseName" />
                </el-form-item>
                <el-form-item label="课程描述">
                    <el-input 
                        v-model="courseForm.courseDesc"
                        type="textarea"
                        :rows="3"
                    />
                </el-form-item>
                <el-form-item label="讲师姓名" required>
                    <el-input v-model="courseForm.trainerName" />
                </el-form-item>
                <el-form-item label="部门ID" required>
                    <el-input v-model="courseForm.departmentId" type="number" />
                </el-form-item>
                <el-form-item label="开始时间" required>
                    <el-date-picker
                        v-model="courseForm.startDate"
                        type="datetime"
                        placeholder="选择开始时间"
                    />
                </el-form-item>
                <el-form-item label="结束时间" required>
                    <el-date-picker
                        v-model="courseForm.endDate"
                        type="datetime"
                        placeholder="选择结束时间"
                    />
                </el-form-item>
                <el-form-item label="培训时长">
                    <el-input v-model="courseForm.durationHours" type="number">
                        <template #append>小时</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="培训地点">
                    <el-input v-model="courseForm.location" />
                </el-form-item>
                <el-form-item label="是否必修">
                    <el-switch v-model="courseForm.isMandatory" />
                </el-form-item>
                <el-form-item label="课程状态">
                    <el-select v-model="courseForm.status">
                        <el-option label="未开始" :value="0" />
                        <el-option label="进行中" :value="1" />
                        <el-option label="已完成" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="附件码">
                    <el-input 
                        v-model="courseForm.attachmentCode" 
                        placeholder="请输入附件码"
                        clearable
                    >
                        <template #append>
                            <el-upload
                                class="upload-inline"
                                action="#"
                                :auto-upload="false"
                                :show-file-list="false"
                                :on-change="handleFileChange"
                                :before-upload="beforeFileUpload"
                            >
                                <el-button type="primary">
                                    <el-icon><Upload /></el-icon>
                                    本地生成
                                </el-button>
                            </el-upload>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="courseDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSaveCourse">确定</el-button>
            </template>
        </el-dialog>

        <!-- 课程详情对话框 -->
        <el-dialog
            title="课程详情"
            v-model="detailDialogVisible"
            width="800px"
        >
            <div class="course-detail">
                <h2>{{ selectedCourse?.employeeTrainingCourses.courseName }}</h2>
                <div class="detail-content">
                    <div class="basic-info">
                        <div class="info-row">
                            <span class="label">课程描述：</span>
                            <span>{{ selectedCourse?.employeeTrainingCourses.courseDesc }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">讲师：</span>
                            <span>{{ selectedCourse?.employeeTrainingCourses.trainerName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">地点：</span>
                            <span>{{ selectedCourse?.employeeTrainingCourses.location }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">时间：</span>
                            <span>
                                {{ formatDateTime(selectedCourse?.employeeTrainingCourses.startDate) }} 至 
                                {{ formatDateTime(selectedCourse?.employeeTrainingCourses.endDate) }}
                            </span>
                        </div>
                    </div>

                    <!-- 学员列表部分 -->
                    <h3>参与学员</h3>
                    <el-table 
                        :data="currentParticipants" 
                        style="width: 100%"
                        @row-click="showEmployeeComment"
                    >
                        <el-table-column prop="employeeName" label="姓名" width="120" />
                        <el-table-column prop="enrollmentDate" label="报名时间" width="160">
                            <template #default="scope">
                                {{ formatDateTime(scope.row.enrollmentDate) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="progressPercentage" label="学习进度" width="180">
                            <template #default="scope">
                                <el-progress 
                                    :percentage="scope.row.progressPercentage"
                                    :status="getProgressStatus(scope.row.progressPercentage)"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column prop="score" label="成绩" width="80">
                            <template #default="scope">
                                <span :class="{'highlight-score': scope.row.score >= 90}">
                                    {{ scope.row.score || '-' }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="completionStatus" label="状态" width="100">
                            <template #default="scope">
                                <el-tag :type="scope.row.completionStatus ? 'success' : 'warning'">
                                    {{ scope.row.completionStatus ? '已完成' : '学习中' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" fixed="right">
                            <template #default="scope">
                                <el-button 
                                    type="primary" 
                                    link
                                    @click.stop="showEmployeeComment(scope.row)"
                                >
                                    查看反馈
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-dialog>

        <!-- 修改员工反馈对话框 -->
        <el-dialog
            title="学员反馈详情"
            v-model="employeeCommentDialogVisible"
            width="500px"
        >
            <div v-if="selectedEmployeeComment" class="employee-feedback">
                <div class="employee-info-header">
                    <h3>{{ selectedEmployeeComment.name }}</h3>
                    <div class="score-tag">
                        成绩：<span class="score">{{ selectedEmployeeComment.score || '-' }}</span>
                    </div>
                </div>
                
                <div class="feedback-content">
                    <!-- 学员反馈部分 -->
                    <div class="feedback-section">
                        <h4>学员反馈</h4>
                        <p class="feedback-text">{{ selectedEmployeeComment.feedback || '暂无反馈' }}</p>
                    </div>

                    <!-- 讲师回复部分 -->
                    <div class="trainer-reply-section">
                        <div class="reply-header">
                            <h4>讲师回复</h4>
                            <el-button 
                                type="primary" 
                                link 
                                @click="editingReply = true"
                                v-if="!editingReply"
                            >
                                {{ selectedEmployeeComment.trainerComments ? '修改回复' : '添加回复' }}
                            </el-button>
                        </div>

                        <!-- 显示模式 -->
                        <div v-if="!editingReply" class="reply-content">
                            <p class="reply-text">
                                {{ selectedEmployeeComment.trainerComments || '暂无回复' }}
                            </p>
                            <el-tag 
                                :type="getCommentStatusType(selectedEmployeeComment.commentStatus)"
                                class="status-tag"
                            >
                                {{ getCommentStatusText(selectedEmployeeComment.commentStatus) }}
                            </el-tag>
                        </div>

                        <!-- 编辑模式 -->
                        <div v-else class="reply-edit">
                            <el-input
                                v-model="trainerReply"
                                type="textarea"
                                :rows="3"
                                placeholder="请输入回复内容"
                            />
                            <div class="reply-actions">
                                <el-select v-model="commentStatus" placeholder="选择审核状态" style="width: 120px">
                                    <el-option label="通过" :value="1" />
                                    <el-option label="驳回" :value="3" />
                                </el-select>
                                <div class="buttons">
                                    <el-button @click="cancelReply">取消</el-button>
                                    <el-button type="primary" @click="submitReply" :loading="submitting">提交</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 管理学员对话框 -->
        <el-dialog
            title="管理学员"
            v-model="participantsDialogVisible"
            width="800px"
        >
            <div class="participants-manager">
                <!-- 添加学员部分 -->
                <div class="add-participant-section">
                    <el-select
                        v-model="selectedEmployees"
                        multiple
                        filterable
                        placeholder="选择要添加的员工"
                        class="employee-select"
                    >
                        <el-option
                            v-for="emp in availableEmployees"
                            :key="emp.employeeId"
                            :label="emp.name"
                            :value="emp.employeeId"
                        >
                            <div class="employee-option">
                                <div class="employee-info">
                                    <span class="employee-name">{{ emp.name }}</span>
                                    <span class="employee-number">(工号: {{ emp.jobNumber }})</span>
                                </div>
                                <div class="department-info">
                                    <span class="department">{{ emp.department }}</span>
                                    <el-tag size="small" :type="getEmployeeStatusType(emp.status)">
                                        {{ getEmployeeStatusText(emp.status) }}
                                    </el-tag>
                                </div>
                            </div>
                        </el-option>
                    </el-select>
                    <el-button type="primary" @click="handleAddEmployees" :loading="addingEmployees">
                        添加所选员工
                    </el-button>
                </div>

                <!-- 现有学员列表 -->
                <el-table :data="currentParticipants" style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="employeeName" label="姓名" />
                    <el-table-column prop="progressPercentage" label="学习进度">
                        <template #default="scope">
                            <el-progress 
                                :percentage="scope.row.progressPercentage || 0"
                                :status="getProgressStatus(scope.row.progressPercentage)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column prop="score" label="成绩" width="80" />
                    <el-table-column prop="completionStatus" label="状态" width="100">
                        <template #default="scope">
                            <el-tag :type="scope.row.completionStatus ? 'success' : 'warning'">
                                {{ scope.row.completionStatus ? '已完成' : '学习中' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="反馈" show-overflow-tooltip>
                        <template #default="scope">
                            {{ scope.row.feedback || '暂无反馈' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="讲师评语" show-overflow-tooltip>
                        <template #default="scope">
                            {{ scope.row.trainerComments || '暂无评语' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="scope">
                            <el-button 
                                type="danger" 
                                link
                                @click="removeParticipant(scope.row.employeeId, selectedCourse.employeeTrainingCourses.trainingId)"
                            >
                                移除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
    Search, Plus, Edit, Delete, View, Timer, 
    User, UserFilled, Picture, Refresh, Check, Close, Location, Upload, Download
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    getTrainingCoursesList,
    getTrainingCourseById,
    deleteTrainingCourse,
    addTrainingCourse,
    updateTrainingCourse,
    removeEmployeeFromCourse,
    addEmployeeToCourse,
    updateTrainingProgress,
    uploadCoursesFile
} from '@/api/employeeTraining'
import { getEmployeeList } from '@/api/employeeManage'
import * as XLSX from 'xlsx';

// 课程类别
const categories = [
    { label: '技术培训', value: 'technical' },
    { label: '管理培训', value: 'management' },
    { label: '职业素养', value: 'professional' },
    { label: '新员工培训', value: 'onboarding' }
];

// 状态和筛选
const searchQuery = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(8);
const total = ref(0);

// 对话框控制
const courseDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const participantsDialogVisible = ref(false);
const dialogType = ref('add');

// 表单数据
const courseForm = ref({
    courseName: '',
    courseDesc: '',
    trainerName: '',
    departmentId: null,
    startDate: null,
    endDate: null,
    durationHours: null,
    location: '',
    isMandatory: false,
    status: 0,
    attachmentCode: '',
    employeeParticipation: 0,
    progress: 0
});

// 选中的课程
const selectedCourse = ref(null);

// 当前用户ID（实际应用中从用户状态获取）
const currentUserId = ref(1);

// 课程列表
const courses = ref([]);

// 修改员工选择相关的代码
const selectedEmployees = ref([])
const availableEmployees = ref([])
const addingEmployees = ref(false)

// 添加新的响应式变量
const employeeCommentDialogVisible = ref(false);
const selectedEmployeeComment = ref(null);
const editingReply = ref(false);
const trainerReply = ref('');
const commentStatus = ref(1) // 默认通过
const submitting = ref(false)

// 添加新的响应式变量
const selectedItems = ref([]);

// 添加日期相关的响应式变量
const dateRange = ref([]);

// 添加日期快捷选项
const dateShortcuts = [
    {
        text: '最近一周',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [start, end];
        },
    },
    {
        text: '最近一个月',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            return [start, end];
        },
    },
    {
        text: '最近三个月',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            return [start, end];
        },
    },
];

// 加载课程列表
const loadCourses = async () => {
    try {
        const res = await getTrainingCoursesList(currentPage.value, pageSize.value);
        courses.value = res.data.list.map(course => ({
            ...course,
            trainingId: course.trainingId // 确保 trainingId 字段存在
        }));
        total.value = res.data.total;
    } catch (error) {
        ElMessage.error('获取课程列表失败');
    }
}

// 筛选后的课程列表
const filteredCourses = computed(() => {
    return courses.value.filter(course => {
        const matchQuery = course.courseName.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchCategory = !filterCategory.value || course.category === filterCategory.value;
        const matchStatus = !filterStatus.value || course.status === Number(filterStatus.value);
        
        // 添加日期筛选逻辑
        let matchDate = true;
        if (dateRange.value && dateRange.value.length === 2) {
            const courseDate = new Date(course.startDate);
            const startDate = new Date(dateRange.value[0]);
            const endDate = new Date(dateRange.value[1]);
            matchDate = courseDate >= startDate && courseDate <= endDate;
        }
        
        return matchQuery && matchCategory && matchStatus && matchDate;
    });
});

// 获取进行中的课程数量
const getCoursesInProgress = () => {
    return courses.value.filter(course => course.status === 1).length;
};

// 获取已完成的课程数量
const getCompletedCourses = () => {
    return courses.value.filter(course => course.status === 0).length;
};

// 获取类别样式
const getCategoryType = (category) => {
    const typeMap = {
        technical: 'primary',
        management: 'success',
        professional: 'warning',
        onboarding: 'info'
    };
    return typeMap[category] || 'info';
};

// 获取状态样式
const getStatusType = (status) => {
    const typeMap = {
        0: 'info',      // 未开始 - 蓝色
        1: 'warning',   // 进行中 - 黄色
        2: 'success'    // 已完成 - 绿色
    };
    return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
    const textMap = {
        0: '未开始',
        1: '进行中',
        2: '已完成'
    };
    return textMap[status] || '未知';
};

// 获取进度状态
const getProgressStatus = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'warning';
    return '';
};

// 格式化日期
const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

// 添加日期时间格式化方法
const formatDateTime = (datetime) => {
    if (!datetime) return '';
    return new Date(datetime).toLocaleString();
};

// 处理筛选
const handleFilter = () => {
    currentPage.value = 1;
    // 实现筛选逻辑
};

// 重置筛选
const resetFilter = () => {
    searchQuery.value = '';
    filterCategory.value = '';
    filterStatus.value = '';
    dateRange.value = [];
    currentPage.value = 1;
};

// 打开添加课程对话框
const openAddCourseDialog = () => {
    dialogType.value = 'add';
    // 重置表单
    courseForm.value = {
        courseName: '',
        courseDesc: '',
        trainerName: '',
        departmentId: null,
        startDate: null,
        endDate: null,
        durationHours: null,
        location: '',
        isMandatory: false,
        status: 0, // 默认状态
        attachmentCode: '',
        employeeParticipation: 0,
        progress: 0
    };
    courseDialogVisible.value = true;
};

// 编辑课程
const editCourse = (course) => {
    try {
        dialogType.value = 'edit';
        // 使用课程的实际字段填充表单
        courseForm.value = {
            trainingId: course.trainingId,
            courseName: course.courseName,
            courseDesc: course.courseDesc,
            trainerName: course.trainerName,
            departmentId: course.departmentId,
            // 直接使用原始日期字符串
            startDate: course.startDate,
            endDate: course.endDate,
            durationHours: course.durationHours,
            location: course.location,
            isMandatory: Boolean(course.isMandatory),
            status: Number(course.status),
            attachmentCode: course.attachmentCode || '',
            employeeParticipation: course.employeeParticipation || 0,
            progress: course.progress || 0
        };
        courseDialogVisible.value = true;
    } catch (error) {
        console.error('编辑课程时出错:', error);
        ElMessage.error('打开编辑窗口失败');
    }
};

// 保存课程前的验证
const validateCourseForm = () => {
    if (!courseForm.value.courseName) {
        ElMessage.warning('请输入课程名称');
        return false;
    }
    if (!courseForm.value.trainerName) {
        ElMessage.warning('请输入讲师姓名');
        return false;
    }
    if (!courseForm.value.departmentId) {
        ElMessage.warning('请输入部门ID');
        return false;
    }
    if (!courseForm.value.startDate) {
        ElMessage.warning('请选择开始时间');
        return false;
    }
    if (!courseForm.value.endDate) {
        ElMessage.warning('请选择结束时间');
        return false;
    }
    if (new Date(courseForm.value.endDate) <= new Date(courseForm.value.startDate)) {
        ElMessage.warning('结束时间必须晚于开始时间');
        return false;
    }
    return true;
};

// 修改保存课程方法
const handleSaveCourse = async () => {
    if (!validateCourseForm()) {
        return;
    }

    try {
        // 准备提交的数据
        const submitData = {
            ...courseForm.value,
            // 格式化日期时间为 "yyyy-MM-dd HH:mm:ss" 格式
            startDate: formatToLocalDateTime(courseForm.value.startDate),
            endDate: formatToLocalDateTime(courseForm.value.endDate),
            // 确保数字字段为数字类型
            departmentId: Number(courseForm.value.departmentId),
            durationHours: Number(courseForm.value.durationHours || 0),
            status: Number(courseForm.value.status),
            employeeParticipation: Number(courseForm.value.employeeParticipation || 0),
            progress: Number(courseForm.value.progress || 0)
        };

        if (dialogType.value === 'add') {
            await addTrainingCourse(submitData);
            ElMessage.success('添加课程成功');
        } else {
            await updateTrainingCourse(submitData);
            ElMessage.success('更新课程成功');
        }
        courseDialogVisible.value = false;
        loadCourses();
    } catch (error) {
        console.error('保存课程失败:', error);
        ElMessage.error(dialogType.value === 'add' ? '添加课程失败' : '更新课程失败');
    }
};

// 修改日期时间格式化函数
const formatToLocalDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    
    // 转换为北京时间
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const beijingOffset = 8;
    const beijingTime = new Date(utc + (3600000 * beijingOffset));
    
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = beijingTime.getFullYear();
    const month = pad(beijingTime.getMonth() + 1);
    const day = pad(beijingTime.getDate());
    const hours = pad(beijingTime.getHours());
    const minutes = pad(beijingTime.getMinutes());
    const seconds = pad(beijingTime.getSeconds());
    
    // 返回 "yyyy-MM-dd HH:mm:ss" 格式的北京时间
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 删除课程
const deleteCourse = async (course) => {
    try {
        await ElMessageBox.confirm('确定要删除该课程吗？', '警告', {
            type: 'warning'
        })
        await deleteTrainingCourse(course.trainingId)
        ElMessage.success('删除课程成功')
        loadCourses()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除课程失败')
        }
    }
};

// 显示课程详情
const showCourseDetail = async (trainingId) => {
    try {
        const res = await getTrainingCourseById(trainingId)
        selectedCourse.value = res.data
        detailDialogVisible.value = true
    } catch (error) {
        ElMessage.error('获取课程详情失败')
    }
};

// 加载所有可选员工
const loadAvailableEmployees = async () => {
    try {
        const res = await getEmployeeList(1, 999) // 使用大的 pageSize 获取所有员工
        // 过滤在职和实习期员工
        // 对于已经在课程中的员工，只排除 completionStatus 不为 2 的员工（即未退出的员工）
        const currentActiveEmployeeIds = selectedCourse.value?.employeeSelectVos
            .filter(e => e.completionStatus !== 2)
            .map(e => e.employeeId) || [];

        availableEmployees.value = res.data.list.filter(emp => 
            // status: 1-在职, 2-实习期
            (emp.status === 1 || emp.status === 2) && 
            !currentActiveEmployeeIds.includes(emp.employeeId)
        );
    } catch (error) {
        ElMessage.error('获取员工列表失败');
    }
};

// 修改管理参与者方法
const manageParticipants = async (course) => {
    try {
        const res = await getTrainingCourseById(course.trainingId)
        selectedCourse.value = res.data
        // 加载可选员工列表
        await loadAvailableEmployees()
        participantsDialogVisible.value = true
    } catch (error) {
        ElMessage.error('获取课程参与者失败')
    }
}

// 修改添加员工方法
const handleAddEmployees = async () => {
    if (!selectedEmployees.value.length) {
        ElMessage.warning('请选择要添加的员工')
        return
    }

    addingEmployees.value = true
    try {
        // 依次添加所选员工
        for (const employeeId of selectedEmployees.value) {
            await addEmployeeToCourse(employeeId, selectedCourse.value.employeeTrainingCourses.trainingId)
        }
        
        ElMessage.success('添加员工成功')
        // 刷新课程详情
        const res = await getTrainingCourseById(selectedCourse.value.employeeTrainingCourses.trainingId)
        selectedCourse.value = res.data
        // 重新加载可选员工列表
        await loadAvailableEmployees()
        // 清空选择
        selectedEmployees.value = []
    } catch (error) {
        ElMessage.error('添加员工失败')
    } finally {
        addingEmployees.value = false
    }
}

// 移除参与者
const removeParticipant = async (employeeId, courseId) => {
    try {
        await ElMessageBox.confirm('确定要移除该员工吗？', '警告', {
            type: 'warning'
        });
        const trainingId = selectedCourse.value.employeeTrainingCourses.trainingId;
        await removeEmployeeFromCourse(employeeId, trainingId);
        ElMessage.success('移除成功');
        // 刷新参与者列表
        const res = await getTrainingCourseById(trainingId);
        selectedCourse.value = res.data;
        
        // 重新加载可选员工列表
        await loadAvailableEmployees();
        
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('移除失败');
        }
    }
};

// 页面加载时获取课程列表
onMounted(() => {
    loadCourses()
})

// 分页处理
const handleSizeChange = (val) => {
    pageSize.value = val
    loadCourses()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    loadCourses()
}

// 显示员工评论
const showEmployeeComment = (employee) => {
    const comment = selectedCourse.value.trainingCourseCommentVos.find(
        c => c.employeeId === employee.employeeId
    );
    if (comment) {
        selectedEmployeeComment.value = comment;
        // 初始化讲师回复内容和评论状态
        trainerReply.value = comment.trainerComments || '';
        commentStatus.value = comment.commentStatus || 1;
        editingReply.value = false;
        employeeCommentDialogVisible.value = true;
    } else {
        ElMessage.info('该学员暂无评论反馈');
    }
};

// 修改提交回复方法
const submitReply = async () => {
    if (!trainerReply.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }

    submitting.value = true
    try {
        // 准备提交的数据，使用 EmployeeTrainingProgress 的结构
        const submitData = {
            progressId: selectedEmployeeComment.value.progressId,
            employeeId: selectedEmployeeComment.value.employeeId,
            trainingId: selectedCourse.value.employeeTrainingCourses.trainingId,
            trainerComments: trainerReply.value,
            commentStatus: commentStatus.value,
            // 保持其他字段不变
            enrollmentDate: selectedEmployeeComment.value.enrollmentDate,
            completionStatus: selectedEmployeeComment.value.completionStatus,
            progressPercentage: selectedEmployeeComment.value.progressPercentage,
            score: selectedEmployeeComment.value.score,
            feedback: selectedEmployeeComment.value.feedback
        }

        await updateTrainingProgress(submitData)

        // 更新本地数据
        selectedEmployeeComment.value.trainerComments = trainerReply.value
        selectedEmployeeComment.value.commentStatus = commentStatus.value
        
        // 刷新课程详情以获取最新数据
        const res = await getTrainingCourseById(selectedCourse.value.employeeTrainingCourses.trainingId)
        selectedCourse.value = res.data
        
        editingReply.value = false
        ElMessage.success('回复已提交')
    } catch (error) {
        ElMessage.error('提交回复失败')
    } finally {
        submitting.value = false
    }
}

// 取消回复时重置为原有内容
const cancelReply = () => {
    editingReply.value = false;
    // 重置为原有的回复内容和状态
    trainerReply.value = selectedEmployeeComment.value.trainerComments || '';
    commentStatus.value = selectedEmployeeComment.value.commentStatus || 1;
};

// 获取评论状态类型
const getCommentStatusType = (status) => {
    const typeMap = {
        0: 'info',     // 未评论
        1: 'success',  // 已通过
        2: 'warning',  // 待审核
        3: 'danger'    // 驳回
    }
    return typeMap[status] || 'info'
}

// 获取评论状态文本
const getCommentStatusText = (status) => {
    const textMap = {
        0: '未评论',
        1: '已通过',
        2: '待审核',
        3: '已驳回'
    }
    return textMap[status] || '未知'
}

// 获取员工状态类型
const getEmployeeStatusType = (status) => {
    const typeMap = {
        0: 'danger',  // 已离职
        1: 'success', // 在职
        2: 'warning'  // 实习期
    }
    return typeMap[status] || 'info'
}

// 获取员工状态文本
const getEmployeeStatusText = (status) => {
    const textMap = {
        0: '已离职',
        1: '在职',
        2: '实习期'
    }
    return textMap[status] || '未知'
}

// 添加获取实际参与人数的方法
const getActiveParticipants = (course) => {
    if (!course.employeeSelectVos) return 0;
    return course.employeeSelectVos.filter(employee => 
        employee.completionStatus !== 2
    ).length;
};

// 添加一个计算属性来过滤学员列表
const currentParticipants = computed(() => {
    return selectedCourse.value?.employeeSelectVos.filter(employee => 
        employee.completionStatus !== 2
    ) || [];
});

// 文件上传处理
const handleFileUpload = async (options) => {
    try {
        const formData = new FormData();
        formData.append('file', options.file);
        await uploadCoursesFile(formData);
        ElMessage.success('文件上传成功');
        // 重新加载课程列表
        loadCourses();
    } catch (error) {
        ElMessage.error('文件上传失败');
    }
};

// 文件上传前的验证
const beforeFileUpload = (file) => {
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
        ElMessage.error('只能上传 Excel 文件!');
        return false;
    }
    return true;
};

// 修改导出方法
const exportToExcel = () => {
    if (selectedItems.value.length === 0) {
        ElMessage.warning('请先选择要导出的课程');
        return;
    }

    const dataToExport = selectedItems.value.map(course => ({
        课程名称: course.courseName,
        讲师: course.trainerName,
        开始时间: formatDateTime(course.startDate),
        结束时间: formatDateTime(course.endDate),
        培训时长: `${course.durationHours}小时`,
        地点: course.location,
        课程类型: course.isMandatory ? '必修' : '选修',
        进度: `${course.progress || 0}%`,
        状态: getStatusText(course.status)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "培训课程信息");

    // 导出为Excel文件
    XLSX.writeFile(workbook, `培训课程信息_${formatDateTime(new Date())}.xlsx`);
    
    ElMessage.success('导出成功');
};
</script>

<style scoped>
.employee-training {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 40px;
}

.title {
    margin: 0;
    font-size: 20px;
    color: #303133;
}

.statistics {
    display: flex;
    gap: 20px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-item .label {
    font-size: 14px;
    color: #909399;
}

.stat-item .value {
    font-size: 20px;
    font-weight: bold;
}

.value.success { color: #67C23A; }
.value.warning { color: #E6A23C; }

.filter-section {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
    align-items: flex-start;
}

.filter-group {
    display: flex;
    gap: 15px;
    flex: 1;
}

.filter-item {
    min-width: 180px;
}

.search-input {
    width: 220px;
}

.date-picker {
    width: 350px;
}

.filter-actions {
    display: flex;
    gap: 10px;
    margin-left: auto;
}

.courses-grid {
    margin-top: 20px;
}

.course-card {
    margin-bottom: 20px;
    transition: all 0.3s;
    position: relative;
}

.course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-image {
    position: relative;
    height: 160px;
    overflow: hidden;
}

.course-image .el-image {
    width: 100%;
    height: 100%;
}

.image-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 24px;
}

.course-category {
    position: absolute;
    top: 10px;
    right: 10px;
}

.course-content {
    padding: 15px;
}

.course-title {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}

.course-description {
    margin: 0 0 15px;
    font-size: 14px;
    color: #606266;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.course-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #909399;
    font-size: 14px;
}

.course-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
}

.course-dates {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

.trainer-info {
    margin-top: 10px;
    display: flex;
    align-items: center;
}

.trainer-info .label {
    color: #909399;
    margin-right: 5px;
}

.course-actions {
    padding: 10px 15px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
}

.cover-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 178px;
    height: 178px;
}

.cover-uploader:hover {
    border-color: #409EFF;
}

.cover-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}

.cover {
    width: 178px;
    height: 178px;
    display: block;
}

.course-detail {
    padding: 20px;
}

.detail-header {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
}

.detail-cover {
    width: 240px;
    height: 160px;
    border-radius: 8px;
    overflow: hidden;
}

.detail-info {
    flex: 1;
}

.detail-info h2 {
    margin: 0 0 15px;
    color: #303133;
}

.detail-meta {
    display: flex;
    align-items: center;
    gap: 15px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #606266;
}

.detail-content {
    h3 {
        margin: 25px 0 15px;
        color: #303133;
        font-size: 16px;
    }

    p {
        color: #606266;
        line-height: 1.6;
    }
}

.participants-manager {
    .participants-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.comments-section {
    margin-top: 20px;
}

.comments-list {
    margin-bottom: 30px;
}

.comment-item {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
    transition: all 0.3s;
}

.comment-item:last-child {
    border-bottom: none;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.comment-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.commenter-name {
    font-weight: bold;
    color: #303133;
}

.comment-score {
    color: #409EFF;
    font-size: 14px;
}

.comment-content {
    color: #606266;
    line-height: 1.6;
    margin: 10px 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.no-comments {
    text-align: center;
    color: #909399;
    padding: 20px;
}

.comment-status {
    margin-left: auto;
}

.comment-actions {
    display: flex;
    gap: 10px;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.commenter-name {
    font-weight: bold;
    color: #303133;
}

.comment-score {
    color: #f56c6c;
}

.info-row {
    margin-bottom: 15px;
}

.info-row .label {
    color: #909399;
    margin-right: 10px;
}

/* 根据状态显示不同的评论样式 */
.comment-item:has(.el-tag--warning) {
    background-color: #fdf6ec;
    border-radius: 4px;
}

/* 驳回状态显示 */
.comment-item:has(.el-tag--danger) {
    opacity: 0.8;
}

.add-participant-section {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.employee-select {
    flex: 1;
}

.employee-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
}

.employee-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.employee-name {
    font-weight: bold;
    color: #303133;
}

.employee-number {
    color: #909399;
    font-size: 12px;
}

.department-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.department {
    color: #606266;
    font-size: 13px;
}

:deep(.el-select-dropdown__item) {
    padding: 0 15px;
}

:deep(.el-tag--small) {
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
}

.highlight-score {
    color: #f56c6c;
    font-weight: bold;
}

.employee-feedback {
    padding: 20px;
}

.employee-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.employee-info-header h3 {
    margin: 0;
    color: #303133;
}

.score-tag {
    background-color: #f5f7fa;
    padding: 5px 10px;
    border-radius: 4px;
}

.score {
    color: #f56c6c;
    font-weight: bold;
    font-size: 16px;
}

.feedback-content {
    margin-top: 20px;
}

.feedback-section {
    margin-bottom: 20px;
}

.feedback-section h4 {
    color: #606266;
    margin: 0 0 10px 0;
}

.feedback-section p {
    margin: 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #606266;
    line-height: 1.6;
}

:deep(.el-table .cell) {
    white-space: nowrap;
}

:deep(.el-table__row) {
    cursor: pointer;
}

:deep(.el-table__row:hover) {
    background-color: #f5f7fa;
}

.trainer-reply-section {
    margin-top: 20px;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.reply-header h4 {
    color: #606266;
    margin: 0;
}

.reply-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.status-tag {
    flex-shrink: 0;
}

.reply-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.buttons {
    display: flex;
    gap: 10px;
}

.feedback-text {
    background-color: #ecf5ff;
}

.button-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.course-checkbox {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 4px;
    border-radius: 4px;
}

/* 隐藏复选框的默认提示 */
.course-checkbox :deep(.el-checkbox__label) {
    display: none;
}

/* 调整复选框的大小和外观 */
.course-checkbox :deep(.el-checkbox__inner) {
    width: 16px;
    height: 16px;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
    .filter-section {
        flex-direction: column;
    }
    
    .filter-group {
        width: 100%;
    }
    
    .filter-item {
        flex: 1;
    }
    
    .filter-actions {
        margin-left: 0;
        justify-content: flex-end;
    }
}

@media screen and (max-width: 768px) {
    .filter-group {
        flex-direction: column;
    }
    
    .filter-item,
    .search-input,
    .date-picker {
        width: 100%;
        min-width: 100%;
    }
}
</style> 