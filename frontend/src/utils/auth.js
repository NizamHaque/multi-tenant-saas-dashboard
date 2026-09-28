import api from '../api/axios'

export async function loginAsDemo() {
  const res = await api.post('/auth/demo-login')
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('role', res.data.role)
  localStorage.setItem('tenantName', res.data.tenantName)
  localStorage.setItem('isDemo', 'true')
  return res.data
}

export const executeDemoLogin = loginAsDemo

export function isDemoUser() {
  const isDemoFlag = localStorage.getItem('isDemo') === 'true'
  const tenantName = localStorage.getItem('tenantName') || ''
  const role = localStorage.getItem('role') || ''
  const storedUserRaw = localStorage.getItem('user')

  let storedUser = {}
  try {
    if (storedUserRaw) storedUser = JSON.parse(storedUserRaw)
  } catch {
    storedUser = {}
  }

  return Boolean(
    isDemoFlag ||
    storedUser.isDemo === true ||
    storedUser.username === 'demo' ||
    storedUser.email?.includes('demo') ||
    tenantName.toLowerCase().includes('demo') ||
    role === 'ROLE_DEMO'
  )
}


export function handleAuthError(error, navigate) {
  const status = error?.response?.status
  if (status === 401 || status === 403) {
    localStorage.clear()
    navigate('/login', { replace: true })
    return true
  }
  return false
}

export function handleAdminAuthError(error, navigate) {
  const status = error?.response?.status
  if (status === 401 || status === 403) {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    navigate('/admin/login', { replace: true })
    return true
  }
  return false
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
}

