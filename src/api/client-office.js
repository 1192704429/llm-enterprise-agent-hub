import request from '@/utils/request'

export function listMyLeave(status) {
  return request({
    url: '/client/office/leave/list',
    method: 'get',
    params: { status },
    authType: 'client'
  })
}

export function submitLeave(data) {
  return request({
    url: '/client/office/leave/submit',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function listPendingApprovals() {
  return request({
    url: '/client/office/approval/pending',
    method: 'get',
    authType: 'client'
  })
}

export function listSubmittedApprovals(status) {
  return request({
    url: '/client/office/approval/submitted',
    method: 'get',
    params: { status },
    authType: 'client'
  })
}

export function getApprovalDetail(instanceId) {
  return request({
    url: '/client/office/approval/' + instanceId + '/detail',
    method: 'get',
    authType: 'client'
  })
}

export function approveTask(taskId, data) {
  return request({
    url: '/client/office/approval/tasks/' + taskId + '/action',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function listMySchedule(params) {
  return request({
    url: '/client/office/schedule/my',
    method: 'get',
    params,
    authType: 'client'
  })
}

export function saveMySchedule(data) {
  return request({
    url: '/client/office/schedule',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function updateMySchedule(data) {
  return request({
    url: '/client/office/schedule',
    method: 'put',
    data,
    authType: 'client'
  })
}

export function deleteMySchedule(id) {
  return request({
    url: '/client/office/schedule/' + id,
    method: 'delete',
    authType: 'client'
  })
}
