import request from '@/utils/request'
import { GetScenerySpotListByPage } from '@/api/projectManage'  // 导入景点管理的API

// 根据景点ID获取评论列表
export const getCommentList = (sceneryId, pageNum, pageSize) => {
    return request({
        url: `/project/sceneryComment/findSceneryCommentBySceneryId/${sceneryId}/${pageNum}/${pageSize}`,
        method: 'get'
    })
}

// 回复评论
export const replyComment = (sceneryCommentId, data) => {
    return request({
        url: `/project/sceneryComment/replySceneryComment/${sceneryCommentId}`,
        method: 'post',
        data
    })
}

// 审核评论
export const approvalComment = (sceneryCommentId, approvalStatus) => {
    return request({
        url: `/project/sceneryComment/approvalSceneryComment/${sceneryCommentId}/${approvalStatus}`,
        method: 'get'
    })
}

// 获取景点列表 - 使用景点管理的API
export const getSceneryList = (page = 1, limit = 999) => {
    return GetScenerySpotListByPage(page, limit, {})
}