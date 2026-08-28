import request from '@/utils/request'

export function pageAnnouncement(current, size, params) {
  return request({
    url: `/announcement/page?current=${current}&size=${size}`,
    method: 'post',
    data: params || {}
  })
}

export function getAnnouncementStats() {
  return request({
    url: '/announcement/stats',
    method: 'get'
  })
}

export function getAnnouncementById(id) {
  return request({
    url: '/announcement/' + id,
    method: 'get'
  })
}

export function saveAnnouncement(data) {
  return request({
    url: '/announcement',
    method: 'post',
    data
  })
}

export function updateAnnouncement(data) {
  return request({
    url: '/announcement',
    method: 'put',
    data
  })
}

export function deleteAnnouncement(id) {
  return request({
    url: '/announcement/' + id,
    method: 'delete'
  })
}

export function publishAnnouncement(id) {
  return request({
    url: '/announcement/' + id + '/publish',
    method: 'put'
  })
}

export function offlineAnnouncement(id) {
  return request({
    url: '/announcement/' + id + '/offline',
    method: 'put'
  })
}

/** 用户端获取有效公告，无需登录 */
export function listActiveAnnouncements() {
  return request({
    url: '/announcement/active',
    method: 'get',
    authType: 'none'
  })
}
