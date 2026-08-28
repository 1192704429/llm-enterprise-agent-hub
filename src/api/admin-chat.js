import request from '@/utils/request'

export function adminAsk(data) {
  return request({
    url: '/admin/chat/ask',
    method: 'post',
    data
  })
}

export function listAdminSessions(params) {
  return request({
    url: '/admin/chat/sessions',
    method: 'get',
    params
  })
}

export function listAdminMessages(sessionId) {
  return request({
    url: `/admin/chat/sessions/${sessionId}/messages`,
    method: 'get'
  })
}

export function deleteAdminSession(sessionId) {
  return request({
    url: `/admin/chat/sessions/${sessionId}`,
    method: 'delete'
  })
}
