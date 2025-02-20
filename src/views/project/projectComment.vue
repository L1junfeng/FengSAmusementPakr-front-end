<template>
    <div class="attraction-review-management">
      <el-container>
        <el-aside width="250px">
          <div class="aside-header">
            <h2 class="mb-4">景点列表</h2>
            <el-button 
              type="primary" 
              size="small" 
              circle
              @click="refreshSceneryList"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
          
          <el-menu
            v-if="attractions.length > 0"
            :default-active="activeAttractionId ? activeAttractionId.toString() : ''"
            class="el-menu-vertical-demo"
            @select="handleAttractionSelect"
          >
            <el-menu-item 
              v-for="attraction in attractions" 
              :key="attraction.id" 
              :index="attraction.id.toString()"
            >
              <div class="menu-item-content">
                <div class="attraction-info">
                  <span class="attraction-name">{{ attraction.name }}</span>
                  <el-badge 
                    v-if="attraction.pendingCount > 0"
                    :value="attraction.pendingCount" 
                    class="pending-badge"
                    type="warning"
                  />
                </div>
                <span class="score-tag" :class="getScoreClass(attraction.averageScore)">
                  {{ formatScore(attraction.averageScore) }}分
                </span>
              </div>
            </el-menu-item>
          </el-menu>
          
          <el-empty 
            v-else 
            description="暂无运营中的景点" 
            :image-size="100"
          />
        </el-aside>
        <el-main>
          <h1 class="text-2xl font-bold mb-4">{{ selectedAttraction ? selectedAttraction.name : '景区' }}评论管理</h1>
  
          <!-- 搜索和筛选 -->
          <el-row :gutter="20" class="mb-4">
            <el-col :span="8">
              <el-input
                v-model="searchQuery"
                placeholder="搜索评论内容或用户名"
                prefix-icon="el-icon-search"
                @input="handleSearch"
              ></el-input>
            </el-col>
            <el-col :span="6">
              <el-select v-model="statusFilter" placeholder="评论状态" @change="handleFilter">
                <el-option label="所有状态" value="" />
                <el-option label="待审核" :value="0" />
                <el-option label="已通过" :value="1" />
                <el-option label="已拒绝" :value="2" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="ratingFilter" placeholder="评分" @change="handleFilter">
                <el-option label="所有评分" value=""></el-option>
                <el-option v-for="i in 5" :key="i" :label="`${i} 星及以上`" :value="i"></el-option>
              </el-select>
            </el-col>
          </el-row>
  
          <!-- 评论列表 -->
          <el-table :data="filteredReviews" style="width: 100%">
            <el-table-column prop="visitorId" label="游客ID" width="100" />
            <el-table-column prop="context" label="评论内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="commentScore" label="评分" width="120">
                <template #default="scope">
                    <el-rate 
                        v-model="scope.row.commentScore" 
                        disabled 
                        show-score 
                        text-color="#ff9900"
                        :max="5"
                        :allow-half="true"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="complainTime" label="评论时间" width="160">
                <template #default="scope">
                    {{ formatDateTime(scope.row.complainTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="approvalStatus" label="状态" width="100">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.approvalStatus)">
                        {{ getStatusText(scope.row.approvalStatus) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="reply" label="回复内容" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="280" fixed="right">
                <template #default="scope">
                    <el-button-group>
                        <!-- 待审核状态的操作 -->
                        <template v-if="scope.row.approvalStatus === 0">
                            <el-button 
                                size="small" 
                                type="success" 
                                @click="approveReview(scope.row.sceneryCommentId)"
                            >
                                通过
                            </el-button>
                            <el-button 
                                size="small" 
                                type="danger" 
                                @click="rejectReview(scope.row.sceneryCommentId)"
                            >
                                拒绝
                            </el-button>
                        </template>
                        
                        <!-- 已通过状态的操作 -->
                        <template v-if="scope.row.approvalStatus === 1">
                            <el-button 
                                size="small" 
                                type="warning" 
                                @click="changeStatus(scope.row.sceneryCommentId, 0)"
                            >
                                撤回审核
                            </el-button>
                        </template>
                        
                        <!-- 已拒绝状态的操作 -->
                        <template v-if="scope.row.approvalStatus === 2">
                            <el-button 
                                size="small" 
                                type="warning" 
                                @click="changeStatus(scope.row.sceneryCommentId, 0)"
                            >
                                重新审核
                            </el-button>
                        </template>
                        
                        <!-- 所有状态都可以回复 -->
                        <el-button 
                            size="small" 
                            type="primary" 
                            @click="showReplyModal(scope.row)"
                        >
                            {{ scope.row.reply ? '修改回复' : '回复' }}
                        </el-button>
                    </el-button-group>
                </template>
            </el-table-column>
          </el-table>
  
          <!-- 回复评论对话框 -->
          <el-dialog v-model="replyDialogVisible" title="回复评论" width="50%">
            <el-form :model="replyForm">
              <el-form-item label="评论内容">
                <el-input v-model="currentReview.context" type="textarea" :rows="2" disabled></el-input>
              </el-form-item>
              <el-form-item label="回复内容">
                <el-input v-model="replyForm.content" type="textarea" :rows="4"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="replyDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitReply">确定</el-button>
              </span>
            </template>
          </el-dialog>
  
          <!-- 添加分页组件 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pageParams.page"
              v-model:page-size="pageParams.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-main>
      </el-container>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getCommentList, replyComment, approvalComment, getSceneryList } from '@/api/projectComment'
  
  // 景点数据
  const attractions = ref([])
  const activeAttractionId = ref(null)
  
  // 获取景点列表
  const fetchSceneryList = async () => {
    try {
        const { data } = await getSceneryList()
        if (data && data.list && data.list.length > 0) {
            // 获取每个景点的未审核评论数量
            const sceneryWithCounts = await Promise.all(
                data.list.map(async (item) => {
                    try {
                        const { data: commentData } = await getCommentList(item.sceneryId, 1, 999)
                        const pendingCount = commentData.list?.filter(c => c.approvalStatus === 0).length || 0
                        
                        return {
                            id: item.sceneryId,
                            name: item.sceneryName,
                            status: item.sceneryStatus,
                            averageScore: item.averageScore || 0,
                            pendingCount
                        }
                    } catch (error) {
                        console.error('获取评论数据失败:', error)
                        return {
                            id: item.sceneryId,
                            name: item.sceneryName,
                            status: item.sceneryStatus,
                            averageScore: item.averageScore || 0,
                            pendingCount: 0
                        }
                    }
                })
            )
            
            attractions.value = sceneryWithCounts.filter(item => item.status === 1)
            
            // 默认选中第一个景点
            if (!activeAttractionId.value && attractions.value.length > 0) {
                activeAttractionId.value = attractions.value[0].id
                fetchCommentList(activeAttractionId.value)
            }
        }
    } catch (error) {
        ElMessage.error('获取景点列表失败')
    }
  }
  
  // 页面加载时获取数据
  onMounted(async () => {
    await fetchSceneryList()
  })
  
  // 修改选中景点的计算属性
  const selectedAttraction = computed(() => {
    return attractions.value.find(a => a.id === activeAttractionId.value)
  })
  
  // 添加刷新方法
  const refreshSceneryList = async () => {
    activeAttractionId.value = null
    await fetchSceneryList()
  }
  
  // 分页参数
  const pageParams = ref({
    page: 1,
    pageSize: 10
  })
  
  // 评论列表
  const reviews = ref([])
  const total = ref(0)
  
  const searchQuery = ref('')
  const statusFilter = ref('')
  const ratingFilter = ref('')
  const replyDialogVisible = ref(false)
  const currentReview = ref({})
  const replyForm = ref({ content: '' })
  
  // 筛选和搜索
  const filteredReviews = computed(() => {
    return reviews.value
        .filter(review => 
            review.context?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            review.visitorId?.toString().includes(searchQuery.value)
        )
        .filter(review => statusFilter.value ? review.approvalStatus === parseInt(statusFilter.value) : true)
        .filter(review => ratingFilter.value ? review.commentScore >= parseInt(ratingFilter.value) : true)
  })
  
  // 获取评论列表
  const fetchCommentList = async (sceneryId) => {
    try {
        const { data } = await getCommentList(
            sceneryId,
            pageParams.value.page,
            pageParams.value.pageSize
        )
        if (data) {
            reviews.value = data.list
            total.value = data.total
        }
    } catch (error) {
        ElMessage.error('获取评论列表失败')
    }
  }
  
  // 审核状态转换
  const getStatusFromApproveStatus = (status) => {
    switch (status) {
      case 0: return 'pending'
      case 1: return 'approved'
      case 2: return 'rejected'
      default: return 'pending'
    }
  }
  
  // 审核评论
  const approveReview = async (id) => {
    try {
        await ElMessageBox.confirm('确定通过这条评论吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
        })
        await approvalComment(id, 1)
        ElMessage.success('评论已通过审核')
        fetchCommentList(activeAttractionId.value)
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败')
        }
    }
  }
  
  const rejectReview = async (id) => {
    try {
        await ElMessageBox.confirm('确定拒绝这条评论吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        await approvalComment(id, 2)
        ElMessage.warning('评论已被拒绝')
        fetchCommentList(activeAttractionId.value)
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败')
        }
    }
  }
  
  // 回复评论
  const submitReply = async () => {
    try {
        const replyData = {
            reply: replyForm.value.content,
            sceneryCommentId: currentReview.value.sceneryCommentId
        }
        await replyComment(currentReview.value.sceneryCommentId, replyData)
        ElMessage.success('回复已提交')
        replyDialogVisible.value = false
        fetchCommentList(activeAttractionId.value)
    } catch (error) {
        ElMessage.error('回复失败')
    }
  }
  
  // 监听景点选择变化
  const handleAttractionSelect = (sceneryId) => {
    activeAttractionId.value = parseInt(sceneryId)
    pageParams.value.page = 1
    fetchCommentList(sceneryId)
  }
  
  // 分页处理
  const handleSizeChange = (val) => {
    pageParams.value.pageSize = val
    fetchCommentList(activeAttractionId.value)
  }
  
  const handleCurrentChange = (val) => {
    pageParams.value.page = val
    fetchCommentList(activeAttractionId.value)
  }
  
  const handleSearch = () => {
    // 可以在这里添加额外的搜索逻辑
  }
  
  const handleFilter = () => {
    // 可以在这里添加额外的筛选逻辑
  }
  
  const getStatusText = (status) => {
    const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
    }
    return statusMap[status] || '未知'
  }
  
  const getStatusType = (status) => {
    const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
    }
    return typeMap[status] || ''
  }
  
  const showReplyModal = (review) => {
    currentReview.value = review
    replyForm.value.content = review.reply
    replyDialogVisible.value = true
  }
  
  const deleteReview = (id) => {
    ElMessageBox.confirm('确定要删除这条评论吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      reviews.value = reviews.value.filter(review => review.id !== id)
      ElMessage.success('评论已删除')
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  }
  
  const formatDateTime = (time) => {
    if (!time) return '-'
    const date = new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  const changeStatus = async (commentId, newStatus) => {
    try {
        await approvalComment(commentId, newStatus)
        ElMessage.success('状态修改成功')
        fetchCommentList(activeAttractionId.value)
    } catch (error) {
        ElMessage.error('操作失败')
    }
  }
  
  const formatScore = (score) => {
    return score ? Number(score).toFixed(1) : '0.0'
  }
  
  const getScoreClass = (score) => {
    if (!score) return 'score-low'
    if (score >= 4) return 'score-high'
    if (score >= 3) return 'score-medium'
    return 'score-low'
  }
  </script>
  
  <style scoped>
  .attraction-review-management {
    height: 100vh;
  }
  .el-aside {
    background-color: #f0f2f5;
    padding: 20px;
  }
  .el-main {
    padding: 20px;
  }
  .aside-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    margin-bottom: 16px;
  }
  .aside-header h2 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
  .menu-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 8px;
  }
  .attraction-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }
  .attraction-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 0;
  }
  .score-tag {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    min-width: 40px;
    text-align: center;
  }
  .score-high {
    background-color: #f0f9eb;
    color: #67c23a;
  }
  .score-medium {
    background-color: #fdf6ec;
    color: #e6a23c;
  }
  .score-low {
    background-color: #fef0f0;
    color: #f56c6c;
  }
  .pending-badge {
    margin-left: 8px;
  }
  :deep(.el-menu-item) {
    padding: 0 12px;
    height: 40px;
    line-height: 40px;
  }
  :deep(.el-menu-item.is-active) {
    background-color: #ecf5ff;
  }
  :deep(.el-menu-item.is-active .score-tag) {
    background-color: var(--el-color-primary-light-9);
  }
  :deep(.el-badge__content.is-fixed) {
    top: 50%;
    transform: translateY(-50%);
  }
  </style>