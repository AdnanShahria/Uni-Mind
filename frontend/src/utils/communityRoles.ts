// ============================================================
// Community Role Hierarchy — Single source of truth
// ============================================================

export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'elder' | 'member';

export interface RoleMeta {
  level: number;      // 1 (lowest) → 5 (highest)
  label: string;
  emoji: string;
  color: string;      // Tailwind color name for dynamic classes
  badgeClass: string; // Full Tailwind badge styling
}

export const ROLE_HIERARCHY: Record<CommunityRole, RoleMeta> = {
  owner: {
    level: 5,
    label: 'Owner',
    emoji: '👑',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  },
  admin: {
    level: 4,
    label: 'Admin',
    emoji: '⚡',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  },
  moderator: {
    level: 3,
    label: 'Moderator',
    emoji: '🛡️',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  },
  elder: {
    level: 2,
    label: 'Elder',
    emoji: '🌿',
    color: 'teal',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  },
  member: {
    level: 1,
    label: 'Member',
    emoji: '👤',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  },
};

/** Ordered list from highest to lowest for UI rendering */
export const ROLES_ORDERED: CommunityRole[] = ['owner', 'admin', 'moderator', 'elder', 'member'];

/**
 * Returns the numeric level for a role string, defaulting to 1 (member)
 */
export const getRoleLevel = (role: string | null | undefined): number => {
  if (!role) return 0;
  return ROLE_HIERARCHY[role as CommunityRole]?.level ?? 1;
};

/**
 * Can an actor with `actorRole` change a target member with `targetRole` to `newRole`?
 * Rules:
 *  - Actor must outrank the target (actor.level > target.level)
 *  - Actor can only grant roles up to (and including) their own level
 *  - Owners can never be demoted by anyone else (level 5 is exclusive)
 */
export const canManageRole = (
  actorRole: string | null,
  targetRole: string | null,
  newRole: CommunityRole
): boolean => {
  const actorLevel = getRoleLevel(actorRole);
  const targetLevel = getRoleLevel(targetRole);
  const newLevel = getRoleLevel(newRole);

  if (actorLevel <= 1) return false;             // plain members can't manage
  if (targetLevel >= actorLevel) return false;   // can't manage peers or superiors
  if (newLevel > actorLevel) return false;       // can't grant higher than own rank
  if (newRole === 'owner') return false;         // owner is never grantable

  return true;
};

/**
 * Returns the list of roles an actor can assign to a target member.
 * Excludes 'owner' (can never be assigned) and any role above the actor.
 */
export const getAssignableRoles = (
  actorRole: string | null,
  targetRole: string | null
): CommunityRole[] => {
  const actorLevel = getRoleLevel(actorRole);
  const targetLevel = getRoleLevel(targetRole);

  if (actorLevel <= 1 || targetLevel >= actorLevel) return [];

  return ROLES_ORDERED.filter((r) => {
    const meta = ROLE_HIERARCHY[r];
    return meta.level <= actorLevel && r !== 'owner';
  });
};
