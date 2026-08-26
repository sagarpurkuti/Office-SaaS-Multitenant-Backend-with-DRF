import { tenantBff } from "./client";
import { toList } from "./list";
import type {
  Branch,
  Department,
  Designation,
  TenantOrganization,
} from "../types";

export const tenantOrganizationApi = {
  profile: async (): Promise<TenantOrganization | null> => {
    const payload = await tenantBff.django<unknown>("api/organization/");
    const [organization] = toList<TenantOrganization>(payload);
    return organization ?? null;
  },

  branches: async (): Promise<Branch[]> =>
    toList<Branch>(await tenantBff.django<unknown>("api/branches/")),

  departments: async (): Promise<Department[]> =>
    toList<Department>(await tenantBff.django<unknown>("api/departments/")),

  designations: async (): Promise<Designation[]> =>
    toList<Designation>(await tenantBff.django<unknown>("api/designations/")),
};
