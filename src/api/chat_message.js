import request from '@/utils/request'

// 分页查询聊天消息列表（current、size 放路径参数，其余放 body）
export function pageChatMessage(current, size, params) {
  return request({
    url: `/chat_message/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询聊天消息详情
export function getChatMessageById(id) {
  return request({
    url: '/chat_message/' + id,
    method: 'get'
  })
}

// 新增聊天消息
export function saveChatMessage(data) {
  return request({
    url: '/chat_message',
    method: 'post',
    data: data
  })
}

// 修改聊天消息
export function updateChatMessage(data) {
  return request({
    url: '/chat_message',
    method: 'put',
    data: data
  })
}

// 删除聊天消息
export function deleteChatMessage(ids) {
  return request({
    url: '/chat_message/' + ids,
    method: 'delete'
  })
}

// 批量删除聊天消息
export function deleteBatchChatMessage(ids) {
  return request({
    url: '/chat_message/batch',
    method: 'delete',
    data: ids
  })
}


// 下拉选项：所属会话
export function listChatSession(data) {
  return request({
    url: '/chat_session/list',
    method: 'post',
    data: data || {}
  })
}
