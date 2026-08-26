export {
  PERMISSION_CATALOG,
  PERMISSION_GROUPS,
  PERMISSION_RESOURCES,
  ALL_PERMISSIONS,
  isPermissionKey,
  permissionLabel,
  splitPermission,
  type PermissionGroup,
  type PermissionKey,
  type PermissionResource,
} from "./permissions";

export {
  SCOPES,
  SCOPE_LABELS,
  SCOPE_SHORT_LABELS,
  compareScopes,
  isScope,
  isSelfServiceScope,
  scopeSatisfies,
  widestScope,
  type Scope,
} from "./scopes";

export {
  EMPTY_GRANTS,
  can,
  canAll,
  canAny,
  expandGrants,
  grantedPermissions,
  grantsForResource,
  mergeGrants,
  parseGrants,
  scopeOf,
  serializeGrants,
  type GrantSpec,
  type PermissionGrants,
} from "./grants";

export { ROLE_PRESETS, ROLE_PRESET_SPECS, presetFor } from "./role-presets";

export {
  ANONYMOUS_ACCESS,
  resolveAccessProfile,
  type AccessProfile,
  type GrantSource,
} from "./resolve";

export {
  RbacProvider,
  useCan,
  useRbac,
  useScopeOf,
  type RbacValue,
} from "./rbac-provider";

export {
  AccessDenied,
  Can,
  RequirePermission,
  ScopeBadge,
  ScopeNotice,
} from "./guards";
