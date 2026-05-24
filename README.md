# AI Backoffice Ops Desk

> Portfolio MVP for Legal/Finance automation: Slack intake simulator, AI request parsing, contract risk audit, mock Jira delivery, SLA tracking and daily summary.

**Live demo:** `https://kilevoy.github.io/ai-backoffice-ops-desk/`  
**Status:** MVP / static demo  
**No real data:** all requests, contracts, names and tasks are synthetic.

---

## Business problem

Legal and Finance teams often receive internal requests through scattered channels: chats, email, direct messages and spreadsheets. Requests are incomplete, deadlines are unclear, ownership is not visible, and task status depends on manual follow-up.

This demo shows how a chaotic message from an employee can be transformed into a structured operational workflow.

```text
Slack request → AI classification → missing data check → contract risk audit → Jira task → SLA tracking → daily summary
```

---

## Solution

AI Backoffice Ops Desk demonstrates a lightweight operating layer for backoffice teams:

- receives Legal/Finance requests from a Slack-like interface;
- classifies request type, priority and risk factors;
- detects missing data before work starts;
- runs a contract risk-audit scenario;
- creates a mock Jira issue with checklist and SLA;
- shows operational metrics and bottlenecks;
- generates a daily manager summary.

The MVP is intentionally static and public-safe. It can later be connected to real Slack, Jira, Google Sheets and AI APIs through n8n, Google Apps Script or a custom backend.

---

## Features

- SaaS-style React dashboard
- Slack Intake Simulator with three scenarios
- AI Request Parser card
- Contract Risk Audit preview
- Mock Jira Task Preview
- SLA Dashboard with charts
- Daily AI Summary
- Documentation for production integration
- Optional n8n workflow blueprints

---

## Tech stack

- React
- TypeScript
- Vite
- Recharts
- CSS modules/global CSS
- GitHub Pages
- Optional production layer: n8n / Apps Script / custom backend

---

## Run locally

```bash
cd app
npm install
npm run dev
```

Build:

```bash
cd app
npm run build
```

---

## Deploy

The repository contains a GitHub Actions workflow for GitHub Pages deployment from `app/dist`.

After the first successful run, enable Pages in repository settings if needed:

```text
Settings → Pages → Source: GitHub Actions
```

---

## Documentation

- [Business case](./docs/business-case.md)
- [Process map](./docs/process-map.md)
- [3-minute demo script](./docs/demo-script.md)
- [Slack/Jira integration plan](./docs/slack-jira-integration.md)
- [Security notes](./docs/security-notes.md)

---

## n8n note

n8n is **not required** for the public static demo. It is presented as an optional implementation layer for production-style automation:

```text
Slack Trigger → Normalize Request → AI Classification → Jira Create Issue → Google Sheets Register → Slack Reply
```

Blueprints are stored in [`workflows/`](./workflows/).

---

## Security notes

- no real documents;
- no real company data;
- no API keys or tokens;
- no personal data;
- all examples are synthetic;
- AI legal analysis is a preliminary assistant output, not a legal opinion.

---

## Role relevance

This case is designed for roles such as:

- Legal Operations Specialist;
- Finance Automation Manager;
- Project Manager for Internal Automation;
- AI/Low-code Automation Manager;
- Business Process Automation Lead.

It demonstrates discovery thinking, process structuring, stakeholder-oriented documentation, delivery control and practical AI automation design.
