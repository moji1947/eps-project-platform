import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import * as XLSX from 'xlsx'
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Building2, CheckCircle2, ChevronRight, CircleAlert, Download, FileSpreadsheet, FilterX, HardHat, Info, RefreshCw, Search, Upload, X } from 'lucide-react'
import { demoProjects, requiredFields } from './data.js'

const STORE='eps-quality-portfolio-v1'
const COLORS={'On Track':'#168A4B','Needs Attention':'#D99A00','Action Required':'#D83A3A','Insufficient Data':'#778397'}
const statuses=Object.keys(COLORS)
const toNum=v=>v===''||v==null?null:Number(v)
const pct=(a,b)=>b>0?a/b*100:null
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'THB',maximumFractionDigits:0}).format(n||0)
const average=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null
const camel=s=>s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase())

function quality(p){
  const missing=[]
  if(!p.completedInspectionPoints)missing.push('inspection results')
  if(!p.actualConstructionCostThb)missing.push('actual construction cost')
  if(!p.requiredTestsCompleted)missing.push('mandatory test results')
  if(missing.length)return{qhi:null,status:'Insufficient Data',reason:`Missing ${missing.join(', ')}`,missing}
  const inspection=pct(p.passedInspectionPoints,p.completedInspectionPoints)
  const ncrPenalty=p.openNcrCritical*25+p.openNcrMajor*7+p.openNcrMinor*2+Math.min(p.overdueNcr,10)
  const rework=pct(p.reworkCostThb,p.actualConstructionCostThb)
  const materials=pct(p.requiredTestsPassed,p.requiredTestsCompleted)
  const punch=pct(p.punchListClosed,p.punchListTotal)??100
  const satisfaction=p.clientSatisfactionRecorded?p.clientSatisfactionScore*20:75
  let qhi=inspection*.35+Math.max(0,100-ncrPenalty)*.25+Math.max(0,100-rework*20)*.15+materials*.1+punch*.1+satisfaction*.05
  qhi=Math.round(Math.max(0,Math.min(100,qhi))*10)/10
  const overrides=[]
  if(p.openNcrCritical)overrides.push(`${p.openNcrCritical} critical NCR open`)
  if(p.unresolvedCriticalTest)overrides.push('Mandatory material test unresolved')
  if(p.formalStopWorkQuality)overrides.push('Quality-related stop-work active')
  if(p.holdPointBypassed)overrides.push('Mandatory hold point bypassed')
  if((Date.now()-new Date(p.lastUpdated))/86400000>14)overrides.push('Quality data exceeds critical stale limit')
  const status=overrides.length?'Action Required':qhi>=85?'On Track':qhi>=70?'Needs Attention':'Action Required'
  const reason=overrides[0]||(status==='Action Required'?(inspection<75?'Inspection pass rate below target':rework>2?'Rework cost above 2%':'QHI below threshold'):status==='Needs Attention'?'Quality indicators need attention':'Quality indicators within target')
  return{qhi,status,reason,override:overrides.join('; ')}
}

function enrich(p){const q=quality(p);return{...p,...q,inspectionPassRate:pct(p.passedInspectionPoints,p.completedInspectionPoints),reworkPercent:pct(p.reworkCostThb,p.actualConstructionCostThb),openNcr:p.openNcrMinor+p.openNcrMajor+p.openNcrCritical,punchRemaining:Math.max(0,p.punchListTotal-p.punchListClosed)}}
function Badge({status,title}){const icon=status==='On Track'?'OK':status==='Needs Attention'?'!':status==='Action Required'?'X':'?';return <span className={`badge badge--${status.replaceAll(' ','-').toLowerCase()}`} title={title}><span aria-hidden={true}>{icon}</span>{status}</span>}
function Toast({message}){return message&&<div className="toast" role="status"><CheckCircle2 size={18}/>{message}</div>}

export default function App(){return <Routes><Route path="*" element={<Overview/>}/><Route path="/projects/:projectId/quality" element={<ProjectDetail/>}/></Routes>}

function Overview(){
  const navigate=useNavigate()
  const [projects,setProjects]=useState(()=>{try{return JSON.parse(localStorage.getItem(STORE))||demoProjects}catch{return demoProjects}})
  const [filters,setFilters]=useState({date:'Year to Date',unit:'All',projectStatus:'All',quality:'All',search:'',openNcr:false})
  const [chartFilter,setChartFilter]=useState(null),[sort,setSort]=useState({key:'qhi',dir:'asc'}),[focus,setFocus]=useState('qhi')
  const [page,setPage]=useState(1),[pageSize,setPageSize]=useState(10),[loading,setLoading]=useState(false),[toast,setToast]=useState(''),[importOpen,setImportOpen]=useState(false),[exportOpen,setExportOpen]=useState(false),[updated,setUpdated]=useState(new Date())
  useEffect(()=>localStorage.setItem(STORE,JSON.stringify(projects)),[projects])
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(t)},[toast])
  const all=useMemo(()=>projects.map(enrich),[projects])
  const filtered=useMemo(()=>all.filter(p=>{const q=filters.search.toLowerCase();const search=!q||[p.name,p.id,p.location,p.businessUnit,p.responsibleTeam].some(v=>String(v).toLowerCase().includes(q));const chartOk=!chartFilter||(!chartFilter.unit||p.businessUnit===chartFilter.unit)&&(!chartFilter.status||p.status===chartFilter.status);const d=new Date(p.lastUpdated),now=new Date(),monthStart=new Date(now.getFullYear(),now.getMonth(),1),lastMonthStart=new Date(now.getFullYear(),now.getMonth()-1,1),threeMonthsAgo=new Date(now.getFullYear(),now.getMonth()-2,1),yearStart=new Date(now.getFullYear(),0,1);const dateOk=filters.date==='This Month'?d>=monthStart:filters.date==='Last Month'?d>=lastMonthStart&&d<monthStart:filters.date==='Last 3 Months'?d>=threeMonthsAgo:filters.date==='Year to Date'?d>=yearStart:true;return dateOk&&search&&(filters.unit==='All'||p.businessUnit===filters.unit)&&(filters.projectStatus==='All'||p.projectStatus===filters.projectStatus)&&(filters.quality==='All'||p.status===filters.quality)&&(!filters.openNcr||p.openNcr>0)&&chartOk}),[all,filters,chartFilter])
  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{let av=a[sort.key],bv=b[sort.key];if(av==null)av=Infinity;if(bv==null)bv=Infinity;return(typeof av==='string'?av.localeCompare(bv):av-bv)*(sort.dir==='asc'?1:-1)}),[filtered,sort])
  const visible=sorted.slice((page-1)*pageSize,page*pageSize),included=filtered.filter(p=>p.qhi!=null),qhi=average(included.map(p=>p.qhi))
  const units=useMemo(()=>[...new Set(all.map(p=>p.businessUnit))],[all])
  const unitData=units.map(unit=>{const rows=filtered.filter(p=>p.businessUnit===unit);return{unit,total:rows.length,...Object.fromEntries(statuses.map(s=>[s,rows.filter(p=>p.status===s).length]))}}).filter(x=>x.total)
  const statusData=statuses.map(name=>({name,value:filtered.filter(p=>p.status===name).length})).filter(x=>x.value)
  const attention=[...filtered].filter(p=>p.status!=='On Track').sort((a,b)=>(b.openNcrCritical-a.openNcrCritical)||(Number(b.unresolvedCriticalTest)-Number(a.unresolvedCriticalTest))||(a.qhi??999)-(b.qhi??999)).slice(0,6)
  const setFilter=(key,value)=>{setFilters(f=>({...f,[key]:value}));setPage(1)},clearFilters=()=>{setFilters({date:'Year to Date',unit:'All',projectStatus:'All',quality:'All',search:'',openNcr:false});setChartFilter(null);setPage(1)}
  const applySort=(key,dir,id=key)=>{setSort({key,dir});setFocus(id);setPage(1)},headerSort=key=>setSort(s=>({key,dir:s.key===key&&s.dir==='asc'?'desc':'asc'})),chartSelect=next=>setChartFilter(c=>JSON.stringify(c)===JSON.stringify(next)?null:next)
  const chips=[filters.unit!=='All'&&['unit',filters.unit],filters.projectStatus!=='All'&&['projectStatus',filters.projectStatus],filters.quality!=='All'&&['quality',filters.quality],filters.search&&['search',`Search: ${filters.search}`],filters.openNcr&&['openNcr','Open NCR only'],chartFilter&&['chart','Chart selection']].filter(Boolean)
  const exportData=type=>{const rows=sorted.map(p=>({Project_ID:p.id,Project:p.name,Business_Unit:p.businessUnit,Location:p.location,Project_Status:p.projectStatus,Progress:p.scurveProgressPercent,QHI:p.qhi,Quality_Status:p.status,Inspection_Pass_Rate:p.inspectionPassRate,Open_NCR:p.openNcr,Rework_Percent:p.reworkPercent,Punch_Remaining:p.punchRemaining,Client_Satisfaction:p.clientSatisfactionScore,Last_Updated:p.lastUpdated})),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Export timestamp',new Date().toISOString()],['Applied filters',chips.map(c=>c[1]).join('; ')||'None'],['Sort order',`${sort.key} ${sort.dir}`],['Portfolio QHI',qhi?.toFixed(1)??'Insufficient Data']]),'Summary');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Projects');if(type==='csv')XLSX.writeFile({SheetNames:['Projects'],Sheets:{Projects:XLSX.utils.json_to_sheet(rows)}},'quality-portfolio-view.csv',{bookType:'csv'});else XLSX.writeFile(wb,'quality-portfolio-view.xlsx');setExportOpen(false);setToast(`${type.toUpperCase()} export created`)}
  const refresh=()=>{setLoading(true);setTimeout(()=>{setUpdated(new Date());setLoading(false);setToast('Quality data updated')},700)}
  const ctx={navigate,projects,setProjects,filters,setFilter,chartFilter,setChartFilter,sort,setSort,focus,setFocus,page,setPage,pageSize,setPageSize,loading,setLoading,toast,setToast,importOpen,setImportOpen,exportOpen,setExportOpen,updated,all,filtered,sorted,visible,included,qhi,units,unitData,statusData,attention,clearFilters,applySort,headerSort,chartSelect,chips,exportData,refresh}
  return <Dashboard ctx={ctx}/>
}

function Dashboard({ctx:c}){
  const finishImport=rows=>{
    c.setProjects(current=>[...current.filter(p=>!rows.some(r=>r.id===p.id)),...rows])
    c.setImportOpen(false)
    c.setToast(rows.length+' valid project records imported')
  }
  return <div className="app">
    <header className="app-header">
      <div className="title-lockup"><span className="logo-mark"><HardHat/></span><div><h1>Project Quality Overview</h1><p>Quality status across all projects</p></div></div>
      <div className="header-actions"><span className="updated">Last updated <strong>{c.updated.toLocaleString()}</strong></span><button className="button secondary" onClick={c.refresh} disabled={c.loading}><RefreshCw className={c.loading?'spin':''}/>{c.loading?'Refreshing':'Refresh'}</button><button className="button primary" onClick={()=>c.setImportOpen(true)}><Upload/>Import Data</button><div className="export-wrap"><button className="button secondary" onClick={()=>c.setExportOpen(v=>!v)}><Download/>Export View</button>{c.exportOpen&&<div className="export-menu"><button onClick={()=>c.exportData('xlsx')}>Excel workbook</button><button onClick={()=>c.exportData('csv')}>CSV file</button></div>}</div></div>
    </header>
    <DashboardBody c={c}/>
    {c.importOpen&&<ImportModal onClose={()=>c.setImportOpen(false)} onImport={finishImport}/>}<Toast message={c.toast}/>
  </div>
}
function DashboardBody({c}){
  const completed=c.filtered.reduce((s,p)=>s+(p.completedInspectionPoints||0),0)
  const passed=c.filtered.reduce((s,p)=>s+(p.passedInspectionPoints||0),0)
  const actual=c.filtered.reduce((s,p)=>s+p.actualConstructionCostThb,0)
  const rework=c.filtered.reduce((s,p)=>s+p.reworkCostThb,0)
  return <main>
    <section className="filterbar" aria-label="Portfolio filters">
      <Filter label="Date range" value={c.filters.date} onChange={v=>c.setFilter('date',v)} options={['Custom Range','This Month','Last Month','Last 3 Months','Year to Date']}/>
      <Filter label="Business unit" value={c.filters.unit} onChange={v=>c.setFilter('unit',v)} options={['All',...c.units]}/>
      <Filter label="Project status" value={c.filters.projectStatus} onChange={v=>c.setFilter('projectStatus',v)} options={['All','Planning','Active','On Hold','Closing','Completed']}/>
      <Filter label="Quality status" value={c.filters.quality} onChange={v=>c.setFilter('quality',v)} options={['All',...statuses]}/>
      <label className="search-field">Search<span><Search/><input value={c.filters.search} onChange={e=>c.setFilter('search',e.target.value)} placeholder="Project, ID, location or team"/></span></label>
      <button className="clear-button" onClick={c.clearFilters}><FilterX/>Clear filters</button>
    </section>
    {c.chips.length>0&&<div className="chips">{c.chips.map(([key,label])=><button key={key} onClick={()=>key==='chart'?c.setChartFilter(null):c.setFilter(key,key==='openNcr'?false:'All')}>{label}<X/></button>)}</div>}
    <section className="kpi-grid" aria-label="Portfolio KPIs">
      <Kpi active={c.focus==='qhi'} title="Portfolio QHI" value={c.qhi?.toFixed(1)??'-'} status={c.qhi==null?'Insufficient Data':c.qhi>=85?'On Track':c.qhi>=70?'Needs Attention':'Action Required'} detail={c.included.length+' included / '+(c.filtered.length-c.included.length)+' excluded'} change="+1.8 vs previous period" onClick={()=>c.applySort('qhi','asc','qhi')} gauge={c.qhi}/>
      <Kpi active={c.focus==='total'} title="Total Projects" value={c.filtered.length} detail={c.filtered.filter(p=>p.projectStatus==='Active').length+' active / '+c.filtered.filter(p=>p.projectStatus==='Completed').length+' completed'} change={c.filtered.filter(p=>p.qhi==null).length+' insufficient data'} onClick={()=>c.applySort('name','asc','total')}/>
      <Kpi active={c.focus==='pass'} title="Inspection Pass Rate" value={(pct(passed,completed)?.toFixed(1)??'-')+'%'} detail={passed.toLocaleString()+' passed / '+completed.toLocaleString()+' completed'} change="+0.9% vs previous" help="Inspection points passed during the selected reporting period." onClick={()=>c.applySort('inspectionPassRate','asc','pass')}/>
      <Kpi active={c.focus==='ncr'} title="Open NCR" value={c.filtered.reduce((s,p)=>s+p.openNcr,0)} detail={c.filtered.reduce((s,p)=>s+p.overdueNcr,0)+' overdue / '+c.filtered.reduce((s,p)=>s+p.openNcrCritical,0)+' critical'} change="-3 vs previous" onClick={()=>c.applySort('openNcr','desc','ncr')} action={<button onClick={e=>{e.stopPropagation();c.setFilter('openNcr',!c.filters.openNcr)}}>{c.filters.openNcr?'Show all':'Open NCR only'}</button>}/>
      <Kpi active={c.focus==='rework'} title="Rework Cost" value={money(rework)} detail={(pct(rework,actual)?.toFixed(2)??'-')+'% of actual cost'} change="+0.12% vs previous" onClick={()=>c.applySort('reworkPercent','desc','rework')}/>
      <Kpi active={c.focus==='punch'} title="Punch List Remaining" value={c.filtered.reduce((s,p)=>s+p.punchRemaining,0)} detail={c.filtered.reduce((s,p)=>s+p.punchListOverdue,0)+' overdue items'} change="-18 vs previous" onClick={()=>c.applySort('punchRemaining','desc','punch')}/>
      <Kpi active={c.focus==='sat'} title="Client Satisfaction" value={average(c.filtered.filter(p=>p.clientSatisfactionRecorded).map(p=>p.clientSatisfactionScore))?.toFixed(1)??'-'} detail={c.filtered.filter(p=>p.clientSatisfactionRecorded).length+' evaluated / '+c.filtered.filter(p=>!p.clientSatisfactionRecorded).length+' not evaluated'} change="+0.2 vs previous" onClick={()=>c.applySort('clientSatisfactionScore','asc','sat')}/>
    </section>
    <div className="focus-row">{c.focus&&<><span>{c.focus==='qhi'?'Projects sorted by lowest QHI':'KPI focus: '+c.focus}</span><button onClick={()=>{c.setFocus(null);c.setSort({key:'name',dir:'asc'})}}>Clear KPI Focus</button></>}</div>
    <Analysis unitData={c.unitData} statusData={c.statusData} filtered={c.filtered} attention={c.attention} chartFilter={c.chartFilter} chartSelect={c.chartSelect} navigate={c.navigate}/>
    <ProjectTable {...c}/>
    <div className="data-controls"><button onClick={()=>{if(confirm('Restore the original 12-project demo dataset?')){c.setProjects(demoProjects);c.setToast('Demo data restored')}}}>Restore Demo Data</button><button className="danger-text" onClick={()=>{if(confirm('Clear all project data from this browser?')){c.setProjects([]);c.setToast('Browser project data cleared')}}}>Clear Imported Data</button></div>
  </main>
}
function Filter({label,value,onChange,options}){return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label>}
function Kpi({title,value,detail,change,status,active,onClick,gauge,help,action}){return <button className={'kpi '+(active?'active':'')} onClick={onClick} aria-pressed={active}><div className="kpi-head"><span>{title}{help&&<Info title={help}/>}</span>{status&&<Badge status={status}/>}</div><strong className="kpi-value">{value}</strong>{gauge!=null&&<span className="gauge"><i style={{width:gauge+'%',background:COLORS[status]}}/></span>}<small>{detail}</small><span className="change">{change}</span>{action&&<span className="kpi-action">{action}</span>}</button>}

function Analysis({unitData,statusData,filtered,attention,chartFilter,chartSelect,navigate}){
  return <section className="analysis-grid">
    <article className="panel"><PanelHead title="Projects by Business Unit" subtitle="Quality status mix across the filtered portfolio"/><div className="chart-box"><ResponsiveContainer width="100%" height={260}><BarChart data={unitData} layout="vertical" margin={{left:18,right:24}}><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="unit" width={126} tick={{fontSize:12}}/><ChartTooltip/>{statuses.map(s=><Bar key={s} dataKey={s} stackId="a" fill={COLORS[s]} onClick={d=>chartSelect({unit:d.unit,status:s})} cursor="pointer"/>)}</BarChart></ResponsiveContainer></div><Legend onSelect={s=>chartSelect({status:s})} selected={chartFilter?.status}/></article>
    <article className="panel"><PanelHead title="Quality Status Distribution" subtitle="Counts match the current project table"/><div className="donut-wrap"><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={94} paddingAngle={2} onClick={d=>chartSelect({status:d.name})}>{statusData.map(x=><Cell key={x.name} fill={COLORS[x.name]}/>)}</Pie><ChartTooltip/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{filtered.length}</strong><span>projects</span></div></div><Legend data={statusData} onSelect={s=>chartSelect({status:s})} selected={chartFilter?.status}/></article>
    <article className="panel attention"><PanelHead title="Projects Requiring Attention" subtitle="Ranked by criticality and overdue conditions"/>{attention.length?<div className="attention-list">{attention.map((p,i)=><button key={p.id} onClick={()=>navigate('/projects/'+p.id+'/quality')}><span className="rank">{i+1}</span><span><strong>{p.name}</strong><small>{p.id+' / '+p.reason+(p.overdueNcr?' / '+p.overdueNcr+' overdue':'')}</small></span><span className="attention-score">{p.qhi??'-'}<Badge status={p.status} title={p.override||p.reason}/></span><ChevronRight/></button>)}</div>:<Empty text="No projects require attention in this view."/>}</article>
  </section>
}
function PanelHead({title,subtitle}){return <div className="panel-head"><h2>{title}</h2><p>{subtitle}</p></div>}
function Legend({data=statuses.map(name=>({name})),onSelect,selected}){return <div className="legend">{data.map(x=><button key={x.name} className={selected===x.name?'selected':''} onClick={()=>onSelect(x.name)}><i style={{background:COLORS[x.name]}}/>{x.name}{x.value!=null&&<strong>{x.value}</strong>}</button>)}</div>}
function Empty({text,action,onClick}){return <div className="empty"><CircleAlert/><strong>{text}</strong>{action&&<button onClick={onClick}>{action}</button>}</div>}

function ProjectTable({loading,filtered,visible,sort,headerSort,navigate,clearFilters,page,setPage,pageSize,setPageSize}){
  return <section className="panel table-panel"><div className="table-title"><div><h2>Project Quality Summary</h2><p>{filtered.length} visible projects / All values use the shared filtered dataset</p></div><span className="browser-note"><Info/>Prototype data is stored in this browser</span></div>
  {loading?<Skeleton/>:filtered.length===0?<Empty text="No projects match the current filters." action="Clear filters" onClick={clearFilters}/>:<>
    <div className="table-scroll"><table><thead><tr><SortTh label="Project" field="name" sort={sort} onSort={headerSort}/><th>Business Unit</th><th>Location</th><th>Project Type</th><SortTh label="Progress" field="scurveProgressPercent" sort={sort} onSort={headerSort}/><SortTh label="QHI" field="qhi" sort={sort} onSort={headerSort}/><SortTh label="Inspection Pass" field="inspectionPassRate" sort={sort} onSort={headerSort}/><SortTh label="Open NCR" field="openNcr" sort={sort} onSort={headerSort}/><SortTh label="Rework Cost" field="reworkPercent" sort={sort} onSort={headerSort}/><SortTh label="Punch Remaining" field="punchRemaining" sort={sort} onSort={headerSort}/><SortTh label="Client Score" field="clientSatisfactionScore" sort={sort} onSort={headerSort}/><th>30-Day QHI Trend</th><th>Quality Status</th><SortTh label="Last Updated" field="lastUpdated" sort={sort} onSort={headerSort}/><th>Action</th></tr></thead>
    <tbody>{visible.map(p=><tr key={p.id} tabIndex="0" onClick={()=>navigate('/projects/'+p.id+'/quality')} onKeyDown={e=>{if(e.key==='Enter')navigate('/projects/'+p.id+'/quality')}}><td><strong>{p.name}</strong><small>{p.id}</small></td><td>{p.businessUnit}</td><td>{p.location}</td><td>{p.projectType}</td><td><span className="progress-label">{p.scurveProgressPercent}%</span><span className="progress"><i style={{width:p.scurveProgressPercent+'%'}}/></span></td><td><strong>{p.qhi??'-'}</strong><small>{p.qhi==null?'Excluded from portfolio QHI':''}</small></td><td>{p.inspectionPassRate?.toFixed(1)??'-'}%</td><td><strong>{p.openNcr}</strong><small>{p.overdueNcr} overdue / {p.openNcrCritical} critical</small></td><td><strong>{p.reworkPercent?.toFixed(2)??'-'}%</strong><small>{money(p.reworkCostThb)}</small></td><td>{p.punchRemaining}<small>{p.punchListOverdue} overdue</small></td><td>{p.clientSatisfactionScore?.toFixed(1)??'Not recorded'}</td><td><Spark data={p.trend}/></td><td><Badge status={p.status} title={p.override||p.reason}/></td><td>{new Date(p.lastUpdated).toLocaleDateString()}</td><td><Link className="view-link" to={'/projects/'+p.id+'/quality'} onClick={e=>e.stopPropagation()}>View Project</Link></td></tr>)}</tbody></table></div>
    <div className="pagination"><label>Rows per page<select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}>{[10,25,50].map(n=><option key={n}>{n}</option>)}</select></label><span>{(page-1)*pageSize+1}-{Math.min(page*pageSize,filtered.length)} of {filtered.length}</span><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><button disabled={page>=Math.ceil(filtered.length/pageSize)} onClick={()=>setPage(p=>p+1)}>Next</button></div>
  </>}</section>
}
function SortTh({label,field,sort,onSort}){return <th><button onClick={()=>onSort(field)}>{label}{sort.key===field&&(sort.dir==='asc'?<ArrowUp/>:<ArrowDown/>)}</button></th>}
function Spark({data}){return <div className="spark"><ResponsiveContainer width="100%" height={34}><LineChart data={data.map((v,i)=>({i,v}))}><Line type="monotone" dataKey="v" stroke="#1769C2" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>}
function Skeleton(){return <div className="skeleton" aria-label="Loading project quality data">{[1,2,3,4,5].map(x=><i key={x}/>)}</div>}

function ImportModal({onClose,onImport}){
  const input=useRef(),[workbook,setWorkbook]=useState(null),[sheet,setSheet]=useState(''),[rows,setRows]=useState([]),[error,setError]=useState(''),[mappings,setMappings]=useState({})
  const parseSheet=(wb,name)=>{setRows(XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:''}));setSheet(name)}
  const openFile=async file=>{setError('');try{const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});setWorkbook(wb);parseSheet(wb,wb.SheetNames[0])}catch{setError('The selected workbook could not be read. Check the file format and try again.')}}
  const headers=rows[0]?Object.keys(rows[0]):[],missingColumns=requiredFields.filter(f=>!headers.includes(f)),mappedMissing=missingColumns.filter(f=>!mappings[f])
  const validation=rows.map((source,index)=>{const r={...source};Object.entries(mappings).forEach(([target,origin])=>{if(origin)r[target]=source[origin]});const errors=[],warnings=[];if(!r.project_id)errors.push('Missing project ID');if(r.project_id&&rows.filter(x=>(x.project_id||x[mappings.project_id])===r.project_id).length>1)errors.push('Duplicate project ID');if(!['Planning','Active','On Hold','Closing','Completed'].includes(r.project_status))errors.push('Invalid project status');if(toNum(r.scurve_progress_percent)<0||toNum(r.scurve_progress_percent)>100)errors.push('Progress outside 0-100');if(toNum(r.rework_cost_thb)<0||toNum(r.actual_construction_cost_thb)<0)errors.push('Negative cost');if(r.client_satisfaction_score!==''&&(toNum(r.client_satisfaction_score)<0||toNum(r.client_satisfaction_score)>5))errors.push('Client score outside 0-5');if(toNum(r.passed_inspection_points)>toNum(r.completed_inspection_points))errors.push('Passed inspections exceed completed');if(toNum(r.first_pass_inspection_points)>toNum(r.completed_inspection_points))errors.push('First-pass inspections exceed completed');if(toNum(r.inspections_within_sla)>toNum(r.completed_inspection_points))errors.push('SLA inspections exceed completed');if(toNum(r.material_approval_approved)>toNum(r.material_approval_total))errors.push('Approved materials exceed total');if(toNum(r.incoming_material_accepted)>toNum(r.incoming_material_inspected))errors.push('Accepted materials exceed inspected');if(toNum(r.required_tests_passed)>toNum(r.required_tests_completed))errors.push('Passed tests exceed completed');if(toNum(r.punch_list_closed)>toNum(r.punch_list_total))errors.push('Closed punch items exceed total');if(!r.completed_inspection_points||!r.actual_construction_cost_thb||!r.required_tests_completed)warnings.push('Missing mandatory QHI input');if(r.reporting_date&&Number.isNaN(Date.parse(r.reporting_date)))errors.push('Invalid reporting date');return{row:index+2,data:r,errors,warnings}})
  const valid=validation.filter(x=>!x.errors.length),warnings=validation.filter(x=>x.warnings.length&&!x.errors.length),errors=validation.filter(x=>x.errors.length)
  const normalize=r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k==='project_id'?'id':k==='project_name'?'name':camel(k),typeof v==='string'&&v.trim()!==''&&!Number.isNaN(Number(v))?Number(v):v]))
  const template=()=>{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([requiredFields]),'Project Quality Data');XLSX.writeFile(wb,'project-quality-import-template.xlsx')}
  const downloadErrors=()=>{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(errors.map(x=>({row:x.row,project_id:x.data.project_id,errors:x.errors.join('; ')}))),'Validation Errors');XLSX.writeFile(wb,'quality-import-errors.xlsx')}
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="import-title"><button className="modal-scrim" onClick={onClose} aria-label="Close import dialog"/><section className="modal"><header><div><h2 id="import-title">Import Project Quality Data</h2><p>Validate Excel or CSV records before saving them in this browser.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X/></button></header><div className="modal-body"><div className="import-toolbar"><button className="button secondary" onClick={template}><Download/>Download Template</button><span>.xlsx, .xls and .csv supported</span></div><button className="dropzone" onClick={()=>input.current.click()} onDrop={e=>{e.preventDefault();openFile(e.dataTransfer.files[0])}} onDragOver={e=>e.preventDefault()}><FileSpreadsheet/><strong>Drop a workbook here or choose a file</strong><span>Prototype data remains on this device.</span></button><input ref={input} hidden type="file" accept=".xlsx,.xls,.csv" onChange={e=>openFile(e.target.files[0])}/>{error&&<div className="error"><AlertTriangle/>{error}</div>}
  {workbook&&<><label className="sheet-select">Workbook sheet<select value={sheet} onChange={e=>parseSheet(workbook,e.target.value)}>{workbook.SheetNames.map(n=><option key={n}>{n}</option>)}</select></label>{missingColumns.length>0&&<div className="error"><AlertTriangle/><span><strong>{mappedMissing.length} required columns still need mapping.</strong><small>Choose the matching source column for each required field below.</small></span></div>}<ColumnMapper fields={missingColumns} headers={headers} mappings={mappings} setMappings={setMappings}/><div className="validation"><div><strong>{valid.length}</strong><span>Valid rows</span></div><div className="warning"><strong>{warnings.length}</strong><span>Warning rows</span></div><div className="bad"><strong>{errors.length}</strong><span>Error rows</span></div></div><div className="preview"><table><thead><tr><th>Row</th><th>Project ID</th><th>Project name</th><th>Result</th></tr></thead><tbody>{validation.slice(0,8).map(x=><tr key={x.row}><td>{x.row}</td><td>{x.data.project_id||'-'}</td><td>{x.data.project_name||'-'}</td><td className={x.errors.length?'bad-text':x.warnings.length?'warn-text':'ok-text'}>{x.errors.join('; ')||x.warnings.join('; ')||'Valid'}</td></tr>)}</tbody></table></div>{errors.length>0&&<button className="text-action" onClick={downloadErrors}>Download validation errors</button>}</>}</div><footer><button className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={!valid.length||mappedMissing.length>0} onClick={()=>onImport(valid.map(x=>normalize(x.data)))}>Import {valid.length} Valid Rows</button></footer></section></div>
}

function ProjectDetail(){const {projectId}=useParams();let list;try{list=JSON.parse(localStorage.getItem(STORE))||demoProjects}catch{list=demoProjects}const p=enrich(list.find(x=>x.id===projectId)||demoProjects.find(x=>x.id===projectId)||demoProjects[0]);return <div className="detail-page"><header><Link to="/" className="back"><ArrowLeft/>Back to Overview</Link></header><main><div className="detail-heading"><span className="logo-mark"><Building2/></span><div><p>{p.id}</p><h1>{p.name}</h1><span>{p.location} / {p.businessUnit}</span></div><Badge status={p.status} title={p.override||p.reason}/></div><section className="detail-grid"><dl><div><dt>Project ID</dt><dd>{p.id}</dd></div><div><dt>Location</dt><dd>{p.location}</dd></div><div><dt>Business unit</dt><dd>{p.businessUnit}</dd></div><div><dt>Project status</dt><dd>{p.projectStatus}</dd></div><div><dt>Current QHI</dt><dd>{p.qhi??'Insufficient Data'}</dd></div></dl><div className="coming"><HardHat/><h2>Project Quality Detail - Coming Next</h2><p>The complete single-project QA/QC dashboard is outside this prototype scope.</p><Link className="button primary" to="/">Back to Overview</Link></div></section></main></div>}

function ColumnMapper({fields,headers,mappings,setMappings}){if(!fields.length)return null;return <div className="mapping"><strong>Column mapping</strong><div>{fields.map(field=><label key={field}><span>{field}</span><select value={mappings[field]||''} onChange={e=>setMappings(current=>({...current,[field]:e.target.value}))}><option value="">Select source column</option>{headers.map(header=><option key={header} value={header}>{header}</option>)}</select></label>)}</div></div>}
