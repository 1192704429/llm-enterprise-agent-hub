import Cookies from 'js-cookie'

const ClientTokenKey = 'knowledge_base_qa_client_token'

export function getClientToken() {
  return Cookies.get(ClientTokenKey)
}

export function setClientToken(token) {
  return Cookies.set(ClientTokenKey, token)
}

export function removeClientToken() {
  return Cookies.remove(ClientTokenKey)
}
