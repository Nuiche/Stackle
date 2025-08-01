// lib/user.ts
export const getUserId = (): string => {
  if (typeof window === 'undefined') return ''
  const key = 'stackle_user_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}
