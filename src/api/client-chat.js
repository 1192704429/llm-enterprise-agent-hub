import request from '@/utils/request'

/** 发起 Agent 对话 */
export function clientAsk(data) {
  return request({
    url: '/client/chat/ask',
    method: 'post',
    data,
    authType: 'client'
  })
}

/** 获取当前用户的会话列表 */
export function listClientSessions(params) {
  return request({
    url: '/client/chat/sessions',
    method: 'get',
    params,
    authType: 'client'
  })
}

/** 获取会话下的消息列表 */
export function listClientMessages(sessionId) {
  return request({
    url: `/client/chat/sessions/${sessionId}/messages`,
    method: 'get',
    authType: 'client'
  })
}

/** 新建会话 */
export function createClientSession(data) {
  return request({
    url: '/client/chat/sessions',
    method: 'post',
    data,
    authType: 'client'
  })
}

/** 删除会话 */
export function deleteClientSession(sessionId) {
  return request({
    url: `/client/chat/sessions/${sessionId}`,
    method: 'delete',
    authType: 'client'
  })
}

/** 提交消息反馈（1=点赞，2=点踩，0=取消） */
export function submitMessageFeedback(messageId, feedback) {
  return request({
    url: `/client/chat/messages/${messageId}/feedback`,
    method: 'put',
    data: { feedback },
    authType: 'client'
  })
}
