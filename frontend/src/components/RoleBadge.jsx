export default function RoleBadge({ role }) {
  const className =
    role === 'ORG_ADMIN'
      ? 'role-badge role-badge--admin'
      : role === 'MANAGER'
        ? 'role-badge role-badge--manager'
        : 'role-badge role-badge--viewer'

  return <span className={className}>{role}</span>
}
