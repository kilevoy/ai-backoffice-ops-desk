# Slack / Jira Integration Plan

The current MVP is static. Production integration can be implemented in three ways.

## Option 1 — n8n

- Slack Trigger or slash command webhook
- Function node for request normalization
- AI node or HTTP request to OpenRouter/OpenAI-compatible API
- Conditional branch for request type
- Jira Create Issue node
- Google Sheets Append Row node
- Slack Reply node
- Cron workflow for SLA reminders and daily summaries

## Option 2 — Google Apps Script

Useful when the operational register lives in Google Sheets. Apps Script can receive webhook payloads, update Sheets and call external APIs.

## Option 3 — Custom backend

A FastAPI/Node backend can provide stronger access control, audit logs, role model, queueing and database persistence.

## Production considerations

- Slack app permissions must be scoped narrowly.
- Jira project and issue type mapping must be agreed with stakeholders.
- API keys must be stored in secrets manager or platform credentials.
- Documents should be processed under clear retention and access rules.
- AI output should be treated as an assistant draft, not a final legal opinion.
