import request from '@/utils/request';

// 获取员工列表
export const getEmployeeList = (pageNum, pageSize) => {
    return request({
        url: `/EmployeeVisitor/employee/findAllEmployee/${pageNum}/${pageSize}`,
        method: 'get'
    });
};

// 添加员工
export const createEmployee = (data) => {
    return request({
        url: '/EmployeeVisitor/employee/addEmployee',
        method: 'post',
        data
    });
};

// 更新员工信息
export const editEmployee = (data) => {
    return request({
        url: '/EmployeeVisitor/employee/updateEmployee',
        method: 'post',
        data
    });
};

// 删除员工
export const deleteEmployee = (id) => {
    return request({
        url: `/EmployeeVisitor/employee/deleteEmployee/${id}`,
        method: 'delete'
    });
};

// 根据 ID 获取员工信息
export const getEmployeeById = (id) => {
    return request({
        url: `/EmployeeVisitor/employee/findEmployeeById/${id}`,
        method: 'get'
    });
};
