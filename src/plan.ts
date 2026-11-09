// Fictional, illustrative clinician-entered discharge plan supplied in the brief.
// These timings, order and medication classes are NOT a universal prescription.
export const defaultPlan={
 patient:{name:'Lim Hong Peng',preferredName:'Uncle Lim',age:78,languages:'Mandarin / Hokkien',english:'Limited',procedure:'Uncomplicated cataract surgery',caregiver:'Lives with wife · limited assistance'},
 times:['08:00','13:00','18:00','22:00'],intervalMinutes:5,
 first:{en:'Antibiotic eye drop',zh:'抗生素眼药水',ms:'Ubat titis mata antibiotik'},
 second:{en:'Steroid eye drop',zh:'类固醇眼药水',ms:'Ubat titis mata steroid'},
 scheduleNote:{en:'Your schedule changes in subsequent weeks. Follow the latest prescribed schedule.',zh:'之后几周的用药时间会改变。请按照最新的处方用药时间表使用。',ms:'Jadual berubah pada minggu berikutnya. Ikut jadual preskripsi terkini.'},
 followup:'',contact:'Use the treating hospital’s emergency instructions. Seek urgent medical attention for severe eye pain or sudden worsening of vision.',
};
export type CarePlan=typeof defaultPlan;
export function chineseNumber(n:number):string{const d=['零','一','二','三','四','五','六','七','八','九'];if(n<10)return d[n]||String(n);if(n<20)return '十'+(n%10?d[n%10]:'');if(n<100)return d[Math.floor(n/10)]+'十'+(n%10?d[n%10]:'');return String(n)}
export function timeLabel(value:string,language='en'){
 const [h,m]=value.split(':').map(Number);const hour=h%12||12;
 if(language==='zh')return (h<12?'早上':h<17?'下午':h<20?'傍晚':'晚上')+chineseNumber(hour)+'点'+(m?chineseNumber(m)+'分':'');
 return `${hour}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'am':'pm'}`;
}
export function validPlan(p:CarePlan){return p.times.length===4&&p.times.every(t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(t))&&new Set(p.times).size===4&&Number.isInteger(p.intervalMinutes)&&p.intervalMinutes>=1&&p.intervalMinutes<=60&&[p.first.en,p.first.zh,p.second.en,p.second.zh].every(v=>v.trim().length>0)}
