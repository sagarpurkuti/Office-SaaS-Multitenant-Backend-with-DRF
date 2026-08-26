"use client";

import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/ui/table";
import { Can, RequirePermission, useRbac } from "../rbac";
import type { Branch, Department, Designation } from "../types";
import { useOrgLookups, useOrganizationProfile } from "./use-organization";

export function OrganizationPage() {
  return (
    <RequirePermission
      anyOf={["organization.view", "branch.view", "department.view"]}
    >
      <OrganizationContent />
    </RequirePermission>
  );
}

function OrganizationContent() {
  const { canAny } = useRbac();
  const { data: organization, isLoading } = useOrganizationProfile();
  const { branches, departments, designations } = useOrgLookups();

  const canSeeStructure = canAny([
    "branch.view",
    "department.view",
    "designation.view",
  ]);

  return (
    <div>
      <PageHeader
        title="Organization"
        description="Company profile, branches, departments and designations."
      />

      <Can permission="organization.view">
        <Card className="mb-6">
          <h2 className="font-semibold">Profile</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          ) : organization ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Name" value={organization.name} />
              <Row label="Short name" value={organization.short_name} />
              <Row label="Phone" value={organization.phone} />
              <Row label="Email" value={organization.email ?? "—"} />
              <Row label="Timezone" value={organization.timezone} />
              <Row label="Currency" value={organization.currency} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No organization record has been created for this tenant yet.
            </p>
          )}
        </Card>
      </Can>

      <Can permission="branch.view">
        <StructureTable
          title="Branches"
          records={branches}
          extra={(branch) =>
            (branch as Branch).is_head_office ? (
              <Badge tone="teal">Head office</Badge>
            ) : null
          }
        />
      </Can>

      <Can permission="department.view">
        <StructureTable title="Departments" records={departments} />
      </Can>

      <Can permission="designation.view">
        <StructureTable title="Designations" records={designations} />
      </Can>

      {canSeeStructure ? null : (
        <EmptyState>
          Your role can view the organization profile but not its structure.
        </EmptyState>
      )}
    </div>
  );
}

type StructureRecord = Branch | Department | Designation;

function StructureTable({
  title,
  records,
  extra,
}: {
  title: string;
  records: StructureRecord[];
  extra?: (record: StructureRecord) => React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 font-semibold text-slate-900">{title}</h2>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Code</Th>
            <Th align="right">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {records.length === 0 ? (
            <TableEmpty colSpan={3}>Nothing has been created yet.</TableEmpty>
          ) : (
            records.map((record) => (
              <Tr key={record.id}>
                <Td className="font-medium text-slate-900">
                  {record.name} {extra?.(record)}
                </Td>
                <Td className="font-mono text-xs">{record.code}</Td>
                <Td align="right">
                  <Badge tone={record.is_active ? "green" : "slate"}>
                    {record.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
