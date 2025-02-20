import request from '@/utils/request'

// 获取所有员工考核任务
export function getAllEmployeeTask(pageNum, pageSize) {
  return request({
    url: `/EmployeeVisitor/employeeTrainingProgress/findAllEmployeeTask/${pageNum}/${pageSize}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取所有可调度员工
export function getAllWorkingEmployee() {
  return request({
    url: '/EmployeeVisitor/employeeSchedule/getAllWorkingEmployee',
    method: 'get'
  })
}

// 添加员工调度任务
export function addScheduleEmployee(data) {
  return request({
    url: '/EmployeeVisitor/employeeSchedule/addScheduleEmployee',
    method: 'post',
    data
  })
}

// 更新员工调度任务状态
export function updateScheduleEmployee(employeeId, scheduleStatus, scheduleId) {
  return request({
    url: `/EmployeeVisitor/employeeSchedule/updateScheduleEmployee/${employeeId}/${scheduleStatus}/${scheduleId}`,
    method: 'get'
  })
}

// 获取所有调度任务
export function getAllEmployeeSchedule(pageNum, pageSize) {
  return request({
    url: `/EmployeeVisitor/employeeSchedule/getAllEmployeeSchedule/${pageNum}/${pageSize}`,
    method: 'get'
  })
} 