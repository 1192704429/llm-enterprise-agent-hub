import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* 布局组件 */
import Layout from '@/layout'


/**
 * 常量路由
 * 不需要权限的基础页面
 * 所有角色都可以访问
 */
export const constantRoutes = [
  // 用户相关
  {
    path: '/',
    redirect: '/user/home',
    hidden: true
  },
  {
    path: '/user/login',
    component: () => import('@/views/client/login'),
    hidden: true,
    meta: {
      appType: 'client',
      requiresAuth: false
    }
  },
  // 管理员相关
  {
    // 管理员登录
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    // 管理员首页
    path: '/index',
    component: Layout,
    children: [
      {
        path: '',
        name: '首页',
        component: () => import('@/views/index/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 兼容旧路径
  {
    path: '/ecommerceData/customer',
    redirect: '/officeData/employee',
    hidden: true
  },
]

/**
 * 异步路由
 * 需要根据角色动态添加的路由
 */
export const asyncRoutes = [
  {
    path: '/knowledgeManagement',
    name: 'KnowledgeManagement',
    component: Layout,
    meta: { title: '企业知识库', icon: 'el-icon-folder-opened', roles: ['admin'] },
    redirect: '/knowledgeManagement/index',
    children: [
      {
        path: '/knowledgeManagement/index',
        name: 'KnowledgeManagementIndex',
        component: () => import('@/views/knowledgeManagement/index'),
        meta: { title: '企业知识库', icon: 'el-icon-folder-opened', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/adminChat',
    name: 'AdminChat',
    component: Layout,
    meta: { title: '智能办公 Agent', icon: 'el-icon-chat-line-round', roles: ['admin'] },
    redirect: '/adminChat/index',
    children: [
      {
        path: '/adminChat/index',
        name: 'AdminChatIndex',
        component: () => import('@/views/adminChat/index'),
        meta: { title: '智能办公 Agent', icon: 'el-icon-chat-line-round', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/qaRecord',
    name: 'QaRecord',
    component: Layout,
    meta: { title: '对话记录', icon: 'el-icon-chat-dot-round', roles: ['admin'] },
    redirect: '/qaRecord/index',
    children: [
      {
        path: '/qaRecord/index',
        name: 'QaRecordIndex',
        component: () => import('@/views/views/qaRecord/index'),
        meta: { title: '对话记录', icon: 'el-icon-chat-dot-round', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Layout,
    meta: { title: '数据统计', icon: 'el-icon-data-analysis', roles: ['admin'] },
    redirect: '/statistics/index',
    children: [
      {
        path: '/statistics/index',
        name: 'StatisticsIndex',
        component: () => import('@/views/statistics/index/index'),
        meta: { title: '数据统计', icon: 'el-icon-data-analysis', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/officeData',
    name: 'OfficeData',
    component: Layout,
    meta: { title: '办公业务', icon: 'el-icon-s-cooperation', roles: ['admin'] },
    redirect: '/officeData/employee',
    children: [
      {
        path: '/officeData/employee',
        name: 'EmployeeManagement',
        component: () => import('@/views/employeeManagement/index'),
        meta: { title: '员工管理', icon: 'el-icon-user', roles: ['admin'] }
      },
      {
        path: '/officeData/department',
        name: 'DepartmentManagement',
        component: () => import('@/views/departmentManagement/index'),
        meta: { title: '部门管理', icon: 'el-icon-office-building', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/announcementManagement',
    name: 'AnnouncementManagement',
    component: Layout,
    meta: { title: '公告管理', icon: 'el-icon-bell', roles: ['admin'] },
    redirect: '/announcementManagement/index',
    children: [
      {
        path: '/announcementManagement/index',
        name: 'AnnouncementManagementIndex',
        component: () => import('@/views/announcementManagement/index'),
        meta: { title: '公告管理', icon: 'el-icon-bell', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/aiModelConfig',
    name: 'AiModelConfig',
    component: Layout,
    meta: { title: '大模型配置', icon: 'el-icon-cpu', roles: ['admin', 'teacher'] },
    redirect: '/aiModelConfig/index',
    children: [
      {
        path: '/aiModelConfig/index',
        name: 'AiModelConfigIndex',
        component: () => import('@/views/aiModelConfig/index'),
        meta: { title: '大模型配置', icon: 'el-icon-cpu', roles: ['admin', 'teacher'] }
      }
    ]
  }
]

/**
 * 用户端路由
 */
export const clientAsyncRoutes = [
  {
    path: '/user',
    component: () => import('@/layout/client'),
    redirect: '/user/home',
    hidden: true,
    meta: { appType: 'client' },
    children: [
      {
        path: 'home',
        name: 'ClientHome',
        component: () => import('@/views/client/home'),
        meta: { title: '智能办公', appType: 'client', requiresAuth: false, showInHeader: true, navTitle: '智能办公' }
      },
      {
        path: 'announcements',
        name: 'ClientAnnouncements',
        component: () => import('@/views/client/announcements'),
        meta: { title: '系统公告', appType: 'client', requiresAuth: false, showInHeader: true, navTitle: '系统公告' }
      },
      {
        path: 'leave',
        name: 'ClientLeave',
        component: () => import('@/views/client/leave'),
        meta: { title: '我的请假', appType: 'client', requiresAuth: true, showInHeader: true, navTitle: '我的请假' }
      },
      {
        path: 'approval',
        name: 'ClientApproval',
        component: () => import('@/views/client/approval'),
        meta: { title: '我的审批', appType: 'client', requiresAuth: true, showInHeader: true, navTitle: '我的审批' }
      },
      {
        path: 'schedule',
        name: 'ClientSchedule',
        component: () => import('@/views/client/schedule'),
        meta: { title: '我的日程', appType: 'client', requiresAuth: true, showInHeader: true, navTitle: '我的日程' }
      },
      {
        path: 'profile',
        name: 'ClientProfile',
        component: () => import('@/views/client/profile'),
        meta: { title: '个人中心', appType: 'client', requiresAuth: true }
      }
    ]
  }
]

const createRouter = () => new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [...constantRoutes, ...clientAsyncRoutes]
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}


/**
 * 根据角色添加路由
 */
export function addRoutesByRoles(roles) {
  function cloneRoutes(routes) {
    return routes.map(route => {
      const clonedRoute = {
        ...route,
        meta: route.meta ? { ...route.meta } : undefined
      }
      if (route.children) {
        clonedRoute.children = cloneRoutes(route.children)
      }
      return clonedRoute
    })
  }
  const routePool = cloneRoutes(asyncRoutes)
  function filterChildRoutes(children) {
    if (!children) return [];
    return children.filter(child => {
      let hasAccess = false;
      if (child.meta && child.meta.roles) {
        hasAccess = roles.some(role => child.meta.roles.includes(role));
      } else {
        hasAccess = true;
      }

      if (child.children) {
        const filteredChildren = filterChildRoutes(child.children);
        child.children = filteredChildren;
        hasAccess = hasAccess || filteredChildren.length > 0;
      }
      return hasAccess;
    });
  }
  const accessedRoutes = routePool.filter(route => {
    const filteredChildren = filterChildRoutes(route.children);
    route.children = filteredChildren;
    const hasRouteAccess = filteredChildren.length > 0;
    return hasRouteAccess;
  });
  router.addRoutes(accessedRoutes);
  return accessedRoutes;
}

export default router
