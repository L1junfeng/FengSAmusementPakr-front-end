import request from '@/utils/request'

// 获取景点设施列表
export const getFacilityList = (sceneryId, pageNum, pageSize) => {
    return request({
        url: `/project/sceneryFacilityInfo/findSceneryFacilityInfoById/${sceneryId}/${pageNum}/${pageSize}`,
        method: 'get'
    })
}

// 添加设施
export const addFacility = (data) => {
    return request({
        url: '/project/sceneryFacilityInfo/addSceneryFacilityInfo',
        method: 'post',
        data
    })
}

// 更新设施
export const updateFacility = (data) => {
    return request({
        url: '/project/sceneryFacilityInfo/updateSceneryFacilityInfo',
        method: 'post',
        data
    })
}

// 删除设施
export const deleteFacility = (id) => {
    return request({
        url: `/project/sceneryFacilityInfo/deleteSceneryFacilityInfo/${id}`,
        method: 'get'
    })
} 