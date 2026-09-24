"""Hostname helpers shared by middleware and provisioning."""

from __future__ import annotations

import re


_HOST_RE = re.compile(
    r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$"
)


def normalize_tenant_host(raw: str) -> str:
    """
    Normalize a hostname the same way the Next.js BFF does.

    Strips scheme, path, port, and lowercases. Raises ValueError if empty/invalid.
    """
    value = (raw or "").strip().lower()
    value = re.sub(r"^https?://", "", value)
    value = value.split("/")[0] if value else value
    value = value.split(":")[0] if value else value
    value = value.strip(".")
    if not value or not _HOST_RE.match(value) or len(value) > 253:
        raise ValueError("Invalid tenant host.")
    return value
