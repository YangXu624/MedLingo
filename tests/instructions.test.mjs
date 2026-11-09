import test from 'node:test';
import assert from 'node:assert/strict';
import {instructionCopy} from '../src/instructions.ts';
import {cards} from '../src/cards.ts';
import {phraseMatch} from '../src/speech.ts';
test('saved edits replace wording without changing other languages',()=>{
 const asset=JSON.parse(JSON.stringify({wording:{en:{title:'New heading',detail:'New description'}}}));
 assert.deepEqual(instructionCopy(cards[0],'en',asset),{title:'New heading',detail:'New description'});
 assert.deepEqual(instructionCopy(cards[0],'zh',asset),cards[0].zh);
});
test('deleted descriptions stay empty after persistence and restore returns the original',()=>{
 const asset=JSON.parse(JSON.stringify({wording:{zh:{detail:''}}}));
 assert.equal(instructionCopy(cards[0],'zh',asset).detail,'');
 delete asset.wording.zh;
 assert.deepEqual(instructionCopy(cards[0],'zh',asset),cards[0].zh);
});
test('legacy Hokkien wording survives; empty overrides do not fall back',()=>{
 const asset={hokkienTitle:'Existing heading',hokkienDetail:'Existing description',wording:{nan:{detail:''}}};
 assert.deepEqual(instructionCopy(cards[0],'nan',asset),{title:'Existing heading',detail:''});
});
test('edited instructions cannot use stale prepared translation pairs',()=>{
 assert.equal(phraseMatch(cards[0].en.title,'zh','en',[cards[0].id]),null);
});
