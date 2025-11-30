# 🚀 Mon Dev Cockpit

Mon cockpit de développement personnel avec terminal intégré, IA, et intégrations.

## ✨ Fonctionnalités actuelles (Phase 1)
- ✅ Terminal web fonctionnel (xterm.js + WebSocket)
- ✅ Dashboard avec statistiques
- ✅ Actions rapides
- ✅ Architecture backend/frontend séparée
- ✅ Sécurité des commandes terminal

## 🛠️ Stack Technique

### Backend
- Node.js + Express + TypeScript
- WebSocket (ws) + Terminal (node-pty)
- Winston pour les logs

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui
- xterm.js pour le terminal

## 🚀 Installation & Lancement

### Prérequis
- Node.js 20+
- npm ou yarn

### Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Ouvrir**
   http://localhost:3000

## 📁 Structure
```
mon-dev/
├── backend/     # Serveur Node.js + WebSocket terminal
├── frontend/    # Application Next.js
└── README.md
```

## 🎯 Roadmap
- [x] Phase 1: Terminal + Dashboard
- [ ] Phase 2: Intégration IA Gemini
- [ ] Phase 3: GitHub API
- [ ] Phase 4: Supabase
- [ ] Phase 5: Ressources & Notes
- [ ] Phase 6: Automatisations n8n

## 📝 Licence
Projet personnel - Pas de licence pour l'instant
