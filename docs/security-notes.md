# Security Notes

## Public demo rules

- Do not use real contracts.
- Do not use real company names.
- Do not use real personal data.
- Do not commit tokens, API keys or webhook URLs.
- Use synthetic data only.

## Secrets handling

For production, keep secrets in:

- n8n credentials;
- GitHub Actions secrets;
- cloud secrets manager;
- environment variables outside the repository.

## AI legal disclaimer

AI-generated contract analysis is a preliminary assistant output. It can help triage and highlight risks, but it is not a final legal opinion.

## Access control

Production implementation should define:

- who can submit requests;
- who can see Legal documents;
- who can access Finance requests;
- who can receive summaries;
- who can override SLA and priority.

## Data retention

Define how long to store:

- uploaded documents;
- extracted text;
- AI prompts and outputs;
- Jira links;
- Slack thread history;
- audit logs.
