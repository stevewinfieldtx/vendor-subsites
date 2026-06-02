/**
 * TDE (Targeted Decomposition Engine) client.
 *
 * TDE is the central content brain for the Vendor Experience Network. Each
 * vendor/product is one TDE collection of 9D-tagged atoms. We pull page copy
 * via `reconstruct()`, answer chat/voice via `/agent/query`, and personalize
 * tone via the voice cascade (voice_guide > CPPW > CPPV).
 *
 * Auth + async conventions follow the TDE integration guide:
 *  - `x-api-key` header on every call except /health and /agent/query
 *  - ingest is async — poll GET /sources/:id for status === "ready"
 *  - search/reconstruct accept 9D filters; reconstruct has voice-aware intents
 *
 * All calls are server-side only. Never expose TDE_API_KEY to the client.
 */

// ----------------------------------------------------------------------------
// 9D taxonomy (canonical WinTech values). Used as reconstruct/search filters.
// ----------------------------------------------------------------------------

export type Persona =
  | "Executive/C-Suite"
  | "CFO/Finance"
  | "CISO/Security"
  | "CTO/IT"
  | "VP Sales"
  | "VP Marketing"
  | "Operations"
  | "Practitioner"
  | "End User"
  | "General";

export type BuyingStage =
  | "Awareness"
  | "Interest"
  | "Evaluation"
  | "Decision"
  | "Retention"
  | "Advocacy";

export interface NineDFilters {
  persona?: Persona;
  buying_stage?: BuyingStage;
  emotional_driver?: string;
  evidence_type?: string;
  economic_driver?: string;
  status_quo_pressure?: string;
  /** NAICS 2-digit sector or SIC division, per TDE search params. */
  d_industry?: string;
}

/** Voice-aware intents inject the reseller's voice fingerprint into output. */
export type ReconstructIntent =
  | "sales_email"
  | "competitive_brief"
  | "executive_summary"
  | "discovery_questions"
  | "enrichment"
  | "agent_response"
  | "objection_handling"
  | "custom";

export interface ReconstructRequest {
  intent: ReconstructIntent;
  query: string;
  filters?: NineDFilters;
  format?: "text" | "json";
  max_atoms?: number;
  max_words?: number;
}

export interface ReconstructResponse<T = string> {
  output: T;
  atoms_used?: unknown[];
  confidence?: "high" | "medium" | "low";
  gaps?: string[];
}

export interface AgentQueryResponse {
  answer?: string;
  response?: string;
  references?: unknown[];
  [k: string]: unknown;
}

export class TdeError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "TdeError";
  }
}

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

export interface TdeConfig {
  baseUrl: string;
  apiKey?: string;
}

/**
 * Read TDE config from the environment. Returns null when unconfigured, which
 * lets callers fall back to mock content during early development.
 */
export function tdeConfigFromEnv(): TdeConfig | null {
  const baseUrl = process.env.TDE_API_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  const apiKey = process.env.TDE_API_KEY ?? process.env.API_SECRET_KEY;
  return { baseUrl, apiKey };
}

export function isTdeConfigured(): boolean {
  return tdeConfigFromEnv() !== null;
}

// ----------------------------------------------------------------------------
// Client
// ----------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 30_000;

export class TdeClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config?: TdeConfig) {
    const cfg = config ?? tdeConfigFromEnv();
    if (!cfg) {
      throw new TdeError(
        "TDE is not configured. Set TDE_API_URL (and TDE_API_KEY).",
      );
    }
    this.baseUrl = cfg.baseUrl.replace(/\/$/, "");
    this.apiKey = cfg.apiKey;
  }

  private async request<T>(
    path: string,
    init: RequestInit & { auth?: boolean; timeoutMs?: number } = {},
  ): Promise<T> {
    const { auth = true, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
    const headers = new Headers(rest.headers);
    if (!headers.has("Content-Type") && rest.body) {
      headers.set("Content-Type", "application/json");
    }
    if (auth && this.apiKey) headers.set("x-api-key", this.apiKey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        ...rest,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      throw new TdeError(
        `TDE request failed: ${(err as Error).message}`,
      );
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    if (!res.ok) {
      throw new TdeError(
        `TDE ${path} returned ${res.status}`,
        res.status,
        text.slice(0, 500),
      );
    }
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  // --- Health / collections -------------------------------------------------

  health(): Promise<Record<string, unknown>> {
    return this.request("/health", { auth: false });
  }

  listCollections(): Promise<Array<{ id: string; name: string; stats?: { atomCount?: number } }>> {
    return this.request("/collections");
  }

  getCollection(id: string): Promise<Record<string, unknown>> {
    return this.request(`/collections/${encodeURIComponent(id)}`);
  }

  createCollection(input: {
    id: string;
    name: string;
    description?: string;
    templateId?: string;
  }): Promise<Record<string, unknown>> {
    return this.request("/collections", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  // --- Ingest (async) -------------------------------------------------------

  ingest(input: {
    collectionId: string;
    type: "youtube" | "pdf" | "docx" | "pptx" | "audio" | "text" | "web";
    input: string;
  }): Promise<{ ok?: boolean; status?: string; [k: string]: unknown }> {
    return this.request("/ingest", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /** Crawl a website into a collection — used to build a reseller's CPPV. */
  crawl(input: {
    collectionId: string;
    url: string;
    maxPages?: number;
  }): Promise<Record<string, unknown>> {
    return this.request("/ingest/crawl", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  listSources(
    collectionId: string,
  ): Promise<Array<{ id?: string; sourceId?: string; status?: string; url?: string }>> {
    return this.request(`/sources/${encodeURIComponent(collectionId)}`);
  }

  /**
   * Poll sources until none are "processing" (or timeout). Returns the final
   * source list. Ingest is async, so callers must wait before retrieval.
   */
  async waitForSources(
    collectionId: string,
    opts: { timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<Array<{ status?: string }>> {
    const timeoutMs = opts.timeoutMs ?? 120_000;
    const intervalMs = opts.intervalMs ?? 4_000;
    const deadline = Date.now() + timeoutMs;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const sources = await this.listSources(collectionId);
      const pending = sources.filter((s) => s.status === "processing");
      if (pending.length === 0 || Date.now() > deadline) return sources;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  // --- Retrieval ------------------------------------------------------------

  search(
    collectionId: string,
    query: string,
    opts: NineDFilters & { top_k?: number } = {},
  ): Promise<{ count: number; results: Array<Record<string, unknown>> }> {
    const params = new URLSearchParams({ q: query });
    for (const [k, v] of Object.entries(opts)) {
      if (v != null) params.set(k, String(v));
    }
    return this.request(
      `/search/${encodeURIComponent(collectionId)}?${params.toString()}`,
    );
  }

  /**
   * Targeted recomposition — the workhorse for page copy. Voice-aware intents
   * (sales_email, agent_response, custom) automatically inject the collection's
   * voice fingerprint so the output matches the reseller's tone.
   */
  reconstruct<T = string>(
    collectionId: string,
    req: ReconstructRequest,
  ): Promise<ReconstructResponse<T>> {
    return this.request(`/reconstruct/${encodeURIComponent(collectionId)}`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  /** ElevenLabs-style grounded Q&A. No auth; pass collection name(s) as string. */
  agentQuery(input: {
    question: string;
    collections: string;
  }): Promise<AgentQueryResponse> {
    return this.request("/agent/query", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input),
    });
  }

  // --- Voice ----------------------------------------------------------------

  buildCppv(collectionId: string): Promise<Record<string, unknown>> {
    return this.request(`/build-cppv/${encodeURIComponent(collectionId)}`, {
      method: "POST",
    });
  }

  cppStatus(): Promise<Record<string, unknown>> {
    return this.request("/api/cpp-status");
  }
}

/** Convenience: a client from env, or null when TDE is unconfigured. */
export function getTdeClient(): TdeClient | null {
  return isTdeConfigured() ? new TdeClient() : null;
}
