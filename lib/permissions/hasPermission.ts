import { POLICIES } from './constants'
import { PermissibleUser, Policies, PortfolioPermissions } from './types'

export function hasPermission<Resource extends keyof PortfolioPermissions>(
  user: PermissibleUser,
  resource: Resource,
  action: PortfolioPermissions[Resource]['action'],
  data?: PortfolioPermissions[Resource]['type'],
) {
  return user.roles.some((role) => {
    const permission = (POLICIES as Policies)[role][resource]?.[action]
    if (permission == null) return false

    if (typeof permission === 'boolean') return permission

    return data != null && permission(user, data)
  })
}
