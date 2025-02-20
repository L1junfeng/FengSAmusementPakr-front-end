import Layout from '@/layout/index.vue'
const EmployeeAssessment = () => import('@/views/employee/EmployeeAssessment.vue')
const EmployeeManagement = () => import('@/views/employee/EmployeeManagement.vue')
const EmployeeTraining = () => import('@/views/employee/EmployeeTraining.vue')
const EmployeeDispatch = () => import('@/views/employee/EmployeeDispatch.vue')

export default [
    {
        path: '/employee',
        component: Layout,
        name: 'Employee',
        meta: {
            title: '员工管理',
        },
        icon: 'User',
        children: [
            {
                path: 'management',
                name: 'EmployeeManagement',
                component: EmployeeManagement,
                meta: {
                    title: '员工基础信息管理',
                },
            },
            {
                path: 'assessment',
                name: 'EmployeeAssessment',
                component: EmployeeAssessment,
                meta: {
                    title: '员工考核任务进度',
                },
            },
            {
                path: 'training',
                name: 'EmployeeTraining',
                component: EmployeeTraining,
                meta: {
                    title: '员工培训课程管理',
                },
            },
            {
                path: 'dispatch',
                name: 'EmployeeDispatch',
                component: EmployeeDispatch,
                meta: {
                    title: '员工实时调度',
                },
            }
        ],
    },
] 