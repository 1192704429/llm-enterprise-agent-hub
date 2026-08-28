import request from '@/utils/request'

export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

export function getDashboardStatistics() {
  return request({
    url: '/dashboard/statistics',
    method: 'get'
  })
}
