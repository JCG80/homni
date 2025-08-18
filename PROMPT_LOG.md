# Prompt Log - Homni Platform

Dette dokumentet holder oversikt over alle AI-prompter, retningsendringer og strategiske beslutninger for Homni-plattformen.

## 📅 18. august 2024 – Prompt Guardian System
- **Formål:** Implementere CI-basert kontroll av prompt-endringer og dokumentasjon
- **Retning:** Sikrer konsistens i AI-prompter og dokumentasjon, støtter kvalitetssikring
- **Bygger på:** Eksisterende repo-health infrastruktur og GitHub Actions
- **Status:** Operasjonell
- **Guardian-status:** ✅ Godkjent

**Detaljer:**
- Opprettet Prompt Guardian workflow som feiler PR-er uten PROMPT_LOG oppdatering
- Trigger på endringer i docs/, prompts/, README, ROADMAP, locales/
- Krever "Guardian-status:" i loggoppføringer
- Standardisert PR-mal for konsistent dokumentasjon

## 📅 18. august 2024 – Master Prompt Etablering
- **Formål:** Opprett enkeltkilde for alle AI-prompter og arkitekturavgjørelser
- **Retning:** Sentraliserer Homni-visjon, roller, moduler og teknisk praksis
- **Bygger på:** Eksisterende prompt-dokumentasjon og meta-prompt
- **Status:** Strategisk
- **Guardian-status:** ✅ Godkjent

**Detaljer:**
- HOMNI_MASTER_PROMPT.md som Single Source of Truth
- Definerer 6 roller, modulær arkitektur (Bytt/Boligmappa/Propr)
- CI/sikkerhet/RLS-standarder
- Lenket fra README.md

## 📅 18. august 2024 – Prosjektkok-AI Rolle
- **Formål:** Definere AI-assistent for konsistens og modularkitektur
- **Retning:** Støtter norsk utvikleropplevelse og kvalitetssikring
- **Bygger på:** Master Prompt og repo-wide sweep metodikk
- **Status:** Operasjonell
- **Guardian-status:** ✅ Godkjent

**Detaljer:**
- Norsk AI-rolle som "Dokument-slukker, Konsistenspoliti, Ressursjeger"
- Strukturerte input/output-mønstre
- Refererer til Master Prompt for konsistens

---

## ✍️ Mal for ny oppføring
### 📅 <DD. måned YYYY> – <Kort navn>
- **Formål:**
- **Retning:** (hvordan støtter Homni-målene)
- **Bygger på:**
- **Status:** Strategisk/Operasjonell
- **Guardian-status:** ✅ Godkjent / ⚠️ Krever justering