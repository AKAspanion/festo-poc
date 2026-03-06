Sprint Plan Festo Virtual Assistant Mobile App

**Date: Friday Mar 6, 2026**

# Summary

Deliver iOS + Android React Native MVP in 6 two-week sprints (12 weeks total): 8 weeks development, 2 weeks testing, and 2 weeks buffer, aligned to the proposal (chat parity, history, structured responses, security, analytics hooks, no offline MVP; multilingual support and notification features are out of scope for this sprint plan).

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
* Push notifications and rich notification behaviours to be handled in a later phase (no implementation in this MVP sprint plan).

## Definition of Done

* Feature complete per acceptance criteria + unit tests for critical logic.
* Telemetry hooks added for key events (privacy-safe, no raw prompt/response unless approved).
* Accessibility basics (labels, dynamic type where applicable, contrast).
* Security: tokens only in Keychain/Keystore, TLS only, no secrets in repo/app bundle.
* QA gates: smoke suite green on both platforms, no priority tasks open.

# 6-Sprint Plan (12 weeks: 8 dev + 2 testing + 2 buffer)

Each sprint is 2 weeks. At each sprint's end, we will demo the work done so far and adjust scope based on learnings and backend readiness.

---

## Sprint 1 — Project Setup, Auth & Foundation (Weeks 1-2) | Development

#### Tasks

* **Project Set Up**
  * Create React Native project, configure iOS + Android targets.
  * Decide repo strategy (monorepo vs standalone) and set up base folder structure.
  * Wire environment configuration for Dev/Stage/Prod (no secrets in app bundle).
  * Set up navigation skeleton: Splash, Login, Chat, Chat History, Account Settings.
* **UX Process**
  * Confirm key user journeys (login, first chat, returning to history, managing profile).
  * Define information architecture and screen flows.
* **Style Guide & Prototype**
  * Establish color, typography, spacing, and component tokens aligned with web.
  * Document button, input, card, list patterns for reuse.
  * Produce low/mid-fidelity prototype for Login, Chat, History, Account Settings; validate with stakeholders.
* **Splash Screen**
  * Implement application loading screen for cold start and app initialization.
* **Login — Email & Password**
  * Implement email/password login form with validation and error messaging.
  * Hook into backend login API for non-SSO scenarios (if applicable).
* **Login — PING ONE Auth**
  * Integrate PingOne/OIDC flow for Festo IDP-based authentication.
  * Handle token issuance, refresh, logout, and session expiry.
  * **Assumption**: PingOne flow and APIs are provided and stable by backend team.
* **Login — SSO Login**
  * Implement SSO login entry point (if applicable) reusing PingOne-based flow.
  * Handle redirect/deep link callbacks and error states.
  * **Assumption**: PingOne-based SSO APIs are exposed by backend team.
* **State Behaviour — Error Handling & Messaging**
  * Implement global network and timeout handling (e.g., banners, retry actions).
  * Standardize API and authentication error messages.
* **Data Encryption & GDPR (baseline)**
  * Store sensitive tokens only in Keychain/Keystore; enforce TLS for all network calls.
  * Begin GDPR compliance checklist: data minimization, logging redaction, consent entry points.
* **Analytics & Crash Tooling (baseline)**
  * Integrate existing analytics/crash tools already configured for web (SDK wiring only).
  * Track basic events: app_start, app_ready, login_success.

#### Acceptance Criteria

* App builds and runs on iOS and Android with Splash, Login, Chat shell, History, and Account Settings navigation.
* UX flows, style guide, and prototype are agreed and documented.
* Users can log in via email/password and/or SSO (PingOne); tokens stored securely; logout clears auth state.
* Network and API errors display user-friendly messages.
* Splash screen appears during app initialization; analytics/crash tooling initialized.

---

## Sprint 2 — Chat Interface Core & History (Weeks 3-4) | Development

#### Tasks

* **Chat Interface — Composer**
  * Implement input text field with single-line and multiline input.
  * Enforce character limit with remaining-count indicator.
  * Implement send button with enabled/disabled rules.
  * Add attach document affordance (prepare for media in Sprint 3).
* **Chat Interface — Messaging Basics**
  * Render message list for user and assistant with timestamps.
  * Show chat status (Sent, Failed) for each outgoing message.
  * Implement typing indicator ("Virtual Assistant is typing...").
* **Chat Interface — Reliability**
  * Provide clear UI for failed messages and allow manual resend.
  * Handle offline/online transitions gracefully in the UI.
* **Chat Interface — Message Formatting**
  * Support basic formatting (bold, italic) in rendered messages.
* **Chat — Default Experience**
  * Add default placeholder state for chat window with a features grid.
* **Chat History — Grouping & Listing**
  * Implement chat history list grouped by conversations.
  * Derive conversation titles from first input text (or editable title).
  * Support pagination or lazy loading for long history lists.
* **Chat History — Management**
  * Search within chat history (by title and/or content, per API support).
  * Rename chat, pin chat, delete chat, archive chat, share chat with confirmation flows.
* **Chat History — Context**
  * Maintain and restore session context when opening a past conversation.
  * Persist metadata needed for defaults per conversation.

#### Acceptance Criteria

* Users can compose, send, and view messages with timestamps and sent/failed status.
* Typing indicator appears during assistant processing; failed messages can be clearly identified and manually retried.
* Bold/italic formatting is rendered correctly; the default placeholder is visible when no messages exist.
* Users can view, search, rename, pin, delete, archive, and share chats; context is restored on open.

---

## Sprint 3 — Media, Attachments, Tables & Rich Chat (Weeks 5-6) | Development

#### Tasks

* **Chat — Media Support**
  * Support sending and viewing images and PDFs only (as per scope).
  * Ensure uploaded media respects size and type constraints.
* **Chat — Attachments & Preview**
  * Add attach document capability in composer with clear affordances.
  * Implement document preview mode for images and PDFs.
  * Ensure preview integrates smoothly in chat flow and history.
* **Chat — Table Format Support**
  * Implement table-format rendering for assistant responses (horizontal scroll, responsive layout).
  * Support copy/share interactions from table content where appropriate.

#### Acceptance Criteria

* Users can attach documents (images/PDFs) and view them in chat with preview.
* Assistant responses with tables render correctly on phone and tablet.
* Error handling works correctly for media and rich messages.

---

## Sprint 4 — Account Settings, Responsiveness, Analytics & Compliance (Weeks 7-8) | Development

#### Tasks

* **Account Settings — My Profile**
  * View profile screen with user details; edit profile flow with validation.
* **Account Settings — Legal & Session**
  * T&C and Privacy Policy screens with links to full documents.
  * Logout flow (clear local data and tokens); delete account flow (with confirmation).
* **Responsiveness**
  * Optimize layouts for tablets (tab responsiveness); Chat and History screens.
  * Ensure landscape layouts remain readable and usable.
* **Analytics — Crash Analytics & Reporting**
  * Finalize crash analytics integration (existing web tools); verify crash/non-fatal capture.
  * Implement crash logs reporting and dashboards; add usage metrics (privacy-safe).
* **Data Encryption & GDPR Compliance**
  * Validate sensitive data encrypted at rest and in transit; document approach.
  * Complete GDPR checklist; verify consent, data subject rights, retention.
* **State Behaviour — Refinements**
  * Refine edge-case error handling and messaging.
* **Accessibility**
  * Validate labels, focus order, screen reader; contrast and dynamic type on key screens.

#### Acceptance Criteria

* Users can view/edit profile, view T&C/PP, log out, delete account.
* Core screens are responsive on tablets and landscape orientations.
* Crash analytics and reporting dashboards are operational; encryption and GDPR compliance are met.
* Accessibility checks pass for major flows.

---

## Sprint 5 — Unit Testing, Multilingual Support & Stabilization (Weeks 9-10) | Testing

#### Tasks

* **Dev Testing — Unit Testing**
  * Implement and extend unit tests for auth, chat, history, and settings.
* **Account Settings — Multilingual Support**
  * Add language selection in Account Settings for 7 supported languages.
  * Persist language preference locally for subsequent sessions.
* **Stabilization**
  * Fix defects uncovered during functional QA and internal testing.

#### Acceptance Criteria

* Unit test suite covers critical paths and runs green in CI.
* Users can change the app language via Account Settings with 7-language support, and the preference is respected on next launch (for all available translated strings).
* No open high-severity defects for functionality delivered in Sprints 1–4.

---

## Sprint 6 — Buffer: Spillover, Store Review & Hypercare (Weeks 11-12)

#### Tasks

* Address spillover from Sprints 1–5 (features not completed or refined).
* Fix medium/low priority defects from QA and UAT.
* Prepare and submit builds to app stores; respond to store review feedback.
* Additional performance and stability tune-ups from telemetry and beta feedback.
* Handle remaining store review items and last-minute stakeholder requests.
* Monitor crash and usage analytics; hotfix critical issues if needed.
* Finalize handover materials; confirm readiness for ongoing maintenance.

#### Acceptance Criteria

* No critical open bugs for functionality committed in Sprints 1–5.
* Release candidate builds submitted and store review feedback addressed.
* App live or ready-to-go-live; crash rate and key metrics within agreed thresholds.
* Handover and maintenance plan agreed with wider team.
