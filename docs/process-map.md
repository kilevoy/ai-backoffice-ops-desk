# Process Map

```text
Slack request
  ↓
Optional n8n / Apps Script / backend layer
  ↓
Normalize message and attachments
  ↓
AI classification
  ↓
Missing data check
  ↓
Contract risk audit, if request type is contract
  ↓
Priority and SLA calculation
  ↓
Jira issue creation
  ↓
Google Sheets / database register
  ↓
Slack reply to requester
  ↓
Scheduled SLA checks
  ↓
Daily summary to Legal/Finance Ops lead
```

## Status logic

- `New` — request received.
- `Waiting for requester` — required fields are missing.
- `In review` — Legal/Finance team is processing.
- `Escalated` — high risk or SLA breach.
- `Done` — request completed.

## SLA logic

- Critical signing deadline: 1 business day.
- Contract amount above threshold: 2 business days.
- Standard NDA: 3 business days.
- General request: 5 business days.
- Missing required data pauses SLA until requester answers.
