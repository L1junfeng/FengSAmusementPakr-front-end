import request from '@/utils/request'

// 分页查询项目数据
// export const GetScenerySpotListByPage = (current , limit , queryDto) => {
//     return request({
        
//         url: `/project/scenerySpot/findAllScenerySpot/${current}/${limit}`,//接口
//         method: 'post',//提交方式
//         //后端接口如果是@RequestBody，需要用data
//         //如果没有注解,前端是params：名称
//         data: queryDto,
//     })
// }

export const GetScenerySpotListByPage = (current , limit) => {
    return request({
        
        url: `/project/scenerySpot/findAllScenerySpot/${current}/${limit}`,//接口
        method: 'get',//提交方式
        //后端接口如果是@RequestBody，需要用data
        //如果没有注解,前端是params：名称
    })
}


// 添加项目请求方法
export const SaveScenerySpot = (scenerySpot) => {
    return request({
        url: '/project/scenerySpot/addScenerySpot',
        method: 'post',
        data: scenerySpot ,
    })
}


// 查询指定角色所对应的菜单id
export const GetScenerySpotIds = (scenerySpotID) => {
    return request({
        url: `/project/scenerySpot/findScenerySpotById/${scenerySpotID}`,
        method: 'get'
    })
}

// 保存修改
export const UpdateScenerySpot = (data, scenerySpotID) => {
    return request({
        url: `/project/scenerySpot/updateScenerySpot/${scenerySpotID}`,
        method: 'post',
        data: data
    })
}

// 删除项目
export const DeleteScenerySpotById = (scenerySpotID) => {
    return request({
        url: `/project/scenerySpot/deleteScenerySpot/${scenerySpotID}`,
        method: 'get'
    })
}
