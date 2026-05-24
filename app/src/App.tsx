import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Bot, BriefcaseBusiness, CheckCircle2, Clock3, FileWarning, LayoutDashboard, ListChecks, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';

type ScenarioId = 'contract' | 'payment' | 'nda';
type SectionId = 'overview' | 'intake' | 'parser' | 'audit' | 'jira' | 'sla' | 'summary';

type Scenario = {
  id: ScenarioId;
  title: string;
  department: 'Legal' | 'Finance';
  requestType: string;
  employeeMessage: string;
  botResponse: string;
  requester: string;
  amount: string;
  deadline: string;
  counterparty: string;
  priority: 'Critical' | 'High' | 'Medium';
  status: string;
  sla: string;
  missingFields: string[];
  riskFactors: string[];
  nextAction: string;
};

const scenarios: Scenario[] = [
  {
    id: 'contract',
    title: 'Legal contract review',
    department: 'Legal',
    requestType: 'Договор подряда',
    employeeMessage:
      '/legal Нужно проверить договор с подрядчиком. Сумма 1 200 000 ₽. Срок подписания до пятницы. Есть штрафы и постоплата. Файл договора прикрепил.',
    botResponse:
      'Заявка принята. Тип: Legal / договор подряда. Приоритет: High. SLA: 2 рабочих дня. Риск: высокий. Не хватает: контрагент, бизнес-владелец, сторона пользователя.',
    requester: 'Мария Соколова',
    amount: '1 200 000 ₽',
    deadline: 'Пятница, 18:00',
    counterparty: 'Не указан',
    priority: 'High',
    status: 'Waiting for requester',
    sla: '2 рабочих дня',
    missingFields: ['Контрагент', 'Бизнес-владелец', 'Сторона пользователя'],
    riskFactors: ['Штрафы', 'Постоплата', 'Короткий срок', 'Сумма > 1 млн ₽'],
    nextAction: 'Запросить недостающие данные и запустить риск-аудит договора',
  },
  {
    id: 'payment',
    title: 'Finance payment approval',
    department: 'Finance',
    requestType: 'Согласование оплаты',
    employeeMessage:
      '/finance Нужно срочно оплатить счет поставщика за сервисы. Сумма 480 000 ₽, желательно сегодня, договор был ранее.',
    botResponse:
      'Заявка принята. Тип: Finance / payment approval. Приоритет: High. Не хватает: номер счета, бюджетная статья, подтверждение договора и ответственный согласующий.',
    requester: 'Илья Морозов',
    amount: '480 000 ₽',
    deadline: 'Сегодня',
    counterparty: 'Поставщик сервисов',
    priority: 'High',
    status: 'Waiting for finance approval',
    sla: '1 рабочий день',
    missingFields: ['Номер счета', 'Бюджетная статья', 'Согласующий', 'Ссылка на договор'],
    riskFactors: ['Срочная оплата', 'Нет номера счета', 'Нет бюджетной статьи'],
    nextAction: 'Создать задачу на проверку основания оплаты и запросить счет',
  },
  {
    id: 'nda',
    title: 'NDA review',
    department: 'Legal',
    requestType: 'NDA review',
    employeeMessage:
      '/legal Проверьте NDA перед переговорами с потенциальным партнером. Встреча завтра утром, файл приложен.',
    botResponse:
      'Заявка принята. Тип: Legal / NDA. Приоритет: Medium. Не хватает: название контрагента, цель переговоров и срок действия NDA.',
    requester: 'Антон Волков',
    amount: 'Не применимо',
    deadline: 'Завтра утром',
    counterparty: 'Потенциальный партнер',
    priority: 'Medium',
    status: 'In legal review',
    sla: '3 рабочих дня',
    missingFields: ['Название контрагента', 'Цель переговоров', 'Срок действия NDA'],
    riskFactors: ['Короткий срок', 'Конфиденциальная информация', 'Нет цели раскрытия'],
    nextAction: 'Передать в Legal review по ускоренному NDA-checklist',
  },
];

const audit = {
  contractType: 'Подряд',
  userSide: 'Подрядчик',
  score: 9,
  recommendation: 'Не подписывать без протокола разногласий',
  risks: [
    'Неоднозначный график платежей и риск блокировки оплаты',
    'Штрафные условия без понятного лимита ответственности',
    'Право заказчика менять объем работ в одностороннем порядке',
    'Неясный порядок сдачи-приемки работ',
    'Риск зависания документов и оплаты на стороне бизнеса',
  ],
};

const jiraTask = {
  key: 'LEGAL-124',
  title: 'Проверка договора подряда на 1 200 000 ₽',
  priority: 'High',
  status: 'Waiting for requester',
  assignee: 'Legal Team',
  sla: '2 рабочих дня',
  labels: ['contract-review', 'high-risk', 'sla-2d', 'vendor-contract'],
  checklist: ['Получить данные контрагента', 'Уточнить сторону пользователя', 'Проверить платежный график', 'Подготовить протокол разногласий', 'Вернуть summary инициатору'],
};

const statusData = [
  { name: 'New', value: 8 },
  { name: 'In review', value: 14 },
  { name: 'Waiting', value: 6 },
  { name: 'Overdue', value: 3 },
  { name: 'Done', value: 19 },
];

const departmentData = [
  { name: 'Legal', value: 31 },
  { name: 'Finance', value: 19 },
];

const slaData = [
  { day: 'Mon', breached: 1, total: 9 },
  { day: 'Tue', breached: 2, total: 11 },
  { day: 'Wed', breached: 1, total: 8 },
  { day: 'Thu', breached: 3, total: 13 },
  { day: 'Fri', breached: 2, total: 9 },
];

const riskData = [
  { name: 'Low', value: 12 },
  { name: 'Medium', value: 21 },
  { name: 'High', value: 14 },
  { name: 'Critical', value: 3 },
];

const navItems: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'intake', label: 'Slack Intake', icon: MessageSquareText },
  { id: 'parser', label: 'AI Parser', icon: Sparkles },
  { id: 'audit', label: 'Risk Audit', icon: FileWarning },
  { id: 'jira', label: 'Jira Task', icon: ListChecks },
  { id: 'sla', label: 'SLA Dashboard', icon: Clock3 },
  { id: 'summary', label: 'Daily Summary', icon: Bot },
];

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function App() {
  const [section, setSection] = useState<SectionId>('overview');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('contract');
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Перейти к содержанию</a>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={24} /></div>
          <div>
            <strong>AI Backoffice</strong>
            <span>Ops Desk</span>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={section === item.id ? 'nav-item active' : 'nav-item'}
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? 'page' : undefined}
                aria-label={`Открыть раздел ${item.label}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Badge tone="blue">Static MVP</Badge>
          <p>Public-safe demo: synthetic data, mock Jira, no real tokens.</p>
        </div>
      </aside>

      <main className="main" id="main-content">
        <header className="hero">
          <div>
            <p className="eyebrow">Legal / Finance Automation Portfolio Demo</p>
            <h1>AI Backoffice Ops Desk</h1>
            <p className="hero-text">Transforms chaotic Legal/Finance requests into structured Jira tasks with SLA control and AI summaries.</p>
          </div>
          <div className="hero-actions">
            <Badge tone="green">React + TypeScript</Badge>
            <Badge tone="amber">n8n optional</Badge>
          </div>
        </header>

        {section === 'overview' && <Overview />}
        {section === 'intake' && <Intake scenario={scenario} setScenarioId={setScenarioId} scenarioId={scenarioId} />}
        {section === 'parser' && <Parser scenario={scenario} />}
        {section === 'audit' && <Audit />}
        {section === 'jira' && <Jira />}
        {section === 'sla' && <Sla />}
        {section === 'summary' && <Summary />}
      </main>
    </div>
  );
}

function Overview() {
  const kpis = [
    { label: 'Total requests', value: '50', detail: 'за текущую неделю', icon: BriefcaseBusiness },
    { label: 'High-risk contracts', value: '14', detail: 'требуют Legal escalation', icon: AlertTriangle },
    { label: 'Overdue SLA', value: '3', detail: 'нужна эскалация', icon: Clock3 },
    { label: 'Waiting for requester', value: '6', detail: 'не хватает данных', icon: MessageSquareText },
    { label: 'Average handling time', value: '1.8d', detail: 'после внедрения intake', icon: CheckCircle2 },
  ];

  return (
    <div className="section-grid">
      <div className="kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <div className="kpi-head"><Icon size={20} /><span>{kpi.label}</span></div>
              <div className="kpi-value">{kpi.value}</div>
              <p className="muted">{kpi.detail}</p>
            </Card>
          );
        })}
      </div>
      <Card className="wide-card">
        <h2>Что показывает MVP</h2>
        <p>Проект демонстрирует не просто чат-бота, а управляемый процесс: от входящего сообщения до Jira-задачи, SLA-контроля, риск-аудита и ежедневной сводки для руководителя.</p>
        <div className="flow-line">
          {['Slack request', 'AI parser', 'Missing data', 'Risk audit', 'Jira task', 'SLA', 'Summary'].map((step) => <span key={step}>{step}</span>)}
        </div>
      </Card>
    </div>
  );
}

function Intake({ scenario, scenarioId, setScenarioId }: { scenario: Scenario; scenarioId: ScenarioId; setScenarioId: (id: ScenarioId) => void }) {
  return (
    <div className="two-col">
      <Card>
        <h2>Slack Intake Simulator</h2>
        <div className="scenario-tabs">
          {scenarios.map((item) => <button key={item.id} className={scenarioId === item.id ? 'tab active' : 'tab'} onClick={() => setScenarioId(item.id)}>{item.title}</button>)}
        </div>
        <div className="chat-window">
          <div className="chat-message employee"><strong>{scenario.requester}</strong><p>{scenario.employeeMessage}</p></div>
          <div className="chat-message bot"><strong>Ops Desk Bot</strong><p>{scenario.botResponse}</p></div>
        </div>
      </Card>
      <Card>
        <h2>Что делает бот</h2>
        <p className="muted">Следующее действие: {scenario.nextAction}</p>
        <h3>Недостающие данные</h3>
        <ul className="check-list">{scenario.missingFields.map((field) => <li key={field}>{field}</li>)}</ul>
        <h3>Risk factors</h3>
        <div className="tag-wrap">{scenario.riskFactors.map((risk) => <Badge key={risk} tone="amber">{risk}</Badge>)}</div>
      </Card>
    </div>
  );
}

function Parser({ scenario }: { scenario: Scenario }) {
  const rows = [
    ['Department', scenario.department],
    ['Request type', scenario.requestType],
    ['Priority', scenario.priority],
    ['Amount', scenario.amount],
    ['Deadline', scenario.deadline],
    ['Requester', scenario.requester],
    ['Counterparty', scenario.counterparty],
    ['SLA', scenario.sla],
  ];
  return (
    <Card>
      <h2>AI Request Parser</h2>
      <p className="muted">AI превращает свободный текст в структурированную карточку заявки.</p>
      <div className="parser-table">{rows.map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>
      <div className="split-block">
        <div><h3>Missing fields</h3><ul className="check-list">{scenario.missingFields.map((field) => <li key={field}>{field}</li>)}</ul></div>
        <div><h3>Risk factors</h3><div className="tag-wrap">{scenario.riskFactors.map((risk) => <Badge key={risk} tone="red">{risk}</Badge>)}</div></div>
      </div>
    </Card>
  );
}

function Audit() {
  return (
    <div className="two-col">
      <Card>
        <h2>Contract Risk Audit</h2>
        <div className="risk-score"><span>{audit.score}/10</span><p>Высокий риск</p></div>
        <div className="parser-table compact"><div><span>Contract type</span><strong>{audit.contractType}</strong></div><div><span>User side</span><strong>{audit.userSide}</strong></div><div><span>Recommendation</span><strong>{audit.recommendation}</strong></div></div>
        <ul className="risk-list">{audit.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
      </Card>
      <Card>
        <h2>Markdown report preview</h2>
        <pre className="report-preview">{`# Contract Risk Audit\n\nСторона: Подрядчик\nРиск: 9/10\n\n## Рекомендация\nНе подписывать без протокола разногласий.\n\n## Критические риски\n- платежный график требует уточнения;\n- штрафы и ответственность не ограничены;\n- порядок приемки работ не детализирован;\n- есть риск блокировки оплаты.\n\n## Next action\nСоздать Jira-задачу и запросить недостающие данные у инициатора.`}</pre>
      </Card>
    </div>
  );
}

function Jira() {
  return (
    <Card>
      <div className="jira-header"><div><h2>{jiraTask.key}</h2><p>{jiraTask.title}</p></div><Badge tone="amber">{jiraTask.priority}</Badge></div>
      <div className="parser-table compact"><div><span>Status</span><strong>{jiraTask.status}</strong></div><div><span>Assignee</span><strong>{jiraTask.assignee}</strong></div><div><span>SLA</span><strong>{jiraTask.sla}</strong></div></div>
      <h3>Labels</h3><div className="tag-wrap">{jiraTask.labels.map((label) => <Badge key={label} tone="blue">{label}</Badge>)}</div>
      <h3>Checklist</h3><ul className="check-list two-columns">{jiraTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
    </Card>
  );
}

function Sla() {
  return (
    <div className="charts-grid">
      <Card><h2>Requests by status</h2><div className="chart-frame" role="img" aria-label="Bar chart showing requests by status: New, In review, Waiting, Overdue and Done"><ResponsiveContainer width="100%" height={260}><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card><h2>Requests by department</h2><div className="chart-frame" role="img" aria-label="Pie chart showing Legal and Finance request distribution"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={departmentData} dataKey="value" nameKey="name" outerRadius={90} label>{departmentData.map((_, index) => <Cell key={index} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></Card>
      <Card><h2>SLA breaches</h2><div className="chart-frame" role="img" aria-label="Area chart showing total requests and SLA breaches by weekday"><ResponsiveContainer width="100%" height={260}><AreaChart data={slaData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Area type="monotone" dataKey="total" fillOpacity={0.2} /><Area type="monotone" dataKey="breached" fillOpacity={0.35} /></AreaChart></ResponsiveContainer></div></Card>
<Card><h2>Risk distribution</h2><div className="chart-frame" role="img" aria-label="Bar chart showing request risk distribution: Low, Medium, High and Critical"><ResponsiveContainer width="100%" height={260}><BarChart data={riskData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
    </div>
  );
}

function Summary() {
  const summaryCards = [
    { label: 'New requests', value: '9', detail: '6 Legal / 3 Finance' },
    { label: 'SLA breaches', value: '3', detail: 'нужна эскалация сегодня' },
    { label: 'High-risk items', value: '3', detail: 'договор, претензия, срочная оплата' },
    { label: 'Blockers', value: '2', detail: 'нет данных от инициаторов' },
  ];

  const escalations = [
    'LEGAL-124: запросить контрагента, сторону пользователя и бизнес-владельца',
    'FIN-087: согласовать бюджетную статью и основание срочной оплаты',
    'LEGAL-131: вынести high-risk договор на daily standup',
  ];

  return (
    <div className="section-grid">
      <Card>
        <h2>Daily AI Summary</h2>
        <p className="muted">Управленческая сводка для Legal/Finance Ops lead: что пришло, где риск, что зависло и что надо эскалировать сегодня.</p>
        <div className="summary-grid">
          {summaryCards.map((item) => (
            <div className="summary-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <h2>Recommended escalations</h2>
          <ul className="check-list">
            {escalations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>

        <Card>
          <h2>Manager brief</h2>
          <div className="summary-box">
            <p><strong>Сегодня создано 9 новых заявок:</strong> основной поток — договоры поставки, подряд и срочные оплаты.</p>
            <p><strong>3 заявки нарушают SLA:</strong> две ожидают данные от инициаторов, одна требует решения руководителя Legal.</p>
            <p><strong>Фокус дня:</strong> закрыть недостающие поля, подтвердить владельцев задач и вынести high-risk договор на короткую синхронизацию.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
