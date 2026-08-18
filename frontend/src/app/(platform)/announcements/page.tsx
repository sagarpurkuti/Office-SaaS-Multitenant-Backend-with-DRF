"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { platformApi } from "@/lib/platform-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
} from "@/components/ui/card";

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => platformApi.announcements.list(),
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">(
    "MEDIUM",
  );

  const create = useMutation({
    mutationFn: () =>
      platformApi.announcements.create({
        title,
        message,
        priority,
        is_active: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setOpen(false);
      setTitle("");
      setMessage("");
    },
  });

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="System-wide messages for operators or tenants."
        actions={
          <Button onClick={() => setOpen((v) => !v)}>
            {open ? "Cancel" : "New announcement"}
          </Button>
        }
      />
      {error ? <ErrorBanner message={(error as Error).message} /> : null}
      {create.error ? (
        <ErrorBanner
          message={
            create.error instanceof ApiError
              ? create.error.message
              : (create.error as Error).message
          }
        />
      ) : null}

      {open ? (
        <Card className="mb-6 max-w-xl">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as typeof priority)
                }
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Publishing…" : "Publish"}
            </Button>
          </form>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !data?.length ? (
        <EmptyState>No announcements.</EmptyState>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{a.title}</h2>
                <div className="flex gap-2">
                  <Badge>{a.priority}</Badge>
                  <Badge tone={a.is_active ? "green" : "slate"}>
                    {a.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {a.message}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
