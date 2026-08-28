import request from '@/utils/request'

export function listAiModelConfigs() {
  return request({
    url: '/ai_model_config/list',
    method: 'get'
  })
}

export function saveAiModelConfig(data) {
  return request({
    url: '/ai_model_config',
    method: 'post',
    data
  })
}

export function updateAiModelConfig(data) {
  return request({
    url: '/ai_model_config',
    method: 'put',
    data
  })
}

export function selectAiModelConfig(id) {
  return request({
    url: `/ai_model_config/${id}/select`,
    method: 'put'
  })
}

export function deleteAiModelConfig(id) {
  return request({
    url: `/ai_model_config/${id}`,
    method: 'delete'
  })
}
