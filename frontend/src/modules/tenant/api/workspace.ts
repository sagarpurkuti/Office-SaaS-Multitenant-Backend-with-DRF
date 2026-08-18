import { tenantBff } from "./client";
import type { TenantInfo, WorkspaceDashboard } from "../types";

export const tenantWorkspaceApi = {
  dashboard: () => tenantBff.django<WorkspaceDashboard>("api/workspace/"),
  tenantInfo: () => tenantBff.django<TenantInfo>("tenant-info/"),
};
