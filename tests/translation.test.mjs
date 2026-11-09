import test from 'node:test';
import assert from 'node:assert/strict';
import {phraseMatch,matchingVoices,translationDirection,preferredVoice} from '../src/speech.ts';
import {cards,copyFor} from '../src/cards.ts';
test('prepared English phrases use the matching target copy',()=>{
 for(const card of cards)for(const lang of ['zh','ms']){
  assert.equal(phraseMatch(card.en.title,lang),card[lang].title);
  assert.equal(phraseMatch(card.en.detail,lang),card[lang].detail);
 }
});
test('negations and unknown wording never get a guessed prepared translation',()=>{
 assert.equal(phraseMatch('Rub your eye','zh'),null);
 assert.equal(phraseMatch('Do not take your medicine','zh'),null);
 assert.equal(phraseMatch('Correct eye-drop technique!','zh'),'正确滴眼药水的方法');
});
test('Hokkien never silently uses Mandarin translation or synthesis',()=>{
 assert.equal(phraseMatch('Do not rub your eye','nan'),null);
 const voices=[{lang:'zh-CN',name:'Mandarin'},{lang:'zh-HK',name:'Cantonese'},{lang:'en-US',name:'English'}];
 assert.deepEqual(matchingVoices(voices,'nan'),[]);
 assert.deepEqual(matchingVoices(voices,'zh'),[voices[0]]);
 assert.deepEqual(copyFor(cards[0],'nan'),cards[0].en);
});
test('voice selection requires the target language',()=>{
 const voices=[{lang:'en-US',name:'English'},{lang:'ms-MY',name:'Malay'},{lang:'zh-SG',name:'Mandarin'}];
 assert.deepEqual(matchingVoices(voices,'ms'),[voices[1]]);
 assert.deepEqual(matchingVoices(voices,'zh'),[voices[2]]);
});

test('reverse card phrases translate Mandarin and Malay back to English',()=>{
 for(const card of cards)for(const source of ['zh','ms']){
  assert.equal(phraseMatch(card[source].title,'en',source),card.en.title);
  assert.equal(phraseMatch(card[source].detail,'en',source),card.en.detail);
 }
 assert.equal(phraseMatch('正确滴眼药水的方法。','en','zh'),'Correct eye-drop technique');
 assert.equal(phraseMatch('揉眼睛','en','zh'),null);
 assert.equal(phraseMatch('anything','en','nan'),null);
});

test('direction chooses distinct models, recognition language and output language',()=>{
 assert.deepEqual(translationDirection('zh',false),{source:'en',target:'zh',key:'en:zh',recognitionLanguage:'en-SG'});
 assert.deepEqual(translationDirection('zh',true),{source:'zh',target:'en',key:'zh:en',recognitionLanguage:'zh-CN'});
 assert.equal(translationDirection('ms',true).recognitionLanguage,'ms-MY');
 assert.equal(translationDirection('ms',true).target,'en');
});

test('voice preference avoids character defaults, prefers enhanced and honours manual choice',()=>{
 const make=(name,uri=name)=>({name,voiceURI:uri,lang:'zh-CN',localService:true,default:false});
 const eddy=make('Eddy'),ting=make('Tingting'),enhanced=make('Tingting Enhanced');
 assert.equal(preferredVoice([eddy,ting],'zh'),ting);
 assert.equal(preferredVoice([eddy,ting,enhanced],'zh'),enhanced);
 assert.equal(preferredVoice([eddy,ting,enhanced],'zh',eddy.voiceURI),eddy);
 assert.equal(preferredVoice([eddy,ting],'en'),undefined);
});
