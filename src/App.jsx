import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, Building2, Camera,
  Check, CheckCircle2, ChevronDown, ClipboardCheck, Clock3, CloudUpload,
  FileCheck2, FileText, FolderOpen, Gauge, Grid2X2, HardHat, ImagePlus,
  Languages, LayoutDashboard, MapPin, Menu, MessageSquareWarning, Minus,
  PackageCheck, PenLine, Plus, RotateCcw, Search, ShieldCheck, Upload,
  UserRound, Wifi, X,
} from 'lucide-react'
import { activities, attention, initialIssues, projects, revisions } from './data.js'

const photoSeeds = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=72',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=72',
  'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=900&q=72',
]

const navItems = [
  ['overview', 'Overview', LayoutDashboard],
  ['my-work', 'My Work', UserRound],
  ['progress', 'Progress', BarChart3],
  ['site-updates', 'Site Updates', Camera],
  ['quality', 'QA/QC', ShieldCheck],
  ['drawings', 'Drawings & Revisions', FileCheck2],
  ['documents', 'Documents', FolderOpen],
  ['reports', 'Reports', Gauge],
]

function classNames(...items) { return items.filter(Boolean).join(' ') }

function Status({ children, tone = 'neutral' }) {
  return <span className={`status status--${tone}`}><span className="status__dot" />{children}</span>
}

function Toast({ message }) {
  return message ? <div className="toast" role="status"><CheckCircle2 size={18} />{message}</div> : null
}

function App() {
  const [active, setActive] = useState('overview')
  const [projectId, setProjectId] = useState(projects[0].id)
  const [projectOpen, setProjectOpen] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [drawingOpen, setDrawingOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem('eps-preview-issues')
    return saved ? JSON.parse(saved) : initialIssues
  })
  const project = projects.find((item) => item.id === projectId) || projects[0]

  useEffect(() => localStorage.setItem('eps-preview-issues', JSON.stringify(issues)), [issues])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const navigate = (id) => { setActive(id); setMenuOpen(false) }
  const openAction = (action) => {
    if (action === 'issue') setIssueOpen(true)
    if (action === 'progress') setProgressOpen(true)
    if (action === 'drawing') setDrawingOpen(true)
  }

  return (
    <div className="app-shell">
      <aside className={classNames('sidebar', menuOpen && 'sidebar--open')}>
        <div className="brand"><img src={`${import.meta.env.BASE_URL}eps-logo.jpg`} alt="EPS Engineering Project Solutions" /></div>
        <nav aria-label="Primary navigation">
          {navItems.map(([id, label, Icon]) => (
            <button key={id} className={classNames('nav-item', active === id && 'nav-item--active')} onClick={() => navigate(id)}>
              <Icon size={20} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-projects">
          <p>Projects</p>
          {projects.slice(0, 4).map((item) => (
            <button key={item.id} className={classNames('project-mini', item.id === projectId && 'project-mini--active')} onClick={() => { setProjectId(item.id); setActive('overview') }}>
              <span className={`project-dot project-dot--${item.status}`} />{item.short}
            </button>
          ))}
        </div>
        <div className="profile"><span className="avatar">AK</span><span><strong>Arun K.</strong><small>Project Manager</small></span><ChevronDown size={16} /></div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
          <div className="project-picker-wrap">
            <button className="project-picker" onClick={() => setProjectOpen(!projectOpen)}><strong>{project.name}</strong><ChevronDown size={17} /></button>
            {projectOpen && <div className="project-menu">
              {projects.map((item) => <button key={item.id} onClick={() => { setProjectId(item.id); setProjectOpen(false) }}><span className={`project-dot project-dot--${item.status}`} />{item.name}{item.id === projectId && <Check size={16} />}</button>)}
            </div>}
          </div>
          <span className="source-chip">{project.template} <i /> 30 Sep 2025</span>
          <div className="topbar-spacer" />
          <span className="sync-state"><Wifi size={15} /> Synced</span>
          <button className="icon-button" aria-label="Notifications"><Bell size={19} /><b>8</b></button>
          <button className="language"><Languages size={17} /><span>ไทย</span><i />EN</button>
          <span className="preview-badge">Preview · Demo Data</span>
        </header>

        <main className="page">
          {active === 'overview' && <Overview project={project} issues={issues} onAction={openAction} setActive={setActive} setToast={setToast} />}
          {active === 'progress' && <ProgressPage onUpdate={() => setProgressOpen(true)} setToast={setToast} />}
          {active === 'site-updates' && <SiteUpdatesPage onIssue={() => setIssueOpen(true)} setToast={setToast} />}
          {active === 'quality' && <QualityPage issues={issues} onIssue={() => setIssueOpen(true)} setToast={setToast} />}
          {active === 'drawings' && <DrawingsPage onUpload={() => setDrawingOpen(true)} setToast={setToast} />}
          {active === 'my-work' && <MyWorkPage onAction={openAction} />}
          {active === 'documents' && <DocumentsPage onUpload={() => setDrawingOpen(true)} />}
          {active === 'reports' && <PortfolioPage onOpen={(id) => { setProjectId(id); setActive('overview') }} />}
        </main>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.slice(0, 5).map(([id, label, Icon]) => <button key={id} className={active === id ? 'is-active' : ''} onClick={() => navigate(id)}><Icon size={20} /><span>{label.replace('Site ', '')}</span></button>)}
        </nav>
      </div>

      {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      {issueOpen && <IssueDrawer onClose={() => setIssueOpen(false)} onSubmit={(issue) => { setIssues((list) => [issue, ...list]); setIssueOpen(false); setToast(`${issue.id} submitted to QA/QC`) }} />}
      {progressOpen && <ProgressDialog onClose={() => setProgressOpen(false)} onSubmit={() => { setProgressOpen(false); setToast('Progress update submitted for review') }} />}
      {drawingOpen && <DrawingDialog onClose={() => setDrawingOpen(false)} onSubmit={(kind) => { setDrawingOpen(false); setToast(`${kind} drawing uploaded to staging`) }} />}
      <Toast message={toast} />
    </div>
  )
}

function Overview({ project, issues, onAction, setActive, setToast }) {
  return <>
    <section className="welcome-row">
      <div><p className="eyebrow">{project.id} · {project.location}</p><h1>Project workspace</h1><p>Review progress, site evidence and drawing changes in one place.</p></div>
      <div className="curve-mini"><SCurve compact /><div><span>Overall progress</span><strong>{project.progress}%</strong><small>Approved actual</small></div></div>
    </section>
    <section className="quick-actions">
      <QuickAction icon={Upload} title="Update progress" text="Record activity progress with evidence" tone="green" onClick={() => onAction('progress')} />
      <QuickAction icon={Camera} title="Report site issue" text="Raise an issue or non-conformance" tone="indigo" onClick={() => onAction('issue')} />
      <QuickAction icon={FileCheck2} title="Upload drawing" text="Upload GA or As-built drawings" tone="violet" onClick={() => onAction('drawing')} />
    </section>
    <div className="overview-grid">
      <div className="overview-left">
        <SiteFeed onAdd={() => onAction('issue')} setToast={setToast} />
        <RevisionControl onUpload={() => onAction('drawing')} setToast={setToast} />
      </div>
      <div className="overview-right">
        <AttentionPanel />
        <PMReview setToast={setToast} />
      </div>
    </div>
    <section className="panel quality-snapshot">
      <div className="panel-head"><div><h2>QA/QC control</h2><p>Issues, revision compliance and closure readiness.</p></div><button className="text-button" onClick={() => setActive('quality')}>Open control center <ArrowRight size={16} /></button></div>
      <IssueTable issues={issues.slice(0, 3)} />
    </section>
  </>
}

function QuickAction({ icon: Icon, title, text, tone, onClick }) {
  return <button className="quick-action" onClick={onClick}><span className={`quick-icon quick-icon--${tone}`}><Icon size={26} /></span><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={18} /></button>
}

function SCurve({ compact = false }) {
  return <svg className={compact ? 's-curve s-curve--compact' : 's-curve'} viewBox="0 0 620 220" role="img" aria-label="Plan and approved actual S-Curve">
    {!compact && [40,80,120,160,200].map((y) => <line key={y} x1="28" y1={y} x2="606" y2={y} className="chart-grid" />)}
    <path d="M28 201 C90 199 112 193 155 177 S223 145 276 127 S347 101 400 83 S480 42 606 25" className="chart-plan" />
    <path d="M28 202 C92 201 122 197 161 184 S232 157 280 139 S349 112 404 96 S470 72 511 61" className="chart-actual" />
    <path d="M511 61 C548 56 578 62 606 58" className="chart-pending" />
  </svg>
}

function SiteFeed({ onAdd, setToast }) {
  const fileRef = useRef(null)
  const [uploads, setUploads] = useState([])
  const handleFiles = (files) => {
    const next = Array.from(files).slice(0, 4).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    setUploads((current) => [...next, ...current])
    setToast(`${next.length} site photo${next.length === 1 ? '' : 's'} added to draft`)
  }
  const cards = [
    { id: 'A-04120', title: 'Procurement & M/C Delivery', user: 'P. Chai', time: '30 Sep 2025 · 10:15', change: '+12%', note: 'Mill body arrived and offloaded safely.', status: 'Approved' },
    { id: 'A-04210', title: 'Structure Installation', user: 'S. Chai', time: '29 Sep 2025 · 16:40', change: '+8%', note: 'Column C12–C15 installation in progress.', status: 'Pending review' },
    { id: 'A-04220', title: 'Equipment Installation', user: 'M. Chai', time: '29 Sep 2025 · 09:30', change: '+5%', note: 'Pump P-201 setting alignment.', status: 'Pending info' },
  ]
  return <section className="panel site-feed">
    <div className="panel-head"><div><h2>Site updates</h2><p>Photo evidence connected to activities and approvals.</p></div><button className="text-button">View all updates <ArrowRight size={16} /></button></div>
    <div className="site-card-grid">
      <button className="add-photo-card" onClick={() => fileRef.current?.click()}><span><Camera size={28} /></span><strong>Add photos from site</strong><small>Take a photo or upload multiple images</small><em>Take photo / Upload</em></button>
      <input ref={fileRef} className="visually-hidden" type="file" accept="image/*" capture="environment" multiple onChange={(e) => handleFiles(e.target.files)} />
      {uploads.slice(0, 1).map((item) => <article className="site-card" key={item.url}><img src={item.url} alt={item.name} /><Status tone="info">Draft</Status><div><strong>New site evidence</strong><p>{item.name}</p><small>Ready to link to an activity</small></div></article>)}
      {cards.slice(0, uploads.length ? 2 : 3).map((card, index) => <article className="site-card" key={card.id}><img src={photoSeeds[index]} alt="Construction work progress" loading="lazy" /><Status tone={card.status === 'Approved' ? 'success' : 'warning'}>{card.status}</Status><div><strong>{card.id} · {card.title}</strong><p>{card.user} · {card.time} <b>{card.change}</b></p><small>{card.note}</small></div></article>)}
    </div>
  </section>
}

function RevisionControl({ onUpload, setToast }) {
  return <section className="panel revisions">
    <div className="panel-head"><div><h2>Drawing & revision control</h2><p>GA, As-built and site acknowledgement linked to Conzol references.</p></div><Status tone="warning">1 wrong-revision alert</Status></div>
    <div className="revision-layout">
      <div className="upload-stack"><button onClick={onUpload}><CloudUpload /><span><strong>Upload GA drawing</strong><small>PDF / DWG · staged before Conzol</small></span></button><button onClick={onUpload}><CloudUpload /><span><strong>Upload As-built drawing</strong><small>PDF / DWG · preserve revision history</small></span></button></div>
      <div className="revision-register">
        <div className="drawing-title"><FileText /><div><strong>ME-RM4-0201</strong><small>Grinding System · Equipment Arrangement</small></div><Status tone="success">Rev.04 · Latest For Construction</Status></div>
        <div className="revision-warning"><AlertTriangle size={17} />Site photo shows Rev.03 in use</div>
        <div className="table-scroll"><table><thead><tr><th>Revision</th><th>Date</th><th>Status</th><th>Pending with</th><th>Site acknowledged</th></tr></thead><tbody>{revisions.map((row) => <tr key={row.revision}><td><strong>{row.revision}</strong></td><td>{row.date}</td><td>{row.status}</td><td>{row.pending}</td><td>{row.acknowledged}</td></tr>)}</tbody></table></div>
        <div className="button-row"><button className="button button--secondary" onClick={() => setToast('Revision comparison opened in preview mode')}>Compare revisions</button><button className="button button--success" onClick={() => setToast('Rev.04 acknowledged for this user')}><CheckCircle2 />Acknowledge revision</button><button className="button button--warning" onClick={() => setToast('PM decision request sent')}><AlertTriangle />Request PM decision</button><button className="button button--secondary" onClick={() => setToast('Conzol reference opened in preview mode')}>Open in Conzol</button></div>
      </div>
    </div>
  </section>
}

function AttentionPanel() {
  return <section className="panel attention-panel"><div className="panel-head"><div><h2>Management attention</h2><p>Owners, elapsed time and decision deadlines.</p></div><span>6 open</span></div>{attention.map((item) => <button className="attention-item" key={item.title}><span className={`attention-icon attention-icon--${item.icon}`}>{item.icon === 'critical' ? <ShieldCheck /> : item.icon === 'warning' ? <AlertTriangle /> : <FileText />}</span><span><strong>{item.title}</strong><small>{item.meta}</small><em>{item.age}</em><b>{item.deadline}</b></span><ArrowRight /></button>)}</section>
}

function PMReview({ setToast }) {
  return <section className="panel pm-review"><div className="panel-head"><div><h2>PM review from anywhere</h2><p>Photo, drawing delta and impact in one decision.</p></div></div><div className="pm-evidence"><img src={photoSeeds[1]} alt="Site evidence" /><div className="drawing-delta"><PenLine /><span>3 marked changes</span></div></div><dl><div><dt>Owner</dt><dd>S. Chai · Contractor</dd></div><div><dt>Cost impact</dt><dd>฿125,000</dd></div><div><dt>Delay impact</dt><dd>3 days · High</dd></div></dl><div className="decision-row"><button className="button button--success" onClick={() => setToast('PM decision approved and recorded')}><Check />Approve</button><button className="button button--danger" onClick={() => setToast('Item returned with PM comment')}><RotateCcw />Return</button></div></section>
}

function ProgressPage({ onUpdate, setToast }) {
  return <><PageTitle eyebrow="Approved records drive the official S-Curve" title="Progress control" text="Review submissions, evidence and reporting-period locks." action={<button className="button button--primary" onClick={onUpdate}><Plus />Update progress</button>} /><section className="stats-row"><Stat label="Approved actual" value="62.3%" note="Official" /><Stat label="Plan" value="67.0%" note="30 Sep 2025" /><Stat label="Pending" value="7.8%" note="Not yet official" /><Stat label="Reporting period" value="Open" note="Closes 02 Oct" /></section><section className="panel chart-panel"><div className="panel-head"><div><h2>S-Curve · Cumulative progress</h2><p>Baseline v1 · approved actual only</p></div><Status tone="warning">4 pending review</Status></div><SCurve /></section><section className="panel"><div className="panel-head"><div><h2>Activity approval queue</h2><p>Plan, previous actual, submitted actual and evidence.</p></div></div><ActivityTable setToast={setToast} /></section></>
}

function ActivityTable({ setToast }) { return <div className="table-scroll"><table><thead><tr><th>Activity ID</th><th>Activity</th><th>WBS</th><th>Previous</th><th>Submitted</th><th>Evidence</th><th>Owner</th><th>Status</th><th /></tr></thead><tbody>{activities.map((row) => <tr key={row.id}><td><strong>{row.id}</strong></td><td>{row.activity}</td><td>{row.wbs}</td><td>{row.previous}%</td><td><strong>{row.submitted}%</strong></td><td>{row.evidence} files</td><td>{row.owner}</td><td><Status tone={row.status === 'Approved' ? 'success' : row.status === 'Returned' ? 'danger' : 'warning'}>{row.status} · {row.age}</Status></td><td><button className="table-action" onClick={() => setToast(`${row.id} opened for review`)}>Review</button></td></tr>)}</tbody></table></div> }

function SiteUpdatesPage({ onIssue, setToast }) { return <><PageTitle eyebrow="Mobile-first evidence capture" title="Site updates" text="Post activity progress, photos and issues from the field." action={<button className="button button--primary" onClick={onIssue}><Camera />Report site issue</button>} /><SiteFeed onAdd={onIssue} setToast={setToast} /><section className="panel offline-card"><Wifi /><div><h2>Low-bandwidth ready</h2><p>Drafts and compressed evidence are queued locally when the connection drops.</p></div><Status tone="success">Online · synced</Status></section></> }

function QualityPage({ issues, onIssue, setToast }) { return <><PageTitle eyebrow="Quality and change control" title="QA/QC control center" text="Classify issues, manage NCRs, inspect rectification and confirm CQD impact." action={<button className="button button--primary" onClick={onIssue}><Plus />New site issue</button>} /><section className="stats-row"><Stat label="Open issues" value={issues.length} note="3 critical" /><Stat label="Open NCR" value="7" note="2 overdue" /><Stat label="First-time pass" value="78%" note="This month" /><Stat label="Evidence complete" value="92%" note="Closure ready" /></section><section className="panel"><div className="tabs"><button className="is-active">Issues / NCR</button><button>Inspections</button><button>Corrective actions</button><button>Root cause & CQD</button></div><IssueTable issues={issues} setToast={setToast} /></section></> }

function IssueTable({ issues, setToast }) { return <div className="table-scroll"><table><thead><tr><th>ID</th><th>Type / issue</th><th>Severity</th><th>Pending with</th><th>Pending</th><th>SLA</th><th>Related activity</th><th>Revision</th><th /></tr></thead><tbody>{issues.map((issue) => <tr key={issue.id}><td><strong>{issue.id}</strong></td><td><strong>{issue.type}</strong><small className="cell-note">{issue.title}</small></td><td><Status tone={issue.severity === 'Critical' ? 'danger' : issue.severity === 'Major' ? 'warning' : 'info'}>{issue.severity}</Status></td><td>{issue.pending}</td><td>{issue.age} days</td><td>{issue.due}</td><td>{issue.activity}</td><td>{issue.revision}</td><td>{setToast && <button className="table-action" onClick={() => setToast(`${issue.id} issue detail opened`)}>Open</button>}</td></tr>)}</tbody></table></div> }

function DrawingsPage({ onUpload, setToast }) { return <><PageTitle eyebrow="Conzol remains the official document source" title="Drawings & revisions" text="Control metadata, references, acknowledgement and work-start warnings." action={<button className="button button--primary" onClick={onUpload}><Upload />Upload drawing</button>} /><section className="stats-row"><Stat label="For Construction" value="86%" note="Approved" /><Stat label="Awaiting acknowledgement" value="6" note="2 active areas" /><Stat label="Overdue approvals" value="4" note="Pending with Designer" /><Stat label="Wrong revision alerts" value="3" note="Requires attention" /></section><RevisionControl onUpload={onUpload} setToast={setToast} /></> }

function MyWorkPage({ onAction }) { return <><PageTitle eyebrow="Arun K. · Project Manager" title="My Work" text="Prioritized actions across progress, quality, documents and decisions." /><section className="work-list"><WorkCard title="Progress approvals" count="4" note="Oldest pending 5 days" icon={BarChart3} onClick={() => onAction('progress')} /><WorkCard title="PM decisions" count="6" note="2 due today" icon={ClipboardCheck} onClick={() => onAction('issue')} /><WorkCard title="Revisions to acknowledge" count="3" note="1 affects active work" icon={FileCheck2} onClick={() => onAction('drawing')} /><WorkCard title="Inspections" count="5" note="2 ready for closure" icon={ShieldCheck} onClick={() => onAction('issue')} /></section><section className="panel"><div className="panel-head"><div><h2>Due next</h2><p>Ordered by impact and decision deadline.</p></div></div>{attention.map((item) => <div className="task-row" key={item.title}><AlertTriangle /><div><strong>{item.title}</strong><small>{item.meta} · {item.age}</small></div><span>{item.deadline}</span><button>Open</button></div>)}</section></> }

function WorkCard({ title, count, note, icon: Icon, onClick }) { return <button className="work-card" onClick={onClick}><span><Icon /></span><div><strong>{count}</strong><h2>{title}</h2><p>{note}</p></div><ArrowRight /></button> }

function DocumentsPage({ onUpload }) { return <><PageTitle eyebrow="Metadata synchronized from the official register" title="Documents" text="Search Conzol references without duplicating controlled files." action={<button className="button button--primary" onClick={onUpload}><Upload />Stage document</button>} /><section className="panel"><div className="document-toolbar"><label><Search /><input placeholder="Search document number or title" /></label><Status tone="success">Conzol export · synced 09:14</Status></div><div className="empty-state"><FolderOpen /><h2>Document register preview</h2><p>The MVP stores document metadata, workflow state and Conzol references. Official files remain in Conzol.</p><button className="button button--secondary" onClick={onUpload}>Stage GA / As-built metadata</button></div></section></> }

function PortfolioPage({ onOpen }) { return <><PageTitle eyebrow="37 S-Curve source workbooks · 3 verified template families" title="Portfolio map" text="Project progress, critical quality issues and management alerts." /><section className="portfolio-grid"><div className="panel map-panel"><div className="map-toolbar"><strong>Thailand projects</strong><div><Status tone="success">On plan</Status><Status tone="warning">At risk</Status><Status tone="danger">Delayed</Status></div></div><div className="map-canvas"><svg viewBox="0 0 360 620" aria-label="Schematic project map of Thailand"><path d="M142 17c37 25 31 78 55 113 15 23 69 41 72 81 4 51-57 70-63 116-4 31 22 61 20 101-2 43-35 62-48 100-9 27 1 55-15 75-14 17-42-3-40-29 3-45 31-76 22-123-7-39-37-70-31-112 6-44 38-63 33-108-5-47-50-78-47-124 2-39 31-57 44-88 14-33 15-107 52-125z" /></svg>{projects.map((item) => <button key={item.id} className={`map-marker map-marker--${item.status}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => onOpen(item.id)}><MapPin /><span>{item.short}<small>{item.progress}% · {item.location}</small></span></button>)}</div></div><div className="panel portfolio-list"><div className="panel-head"><div><h2>Projects</h2><p>Click any project to open its workspace.</p></div></div>{projects.map((item) => <button key={item.id} onClick={() => onOpen(item.id)}><span className={`project-dot project-dot--${item.status}`} /><span><strong>{item.name}</strong><small>{item.location} · {item.template}</small></span><b>{item.progress}%</b><ArrowRight /></button>)}</div></section></> }

function PageTitle({ eyebrow, title, text, action }) { return <section className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{action}</section> }
function Stat({ label, value, note }) { return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }

function IssueDrawer({ onClose, onSubmit }) {
  const [files, setFiles] = useState([])
  const [form, setForm] = useState({ activity: 'A-04210 · Structure Installation', area: 'Area 2 / Grid C12–C15', type: 'Drawing mismatch', drawing: 'ME-RM4-0201', revision: 'Rev.03', description: 'Site photo shows Rev.03 in use, but Rev.04 is the latest For Construction.', severity: 'Critical', owner: 'S. Rungrot · Site', due: '2025-10-04' })
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const addFiles = (fileList) => setFiles((current) => [...current, ...Array.from(fileList).slice(0, 4).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))])
  const submit = (event) => { event.preventDefault(); onSubmit({ id: `SI-${String(Date.now()).slice(-4)}`, type: form.type, title: form.description, severity: form.severity, pending: form.owner, age: 0, due: form.due, activity: form.activity.split(' · ')[0], revision: `${form.revision} submitted`, status: 'QA/QC review' }) }
  return <div className="drawer-layer"><button className="drawer-scrim" aria-label="Close issue form" onClick={onClose} /><aside className="drawer" aria-label="Report site issue"><div className="drawer-head"><div><p className="eyebrow">Site issue · New</p><h2>Report site issue</h2><p>Capture evidence, location and revision used.</p></div><button className="icon-button" onClick={onClose}><X /></button></div><form onSubmit={submit}>
    <fieldset><legend><b>1</b>Add site photos</legend><div className="photo-upload-row"><label className="upload-button"><Camera />Take photo<input type="file" accept="image/*" capture="environment" onChange={(e) => addFiles(e.target.files)} /></label><label className="upload-button"><ImagePlus />Upload photos<input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} /></label></div><div className="photo-preview">{files.length ? files.map((file) => <figure key={file.url}><img src={file.url} alt={file.name} /><button type="button" onClick={() => setFiles((list) => list.filter((item) => item.url !== file.url))}><X /></button></figure>) : photoSeeds.slice(0, 3).map((src, i) => <figure key={src}><img src={src} alt={`Example site evidence ${i + 1}`} /></figure>)}</div><button className="markup-button" type="button"><PenLine />Mark up photo</button></fieldset>
    <fieldset><legend><b>2</b>Work context</legend><div className="form-grid"><Field label="Activity"><select value={form.activity} onChange={update('activity')}><option>A-04210 · Structure Installation</option><option>A-04220 · Equipment Installation</option><option>A-04120 · Procurement & M/C Delivery</option></select></Field><Field label="Area / Grid"><input value={form.area} onChange={update('area')} /></Field></div></fieldset>
    <fieldset><legend><b>3</b>Issue and drawing</legend><div className="form-grid form-grid--3"><Field label="Issue type"><select value={form.type} onChange={update('type')}><option>Drawing mismatch</option><option>Design conflict</option><option>Requirement change</option><option>Installation defect</option><option>Material issue</option><option>NCR</option></select></Field><Field label="Drawing used"><input value={form.drawing} onChange={update('drawing')} /></Field><Field label="Revision used"><select value={form.revision} onChange={update('revision')}><option>Rev.03</option><option>Rev.04</option><option>Unknown</option></select></Field></div><Field label="Description"><textarea rows="3" value={form.description} onChange={update('description')} /></Field></fieldset>
    <fieldset><legend><b>4</b>Ownership and SLA</legend><div className="form-grid form-grid--3"><Field label="Severity"><select value={form.severity} onChange={update('severity')}><option>Critical</option><option>Major</option><option>Minor</option></select></Field><Field label="Assign to"><select value={form.owner} onChange={update('owner')}><option>S. Rungrot · Site</option><option>E. Eng · Engineering</option><option>QA/QC Manager</option></select></Field><Field label="Required response date"><input type="date" value={form.due} onChange={update('due')} /></Field></div></fieldset>
    <div className="drawer-actions"><button type="button" className="button button--secondary" onClick={onClose}>Save draft</button><button className="button button--primary" type="submit">Submit issue</button></div>
  </form></aside></div>
}

function ProgressDialog({ onClose, onSubmit }) { const [actual, setActual] = useState(45); return <Modal title="Update progress" subtitle="A-04210 · Structure Installation" onClose={onClose}><div className="progress-context"><Stat label="Plan" value="52%" note="30 Sep" /><Stat label="Previous approved" value="35%" note="20 Sep" /><Stat label="New actual" value={`${actual}%`} note="Draft" /></div><Field label="New actual progress"><input type="range" min="35" max="100" value={actual} onChange={(e) => setActual(e.target.value)} /></Field><Field label="Work completed"><textarea rows="3" defaultValue="Column C12–C15 installation completed with alignment check." /></Field><Field label="Forecast finish"><input type="date" defaultValue="2025-10-18" /></Field><label className="drop-zone"><ImagePlus /><strong>Add progress photos</strong><small>Evidence required for increases over 10%</small><input type="file" multiple accept="image/*" /></label><div className="modal-actions"><button className="button button--secondary" onClick={onClose}>Save draft</button><button className="button button--primary" onClick={onSubmit}>Submit for review</button></div></Modal> }

function DrawingDialog({ onClose, onSubmit }) { const [kind, setKind] = useState('GA'); return <Modal title="Upload drawing" subtitle="Stage metadata and file before document-control review" onClose={onClose}><div className="segmented"><button className={kind === 'GA' ? 'is-active' : ''} onClick={() => setKind('GA')}>GA drawing</button><button className={kind === 'As-built' ? 'is-active' : ''} onClick={() => setKind('As-built')}>As-built drawing</button></div><div className="form-grid"><Field label="Drawing number"><input defaultValue="ME-RM4-0201" /></Field><Field label="Revision"><input defaultValue="Rev.05" /></Field></div><Field label="Drawing title"><input defaultValue="Grinding System · Equipment Arrangement" /></Field><label className="drop-zone"><CloudUpload /><strong>Drop PDF / DWG here</strong><small>The official controlled file will remain in Conzol after review.</small><input type="file" accept=".pdf,.dwg,.dxf" /></label><div className="modal-actions"><button className="button button--secondary" onClick={onClose}>Cancel</button><button className="button button--primary" onClick={() => onSubmit(kind)}>Upload to staging</button></div></Modal> }

function Modal({ title, subtitle, onClose, children }) { return <div className="modal-layer"><button className="modal-scrim" onClick={onClose} aria-label="Close dialog" /><section className="modal"><div className="drawer-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><X /></button></div>{children}</section></div> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }

export default App
