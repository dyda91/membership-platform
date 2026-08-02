import Badge from "./Badge"
import type { BadgeVariant } from "./status-labels"
import {
  accountStatusVariant,
  accessStatusVariant,
  roleBadgeVariant,
  postStatusVariant,
  ROLE_LABELS,
  ACCOUNT_STATUS_LABELS,
  ACCESS_STATUS_LABELS,
  POST_STATUS_LABELS,
} from "./status-labels"
import type { Role, AccountStatus } from "../../services/users"
import type { PostStatus } from "../../services/posts"
import type { TierAccessStatus } from "../../services/tier-access"

export type { BadgeVariant }

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={roleBadgeVariant(role)}>{ROLE_LABELS[role]}</Badge>
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <Badge variant={accountStatusVariant(status)}>
      {ACCOUNT_STATUS_LABELS[status]}
    </Badge>
  )
}

export function AccessStatusBadge({ status }: { status: TierAccessStatus }) {
  return (
    <Badge variant={accessStatusVariant(status)}>
      {ACCESS_STATUS_LABELS[status]}
    </Badge>
  )
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={postStatusVariant(status)}>
      {POST_STATUS_LABELS[status]}
    </Badge>
  )
}
