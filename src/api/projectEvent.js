import request from '@/utils/request'

// 分页获取所有事件
export const getEventList = (pageNum, pageSize) => {
    return request({
        url: `/project/sceneryEvent/findAllEvent/${pageNum}/${pageSize}`,
        method: 'get'
    })
}

// 根据ID获取事件详情
export const getEventById = (id) => {
    return request({
        url: `/project/sceneryEvent/findEventById/${id}`,
        method: 'get'
    })
}

// 添加事件
export const addEvent = (data) => {
    return request({
        url: '/project/sceneryEvent/addEvent',
        method: 'post',
        data
    })
}

// 更新事件
export const updateEvent = (data) => {
    return request({
        url: '/project/sceneryEvent/updateEvent',
        method: 'post',
        data
    })
}
