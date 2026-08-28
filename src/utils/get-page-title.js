import defaultSettings from '@/settings'

const title = defaultSettings.fullTitle || defaultSettings.title || 'Vue Admin Template'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return title
}
