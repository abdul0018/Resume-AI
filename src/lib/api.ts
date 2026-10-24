import type {
  AdminOrder,
  InviteData,
  OrderView,
  PackageId,
  PackageInfo,
  PublicInvite,
  RsvpEntry,
  Settings,
  TemplateId,
  TemplateMeta,
  Customer,
} from "@shared/schema";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init: RequestInit & { json?: unknown; editKey?: string } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  if (init.editKey) headers.set("X-Edit-Key", init.editKey);
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, body, credentials: "same-origin" });
  } catch {
    throw new ApiError("Internet aloqasini tekshiring va qayta urinib ko‘ring", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error || "Xatolik yuz berdi", res.status);
  return data as T;
}

export interface PublicConfig {
  brandName: string;
  instagram: string;
  telegram: string;
  phone: string;
  packages: PackageInfo[];
  templates: TemplateMeta[];
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  clickUrl: string;
  paymeUrl: string;
  note: string;
  telegram: string;
}

export const api = {
  config: () => request<PublicConfig>("/api/config"),

  upload: (file: Blob, kind: "image" | "audio") =>
    request<{ url: string }>(`/api/uploads?kind=${kind}`, {
      method: "POST",
      body: file,
      headers: { "Content-Type": "application/octet-stream" },
    }),

  createOrder: (input: { template: TemplateId; package: PackageId; data: InviteData; customer: Customer; website?: string }) =>
    request<{ id: string; key: string; slug: string }>("/api/orders", { method: "POST", json: input }),

  order: (id: string, key: string) => request<{ order: OrderView; payment: PaymentInfo }>(`/api/orders/${id}`, { editKey: key }),

  updateOrder: (id: string, key: string, input: { template: TemplateId; data: InviteData }) =>
    request<{ ok: true }>(`/api/orders/${id}`, { method: "PUT", json: input, editKey: key }),

  uploadReceipt: (id: string, key: string, file: Blob) =>
    request<{ receipt: string }>(`/api/orders/${id}/receipt`, {
      method: "POST",
      body: file,
      editKey: key,
      headers: { "Content-Type": "application/octet-stream" },
    }),

  orderRsvps: (id: string, key: string) => request<{ rsvps: RsvpEntry[] }>(`/api/orders/${id}/rsvps`, { editKey: key }),

  invite: (slug: string) => request<{ invite: PublicInvite }>(`/api/invites/${encodeURIComponent(slug)}`),

  rsvp: (slug: string, input: { name: string; attending: boolean; guests: number; message: string; website?: string }) =>
    request<{ ok: true }>(`/api/invites/${encodeURIComponent(slug)}/rsvp`, { method: "POST", json: input }),

  admin: {
    me: () => request<{ admin: boolean }>("/api/admin/me"),
    login: (password: string) => request<{ ok: true }>("/api/admin/login", { method: "POST", json: { password } }),
    logout: () => request<{ ok: true }>("/api/admin/logout", { method: "POST" }),
    stats: () => request<{ total: number; pending: number; review: number; active: number; revenue: number }>("/api/admin/stats"),
    orders: (params: { status?: string; q?: string; offset?: number }) => {
      const qs = new URLSearchParams({ status: params.status || "all", q: params.q || "", offset: String(params.offset || 0) });
      return request<{ orders: AdminOrder[]; total: number }>(`/api/admin/orders?${qs}`);
    },
    updateOrder: (id: string, patch: { status?: string; adminNote?: string }) =>
      request<{ order: OrderView }>(`/api/admin/orders/${id}`, { method: "PATCH", json: patch }),
    deleteOrder: (id: string) => request<{ ok: true }>(`/api/admin/orders/${id}`, { method: "DELETE" }),
    editLink: (id: string) => request<{ url: string }>(`/api/admin/orders/${id}/edit-link`),
    rsvps: (id: string) => request<{ rsvps: RsvpEntry[] }>(`/api/admin/orders/${id}/rsvps`),
    templates: () => request<{ templates: TemplateMeta[] }>("/api/admin/templates"),
    updateTemplate: (id: string, patch: Partial<TemplateMeta>) =>
      request<{ template: TemplateMeta }>(`/api/admin/templates/${id}`, { method: "PATCH", json: patch }),
    settings: () => request<{ settings: Settings }>("/api/admin/settings"),
    saveSettings: (settings: Settings) => request<{ settings: Settings }>("/api/admin/settings", { method: "PUT", json: settings }),
  },
};

/* ------------------------------------------------------------------ */
/* Cached public config                                                */
/* ------------------------------------------------------------------ */

let configPromise: Promise<PublicConfig> | null = null;
export function loadConfig() {
  configPromise ??= api.config().catch((e) => {
    configPromise = null;
    throw e;
  });
  return configPromise;
}
