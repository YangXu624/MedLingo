import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSession,assess,invalidate,allVerified,canShare,summary} from '../src/teachback.ts';
import {buildCards,cards} from '../src/cards.ts';
import {defaultPlan,validPlan} from '../src/plan.ts';
test('exact five-module scenario keeps incorrect response and explicit reassessment',()=>{
 let s=freshSession();s.results['lim-interval'].response='两种眼药水，我一起滴就可以了，对吗？';
 s=assess(s,'lim-interval','reteach');assert.equal(s.results['lim-interval'].status,'reteach');
 s.results['lim-interval'].response='先滴抗生素，等五分钟，再滴类固醇。';s=assess(s,'lim-interval','verified');
 assert.equal(s.results['lim-interval'].history.length,2);assert.match(s.results['lim-interval'].history[0].response,/一起/);
 assert.equal(allVerified(s),false);assert.match(summary(s,cards).priority,/5-minute/);
});
test('handover requires all five, consent, recipient and review; deleted topics block it',()=>{
 let s=freshSession();for(const c of cards)s=assess(s,c.id,'verified');
 assert.equal(allVerified(s),true);assert.equal(canShare(s),false);
 Object.assign(s,{consent:true,recipient:'Authorised supporter',reviewed:true});assert.equal(canShare(s),true);
 assert.equal(canShare(s,{'lim-technique':{deleted:true}}),false);
 s.consent=false;assert.equal(canShare(s),false);
});
test('edited plan changes clock wording, interval and handover together',()=>{
 let s=freshSession();s.plan={...s.plan,times:['09:00','14:00','19:00','23:00'],intervalMinutes:10};
 const current=buildCards(s.plan);assert.match(current[0].zh.detail,/早上九点/);assert.match(current[1].en.detail,/10 minutes/);
 assert.match(current[1].zh.detail,/十分钟/);assert.equal(summary(s,current).instructions[1].english,current[1].en.detail);
 for(const c of current)s=assess(s,c.id,'verified');s.reviewed=true;s.finalized=true;
 s=invalidate(s);assert.equal(allVerified(s),false);assert.equal(s.finalized,false);assert.equal(s.reviewed,false);
});
test('summary uses edited precautions and excludes raw responses',()=>{
 const s=freshSession();s.results['lim-technique'].response='Private nurse observation';
 const data=summary(s,cards,{'lim-protection':{wording:{en:{detail:'Reviewed personalised precautions'}}}});
 assert.equal(data.instructions[3].english,'Reviewed personalised precautions');assert.equal(JSON.stringify(data).includes('Private nurse observation'),false);
 assert.equal(JSON.parse(JSON.stringify(s)).results['lim-technique'].response,s.results['lim-technique'].response);
});
test('invalid and duplicate times cannot be verified for sharing',()=>{
 assert.equal(validPlan(defaultPlan),true);assert.equal(validPlan({...defaultPlan,times:['08:00','08:00','18:00','22:00']}),false);
 assert.equal(validPlan({...defaultPlan,intervalMinutes:0}),false);
});
