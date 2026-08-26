"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/card";
import { tenantQueryKeys } from "../api/query-keys";
import { tenantWorkspaceApi } from "../api/workspace";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import { displayName } from "../auth/roles";
import { useRbac } from "../rbac";
import {
  WIDGET_SPAN_CLASS,
  visibleWidgets,
} from "./widget-registry";

export function TenantDashboardPage() {
  const { user } = useTenantAuth();
  const { canAny, roleLabel } = useRbac();

  const { data } = useQuery({
    queryKey: tenantQueryKeys.workspace,
    queryFn: () => tenantWorkspaceApi.dashboard(),
  });

  const widgets = visibleWidgets(canAny);

  return (
    <div>
      <PageHeader
        title={data?.organization?.name || data?.tenant_name || "Workspace"}
        description={
          user
            ? `Welcome back, ${displayName(user)}. Signed in as ${roleLabel}.`
            : "Tenant workspace"
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        {widgets.map((widget) => {
          const Widget = widget.component;
          return (
            <div
              key={widget.id}
              className={WIDGET_SPAN_CLASS[widget.span]}
            >
              <Widget />
            </div>
          );
        })}
      </div>
    </div>
  );
}
