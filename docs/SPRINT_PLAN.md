Sprint Plan Festo Virtual Assistant Mobile App

**Date: Friday Mar 6, 2026**

# Summary

Deliver iOS + Android React Native MVP in 6 weeks, with a 2-week buffer (hypercare + spillover + store review variability), aligned to the proposal (chat parity, history, structured responses, i18n, security, analytics hooks, no offline MVP, notification triggers moved to next phase, but we can keep minimal client scaffolding behind a flag).

## Delivery Team

* 1 Senior React Native engineer (full time)
* 1 UI/UX designer
* 1 Solution Architect / Tech Lead (part time, governance + reviews)
* DevOps support (as needed for pipelines and store releases)

## Working assumptions

* Existing Frontend Repo is available for review before development
* Backend APIs (chat + history + auth) are available by/within Week 1, with a stable contract (or versioned).
* Ping Identity integration details (flows, token/refresh, MFA/device rules, redirect URLs) are clarified during Week 1.
* Assistant returns structured blocks (or we can derive a stable schema via an adapter layer).
* Push notifications: framework only (optional), real triggers are post-MVP.

## Definition of Done

* Feature complete per acceptance criteria + unit tests for critical logic.
* Telemetry hooks added for key events (privacy-safe, no raw prompt/response unless approved).
* Accessibility basics (labels, dynamic type where applicable, contrast).
* Security: tokens only in Keychain/Keystore, TLS only, no secrets in repo/app bundle.
* QA gates: smoke suite green on both platforms, no priority tasks open.

# 8-Week Sprint Plan (6 weeks delivery + 2 weeks buffer)

Each sprint will be of 2 weeks. At each week's end, we will demo the work done so far.

### Sprint 1 - Alignment, Discovery & Foundation (Week 1-2)

#### Tasks

* UX
  * Screens: Login, Chat, History list, Conversation view, Settings (language override, legal).
* Architecture
  * Project setup approach (monorepo vs standalone), environment strategy (Dev/Stage/Prod).
  * Choose state approach (Redux Toolkit or Zustand) + navigation + i18n library.
  * Define structured response schema (blocks) + adapter approach if backend varies.
  * Folder structure (UI/domain/data separation), theming/design tokens alignment.
  * Error boundary + global toasts/snackbars.
* API Understanding
  * Contract walkthrough: chat send, history list (pagination), conversation detail, attachments/media links.
  * Decide streaming vs non-streaming handling based on existing behavior.
* Auth (Ping Identity)
  * Confirm flow (OAuth2/OIDC preferred), token refresh, logout, session expiry, MFA edge cases.
  * Define secure storage + deep link/redirect handling requirements.
  * Implement OIDC client flow + secure token storage + logout.
  * Session expiry handling (silent refresh or re-auth).
* Environments & CI
  * Dev/Stage/Prod config wiring (no secrets in app).
  * Build pipelines baseline + artifact generation for QA.
* I18n
  * i18n wiring + locale detection + fallback + language override plumbing.

#### Acceptance Criteria

* Alignment of dev team, clarification of backend.
* Libraries and approach finalized and project setup complete.
* Working app shell on iOS/Android with navigation, environments, CI basics.
* Users can login and land in an empty chat shell on both platforms.

### Sprint 2 — Chat Core (Week 3-4)

#### Tasks

* Chat UI
  * Composer (text input, send button state, disabled rules, basic attachments display if needed later).
  * Message list (virtualized), timestamps, sender grouping, loading states.
  * Suggested prompts (from backend or static for MVP if needed).
  * Network loss banner, retry/resend for failed messages, optimistic UI rules.
  * Conversation list (paginated), pull-to-refresh, empty/error states.
  * Conversation detail load (paginate older messages if needed).
  * Session continuity rules (resume last session, deep link into a conversation if applicable).
* Performance
  * Render optimization for long threads (incremental rendering, memoization patterns, stable keys).
  * Image/link preview handling baseline (no heavy caching/offline).
* Network Calls
  * Typed API client, request tracing IDs, retry/backoff for safe calls, cancellation.
  * Streaming support implemented if required (else long-poll/standard response).
* Analytics
  * Events: login\_success, conversation\_open, message\_send, message\_fail, response\_rendered, latency metrics.
* Testing
  * Unit tests: API client, message reducer/store logic.

#### Acceptance Criteria

* Users can send a message, receive assistant replies reliably, and handle transient failures gracefully.
* Users can view and open past conversations with smooth scrolling and stable state.

### Sprint 3 — Structured Response Rendering & Readiness (Week 5-6)

#### Tasks

* Chat Renderer
  * Text, Link, Table, Media (image + PDF link open), renderer.
  * Adapter layer to normalize backend payload - block schema.
  * Table UX: horizontal scroll, sticky header optional, copy/share where sensible.
* I18n
  * All UI strings externalized, locale-aware formatting for dates/numbers if shown.
* Review
  * App startup, memory/performance sanity, crash-free baseline.
  * Privacy review of analytics events (GDPR-aligned).
  * Review crash reporting, log levels, correlation IDs.
  * Security review: token storage verification, TLS enforcement, logging redaction.
  * Accessibility pass: labels, focus order, dynamic type checks on key screens.
* Release
  * App signing, store metadata placeholders, internal beta distribution.
* Testing
  * Snapshot/component tests for renderer blocks, contract tests for adapter mapping.
  * Device matrix smoke: key iPhones & Android variants.

#### Acceptance Criteria

* Structured responses render consistently for the known response types - text, links, comparison tables, media (images, PDFs/links).
* Release Candidate passes smoke tests, no earlier sprint defects.
* Store submission package ready.

### Sprint 4 — Buffer: Store Review, Spillover, Stabilization(Week 7-8)

#### Tasks

* Potential Fixes
  * Fix anything from earlier tasks.
  * Performance tuning for worst-case conversations/tables.
  * Auth edge cases found in real IAM environments.

#### Acceptance Criteria

#### Release candidate build(s) ready for store submission; quality gates met

* Absorb any spillover, fix high-priority defects, address store review feedback quickly.
