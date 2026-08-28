import { marked, setOptions } from 'marked'

setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

function normalizeMarkdown(text) {
  return String(text)
    .replace(/^(\d+)、/gm, '$1. ')
}

export function renderMarkdown(text) {
  if (!text) return ''
  try {
    return marked(normalizeMarkdown(text))
  } catch (e) {
    console.error('[renderMarkdown]', e)
    return normalizeMarkdown(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }
}

export function parseSources(remark) {
  if (!remark) return []
  try {
    const list = JSON.parse(remark)
    return Array.isArray(list) ? list.filter(Boolean) : []
  } catch (e) {
    return []
  }
}
