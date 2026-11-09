import {copyFor,type Card,type Copy,type Language} from './cards.ts';
export type InstructionAsset={mandarinAudio?:string;mandarinAudioText?:string;deleted?:boolean;image?:string;audio?:string;hokkienTitle?:string;hokkienDetail?:string;wording?:Partial<Record<Language,Partial<Copy>>>};
export function instructionCopy(card:Card,language:Language,asset?:InstructionAsset):Copy{
 const english={...card.en,...asset?.wording?.en};
 const base=language==='nan'?{
  title:asset?.hokkienTitle??english.title,
  detail:asset?.hokkienDetail??english.detail,
 }:copyFor(card,language);
 // Empty strings intentionally remove wording; only missing values fall back.
 return {...base,...asset?.wording?.[language]};
}
