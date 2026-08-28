import request from '@/utils/request'

export function pageKnowledgeChunks(knowledgeId, current, size, keyword) {
  const params = new URLSearchParams({
    current: String(current),
    size: String(size)
  })
  if (keyword) {
    params.append('keyword', keyword)
  }
  return request({
    url: `/knowledge/${knowledgeId}/chunks/page?${params.toString()}`,
    method: 'get'
  })
}

export function updateKnowledgeChunk(knowledgeId, chunkId, data) {
  return request({
    url: `/knowledge/${knowledgeId}/chunks/${chunkId}`,
    method: 'put',
    data
  })
}

export function reindexKnowledgeChunks(knowledgeId) {
  return request({
    url: `/knowledge/${knowledgeId}/chunks/reindex`,
    method: 'post'
  })
}
