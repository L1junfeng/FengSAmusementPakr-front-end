// 导入组件
const Layout = () => import('@/layout/index.vue')
const sysRole = () => import('@/views/system/sysRole.vue')
const sysUser = () => import('@/views/system/sysUser.vue')
const sysMenu = () => import('@/views/system/sysMenu.vue')

// 导出该组件
export default([
    {
        path: "/system",
        component: Layout,
        name: 'system',
        meta: {
            title: '基础管理',
        },
        icon: 'Location',
        children: [
            {
                path: '/sysRole',
                name: 'sysRole',
                component: sysRole,
                meta: {
                    title: '设施管理',
                },
                hidden: false
            },
            {
                path: '/sysUser',
                name: 'sysUser',
                component: sysUser,
                meta: {
                    title: '评论管理',
                },
                hidden: false
            },
            {
                path: '/menu',
                name: 'sysMenu',
                component: sysMenu,
                meta: {
                    title: '项目管理',
                },
                hidden: false
            }
        ]
    }
])