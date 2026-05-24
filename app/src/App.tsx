import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Bot, BriefcaseBusiness, CheckCircle2, Clock3, FileWarning, LayoutDashboard, ListChecks, MessageSquareText, Paperclip, ShieldCheck, Sparkles } from 'lucide-react';

type ScenarioId = 'contract' | 'payment' | 'nda';
type SectionId = 'overview' | 'intake' | 'parser' | 'audit' | 'jira' | 'sla' | 'summary' | 'register';
type RegisterFilter = 'all' | 'overdue' | 'waiting' | 'highRisk' | 'legal' | 'finance';

type Attachment = {
  fileName: string;
  status: string;
  extractedText: string;
  pages: string;
  documentType: string;
};

type Scenario = {
  id: ScenarioId;
  title: string;
  department: string;
  requestType: string;
  employeeMessage: string;
  botResponse: string;
  requester: string;
  amount: string;
  deadline: string;
  counterparty: string;
  priority: string;
  status: string;
  sla: string;
  missingFields: string[];
  riskFactors: string[];
  nextAction: string;
  attachment: Attachment;
};

type RequestRecord = {
  key: string;
  title: string;
  department: 'Юридический блок' | 'Финансы';
  requestType: string;
  status: 'Новая' | 'В работе' | 'Ожидает инициатора' | 'Просрочена' | 'Закрыта';
  risk: 'Низкий' | 'Средний' | 'Высокий' | 'Критический';
  requester: string;
  owner: string;
  sla: string;
  due: string;
  document: string;
  nextAction: string;
};

const scenarios: Scenario[] = [
  {
    id: 'contract',
    title: 'Проверка договора',
    department: 'Юридический блок',
    requestType: 'Договор подряда',
    employeeMessage:
      '/legal Нужно проверить договор с подрядчиком. Сумма 1 200 000 ₽. Срок подписания до пятницы. Есть штрафы и постоплата. Файл договора прикрепил.',
    botResponse:
      'Заявка принята. Тип: юридическая проверка договора подряда. Приоритет: высокий. SLA: 2 рабочих дня. Риск: высокий. Не хватает: контрагент, бизнес-владелец, сторона пользователя.',
    requester: 'Мария Соколова',
    amount: '1 200 000 ₽',
    deadline: 'Пятница, 18:00',
    counterparty: 'Не указан',
    priority: 'Высокий',
    status: 'Ожидает инициатора',
    sla: '2 рабочих дня',
    missingFields: ['Контрагент', 'Бизнес-владелец', 'Сторона пользователя'],
    riskFactors: ['Штрафы', 'Постоплата', 'Короткий срок', 'Сумма > 1 млн ₽'],
    nextAction: 'Запросить недостающие данные и запустить риск-аудит договора',
    attachment: {
      fileName: 'dogovor-podryada-demo.docx',
      status: 'Файл получен в Slack-thread',
      extractedText: 'Да, текст извлечён',
      pages: '8 страниц',
      documentType: 'Договор подряда',
    },
  },
  {
    id: 'payment',
    title: 'Согласование оплаты',
    department: 'Финансы',
    requestType: 'Согласование оплаты',
    employeeMessage:
      '/finance Нужно срочно оплатить счет поставщика за сервисы. Сумма 480 000 ₽, желательно сегодня, договор был ранее. Счёт приложил.',
    botResponse:
      'Заявка принята. Тип: финансовое согласование оплаты. Приоритет: высокий. Не хватает: номер счета, бюджетная статья, подтверждение договора и ответственный согласующий.',
    requester: 'Илья Морозов',
    amount: '480 000 ₽',
    deadline: 'Сегодня',
    counterparty: 'Поставщик сервисов',
    priority: 'Высокий',
    status: 'Ожидает согласования финансов',
    sla: '1 рабочий день',
    missingFields: ['Номер счета', 'Бюджетная статья', 'Согласующий', 'Ссылка на договор'],
    riskFactors: ['Срочная оплата', 'Нет номера счета', 'Нет бюджетной статьи'],
    nextAction: 'Создать задачу на проверку основания оплаты и запросить счет',
    attachment: {
      fileName: 'schet-na-oplatu-demo.pdf',
      status: 'Файл получен в Slack-thread',
      extractedText: 'Да, реквизиты извлечены',
      pages: '2 страницы',
      documentType: 'Счёт на оплату',
    },
  },
  {
    id: 'nda',
    title: 'Проверка NDA',
    department: 'Юридический блок',
    requestType: 'Проверка NDA',
    employeeMessage:
      '/legal Проверьте NDA перед переговорами с потенциальным партнером. Встреча завтра утром, файл приложен.',
    botResponse:
      'Заявка принята. Тип: юридическая проверка NDA. Приоритет: средний. Не хватает: название контрагента, цель переговоров и срок действия NDA.',
    requester: 'Антон Волков',
    amount: 'Не применимо',
    deadline: 'Завтра утром',
    counterparty: 'Потенциальный партнер',
    priority: 'Средний',
    status: 'В юридической проверке',
    sla: '3 рабочих дня',
    missingFields: ['Название контрагента', 'Цель переговоров', 'Срок действия NDA'],
    riskFactors: ['Короткий срок', 'Конфиденциальная информация', 'Нет цели раскрытия'],
    nextAction: 'Передать в юридическую проверку по ускоренному NDA-чек-листу',
    attachment: {
      fileName: 'nda-demo.pdf',
      status: 'Файл получен в Slack-thread',
      extractedText: 'Да, текст извлечён',
      pages: '5 страниц',
      documentType: 'NDA',
    },
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
  priority: 'Высокий',
  status: 'Ожидает инициатора',
  assignee: 'Юридическая команда',
  sla: '2 рабочих дня',
  labels: ['проверка-договора', 'высокий-риск', 'sla-2d', 'договор-с-поставщиком'],
  checklist: ['Получить данные контрагента', 'Уточнить сторону пользователя', 'Проверить платежный график', 'Подготовить протокол разногласий', 'Вернуть summary инициатору'],
};

const statusData = [
  { name: 'Новые', value: 8 },
  { name: 'В работе', value: 14 },
  { name: 'Ожидают', value: 6 },
  { name: 'Просрочены', value: 3 },
  { name: 'Закрыты', value: 19 },
];

const departmentData = [
  { name: 'Юристы', value: 31 },
  { name: 'Финансы', value: 19 },
];

const slaData = [
  { day: 'Пн', breached: 1, total: 9 },
  { day: 'Вт', breached: 2, total: 11 },
  { day: 'Ср', breached: 1, total: 8 },
  { day: 'Чт', breached: 3, total: 13 },
  { day: 'Пт', breached: 2, total: 9 },
];

const riskData = [
  { name: 'Низкий', value: 12 },
  { name: 'Средний', value: 21 },
  { name: 'Высокий', value: 14 },
  { name: 'Критический', value: 3 },
];

const requestRecords: RequestRecord[] = [
  {
    key: 'LEGAL-124',
    title: 'Проверка договора подряда на 1 200 000 ₽',
    department: 'Юридический блок',
    requestType: 'Договор подряда',
    status: 'Ожидает инициатора',
    risk: 'Высокий',
    requester: 'Мария Соколова',
    owner: 'Юридическая команда',
    sla: '2 рабочих дня',
    due: 'Сегодня, 18:00',
    document: 'dogovor-podryada-demo.docx',
    nextAction: 'Запросить контрагента, бизнес-владельца и сторону пользователя',
  },
  {
    key: 'FIN-087',
    title: 'Согласование срочной оплаты поставщику',
    department: 'Финансы',
    requestType: 'Оплата счета',
    status: 'Просрочена',
    risk: 'Высокий',
    requester: 'Илья Морозов',
    owner: 'Финансовый контролер',
    sla: '1 рабочий день',
    due: 'Вчера, 16:00',
    document: 'schet-na-oplatu-demo.pdf',
    nextAction: 'Подтвердить бюджетную статью и основание оплаты',
  },
  {
    key: 'LEGAL-131',
    title: 'Проверка договора поставки с постоплатой',
    department: 'Юридический блок',
    requestType: 'Договор поставки',
    status: 'Просрочена',
    risk: 'Критический',
    requester: 'Елена Ким',
    owner: 'Старший юрист',
    sla: '2 рабочих дня',
    due: 'Вчера, 12:00',
    document: 'supply-agreement-demo.docx',
    nextAction: 'Вынести на синхронизацию и подготовить протокол разногласий',
  },
  {
    key: 'LEGAL-142',
    title: 'NDA перед переговорами с партнером',
    department: 'Юридический блок',
    requestType: 'Проверка NDA',
    status: 'В работе',
    risk: 'Средний',
    requester: 'Антон Волков',
    owner: 'Юрист по договорам',
    sla: '3 рабочих дня',
    due: 'Завтра, 11:00',
    document: 'nda-demo.pdf',
    nextAction: 'Проверить срок действия NDA и цель раскрытия информации',
  },
  {
    key: 'FIN-094',
    title: 'Возврат аванса по закрытому проекту',
    department: 'Финансы',
    requestType: 'Возврат аванса',
    status: 'Ожидает инициатора',
    risk: 'Средний',
    requester: 'Ольга Романова',
    owner: 'Бухгалтерия',
    sla: '2 рабочих дня',
    due: 'Сегодня, 15:00',
    document: 'advance-return-demo.xlsx',
    nextAction: 'Получить акт сверки и подтверждение закрытия проекта',
  },
  {
    key: 'LEGAL-148',
    title: 'Претензия по нарушению сроков поставки',
    department: 'Юридический блок',
    requestType: 'Претензия',
    status: 'Просрочена',
    risk: 'Критический',
    requester: 'Дмитрий Орлов',
    owner: 'Юрист по спорам',
    sla: '1 рабочий день',
    due: 'Вчера, 10:00',
    document: 'claim-supply-delay-demo.docx',
    nextAction: 'Согласовать позицию с закупками и отправить проект претензии',
  },
  {
    key: 'FIN-101',
    title: 'Проверка лимита по маркетинговому бюджету',
    department: 'Финансы',
    requestType: 'Бюджетный контроль',
    status: 'В работе',
    risk: 'Низкий',
    requester: 'Наталья Белова',
    owner: 'Финансовый аналитик',
    sla: '2 рабочих дня',
    due: 'Пятница, 17:00',
    document: 'marketing-budget-demo.xlsx',
    nextAction: 'Сверить лимит с планом и обновить комментарий в Jira',
  },
  {
    key: 'LEGAL-153',
    title: 'Допсоглашение о продлении услуг',
    department: 'Юридический блок',
    requestType: 'Допсоглашение',
    status: 'Новая',
    risk: 'Средний',
    requester: 'Павел Никитин',
    owner: 'Юридическая команда',
    sla: '3 рабочих дня',
    due: 'Понедельник, 13:00',
    document: 'service-extension-demo.docx',
    nextAction: 'Проверить базовый договор и срок продления',
  },
  {
    key: 'FIN-108',
    title: 'Согласование счета за облачные сервисы',
    department: 'Финансы',
    requestType: 'Оплата счета',
    status: 'Закрыта',
    risk: 'Низкий',
    requester: 'Сергей Лебедев',
    owner: 'Финансовый контролер',
    sla: '1 рабочий день',
    due: 'Сегодня, 12:00',
    document: 'cloud-invoice-demo.pdf',
    nextAction: 'Архивировать подтверждение оплаты',
  },
  {
    key: 'LEGAL-160',
    title: 'Проверка договора с персональными данными',
    department: 'Юридический блок',
    requestType: 'Договор с данными',
    status: 'В работе',
    risk: 'Высокий',
    requester: 'Ксения Федорова',
    owner: 'Юрист по комплаенсу',
    sla: '2 рабочих дня',
    due: 'Завтра, 16:00',
    document: 'personal-data-contract-demo.docx',
    nextAction: 'Проверить DPA, роли сторон и трансграничную передачу',
  },
  {
    key: 'FIN-116',
    title: 'Заявка на оплату без договора',
    department: 'Финансы',
    requestType: 'Исключение оплаты',
    status: 'Ожидает инициатора',
    risk: 'Критический',
    requester: 'Андрей Егоров',
    owner: 'Руководитель финансов',
    sla: '1 рабочий день',
    due: 'Сегодня, 14:00',
    document: 'payment-exception-demo.pdf',
    nextAction: 'Получить письменное подтверждение владельца бюджета',
  },
  {
    key: 'LEGAL-166',
    title: 'Лицензионное соглашение на AI-инструмент',
    department: 'Юридический блок',
    requestType: 'Лицензия ПО',
    status: 'Новая',
    risk: 'Высокий',
    requester: 'Виктория Смирнова',
    owner: 'Юрист по IT',
    sla: '3 рабочих дня',
    due: 'Вторник, 18:00',
    document: 'ai-license-demo.pdf',
    nextAction: 'Проверить условия обработки данных и ограничения использования',
  },
];

const registerFilters: { id: RegisterFilter; label: string }[] = [
  { id: 'all', label: 'Все заявки' },
  { id: 'overdue', label: 'Просроченные SLA' },
  { id: 'waiting', label: 'Ожидают инициатора' },
  { id: 'highRisk', label: 'Высокий риск' },
  { id: 'legal', label: 'Юридический блок' },
  { id: 'finance', label: 'Финансы' },
];

const navItems: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'intake', label: 'Приём заявок', icon: MessageSquareText },
  { id: 'parser', label: 'AI-разбор', icon: Sparkles },
  { id: 'audit', label: 'Риск-аудит', icon: FileWarning },
  { id: 'jira', label: 'Jira-задача', icon: ListChecks },
  { id: 'sla', label: 'SLA-панель', icon: Clock3 },
  { id: 'register', label: 'Реестр заявок', icon: BriefcaseBusiness },
  { id: 'summary', label: 'Дневная сводка', icon: Bot },
];

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function AttachedDocument({ attachment }: { attachment: Attachment }) {
  return (
    <div className="attachment-panel" aria-label={`Прикреплённый документ: ${attachment.fileName}`}>
      <div className="attachment-icon" aria-hidden="true"><Paperclip size={18} /></div>
      <div>
        <span>Прикреплённый документ</span>
        <strong>{attachment.fileName}</strong>
        <p>{attachment.status} · {attachment.extractedText} · {attachment.pages}</p>
      </div>
    </div>
  );
}

function App() {
  const [section, setSection] = useState<SectionId>('overview');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('contract');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>('all');
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const openRegister = (filter: RegisterFilter) => {
    setRegisterFilter(filter);
    setSection('register');
  };

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
        <nav className="nav" aria-label="Основные разделы демо">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={section === item.id ? 'nav-item active' : 'nav-item'}
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? 'page' : undefined}
                aria-label={`Открыть раздел: ${item.label}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Badge tone="blue">Статический MVP</Badge>
          <p>Публичное демо: синтетические данные, mock Jira, без реальных токенов.</p>
        </div>
      </aside>

      <main className="main" id="main-content">
        <header className="hero">
          <div>
            <p className="eyebrow">Демо для автоматизации Legal / Finance процессов</p>
            <h1>AI Backoffice Ops Desk</h1>
            <p className="hero-text">Превращает хаотичные заявки в юридический и финансовый блоки в структурированные Jira-задачи с SLA-контролем и AI-сводками.</p>
          </div>
          <div className="hero-actions">
            <Badge tone="green">React + TypeScript</Badge>
            <Badge tone="amber">n8n опционально</Badge>
          </div>
        </header>

        {section === 'overview' && <Overview openRegister={openRegister} />}
        {section === 'intake' && <Intake scenario={scenario} setScenarioId={setScenarioId} scenarioId={scenarioId} />}
        {section === 'parser' && <Parser scenario={scenario} />}
        {section === 'audit' && <Audit />}
        {section === 'jira' && <Jira />}
        {section === 'sla' && <Sla openRegister={openRegister} />}
        {section === 'register' && <RequestRegister activeFilter={registerFilter} setActiveFilter={setRegisterFilter} />}
        {section === 'summary' && <Summary openRegister={openRegister} />}
      </main>
    </div>
  );
}

function Overview({ openRegister }: { openRegister: (filter: RegisterFilter) => void }) {
  const kpis = [
    { label: 'Всего заявок', value: '50', detail: 'за текущую неделю', icon: BriefcaseBusiness, filter: 'all' as RegisterFilter },
    { label: 'Договоры с высоким риском', value: '14', detail: 'требуют эскалации юристам', icon: AlertTriangle, filter: 'highRisk' as RegisterFilter },
    { label: 'Просроченные SLA', value: '3', detail: 'нужна эскалация сегодня', icon: Clock3, filter: 'overdue' as RegisterFilter },
    { label: 'Ожидают инициатора', value: '6', detail: 'не хватает данных', icon: MessageSquareText, filter: 'waiting' as RegisterFilter },
    { label: 'Среднее время обработки', value: '1,8 дн.', detail: 'после внедрения intake-процесса', icon: CheckCircle2 },
  ];

  return (
    <div className="section-grid">
      <div className="kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            kpi.filter ? (
              <button key={kpi.label} className="card kpi-card clickable-kpi" onClick={() => openRegister(kpi.filter)} type="button">
                <div className="kpi-head"><Icon size={20} /><span>{kpi.label}</span></div>
                <div className="kpi-value">{kpi.value}</div>
                <p className="muted">{kpi.detail}</p>
                <span className="open-hint">Открыть список →</span>
              </button>
            ) : (
              <Card key={kpi.label}>
                <div className="kpi-head"><Icon size={20} /><span>{kpi.label}</span></div>
                <div className="kpi-value">{kpi.value}</div>
                <p className="muted">{kpi.detail}</p>
              </Card>
            )
          );
        })}
      </div>
      <Card className="wide-card">
        <h2>Что показывает MVP</h2>
        <p>Проект демонстрирует не просто чат-бота, а управляемый процесс: сотрудник отправляет заявку через Slack-бота или intake-канал, прикрепляет документ, а система превращает это в Jira-задачу, риск-аудит, SLA-контроль и ежедневную сводку для руководителя.</p>
        <div className="flow-line">
          {['Заявка в Slack', 'Файл договора', 'AI-разбор', 'Недостающие данные', 'Риск-аудит', 'Jira-задача', 'SLA', 'Сводка'].map((step) => <span key={step}>{step}</span>)}
        </div>
      </Card>
    </div>
  );
}

function Intake({ scenario, scenarioId, setScenarioId }: { scenario: Scenario; scenarioId: ScenarioId; setScenarioId: (id: ScenarioId) => void }) {
  return (
    <div className="two-col">
      <Card>
        <h2>Симулятор приёма заявок в Slack</h2>
        <p className="muted">Сотрудник отправляет заявку через команду /legal или /finance и прикрепляет документ прямо к сообщению или Slack-thread.</p>
        <div className="scenario-tabs">
          {scenarios.map((item) => <button key={item.id} className={scenarioId === item.id ? 'tab active' : 'tab'} onClick={() => setScenarioId(item.id)}>{item.title}</button>)}
        </div>
        <div className="chat-window">
          <div className="chat-message employee"><strong>{scenario.requester}</strong><p>{scenario.employeeMessage}</p></div>
          <div className="chat-message bot"><strong>Ops Desk Bot</strong><p>{scenario.botResponse}</p></div>
        </div>
        <AttachedDocument attachment={scenario.attachment} />
      </Card>
      <Card>
        <h2>Что делает бот</h2>
        <p className="muted">Следующее действие: {scenario.nextAction}</p>
        <h3>Недостающие данные</h3>
        <ul className="check-list">{scenario.missingFields.map((field) => <li key={field}>{field}</li>)}</ul>
        <h3>Факторы риска</h3>
        <div className="tag-wrap">{scenario.riskFactors.map((risk) => <Badge key={risk} tone="amber">{risk}</Badge>)}</div>
      </Card>
    </div>
  );
}

function Parser({ scenario }: { scenario: Scenario }) {
  const rows = [
    ['Подразделение', scenario.department],
    ['Тип заявки', scenario.requestType],
    ['Приоритет', scenario.priority],
    ['Сумма', scenario.amount],
    ['Дедлайн', scenario.deadline],
    ['Инициатор', scenario.requester],
    ['Контрагент', scenario.counterparty],
    ['SLA', scenario.sla],
    ['Документ', scenario.attachment.fileName],
    ['Тип документа', scenario.attachment.documentType],
    ['Извлечение текста', scenario.attachment.extractedText],
    ['Объём', scenario.attachment.pages],
  ];
  return (
    <Card>
      <h2>AI-разбор заявки</h2>
      <p className="muted">AI превращает свободный текст и прикреплённый документ в структурированную карточку заявки.</p>
      <div className="parser-table">{rows.map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>
      <div className="split-block">
        <div><h3>Недостающие данные</h3><ul className="check-list">{scenario.missingFields.map((field) => <li key={field}>{field}</li>)}</ul></div>
        <div><h3>Факторы риска</h3><div className="tag-wrap">{scenario.riskFactors.map((risk) => <Badge key={risk} tone="red">{risk}</Badge>)}</div></div>
      </div>
    </Card>
  );
}

function Audit() {
  const contractAttachment = scenarios[0].attachment;

  return (
    <div className="two-col">
      <Card>
        <h2>Риск-аудит договора</h2>
        <div className="risk-score"><span>{audit.score}/10</span><p>Высокий риск</p></div>
        <div className="parser-table compact"><div><span>Тип договора</span><strong>{audit.contractType}</strong></div><div><span>Сторона пользователя</span><strong>{audit.userSide}</strong></div><div><span>Рекомендация</span><strong>{audit.recommendation}</strong></div></div>
        <h3>Источник анализа</h3>
        <div className="source-panel">
          <span>Сообщение инициатора</span>
          <span>Прикреплённый файл: {contractAttachment.fileName}</span>
          <span>{contractAttachment.extractedText}</span>
        </div>
        <ul className="risk-list">{audit.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
      </Card>
      <Card>
        <h2>Предпросмотр Markdown-отчёта</h2>
        <pre className="report-preview">{`# Риск-аудит договора\n\nИсточник: сообщение инициатора + dogovor-podryada-demo.docx\nСторона: Подрядчик\nРиск: 9/10\n\n## Рекомендация\nНе подписывать без протокола разногласий.\n\n## Критические риски\n- платежный график требует уточнения;\n- штрафы и ответственность не ограничены;\n- порядок приемки работ не детализирован;\n- есть риск блокировки оплаты.\n\n## Следующее действие\nСоздать Jira-задачу и запросить недостающие данные у инициатора.`}</pre>
      </Card>
    </div>
  );
}

function Jira() {
  return (
    <Card>
      <div className="jira-header"><div><h2>{jiraTask.key}</h2><p>{jiraTask.title}</p></div><Badge tone="amber">{jiraTask.priority}</Badge></div>
      <div className="parser-table compact"><div><span>Статус</span><strong>{jiraTask.status}</strong></div><div><span>Ответственный</span><strong>{jiraTask.assignee}</strong></div><div><span>SLA</span><strong>{jiraTask.sla}</strong></div></div>
      <h3>Метки</h3><div className="tag-wrap">{jiraTask.labels.map((label) => <Badge key={label} tone="blue">{label}</Badge>)}</div>
      <h3>Чек-лист</h3><ul className="check-list two-columns">{jiraTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
    </Card>
  );
}

function Sla({ openRegister }: { openRegister: (filter: RegisterFilter) => void }) {
  return (
    <div className="charts-grid">
      <Card className="wide-card drilldown-actions">
        <div>
          <h2>Переходы к заявкам</h2>
          <p className="muted">Операционный drill-down из SLA-панели в синтетический реестр заявок.</p>
        </div>
        <div className="action-row">
          <button className="tab active" type="button" onClick={() => openRegister('all')}>Открыть все заявки</button>
          <button className="tab" type="button" onClick={() => openRegister('overdue')}>Открыть просроченные SLA</button>
          <button className="tab" type="button" onClick={() => openRegister('waiting')}>Открыть заявки, ожидающие инициатора</button>
          <button className="tab" type="button" onClick={() => openRegister('highRisk')}>Открыть высокий риск</button>
        </div>
      </Card>
      <Card><h2>Заявки по статусам</h2><div className="chart-frame" role="img" aria-label="Столбчатая диаграмма заявок по статусам: новые, в работе, ожидают, просрочены и закрыты"><ResponsiveContainer width="100%" height={260}><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card><h2>Заявки по подразделениям</h2><div className="chart-frame" role="img" aria-label="Круговая диаграмма распределения заявок между юридическим блоком и финансами"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={departmentData} dataKey="value" nameKey="name" outerRadius={90} label>{departmentData.map((_, index) => <Cell key={index} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></Card>
      <Card><h2>Нарушения SLA</h2><div className="chart-frame" role="img" aria-label="График общего количества заявок и нарушений SLA по дням недели"><ResponsiveContainer width="100%" height={260}><AreaChart data={slaData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Area type="monotone" dataKey="total" fillOpacity={0.2} /><Area type="monotone" dataKey="breached" fillOpacity={0.35} /></AreaChart></ResponsiveContainer></div></Card>
      <Card><h2>Распределение рисков</h2><div className="chart-frame" role="img" aria-label="Столбчатая диаграмма распределения заявок по уровню риска: низкий, средний, высокий и критический"><ResponsiveContainer width="100%" height={260}><BarChart data={riskData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
    </div>
  );
}

function getRiskTone(risk: RequestRecord['risk']): 'green' | 'blue' | 'amber' | 'red' {
  if (risk === 'Низкий') return 'green';
  if (risk === 'Средний') return 'blue';
  if (risk === 'Высокий') return 'amber';
  return 'red';
}

function RequestRegister({ activeFilter, setActiveFilter }: { activeFilter: RegisterFilter; setActiveFilter: (filter: RegisterFilter) => void }) {
  const filteredRecords = useMemo(() => {
    return requestRecords.filter((record) => {
      if (activeFilter === 'overdue') return record.status === 'Просрочена';
      if (activeFilter === 'waiting') return record.status === 'Ожидает инициатора';
      if (activeFilter === 'highRisk') return record.risk === 'Высокий' || record.risk === 'Критический';
      if (activeFilter === 'legal') return record.department === 'Юридический блок';
      if (activeFilter === 'finance') return record.department === 'Финансы';
      return true;
    });
  }, [activeFilter]);

  const activeLabel = registerFilters.find((filter) => filter.id === activeFilter)?.label ?? 'Все заявки';

  return (
    <Card className="register-card">
      <div className="register-header">
        <div>
          <h2>Реестр заявок</h2>
          <p className="muted">Синтетический операционный список заявок Legal и Finance с SLA, риском и следующим действием.</p>
        </div>
        <Badge tone="blue">{activeLabel}: {filteredRecords.length}</Badge>
      </div>

      <div className="filter-bar" aria-label="Фильтры реестра заявок">
        {registerFilters.map((filter) => (
          <button
            key={filter.id}
            className={activeFilter === filter.id ? 'filter-button active' : 'filter-button'}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="request-table" role="table" aria-label="Реестр заявок">
        <div className="request-row request-row-head" role="row">
          <span role="columnheader">Задача</span>
          <span role="columnheader">Тип</span>
          <span role="columnheader">Подразделение</span>
          <span role="columnheader">Статус</span>
          <span role="columnheader">Риск</span>
          <span role="columnheader">SLA / срок</span>
          <span role="columnheader">Документ</span>
          <span role="columnheader">Следующее действие</span>
        </div>
        {filteredRecords.map((record) => (
          <div className="request-row" role="row" key={record.key}>
            <div className="request-task" role="cell">
              <strong>{record.key}</strong>
              <span>{record.title}</span>
              <small>{record.requester} → {record.owner}</small>
            </div>
            <span role="cell">{record.requestType}</span>
            <span role="cell">{record.department}</span>
            <span role="cell"><Badge tone={record.status === 'Просрочена' ? 'red' : record.status === 'Закрыта' ? 'green' : 'neutral'}>{record.status}</Badge></span>
            <span role="cell"><Badge tone={getRiskTone(record.risk)}>{record.risk}</Badge></span>
            <span role="cell"><strong>{record.sla}</strong><small>{record.due}</small></span>
            <span role="cell" className="document-cell">{record.document}</span>
            <span role="cell">{record.nextAction}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Summary({ openRegister }: { openRegister: (filter: RegisterFilter) => void }) {
  const summaryCards = [
    { label: 'Новые заявки', value: '9', detail: '6 юридических / 3 финансовых' },
    { label: 'Нарушения SLA', value: '3', detail: 'нужна эскалация сегодня' },
    { label: 'Высокий риск', value: '3', detail: 'договор, претензия, срочная оплата' },
    { label: 'Блокеры', value: '2', detail: 'нет данных от инициаторов' },
  ];

  const escalations = [
    'LEGAL-124: запросить контрагента, сторону пользователя и бизнес-владельца',
    'FIN-087: согласовать бюджетную статью и основание срочной оплаты',
    'LEGAL-131: вынести договор с высоким риском на ежедневную синхронизацию',
  ];

  return (
    <div className="section-grid">
      <Card>
        <h2>Дневная AI-сводка</h2>
        <p className="muted">Управленческая сводка для руководителя Legal/Finance Ops: что пришло, где риск, что зависло и что надо эскалировать сегодня.</p>
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
          <h2>Рекомендуемые эскалации</h2>
          <ul className="check-list">
            {escalations.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <button className="tab active register-cta" type="button" onClick={() => openRegister('highRisk')}>Открыть эскалации в реестре</button>
        </Card>

        <Card>
          <h2>Кратко для руководителя</h2>
          <div className="summary-box">
            <p><strong>Сегодня создано 9 новых заявок:</strong> основной поток — договоры поставки, подряд и срочные оплаты.</p>
            <p><strong>3 заявки нарушают SLA:</strong> две ожидают данные от инициаторов, одна требует решения руководителя юридического блока.</p>
            <p><strong>Фокус дня:</strong> закрыть недостающие поля, подтвердить владельцев задач и вынести договор с высоким риском на короткую синхронизацию.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
