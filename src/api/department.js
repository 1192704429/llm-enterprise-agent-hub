import request from '@/utils/request'

export function pageDepartment(current, size, params) {
  return request({
    url: `/department/page?current=${current}&size=${size}`,
    method: 'post',
    data: params || {}
  })
}

export function listDepartment(params) {
  return request({
    url: '/department/list',
    method: 'post',
    data: params || {}
  })
}

export function getDepartmentById(id) {
  return request({ url: '/department/' + id, method: 'get' })
}

export function saveDepartment(data) {
  return request({ url: '/department', method: 'post', data })
}

export function updateDepartment(data) {
  return request({ url: '/department', method: 'put', data })
}

export function deleteDepartment(id) {
  return request({ url: '/department/' + id, method: 'delete' })
}
