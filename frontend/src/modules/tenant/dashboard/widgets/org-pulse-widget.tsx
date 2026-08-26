"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Layers, Users, UserSquare2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { tenantQueryKeys } from "../../api/query-keys";
import { tenantWorkspaceApi } from "../../api/workspace";

/** Organization-wide headline numbers. Only rendered for org-scoped roles. */
export function OrgPulseWidget() {
  const { data, isLoading } = useQuery({
    queryKey: tenantQueryKeys.workspace,
    queryFn: () => tenantWorkspaceApi.dashboard(),
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Employees"
        value={data?.counts.employees ?? 0}
        icon={Users}
        loading={isLoading}
      />
      <StatCard
        label="Departments"
        value={data?.counts.departments ?? 0}
        icon={Layers}
        loading={isLoading}
      />
      <StatCard
        label="Branches"
        value={data?.counts.branches ?? 0}
        icon={Building2}
        loading={isLoading}
      />
      <StatCard
        label="Members"
        value={data?.counts.members ?? 0}
        icon={UserSquare2}
        loading={isLoading}
      />
    </div>
  );
}
