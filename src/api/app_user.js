import request from '@/utils/request'

// 分页查询客户列表
export function pageAppUser(current, size, params) {
  return request({
    url: `/app_user/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

export function getAppUserStats() {
  return request({ url: '/app_user/stats', method: 'get' })
}

export function listAppUserOptions() {
  return request({ url: '/app_user/options', method: 'get' })
}

// 查询客户列表（不分页）
export function listAppUser(params) {
  return request({
    url: '/app_user/list',
    method: 'post',
    data: params || {}
  })
}

// 查询员工详情
export function getAppUserById(id) {
  return request({
    url: '/app_user/' + id,
    method: 'get'
  })
}

// 新增员工
export function saveAppUser(data) {
  return request({
    url: '/app_user',
    method: 'post',
    data
  })
}

// 修改员工
export function updateAppUser(data) {
  return request({
    url: '/app_user',
    method: 'put',
    data
  })
}

// 删除员工
export function deleteAppUser(id) {
  return request({
    url: '/app_user/' + id,
    method: 'delete'
  })
}

// 批量删除员工
export function deleteBatchAppUser(ids) {
  return request({
    url: '/app_user/batch',
    method: 'delete',
    data: ids
  })
}
