l# Doualair Blog

Un blog moderne et élégant développé avec React, TypeScript, Node.js et MongoDB.

## 🚀 Fonctionnalités

- **Interface moderne** avec animations fluides et design responsive
- **Authentification complète** (inscription/connexion)
- **Mode sombre/clair** avec transition automatique
- **Validation en temps réel** des formulaires
- **Animations interactives** avec Framer Motion
- **API REST** avec Express.js et MongoDB
- **Design responsive** optimisé pour tous les appareils

## 🛠️ Technologies utilisées

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- React Toastify
- React Icons

### Backend

- Node.js
- Express.js
- MongoDB avec Mongoose
- bcryptjs pour le hachage des mots de passe
- dotenv pour les variables d'environnement

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- MongoDB (installé localement ou MongoDB Atlas)
- npm ou yarn

## 🔧 Installation

1. **Cloner le repository**

   ```bash
   git clone https://github.com/kenryalonzo/com.DoualairBlog.pwa.git
   cd Doualair_Blog
   ```

2. **Installer les dépendances du backend**

   ```bash
   npm install
   ```

3. **Installer les dépendances du frontend**

   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configuration des variables d'environnement**

   Créez un fichier `.env` dans le dossier `api/` avec le contenu suivant :

   ```env
   # Configuration MongoDB
   MONGO_URI=mongodb://localhost:27017/doualair_blog

   # Configuration du serveur
   PORT=3000

   # Configuration JWT (pour l'authentification)
   JWT_SECRET=votre_secret_jwt_tres_securise_ici

   # Configuration de l'environnement
   NODE_ENV=development
   ```

   **Note :** Remplacez `votre_secret_jwt_tres_securise_ici` par une chaîne de caractères sécurisée.

5. **Démarrer MongoDB**

   Si vous utilisez MongoDB localement :

   ```bash
   mongod
   ```

   Ou utilisez MongoDB Atlas en remplaçant l'URL dans MONGO_URI.

## 🚀 Démarrage

### Développement

1. **Démarrer le serveur backend**

   ```bash
   npm run dev
   ```

2. **Démarrer le client frontend** (dans un nouveau terminal)

   ```bash
   cd client
   npm run dev
   ```

3. **Accéder à l'application**
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:3000

### Production

1. **Construire le frontend**

   ```bash
   cd client
   npm run build
   ```

2. **Démarrer en production**
   ```bash
   npm start
   ```

## 📁 Structure du projet

```
Doualair_Blog/
├── api/                    # Backend Node.js/Express
│   ├── controllers/        # Contrôleurs de l'API
│   ├── models/            # Modèles Mongoose
│   ├── routes/            # Routes de l'API
│   ├── utils/             # Utilitaires
│   └── index.js           # Point d'entrée du serveur
├── client/                # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   └── assets/        # Ressources statiques
│   ├── public/            # Fichiers publics
│   └── package.json
├── package.json           # Dépendances du backend
└── README.md
```

## 🔌 API Endpoints

### Authentification

- `POST /api/auth/signup` - Inscription d'un nouvel utilisateur
- `POST /api/auth/signin` - Connexion d'un utilisateur

### Utilisateurs

- `GET /api/user/test` - Test de l'API

## 🎨 Fonctionnalités de l'interface

### Pages disponibles

- **Accueil** (`/`) - Page d'accueil avec présentation
- **À propos** (`/about`) - Informations sur le projet
- **Projets** (`/projects`) - Galerie de projets
- **Dashboard** (`/dashboard`) - Tableau de bord utilisateur
- **Inscription** (`/sign-up`) - Création de compte
- **Connexion** (`/sign-in`) - Authentification

### Animations et interactions

- Particules animées au survol du logo
- Transitions fluides entre les pages
- Animations de validation des formulaires
- Effets de survol et de clic
- Mode sombre/clair avec transition

## 🔒 Sécurité

- Mots de passe hachés avec bcryptjs
- Validation côté serveur et client
- Protection contre les injections
- Gestion d'erreurs centralisée

## 🐛 Dépannage

### Erreurs courantes

1. **Erreur de connexion MongoDB**

   - Vérifiez que MongoDB est démarré
   - Vérifiez l'URL de connexion dans `.env`

2. **Erreurs de dépendances**

   - Supprimez `node_modules` et `package-lock.json`
   - Relancez `npm install`

3. **Erreurs de port**
   - Vérifiez que les ports 3000 et 5173 sont disponibles
   - Modifiez les ports dans la configuration si nécessaire

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Kenry Alonzo**

- GitHub: [@kenryalonzo](https://github.com/kenryalonzo)

## 🙏 Remerciements

- [React](https://reactjs.org/) pour le framework frontend
- [Express.js](https://expressjs.com/) pour le framework backend
- [MongoDB](https://www.mongodb.com/) pour la base de données
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Framer Motion](https://www.framer.com/motion/) pour les animations
