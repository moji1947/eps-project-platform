import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowLeft, Building2, Camera, CheckCircle2, ClipboardCheck, Clock3, ExternalLink, FileText, HardHat, ImagePlus, Info, Link2, MapPin, PackageCheck, Plus, Save, ShieldCheck, TestTube2, Users, Wrench } from 'lucide-react'
import './detail.css'

const DETAIL_COLORS={green:'#168A4B',yellow:'#D99A00',orange:'#E47700',red:'#D83A3A',blue:'#1769C2',navy:'#082A57',grey:'#778397'}
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'THB',maximumFractionDigits:0}).format(n||0)
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n))

export default function ProjectQualityDetail({project,StatusBadge}){
  const storageKey='eps-quality-detail-'+project.id
  const [showMethodology,setShowMethodology]=useState(false)
  const [notice,setNotice]=useState('')
  const [tests,setTests]=useState([
    {id:1,name:'Concrete strength',tested:152,total:154},
    {id:2,name:'Welding NDT',tested:213,total:215},
    {id:3,name:'Hydrostatic test',tested:84,total:86},
    {id:4,name:'Electrical insulation',tested:118,total:118},
  ])
  const [issues,setIssues]=useState(()=>{
    try{return JSON.parse(localStorage.getItem(storageKey))||[
      {id:'AUD-0241',date:'2026-08-03 10:15',zone:'Material Yard',title:'Anchor bolt alignment outside tolerance',status:'ACTION REQUIRED',reference:'NCR-0088',before:1,after:0},
      {id:'AUD-0238',date:'2026-08-02 14:40',zone:'Level 3 North Wing',title:'Cable tray clearance verified after correction',status:'APPROVED',reference:'ITP-EL-042',before:1,after:2},
    ]}catch{return[]}
  })
  const [form,setForm]=useState({date:new Date().toISOString().slice(0,16),zone:'',title:'',description:'',status:'ACTION REQUIRED',reference:''})
  const [photos,setPhotos]=useState({before:[],after:[]})
  useEffect(()=>localStorage.setItem(storageKey,JSON.stringify(issues)),[issues,storageKey])
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3200);return()=>clearTimeout(timer)},[notice])
  const addTest=()=>setTests(list=>[...list,{id:Date.now(),name:'New test discipline',tested:0,total:0}])
  const updateTest=(id,key,value)=>setTests(list=>list.map(test=>test.id===id?{...test,[key]:key==='name'?value:Number(value)}:test))
  const attachPhotos=(kind,files)=>setPhotos(current=>({...current,[kind]:Array.from(files).slice(0,4).map(file=>({name:file.name,url:URL.createObjectURL(file)}))}))
  const submitIssue=e=>{e.preventDefault();if(!form.zone||!form.title||!form.reference){setNotice('Complete zone, issue title and document reference.');return}const item={id:'AUD-'+String(240+issues.length+1).padStart(4,'0'),date:form.date.replace('T',' '),zone:form.zone,title:form.title,status:form.status,reference:form.reference,before:photos.before.length,after:photos.after.length};setIssues(list=>[item,...list]);setForm({...form,zone:'',title:'',description:'',reference:''});setPhotos({before:[],after:[]});setNotice('Site issue saved to this browser.')}
  const props={project,StatusBadge,showMethodology,setShowMethodology,notice,setNotice,tests,addTest,updateTest,issues,form,setForm,photos,attachPhotos,submitIssue}
  return <DetailDashboard {...props}/>
}

function DetailDashboard({project:p,StatusBadge,showMethodology,setShowMethodology,notice,setNotice,tests,addTest,updateTest,issues,form,setForm,photos,attachPhotos,submitIssue}){
  const firstPass=p.firstPassInspectionPoints||0
  const passedAfter=Math.max(0,(p.passedInspectionPoints||0)-firstPass)
  const rejected=Math.max(0,(p.completedInspectionPoints||0)-(p.passedInspectionPoints||0))
  const pending=Math.max(8,Math.round((p.completedInspectionPoints||0)*.04))
  const inspectionData=[{name:'Passed first time',value:firstPass,color:DETAIL_COLORS.green},{name:'Passed after rework',value:passedAfter,color:DETAIL_COLORS.yellow},{name:'Rejected',value:rejected,color:DETAIL_COLORS.red},{name:'Pending',value:pending,color:DETAIL_COLORS.grey}]
  const ncrData=[{name:'Closed',value:p.closedNcr||0,color:DETAIL_COLORS.green},{name:'Open',value:p.openNcr||0,color:DETAIL_COLORS.yellow},{name:'Overdue',value:p.overdueNcr||0,color:DETAIL_COLORS.red}]
  const currentRework=p.reworkPercent||0
  const reworkTrend=['Mar','Apr','May','Jun','Jul','Aug'].map((month,index)=>({month,value:clamp(currentRework+(5-index)*.12-(index%2)*.08,0,9)}))
  const punchTrend=['Mar','Apr','May','Jun','Jul','Aug'].map((month,index)=>({month,closed:Math.max(0,Math.round((p.punchListClosed||0)*(index+1)/6)),remaining:Math.max(0,(p.punchListTotal||0)-Math.round((p.punchListClosed||0)*(index+1)/6))}))
  const supplierData=[{name:'Siam Structural',score:98.6},{name:'Metro Electrical',score:97.8},{name:'Eastern Piping',score:96.9},{name:'Prime Concrete',score:95.7},{name:'Asia Equipment',score:94.8}]
  const disciplines=[['Civil','Excellent'],['Structure',p.openNcrCritical?'Critical':'Good'],['Mechanical',p.reworkPercent>2?'Watch':'Good'],['Piping','Excellent'],['Electrical',p.holdPointBypassed?'Critical':'Good'],['Boiler','Good'],['Commissioning',p.punchListOverdue>5?'Watch':'Excellent']]
  const supplierQuality=p.materialApprovalTotal?Math.round(p.materialApprovalApproved/p.materialApprovalTotal*1000)/10:null
  const testRate=p.requiredTestsCompleted?Math.round(p.requiredTestsPassed/p.requiredTestsCompleted*1000)/10:null
  const kpis=[
    ['First Pass Yield',firstPass&&p.completedInspectionPoints?(firstPass/p.completedInspectionPoints*100).toFixed(1)+'%':'-','Target >= 90%'],
    ['Inspection Pass Rate',p.inspectionPassRate?.toFixed(1)+'%','Target >= 95%'],
    ['Open NCR',p.openNcr,'Target <= 5'],
    ['Rework Cost',p.reworkPercent?.toFixed(2)+'%','Target <= 1%'],
    ['Punch List Remaining',p.punchRemaining,'Target <= 30'],
    ['Test Pass Rate',testRate==null?'-':testRate+'%','Target >= 98%'],
    ['Supplier Quality',supplierQuality==null?'-':supplierQuality+'%','Target >= 95%'],
    ['Client Satisfaction',p.clientSatisfactionScore==null?'-':p.clientSatisfactionScore.toFixed(1)+'/5','Target >= 4.5'],
  ]
  return <div className="quality-detail">
    <header className="quality-detail__header"><Link to="/" className="quality-detail__back"><ArrowLeft/>Back to Overview</Link><div className="quality-detail__identity"><span className="quality-detail__mark"><Building2/></span><div><span>Project Quality Dashboard</span><h1>{p.name}</h1><p>{p.id} / {p.location} / {p.businessUnit} / Reporting date {new Date(p.lastUpdated).toLocaleDateString()}</p></div></div><div className="quality-detail__health"><span>Quality Health Index</span><strong>{p.qhi??'-'}</strong><StatusBadge status={p.status} title={p.override||p.reason}/><small>Target &gt;= 90</small></div><button className="detail-button detail-button--light" onClick={()=>setShowMethodology(value=>!value)}><Info/>View Methodology</button></header>
    {showMethodology&&<div className="methodology-note"><strong>QHI = Inspection 35% + NCR control 25% + Rework control 15% + Mandatory tests 10% + Punch closure 10% + Client satisfaction 5%.</strong><span>Each metric is normalized to 0-100. Critical NCR, unresolved mandatory test, quality stop-work, bypassed hold point, or critically stale data forces Red status.</span></div>}
    <main className="quality-detail__main"><section className="detail-kpis" aria-label="Target-driven project KPIs">{kpis.map(([label,value,target])=><DetailKpi key={label} label={label} value={value} target={target}/>)}</section>
      <div className="detail-workspace">
        <InspectionPanel data={inspectionData} total={(p.completedInspectionPoints||0)+pending} firstPass={firstPass&&p.completedInspectionPoints?firstPass/p.completedInspectionPoints*100:0}/>
        <NcrPanel data={ncrData} project={p}/>
        <ReworkPanel trend={reworkTrend} project={p}/>
        <MaterialPanel project={p} suppliers={supplierData} supplierQuality={supplierQuality}/>
        <TestsPanel tests={tests} addTest={addTest} updateTest={updateTest}/>
        <PunchPanel project={p} trend={punchTrend}/>
        <HeatMapPanel disciplines={disciplines}/>
        <IssuePanel issues={issues} form={form} setForm={setForm} photos={photos} attachPhotos={attachPhotos} submitIssue={submitIssue}/>
        <AlertsPanel project={p}/>
        <QuickLinks onPlaceholder={()=>setNotice('Quick Links are placeholders. Send the URLs and preferred UI style to finalize them.')}/>
      </div>
    </main>
    <footer className="quality-detail__footer"><span>Data source: QMS System</span><span>Last updated {new Date().toLocaleString()}</span></footer>
    {notice&&<div className="detail-toast" role="status"><CheckCircle2/>{notice}</div>}
  </div>
}

function DetailKpi({label,value,target}){return <article className="detail-kpi"><span>{label}</span><strong>{value}</strong><small>{target}</small></article>}
function DetailSection({number,title,subtitle,children,className=''}){return <section className={'detail-section '+className}><header><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></header>{children}</section>}
function Donut({data,label,value}){return <div className="detail-donut"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={2}>{data.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div><strong>{value}</strong><span>{label}</span></div></div>}
function MiniLegend({data}){return <div className="detail-legend">{data.map(item=><span key={item.name}><i style={{background:item.color}}/>{item.name}<strong>{item.value}</strong></span>)}</div>}

// DETAIL_HELPERS
function InspectionPanel({data,total,firstPass}){return <DetailSection number="02" title="Inspection Performance" subtitle="Inspection outcomes for the current reporting period" className="detail-section--inspection"><div className="panel-split"><div><Donut data={data} label="Inspection points" value={total}/><MiniLegend data={data}/></div><div className="metric-callout"><span>First pass yield</span><strong>{firstPass.toFixed(1)}%</strong><small>Passed without rework</small><div className="meter"><i style={{width:clamp(firstPass,0,100)+'%'}}/></div></div></div></DetailSection>}

function NcrPanel({data,project:p}){const closedRate=(p.closedNcr||0)+(p.openNcr||0)?(p.closedNcr/((p.closedNcr||0)+(p.openNcr||0))*100):0;return <DetailSection number="03" title="NCR Management" subtitle="Non-conformance status and closure discipline" className="detail-section--ncr"><div className="panel-split"><div><Donut data={data} label="NCR records" value={data.reduce((sum,item)=>sum+item.value,0)}/><MiniLegend data={data}/></div><div className="metric-stack"><div><span>Average closing time</span><strong>{Math.max(2,Math.round(12-(p.inspectionPassRate||80)/10))} days</strong></div><div><span>Closed within SLA</span><strong>{closedRate.toFixed(1)}%</strong></div><div><span>Critical open</span><strong className={p.openNcrCritical?'text-critical':''}>{p.openNcrCritical||0}</strong></div></div></div></DetailSection>}

function ReworkPanel({trend,project:p}){const causes=[{name:'Installation tolerance',value:38},{name:'Drawing coordination',value:27},{name:'Material handling',value:20},{name:'Workmanship',value:15}];return <DetailSection number="04" title="Rework Analysis" subtitle="Cost impact and recurring causes" className="detail-section--rework"><div className="rework-summary"><div><span>Financial impact</span><strong>{money(p.reworkCostThb)}</strong><small>{p.reworkPercent?.toFixed(2)}% of actual construction cost</small></div><div className="cause-list">{causes.map(cause=><span key={cause.name}>{cause.name}<i><b style={{width:cause.value+'%'}}/></i><strong>{cause.value}%</strong></span>)}</div></div><div className="chart-frame" aria-label="Six month rework cost trend"><ResponsiveContainer width="100%" height={190}><AreaChart data={trend} margin={{top:10,right:10,left:-20,bottom:0}}><defs><linearGradient id="reworkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={DETAIL_COLORS.orange} stopOpacity={.26}/><stop offset="95%" stopColor={DETAIL_COLORS.orange} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month"/><YAxis unit="%"/><Tooltip formatter={v=>[v.toFixed(2)+'%','Rework']}/><Area type="monotone" dataKey="value" stroke={DETAIL_COLORS.orange} fill="url(#reworkFill)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></DetailSection>}

function MaterialPanel({project:p,suppliers,supplierQuality}){const accepted=p.incomingMaterialInspected?Math.round(p.incomingMaterialAccepted/p.incomingMaterialInspected*100):0;return <DetailSection number="05" title="Material & Supplier Quality" subtitle="Incoming acceptance and supplier performance" className="detail-section--material"><div className="material-score"><PackageCheck/><div><span>Incoming material accepted</span><strong>{accepted}%</strong><small>{p.incomingMaterialAccepted||0} of {p.incomingMaterialInspected||0} receipts</small></div><div><span>Submittal approval</span><strong>{supplierQuality==null?'-':supplierQuality+'%'}</strong><small>{p.materialApprovalApproved||0} of {p.materialApprovalTotal||0} approved</small></div></div><div className="supplier-table"><div className="supplier-table__head"><span>Supplier</span><span>Quality score</span></div>{suppliers.map((supplier,index)=><div key={supplier.name}><span><b>{index+1}</b>{supplier.name}</span><strong>{supplier.score}%</strong></div>)}</div></DetailSection>}

// DETAIL_HELPERS_2
function TestsPanel({tests,addTest,updateTest}){return <DetailSection number="06" title="Dynamic Critical Tests" subtitle="Customizable mandatory quality test register" className="detail-section--tests"><div className="test-table"><div className="test-table__head"><span>Test discipline</span><span>Passed</span><span>Required</span><span>Pass rate</span></div>{tests.map(test=>{const rate=test.total?clamp(test.tested/test.total*100,0,100):0;return <div key={test.id}><input aria-label="Test discipline" value={test.name} onChange={e=>updateTest(test.id,'name',e.target.value)}/><input aria-label={'Passed tests for '+test.name} type="number" min="0" value={test.tested} onChange={e=>updateTest(test.id,'tested',e.target.value)}/><input aria-label={'Required tests for '+test.name} type="number" min="0" value={test.total} onChange={e=>updateTest(test.id,'total',e.target.value)}/><strong className={rate<95?'text-watch':''}>{rate.toFixed(1)}%</strong></div>})}</div><button className="detail-button detail-button--outline" type="button" onClick={addTest}><Plus/>Add test discipline</button></DetailSection>}

function PunchPanel({project:p,trend}){return <DetailSection number="07" title="Punch List Progress" subtitle="Closure volume and monthly clearance" className="detail-section--punch"><div className="punch-summary"><div><span>Closed</span><strong>{p.punchListClosed||0}</strong></div><div><span>Remaining</span><strong>{p.punchRemaining||0}</strong></div><div><span>Overdue</span><strong className={p.punchListOverdue?'text-critical':''}>{p.punchListOverdue||0}</strong></div></div><div className="chart-frame" aria-label="Monthly punch list closure chart"><ResponsiveContainer width="100%" height={220}><BarChart data={trend} margin={{top:10,right:6,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="closed" name="Closed" fill={DETAIL_COLORS.blue} radius={[4,4,0,0]}/><Bar dataKey="remaining" name="Remaining" fill="#C8D2E0" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></DetailSection>}

function HeatMapPanel({disciplines}){const pins=[['Civil','18%','63%'],['Structure','36%','34%'],['Mechanical','55%','54%'],['Piping','69%','27%'],['Electrical','81%','60%'],['Boiler','52%','77%'],['Commissioning','29%','82%']];return <DetailSection number="08" title="Area & Discipline Heat Map" subtitle="Current quality condition by work area" className="detail-section--heat"><div className="site-map" role="img" aria-label="Site quality map with discipline status pins"><div className="site-map__road">ACCESS ROAD</div><div className="site-map__zone site-map__zone--a">PROCESS AREA</div><div className="site-map__zone site-map__zone--b">UTILITY BLOCK</div><div className="site-map__zone site-map__zone--c">WAREHOUSE</div>{pins.map(([name,left,top])=>{const status=disciplines.find(item=>item[0]===name)?.[1]||'Good';return <button key={name} type="button" className={'site-pin site-pin--'+status.toLowerCase()} style={{left,top}} title={name+': '+status}><MapPin/><span>{name}</span></button>})}</div><div className="discipline-grid">{disciplines.map(([name,status])=><div key={name}><span>{name}</span><b className={'status-dot status-dot--'+status.toLowerCase()}/><strong>{status}</strong></div>)}</div></DetailSection>}

// DETAIL_HELPERS_3
function IssuePanel({issues,form,setForm,photos,attachPhotos,submitIssue}){const field=(key,value)=>setForm(current=>({...current,[key]:value}));return <DetailSection number="09" title="Issue Update & Audit Log" subtitle="Record site observations with traceable evidence" className="detail-section--issues"><form className="issue-form" onSubmit={submitIssue}><label><span>Date & time</span><input type="datetime-local" value={form.date} onChange={e=>field('date',e.target.value)} required/></label><label><span>Location / zone</span><input value={form.zone} onChange={e=>field('zone',e.target.value)} placeholder="e.g. Level 3 North Wing" required/></label><label className="issue-form__wide"><span>Issue title</span><input value={form.title} onChange={e=>field('title',e.target.value)} placeholder="Describe the quality observation" required/></label><label className="issue-form__wide"><span>Description</span><textarea value={form.description} onChange={e=>field('description',e.target.value)} rows="3" placeholder="Add scope, condition and required action"/></label><label><span>Status</span><select value={form.status} onChange={e=>field('status',e.target.value)}><option>ACTION REQUIRED</option><option>IN PROGRESS</option><option>APPROVED</option><option>CLOSED</option></select></label><label><span>Document reference</span><input value={form.reference} onChange={e=>field('reference',e.target.value)} placeholder="NCR, ITP or drawing number" required/></label><PhotoInput kind="before" label="Before photos" photos={photos.before} attachPhotos={attachPhotos}/><PhotoInput kind="after" label="After photos" photos={photos.after} attachPhotos={attachPhotos}/><div className="issue-form__actions"><span>Prototype records are stored in this browser.</span><button className="detail-button detail-button--primary" type="submit"><Save/>Save issue update</button></div></form><div className="audit-log"><div className="audit-log__head"><span>Recent audit activity</span><strong>{issues.length} records</strong></div>{issues.map(issue=><article key={issue.id}><div className="audit-log__icon"><ClipboardCheck/></div><div><span>{issue.id} / {issue.date}</span><strong>{issue.title}</strong><small>{issue.zone} / Ref. {issue.reference}</small></div><div className="audit-log__evidence"><span><Camera/>{issue.before} before</span><span><Camera/>{issue.after} after</span></div><b className={'audit-status audit-status--'+issue.status.toLowerCase().replaceAll(' ','-')}>{issue.status}</b></article>)}</div></DetailSection>}

function PhotoInput({kind,label,photos,attachPhotos}){return <label className="photo-input"><span>{label}</span><input type="file" accept="image/*" multiple onChange={e=>attachPhotos(kind,e.target.files)}/><span className="photo-input__control"><ImagePlus/>Choose up to 4 images</span>{photos.length>0&&<span className="photo-preview">{photos.map(photo=><img key={photo.name} src={photo.url} alt={photo.name}/>)}</span>}</label>}

function AlertsPanel({project:p}){const alerts=[];if((p.overdueNcr||0)>10)alerts.push(['NCR overdue threshold exceeded',p.overdueNcr+' NCR records are overdue.']);if((p.reworkPercent||0)>1)alerts.push(['Rework cost above 1%',p.reworkPercent.toFixed(2)+'% of actual construction cost.']);if((p.punchRemaining||0)>200)alerts.push(['Punch list threshold exceeded',p.punchRemaining+' items remain open.']);if(p.openNcrCritical)alerts.push(['Critical NCR open',p.openNcrCritical+' critical NCR requires immediate action.']);return <DetailSection number="10" title="Basic Quality Alerts" subtitle="Transparent threshold alerts - no AI scoring" className="detail-section--alerts">{alerts.length?<div className="alert-list">{alerts.map(([title,description])=><article key={title}><AlertTriangle/><div><strong>{title}</strong><span>{description}</span></div></article>)}</div>:<div className="alert-empty"><ShieldCheck/><div><strong>No alert thresholds triggered</strong><span>Current project values remain within configured limits.</span></div></div>}<div className="alert-rules"><span>NCR overdue &gt; 10</span><span>Rework &gt; 1%</span><span>Punch remaining &gt; 200</span></div></DetailSection>}

function QuickLinks({onPlaceholder}){const placeholders=[['Quality documents',FileText],['Inspection register',ClipboardCheck],['NCR register',AlertTriangle]];return <DetailSection number="11" title="Quick Links" subtitle="Open connected quality systems and project registers" className="detail-section--links"><div className="quick-links"><a href="https://www.conzol.com/dashboard/#/EPS/home?id=041448614465968aa8957a" target="_blank" rel="noreferrer"><Building2/><span>Conzol Dashboard<small>Open EPS project dashboard</small></span><ExternalLink/></a>{placeholders.map(([label,Icon])=><button type="button" key={label} onClick={onPlaceholder}><Icon/><span>{label}<small>URL to be confirmed</small></span><ExternalLink/></button>)}</div><p className="quick-links__note"><Info/>Conzol Dashboard is connected. Remaining destinations stay as placeholders until you confirm their URLs.</p></DetailSection>}
