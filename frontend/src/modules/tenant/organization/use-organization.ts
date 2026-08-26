"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { orNullOnForbidden } from "../api/list";
import { tenantOrganizationApi } from "../api/organization";
import { tenantQueryKeys } from "../api/query-keys";
import { useRbac } from "../rbac";
import type { Branch, Department, Designation } from "../types";

/**
 * Structure lookups used to label employee records.
 *
 * These endpoints are Owner/HR-only in Django, so a manager legitimately gets a
 * 403 here. That is treated as "no labels available" rather than an error, and
 * the page falls back to showing the raw identifier.
 */
export function useOrgLookups() {
  const { can } = useRbac();

  const branches = useQuery({
    queryKey: tenantQueryKeys.organization.branches,
    queryFn: async () =>
      (await orNullOnForbidden(tenantOrganizationApi.branches())) ?? [],
    enabled: can("branch.view"),
  });

  const departments = useQuery({
    queryKey: tenantQueryKeys.organization.departments,
    queryFn: async () =>
      (await orNullOnForbidden(tenantOrganizationApi.departments())) ?? [],
    enabled: can("department.view"),
  });

  const designations = useQuery({
    queryKey: tenantQueryKeys.organization.designations,
    queryFn: async () =>
      (await orNullOnForbidden(tenantOrganizationApi.designations())) ?? [],
    enabled: can("designation.view"),
  });

  const branchNames = useNameMap(branches.data);
  const departmentNames = useNameMap(departments.data);
  const designationNames = useNameMap(designations.data);

  return {
    branches: branches.data ?? [],
    departments: departments.data ?? [],
    designations: designations.data ?? [],
    branchNames,
    departmentNames,
    designationNames,
    isLoading:
      branches.isLoading || departments.isLoading || designations.isLoading,
  };
}

type NamedRecord = Branch | Department | Designation;

function useNameMap(records: NamedRecord[] | undefined) {
  return useMemo(() => {
    const map = new Map<number, string>();
    for (const record of records ?? []) map.set(record.id, record.name);
    return map;
  }, [records]);
}

export function useOrganizationProfile() {
  const { can } = useRbac();
  return useQuery({
    queryKey: tenantQueryKeys.organization.profile,
    queryFn: () => orNullOnForbidden(tenantOrganizationApi.profile()),
    enabled: can("organization.view"),
  });
}
