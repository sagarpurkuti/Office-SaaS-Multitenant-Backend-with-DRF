"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tenantAttendanceApi } from "../../api/attendance";
import { tenantQueryKeys } from "../../api/query-keys";
import { useCurrentEmployee } from "../../employees/use-employees";
import { formatMinutes, formatTime, humanizeEnum } from "../../lib/format";
import { useRbac } from "../../rbac";
import { WidgetCard, WidgetEmpty, WidgetRow } from "./widget-card";

/** Self-service attendance: today's record plus check in / check out. */
export function MyDayWidget() {
  const { can } = useRbac();
  const queryClient = useQueryClient();
  const { employee } = useCurrentEmployee();

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.attendance.today,
    queryFn: () => tenantAttendanceApi.today(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.attendance.all });
  };

  const checkIn = useMutation({
    mutationFn: () => tenantAttendanceApi.checkIn(),
    onSuccess: invalidate,
  });

  const checkOut = useMutation({
    mutationFn: () => tenantAttendanceApi.checkOut(),
    onSuccess: invalidate,
  });

  const canMark = can("attendance.mark") && Boolean(employee);
  const mutationError = checkIn.error ?? checkOut.error;

  return (
    <WidgetCard
      title="My day"
      description="Today's attendance record."
      action={{ href: "/attendance", label: "Attendance" }}
      loading={isLoading}
      error={error}
    >
      {data ? (
        <div>
          <Badge tone={data.status === "PRESENT" ? "green" : "amber"}>
            {humanizeEnum(data.status)}
          </Badge>
          <dl className="mt-3">
            <WidgetRow label="Checked in" value={formatTime(data.check_in)} />
            <WidgetRow label="Checked out" value={formatTime(data.check_out)} />
            <WidgetRow
              label="Worked"
              value={formatMinutes(data.worked_minutes)}
            />
          </dl>
        </div>
      ) : employee ? (
        <WidgetEmpty>No attendance recorded for today yet.</WidgetEmpty>
      ) : (
        <WidgetEmpty>
          Your login is not linked to an employee record, so attendance cannot be
          recorded.
        </WidgetEmpty>
      )}

      {canMark ? (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => checkIn.mutate()}
            disabled={checkIn.isPending || Boolean(data?.check_in)}
          >
            {checkIn.isPending ? "Checking in…" : "Check in"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => checkOut.mutate()}
            disabled={checkOut.isPending || !data?.check_in || Boolean(data?.check_out)}
          >
            {checkOut.isPending ? "Checking out…" : "Check out"}
          </Button>
        </div>
      ) : null}

      {mutationError ? (
        <p className="mt-3 text-xs text-red-600">
          {mutationError instanceof Error
            ? mutationError.message
            : "Could not update attendance."}
        </p>
      ) : null}
    </WidgetCard>
  );
}
