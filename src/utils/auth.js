import Cookies from 'js-cookie'

// 存储token的key
const TokenKey = 'knowledge_base_qa'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
