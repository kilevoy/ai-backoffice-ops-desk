# План интеграции Slack / Jira

Текущий MVP является статическим. Production-интеграцию можно реализовать несколькими способами.

## Вариант 1 — n8n

- Slack Trigger или webhook slash-команды.
- Function node для нормализации заявки.
- AI node или HTTP request к OpenRouter / OpenAI-compatible API.
- Условные ветки по типу заявки.
- Jira Create Issue node.
- Google Sheets Append Row node.
- Slack Reply node.
- Cron workflow для SLA-напоминаний и дневных сводок.

## Вариант 2 — Google Apps Script

Подходит, если операционный реестр живёт в Google Sheets. Apps Script может принимать webhook payload, обновлять таблицы и вызывать внешние API.

## Вариант 3 — собственный backend

Backend на FastAPI или Node.js даст больше контроля: доступы, audit logs, роли, очереди, база данных и хранение истории заявок.

## Production-ограничения

- Права Slack app должны быть минимально необходимыми.
- Маппинг Jira-проекта, issue type, меток и статусов нужно согласовать со стейкхолдерами.
- API-ключи должны храниться в secrets manager или в защищённых credentials платформы.
- Документы нужно обрабатывать по понятным правилам доступа и срока хранения.
- AI-ответы должны рассматриваться как черновик помощника, а не как финальное юридическое заключение.
