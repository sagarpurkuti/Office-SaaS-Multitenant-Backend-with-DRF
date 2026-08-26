import type { LeaveStatus } from "../types";

/** Tones accepted by the shared `Badge` component. */
export type Tone = "slate" | "teal" | "amber" | "red" | "green";

export function leaveStatusTone(status: LeaveStatus): Tone {
  switch (status) {
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    case "CANCELLED":
      return "slate";
    default:
      return "amber";
  }
}

export function payrollStatusTone(status: string): Tone {
  switch (status) {
    case "PAID":
      return "green";
    case "APPROVED":
      return "teal";
    case "LOCKED":
      return "slate";
    default:
      return "amber";
  }
}

export function attendanceStatusTone(status: string): Tone {
  switch (status) {
    case "PRESENT":
    case "WORK_FROM_HOME":
    case "ON_DUTY":
      return "green";
    case "ABSENT":
      return "red";
    case "LATE":
    case "HALF_DAY":
      return "amber";
    default:
      return "slate";
  }
}

export function employeeStatusTone(status: string): Tone {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "ON_LEAVE":
      return "amber";
    case "SUSPENDED":
    case "TERMINATED":
      return "red";
    default:
      return "slate";
  }
}
