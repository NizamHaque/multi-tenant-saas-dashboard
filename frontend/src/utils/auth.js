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
