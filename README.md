<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/84a0c120-8355-484a-b06e-a94811dc7260

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Urban Data Lab
Protótipo de sistema de apoio à decisão urbanística baseado em AI
## 🧭 Overview

Urban Data Lab is a prototype of an AI-powered urban feasibility analysis system designed to support architects, real estate investors, and urban planning professionals in the early-stage evaluation of land and building development potential in Portugal.

The system leverages large language models (LLMs) to translate complex urban planning concepts, zoning constraints, and regulatory frameworks into structured, decision-oriented insights.

This project explores the intersection between architecture, urban planning, geospatial reasoning, and artificial intelligence.

---

## 🎯 Problem Statement

Urban feasibility analysis is traditionally:

- Time-consuming and fragmented across multiple sources (PDMs, GIS platforms, municipal portals)
- Highly dependent on expert interpretation of legal and spatial data
- Difficult to standardize across municipalities in Portugal

Urban Data Lab addresses this by creating a structured AI-assisted pre-analysis layer that accelerates decision-making in early design and investment phases.

---

## 💡 Solution

Urban Data Lab introduces an AI-driven system that:

- Receives structured user input about a site and intended project
- Simulates urban planning reasoning based on PDM logic and zoning principles
- Produces a structured feasibility report
- Clearly separates assumptions from inferred analysis

The system acts as a **pre-decision support tool**, not a substitute for formal municipal validation.

---

## 🏗️ System Architecture (Conceptual)

The prototype is structured into four conceptual layers:

### 1. User Input Layer
- Location (address or coordinates)
- Project type (new build, rehabilitation, change of use)
- Intended use (housing, tourism, commercial, etc.)
- Site parameters (area, constraints)

### 2. AI Reasoning Layer (LLM - Gemini via AI Studio)
- Interprets urban planning logic
- Applies heuristic reasoning based on PDM structures
- Generates structured feasibility insights

### 3. Knowledge Layer (Conceptual)
- Municipal Master Plans (PDM)
- Urban zoning rules
- Constraints (REN, RAN, heritage zones)
- Urban density and typology logic

### 4. Output Layer
- Structured feasibility report
- Viability classification
- Constraints and risks
- Strategic recommendations

---

## 🧠 AI Model Configuration

- Model: Gemini (Google AI Studio)
- Mode: Instruction-based agent
- Temperature: Low (0.2–0.4 for analytical consistency)
- Role: Urban feasibility reasoning assistant

---

## 📥 Input Structure

The system expects structured input such as:

- Location: Lisbon, Porto, or coordinates
- Project Type: New construction / rehabilitation / change of use
- Intended Use: Housing / tourism / commercial / mixed-use
- Site Area: m² (optional)
- Constraints: textual description (optional)
- User Profile: architect / investor / technician

---

## 📤 Output Structure

The AI generates a structured report including:

1. Urban Context Overview  
2. Zoning Compatibility Assessment  
3. Key Constraints and Risks  
4. Development Potential (qualitative)  
5. Viability Level (High / Medium / Low / Conditional)  
6. Recommendations for Further Validation  

---

## 🌍 Geospatial & Data Strategy (Conceptual)

The system is designed with future interoperability in mind, including:

- Municipal GIS systems (ArcGIS REST services)
- WMS / WFS geospatial standards
- Open geospatial datasets (OpenStreetMap, INSPIRE EU)
- National cartographic and planning data (DGT Portugal)

⚠️ Note: These integrations are conceptual at prototype stage and not yet implemented.

---

## ⚠️ Limitations

- The system does not replace official municipal planning validation
- Outputs are based on inferred urban logic and structured assumptions
- No direct real-time GIS integration is implemented in this prototype
- Regulatory interpretation may vary between municipalities

---

## 🚀 Development Roadmap

### Phase 1 — UX Definition ✔
User journey and input structure defined.

### Phase 2 — AI Agent Configuration ✔
LLM-based urban reasoning agent developed in Google AI Studio.

### Phase 3 — Data Structuring (Next)
Formalization of urban planning rules and zoning logic.

### Phase 4 — Geospatial Integration (Future)
Connection to GIS systems, WMS/WFS services, and spatial databases.

### Phase 5 — Web Interface Development (Future)
Full application interface for real-world usage.

### Phase 6 — Real Case Validation (Future)
Testing against real urban planning scenarios in Portugal.

---

## 📌 Strategic Vision

Urban Data Lab aims to evolve into a decision-support platform that bridges architecture, urban planning, and real estate investment through AI-assisted spatial reasoning.

It positions itself as a **pre-viability intelligence layer for the built environment**, enhancing early-stage decision-making and reducing uncertainty in urban development processes.

---

## 🛠️ Tech Stack (Prototype Stage)

- Google AI Studio (Gemini LLM)
- Prompt engineering (system-based agent design)
- Conceptual GIS integration model
- Structured input-output architecture

---

## 👤 Author

Architectural and urban AI prototype developed as part of a research-driven exploration into AI-assisted urban planning systems.

---

## 📎 Status

Prototype (Conceptual + Functional AI Agent)
