# Backend - Dev Cockpit

Serveur Node.js/Express gérant le terminal WebSocket et les API.

## 🛠️ Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **WebSocket**: `ws` + `node-pty`
- **Logs**: Winston
- **Langage**: TypeScript

## 🚀 Démarrage

```bash
# Installation
npm install

# Configuration
cp .env.example .env

# Dev (Hot reload)
npm run dev

# Build & Start
npm run build
npm start
```

## 📁 Structure
- `src/server.ts`: Point d'entrée
- `src/websocket/`: Logique WebSocket (Terminal)
- `src/utils/`: Utilitaires (Logger, Validator)
- `src/middleware/`: Middlewares Express

## 🔒 Sécurité
Le terminal est protégé par `commandValidator.ts` qui bloque les commandes dangereuses (`rm -rf /`, etc.).
