import {cards,type Card} from './cards.ts';
import {defaultPlan,validPlan,type CarePlan} from './plan.ts';
import {instructionCopy,type InstructionAsset} from './instructions.ts';
export type Status='pending'|'reteach'|'verified';
export type Observation={status:Exclude<Status,'pending'>;response:string;at:string};
export type Result={status:Status;response:string;history:Observation[]};
export type Session={plan:CarePlan;results:Record<string,Result>;consent:boolean;recipient:string;reviewed:boolean;finalized:boolean};
export function freshSession():Session{return {plan:structuredClone(defaultPlan),results:Object.fromEntries(cards.map(c=>[c.id,{status:'pending',response:'',history:[]}])),consent:false,recipient:'',reviewed:false,finalized:false}}
export function invalidate(s:Session,ids=cards.map(c=>c.id)):Session{return {...s,reviewed:false,finalized:false,results:Object.fromEntries(Object.entries(s.results).map(([id,r])=>[id,ids.includes(id)?{...r,status:'pending'}:r]))}}
export function assess(s:Session,id:string,status:'verified'|'reteach'):Session{return {...s,reviewed:false,finalized:false,results:{...s.results,[id]:{...s.results[id],status,history:[...s.results[id].history,{status,response:s.results[id].response,at:new Date().toISOString()}]}}}}
export function allVerified(s:Session,assets:Record<string,InstructionAsset>={}){return validPlan(s.plan)&&cards.every(c=>!assets[c.id]?.deleted&&s.results[c.id]?.status==='verified')}
export function canShare(s:Session,assets:Record<string,InstructionAsset>={}){return allVerified(s,assets)&&s.consent&&s.recipient.trim().length>0&&s.reviewed}
export function summary(s:Session,currentCards:Card[],assets:Record<string,InstructionAsset>={}){
 const reteaching=currentCards.filter(c=>s.results[c.id].history.some(h=>h.status==='reteach'));
 const intervalReteach=reteaching.some(c=>c.id==='lim-interval');
 return {patient:s.plan.patient.preferredName,preferredLanguage:s.plan.patient.languages,recipient:s.recipient,
  instructions:currentCards.map(c=>({module:instructionCopy(c,'en',assets[c.id]).title,english:instructionCopy(c,'en',assets[c.id]).detail,mandarin:instructionCopy(c,'zh',assets[c.id]).detail})),scheduleNote:s.plan.scheduleNote,followup:s.plan.followup||'Confirm follow-up arrangements with the care team.',contact:s.plan.contact,
  verified:currentCards.filter(c=>s.results[c.id].status==='verified').map(c=>instructionCopy(c,'en',assets[c.id]).title),reteaching:reteaching.map(c=>instructionCopy(c,'en',assets[c.id]).title),
  priority:intervalReteach?`Uncle Lim initially needed re-teaching about the ${s.plan.intervalMinutes}-minute interval. Remind him to use ${s.plan.first.en.toLowerCase()} first, wait ${s.plan.intervalMinutes} minutes, then use ${s.plan.second.en.toLowerCase()}. Ask him to repeat the sequence during the first home visit.`:'Reinforce the reviewed instructions and help Uncle Lim follow his existing discharge plan.',
  scope:'Non-clinical support only: remind, reinforce and help contact the care team. Do not diagnose, change prescriptions or make independent medical decisions.'};
}
