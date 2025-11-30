# 🚀 Mon Dev Cockpit

Mon cockpit de développement personnel avec terminal intégré, IA, et intégrations.
Refondu avec une architecture unifiée et un design moderne Glassmorphism.

## ✨ Fonctionnalités
- **Architecture Unifiée** : Backend et Frontend dans un seul projet.
- **Design Moderne** : Interface "Glassmorphism" avec animations fluides (Framer Motion).
- **Terminal Web** : Accès direct au shell via WebSocket (xterm.js).
- **Dashboard** : Statistiques et actions rapides.

## 🛠️ Stack Technique
- **Runtime**: Node.js 20+
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: Express.js, WebSocket (ws), node-pty
- **Langage**: TypeScript strict

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Lancement (Backend + Frontend)
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure
```
mon-dev/
├── app/         # Pages Next.js (Dashboard, Terminal)
├── components/  # Composants React (UI, Layout)
├── src/         # Code Backend (Server, WebSocket)
├── public/      # Assets statiques
└── package.json # Dépendances unifiées
```

## 🎨 Design System
- **Thème** : Dark Slate (`#0F172A`)
- **Accents** : Cyan, Blue, Emerald gradients
- **Effets** : Backdrop blur, Glass cards, Hover glows

## 🎯 Roadmap
- [x] Phase 1: Refactoring Structurel
- [x] Phase 2: Redesign UI (Glassmorphism)
- [ ] Phase 3: Intégration IA Gemini
- [ ] Phase 4: GitHub API
