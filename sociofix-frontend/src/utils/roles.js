// The backend may expose the role under different field names/values
// depending on how the user model was implemented. This helper normalizes
// that check in one place so pages don't have to guess.
export function isAdminUser(user) {
  if (!user) return false
  const role = (user.role || user.user_type || '').toString().toLowerCase()
  if (role) return role === 'admin' || role === 'committee' || role === 'superadmin'
  if (typeof user.is_admin === 'boolean') return user.is_admin
  return false
}
