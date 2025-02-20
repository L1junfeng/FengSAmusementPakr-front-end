import request from '@/utils/request'

// 获取所有培训课程
export const getTrainingCoursesList = (pageNum, pageSize) => {
    return request({
        url: `/EmployeeVisitor/employeeTrainingCourses/findAllEmployeeTrainingCourses/${pageNum}/${pageSize}`,
        method: 'get'
    })
}

// 获取培训课程详情
export const getTrainingCourseById = (id) => {
    return request({
        url: `/EmployeeVisitor/employeeTrainingCourses/findEmployeeTrainingCoursesById/${id}`,
        method: 'get'
    })
}

// 删除培训课程
export const deleteTrainingCourse = (id) => {
    return request({
        url: `/EmployeeVisitor/employeeTrainingCourses/deleteEmployeeTrainingCoursesById/${id}`,
        method: 'delete'
    })
}

// 添加培训课程
export const addTrainingCourse = (data) => {
    return request({
        url: '/EmployeeVisitor/employeeTrainingCourses/addEmployeeTrainingCourses',
        method: 'post',
        data
    })
}

// 更新培训课程
export const updateTrainingCourse = (data) => {
    return request({
        url: '/EmployeeVisitor/employeeTrainingCourses/updateEmployeeTrainingCourses',
        method: 'post',
        data
    })
}

// 移除员工选课
export const removeEmployeeFromCourse = (employeeId, trainingId) => {
    return request({
        url: `/EmployeeVisitor/employeeTrainingCourses/deleteEmployeeSelect/${trainingId}/${employeeId}`,
        method: 'delete'
    })
}

// 添加员工选课
export const addEmployeeToCourse = (employeeId, trainingId) => {
    return request({
        url: `/EmployeeVisitor/employeeTrainingCourses/addEmployeeSelect/${trainingId}/${employeeId}`,
        method: 'get'
    })
}

// 更新培训进度和评论
export const updateTrainingProgress = (data) => {
    return request({
        url: '/EmployeeVisitor/employeeTrainingProgress/updateEmployeeTrainProgress',
        method: 'post',
        data
    })
}

// 上传课程文件
export function uploadCoursesFile(formData) {
    return request({
        url: '/EmployeeVisitor/employeeTrainingCourses/upFile',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}