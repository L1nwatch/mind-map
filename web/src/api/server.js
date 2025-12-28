const TOKEN_STORAGE_KEY = 'MIND_MAP_TOKEN'
const DOC_ID_STORAGE_KEY = 'MIND_MAP_DOC_ID'

export const isServerMode = () => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('server') === '1') {
    return true
  }
  const host = window.location.hostname
  return host === 'watch0.top' || host.endsWith('.watch0.top')
}

export const getAuthToken = () => {
  const params = new URLSearchParams(window.location.search)
  const queryToken = params.get('token')
  if (queryToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, queryToken)
    return queryToken
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export const setAuthToken = token => {
  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export const getLastDocId = () => {
  const value = localStorage.getItem(DOC_ID_STORAGE_KEY)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const setLastDocId = docId => {
  if (!docId) {
    localStorage.removeItem(DOC_ID_STORAGE_KEY)
    return
  }
  localStorage.setItem(DOC_ID_STORAGE_KEY, String(docId))
}

const apiFetch = async (path, options = {}) => {
  let token = getAuthToken()
  if (!token) {
    token = window.prompt('请输入管理密码') || ''
    if (token) {
      setAuthToken(token)
    }
  }
  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('X-Private-Token', token)
  }
  headers.set('Content-Type', 'application/json')
  const response = await fetch(`/api/mindmaps${path}`, {
    ...options,
    headers
  })
  return response
}

export const listDocs = async () => {
  const response = await apiFetch('/', { method: 'GET' })
  if (!response.ok) {
    throw new Error(`list_docs_failed:${response.status}`)
  }
  return response.json()
}

export const getDoc = async docId => {
  const response = await apiFetch(`/${docId}`, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`get_doc_failed:${response.status}`)
  }
  return response.json()
}

export const createDoc = async payload => {
  const response = await apiFetch('/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error(`create_doc_failed:${response.status}`)
  }
  return response.json()
}

export const updateDoc = async (docId, payload) => {
  const response = await apiFetch(`/${docId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
  if (response.status === 409) {
    const conflict = await response.json()
    return { conflict }
  }
  if (!response.ok) {
    throw new Error(`update_doc_failed:${response.status}`)
  }
  return { doc: await response.json() }
}

export const deleteDoc = async docId => {
  const response = await apiFetch(`/${docId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`delete_doc_failed:${response.status}`)
  }
}
