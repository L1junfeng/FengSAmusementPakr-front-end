// 导入组件
const Layout = () => import('@/layout/index.vue')

const projectManage = () => import('@/views/project/projectManage.vue')
const projectComment = () => import('@/views/project/projectComment.vue')
const projectEvent = () => import('@/views/project/projectEvent.vue')

// 导出该组件
export default([
    {
        path: "/project",
        component: Layout,
        name: 'project',
        meta: {
            title: '项目管理',
        },
        icon: 'Document',
        children: [
            {
                path: '/projectManage',
                name: 'projectManage',
                component: projectManage,
                meta: {
                    title: '项目管理',
                },
                hidden: false
            },
            {
                path: '/projectComment',
                name: 'projectComment',
                component: projectComment,
                meta: {
                    title: '评论管理',
                },
                hidden: false
            },
            {
                path: '/projectEvent',
                name: 'projectEvent',
                component: projectEvent,
                meta: {
                    title: '事件管理',
                },
                hidden: false
            }
        ]
    }
])