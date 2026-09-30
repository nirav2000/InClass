# InClass

A lightweight weekly school-homework app. French is the first subject.

## Week 1
The first pack is based on the supplied pets/colours/descriptions vocabulary sheet:
- **J’ai**
- pets: un chien, un chat, un cheval, un poisson, un hamster, un serpent, un lapin, un oiseau, un cochon d'inde, une souris
- colours: bleu/bleue, vert/verte, rouge, jaune, noir/noire, blanc/blanche, gris/grise, brun/brune, marron
- **et**
- descriptions: méchant/méchante, mignon/mignonne, intelligent/intelligente, stupide

## Learning loop
1. Learn — tap French to hear it.
2. Spell — hear a word and type it.
3. Build — make correct pet + colour + description sentences.
4. Speak — listen and repeat using browser speech recognition when available.
5. Chat — answer a simple spoken prompt with the week's vocabulary.

Progress is kept separately for **Sai** and **Parent** in local storage.

## Technical approach
This first release is intentionally static so it can run cheaply on GitHub Pages and install as a PWA on iPhone/iPad. Playback uses the browser's French `speechSynthesis` voice. Speech practice uses `SpeechRecognition` / `webkitSpeechRecognition` where supported.

Speech recognition is only a practice signal; it is **not** a phoneme-level pronunciation score.

## Adding future homework
The weekly vocabulary is kept as structured data near the top of `app.js`. A future iteration should move weeks into separate JSON files and add a secure AI ingestion path (for example via a Cloudflare Worker) so a parent can upload a homework image and generate a reviewed weekly pack without exposing an API key in the browser.
