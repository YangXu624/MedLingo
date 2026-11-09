import { cards, copyFor, type Language } from './cards.ts';
export type TranslatorInstance = {translate:(text:string)=>Promise<string>;destroy:()=>void};
type TranslatorAPI = {availability:(options:{sourceLanguage:string;targetLanguage:string})=>Promise<string>;create:(options:{sourceLanguage:string;targetLanguage:string;monitor?:(m:{addEventListener:(event:string,fn:(e:{loaded:number})=>void)=>void})=>void})=>Promise<TranslatorInstance>};
export type Recognition = {lang:string;continuous:boolean;interimResults:boolean;onstart:(()=>void)|null;onresult:((e:{results:ArrayLike<{isFinal:boolean;0:{transcript:string}}>})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
declare global {interface Window {Translator?:TranslatorAPI;SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition}}
export function translationDirection(selected:Language,reverse:boolean){
 const source:Language=reverse?selected:'en';
 const target:Language=reverse?'en':selected;
 return {source,target,key:`${source}:${target}`,recognitionLanguage:({en:'en-SG',zh:'zh-CN',ms:'ms-MY',nan:'nan'} as const)[source]};
}
export function phraseMatch(text:string,language:Language,source:Language='en',excludedIds:string[]=[]){
 const normal=(v:string)=>v.toLowerCase().replace(/[.,!?;:。！？；：]/g,'').replace(/\s+/g,' ').trim();
 if(language==='nan'||source==='nan')return null;
 for(const card of cards){if(excludedIds.includes(card.id))continue;const original=copyFor(card,source),c=copyFor(card,language);if(normal(text)===normal(original.title))return c.title;if(normal(text)===normal(original.detail))return c.detail;if(normal(text)===normal(original.title+' '+original.detail))return c.title+'. '+c.detail;}
 return null;
}
export function matchingVoices(voices:SpeechSynthesisVoice[],language:Language){
 return voices.filter(v=>{const l=v.lang.replace('_','-').toLowerCase();if(language==='nan')return false;if(language==='zh')return /^(zh($|-(cn|sg|tw|hans|hant))|cmn)/.test(l)&&!v.name.toLowerCase().includes('cantonese');return l===language||l.startsWith(language+'-')});
}

// Voice names are only a preference heuristic, not a quality guarantee.
// Preserve explicit choices; otherwise prefer full-quality local voices and
// conventional speech voices over compact/character variants.
export function preferredVoice(voices:SpeechSynthesisVoice[],language:Language,preferred=''){
 const candidates=matchingVoices(voices,language);
 const explicit=candidates.find(v=>v.voiceURI===preferred);
 if(explicit)return explicit;
 const score=(v:SpeechSynthesisVoice)=>{
  const name=(v.name+' '+v.voiceURI).toLowerCase();
  let value=v.localService?30:0;
  if(/premium|neural|natural/.test(name))value+=100;
  if(/enhanced/.test(name))value+=80;
  if(/ting.?ting|mei.?jia|yu.?shu|samantha|daniel|karen|moira|rishi|sangeeta/.test(name))value+=35;
  if(v.default)value+=10;
  if(/compact/.test(name))value-=15;
  if(/\b(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|bells|boing|bubbles|trinoids|zarvox)\b/.test(name))value-=100;
  return value;
 };
 return [...candidates].sort((a,b)=>score(b)-score(a))[0];
}
