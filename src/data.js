export const projects = [
  { id: 'EPS-STS-SG', name: 'Separate Grinding, STS', short: 'Separate Grinding, STS', location: 'Saraburi', status: 'at-risk', progress: 62.3, plan: 67, issues: 4, template: 'EPS Standard', x: 59, y: 46 },
  { id: 'EPS-SLP-SOLAR', name: 'SLP Solar Roof 0.97 MWp', short: 'SLP Solar Roof 0.97 MWp', location: 'Lampang', status: 'on-plan', progress: 48.1, plan: 49, issues: 1, template: 'EPS Standard', x: 50, y: 26 },
  { id: 'EPS-SWCC-SOLAR', name: 'SF SWCC 4.027 MWp', short: 'SF SWCC 4.027 MWp', location: 'Chonburi', status: 'at-risk', progress: 36.8, plan: 42, issues: 3, template: 'Solar + PR/PO', x: 69, y: 59 },
  { id: 'EPS-MIC-BOILER', name: 'Michelin Boiler', short: 'Michelin Boiler', location: 'Rayong', status: 'on-plan', progress: 54.6, plan: 56, issues: 2, template: 'Michelin P/F/A', x: 72, y: 65 },
  { id: 'EPS-STS-BIO', name: 'STS Biomass Power Plant', short: 'STS Biomass Power Plant', location: 'Saraburi', status: 'delayed', progress: 71.4, plan: 79, issues: 5, template: 'EPS Standard', x: 57, y: 43 },
  { id: 'EPS-SKK5-COOL', name: 'SKK5 Cooler Modification', short: 'SKK5 Cooler Modification', location: 'Saraburi', status: 'finished', progress: 100, plan: 100, issues: 0, template: 'EPS Standard', x: 62, y: 42 },
]

export const activities = [
  { id: 'A-04120', activity: 'Procurement & M/C Delivery', wbs: '2.4.1', previous: 48, submitted: 62, evidence: 12, owner: 'P. Chai', status: 'Pending review', age: '4 days' },
  { id: 'A-04130', activity: 'Basic Engineering', wbs: '2.3.1', previous: 90, submitted: 100, evidence: 8, owner: 'E. Eng', status: 'Pending review', age: '2 days' },
  { id: 'A-04150', activity: 'Site Mobilization', wbs: '1.2.1', previous: 100, submitted: 100, evidence: 10, owner: 'S. Manee', status: 'Approved', age: 'Today' },
  { id: 'A-04210', activity: 'Structure Installation', wbs: '3.1.1', previous: 35, submitted: 45, evidence: 18, owner: 'S. Chai', status: 'Returned', age: '1 day' },
  { id: 'A-04220', activity: 'Equipment Installation', wbs: '3.2.1', previous: 12, submitted: 18, evidence: 9, owner: 'M. Chai', status: 'Pending review', age: '5 days' },
]

export const initialIssues = [
  { id: 'SI-0241', type: 'Drawing mismatch', title: 'Rev.03 used at Grid C12–C15', severity: 'Critical', pending: 'S. Rungrot · Site', age: 5, due: '04 Oct 2025', activity: 'A-04210', revision: 'Rev.04 pending acknowledgement', status: 'Engineering review' },
  { id: 'NCR-0088', type: 'Installation defect', title: 'Equipment base alignment outside tolerance', severity: 'Major', pending: 'S. Chai · Contractor', age: 2, due: '03 Oct 2025', activity: 'A-04220', revision: 'Rev.02 acknowledged', status: 'Rectification' },
  { id: 'SI-0236', type: 'Requirement change', title: 'Access platform width adjustment', severity: 'Minor', pending: 'E. Eng · Engineering', age: 1, due: '05 Oct 2025', activity: 'A-04130', revision: 'Rev.04 acknowledged', status: 'Technical decision' },
]

export const revisions = [
  { revision: 'Rev.04', date: '30 Sep 2025', status: 'Latest For Construction', pending: 'S. Chai · Contractor', acknowledged: '12 / 18', activity: 'A-04210' },
  { revision: 'Rev.03', date: '27 Sep 2025', status: 'Superseded', pending: '—', acknowledged: '18 / 18', activity: 'A-04210' },
  { revision: 'Rev.02', date: '20 Sep 2025', status: 'For Review', pending: 'E. Eng · Engineering', acknowledged: '16 / 18', activity: 'A-04130' },
]

export const attention = [
  { icon: 'warning', title: 'Procurement & M/C Delivery', meta: 'P. Chai · WBS 2.4.1', age: 'Pending 4 days', deadline: 'Decision by 04 Oct 2025' },
  { icon: 'critical', title: 'SI-0241 · Drawing mismatch', meta: 'S. Rungrot · WBS 3.1.1', age: 'Pending 5 days', deadline: 'Decision by 02 Oct 2025' },
  { icon: 'warning', title: 'Installation quality hold', meta: 'S. Chai · WBS 3.2.1', age: 'Pending 3 days', deadline: 'Decision by 03 Oct 2025' },
  { icon: 'info', title: 'Drawing revision awaiting acknowledgement', meta: 'ME-RM4-0201 · Rev.04', age: 'Pending 2 days', deadline: 'Decision by 05 Oct 2025' },
]
