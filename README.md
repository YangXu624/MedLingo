# MedLingo — Uncle Lim's personalised teach-back

The existing recovery board, visual style, editable cards and push-to-talk translator are retained. The instruction catalogue is now exactly five personalised modules for fictional patient Lim Hong Peng (Uncle Lim), 78. Mandarin/English is the primary teaching flow.

## Run

Node.js 22.18+ or 24+ recommended.

```sh
cd MedLingo
npm install
npm run dev
```

Open the Local URL printed by Vite. To build or check:

```sh
npm run build
npm test
npm run preview
```

All card content, vector illustrations and app assets are local. Browser speech/translation services may need internet or a first-use model download; no paid API key is required.

## Five modules

1. Week 1 eye-drop schedule: 8 am, 1 pm, 6 pm, 10 pm, with four illustrated clocks and a reminder to follow subsequent prescribed changes.
2. Eye-drop sequence: prescribed antibiotic first → wait five minutes → prescribed steroid, with distinct numbered bottles.
3. Correct eye-drop technique: clean hands and no tip contact, with an elderly patient illustration.
4. Eye protection: shield for sleep during the first week as directed, and no rubbing, with a ventilated shield illustration.
5. Warning signs: severe eye pain or sudden worsening of vision, and urgent treating-team escalation.

The medication schedule, interval and order are the **illustrative clinician-entered plan supplied for the fictional presentation**, not universal cataract advice. No individual drug product, concentration or dose is invented. The prior guide's generic timetable is not used for this new patient-specific plan.

## Filming walkthrough

1. **Start teach-back** opens the schedule. Press **Listen in Mandarin** and ask the bilingual nurse question. Record the response and explicitly choose **Verified** when appropriate.
2. Press **Next** for eye-drop order and interval. Record the incorrect response: `两种眼药水，我一起滴就可以了，对吗？`
3. Choose **Needs re-teaching**. The waiting-time diagram gains amber emphasis and the nurse panel offers **Replay instruction**.
4. Explain again. Enter Uncle Lim's corrected response, then choose **Verified**. The initial response remains in assessment history alongside the new assessment.
5. Complete the remaining three modules. Every module has the same response, verification and re-teaching controls. **Hide nurse controls** leaves the patient-facing material alone for filming.
6. Close the patient view and select **Review home support**. The draft highlights the interval if it actually needed re-teaching. Review the full content, obtain patient consent, name the authorised supporter, check the nurse-review control and choose **Finalise support handover**.
7. **Print visitor card** opens the browser's print/Save as PDF flow; **Export support plan** downloads JSON. Nothing is sent to a hospital or community supporter.

Before another take, open **Picture & audio settings → Reset teach-back session**, then confirm. This clears assessments and consent while preserving the configured care plan, wording and media.

## Editing and consistency

- **Picture & audio settings → Clinician-entered discharge plan** edits four times, interval, bilingual bottle labels, follow-up and escalation instructions. Save updates the visuals, patient text, read-aloud and handover from the same data and invalidates previous verification.
- Schedule/sequence descriptions are generated from the structured care plan. Edit those timings/labels in the plan editor rather than independently overriding the description.
- Other module headings/descriptions remain editable by language. Clearing a description and deleting/restoring an entire card still work. Deleted required modules block finalisation until restored and verified. Changes require fresh verification of the affected module.
- English and Mandarin text edits are independent; review both for consistency. Uploaded recordings are not rewritten automatically.
- Each card supports replacement images and verified Mandarin or Hokkien recordings under 2 MB. Mandarin playback uses an uploaded recording only while its bound text matches the current text; otherwise it uses current Mandarin text-to-speech.
- Hokkien remains recording-only. No live Hokkien synthesis or translation is claimed.
- Locally generated SVG illustrations are explanatory, not photographs or institutional medical artwork. Illustrations and wording need clinical review before actual patient care.

## Nurse decisions and community support

Only the nurse's explicit **Verified** decision verifies a module. Typed/transcribed text never scores itself. The app stores each assessment, response snapshot and timestamp. Re-teaching is visible, and later verification retains earlier attempts.

All five modules must be present and verified before finalisation. Consent, a designated supporter and nurse review are mandatory. Revoking consent or changing relevant content invalidates the ready handover. The nurse-facing draft is visible for review, but print/export controls and the printable visitor view are unavailable until finalised. The visitor summary excludes raw responses/clinical notes and contains approved instructions, follow-up, verified topics, re-teaching topics and targeted reinforcement. It explicitly prohibits diagnosis, prescription changes and independent medical decisions.

Storage is localStorage under `medlingo.lim-teachback.v1` for the current plan/results/consent and `medlingo.visual-assets.v1` for media/text edits. This is educational local storage, not clinical-record security or a real access-control system. Previously stored generic card assets are retained but not mapped onto the five new modules.

## Speech and translation

The existing English ↔ selected-language push-to-talk flow remains. Hold to speak, release to finish transcription, translate and speak. It uses browser SpeechRecognition, Translator and speechSynthesis where supported. No paid API key is needed. First-use model downloads and speech-service network latency may delay responses. Browser microphone access needs user permission; transcription may use the browser provider's servers. Use the feature only without real patient identifiers.

Saved per-language voice choices, **Test voice** and speed controls remain. Mandarin speech should be checked by a fluent speaker; this app does not certify TTS pronunciation. Pre-recorded Mandarin is provided as a fallback. The five module instructions are not automatically machine-retranslated during teaching.

## Architecture

- `src/plan.ts`: configurable fictional clinician-entered plan, validation and time labels.
- `src/cards.ts`: builds the five module copies/questions from the plan.
- `src/ModuleVisual.tsx`: clocks, bottles/timer, elderly patient/shield and warning visuals.
- `src/TeachPanel.tsx`: bilingual questions, response entry, explicit assessment and history.
- `src/teachback.ts`: assessment state, invalidation, completion/consent guards and shared summary data.
- `src/Handover.tsx`: nurse review, consent and guarded print/JSON export.
- `src/PlanEditor.tsx`: structured care-plan editing.
- `src/instructions.ts`: per-language text overrides; `src/main.tsx` integrates the existing board and translator.
- `src/speech.ts`, `src/pushToTalk.ts`: language-safe voice selection and push-to-talk lifecycle.

## Validation

Production build and 22 tests pass. Tests cover both push-to-talk directions, cancellation, final-result handling, voice selection, text edits, five-module verification, the incorrect→re-teaching→verified sequence, history retention, consent/recipient/review gates, deleted-module blocking, care-plan consistency and exclusion of raw responses from summaries.

Browser checks exercised the five-module flow, Mandarin playback controls, interval re-teaching emphasis, corrected-response verification, all-five completion, consent gating and persistence after refresh. Desktop patient layout was visually reviewed. Human microphone input and the linguistic accuracy of recorded/TTS speech still require presenter testing.

## Compact translator during teach-back

A compact Speak & Translate panel sits directly below the nurse controls in each module. It reuses the existing push-to-talk, direction swap, browser translation and spoken playback. Enable the mic notice, hold to speak in English or swap to the selected language, then release to translate and hear the result. Typed text is supported too. **Add to response** explicitly appends the original transcript (labelled with its source language) to the current module's response; it never verifies the module. Switching/closing modules clears the temporary transcript and cancels active capture/translation. Hiding nurse controls also cancels capture. Live Hokkien remains unavailable.

## Deploy to Vercel and use on iPad

1. Import `YangXu624/MedLingo` at https://vercel.com/new.
2. Leave Root Directory at the repository root (`./`), not `sp`. Select Vite if it is not detected.
3. The included `vercel.json` sets install to `npm ci`, build to `npm run build`, and output to `dist`. Node.js is pinned to 24.x. No environment variables are required.
4. Click Deploy, then open the HTTPS deployment URL in Safari on your iPad. You can use Share → Add to Home Screen for a shortcut.
5. Future pushes to the production branch automatically redeploy the app.

The prepared multilingual cards work independently of the live translation API. Free-form translation currently relies on the desktop browser Translator API, which is unavailable on iPad; deploying to Vercel does not add a translation backend. Microphone recognition, installed voices and automatic audio playback depend on the device/browser and need testing on the iPad. Hokkien still requires recordings.

Card edits, uploaded pictures/recordings and teach-back sessions are stored in each browser's localStorage. They are not committed to GitHub or synced across devices/domains. The hosted app starts with the source-code defaults; configure the iPad separately.
