# Guide de Test - Page SignIn Améliorée

## 🚀 Instructions de Démarrage

### 1. Installation et Préparation

```bash
# Backend
cd /workspace
npm install
npm run dev

# Frontend (nouveau terminal)
cd /workspace/client
npm install
npm run dev
```

### 2. Vérification des Variables d'Environnement

**Backend (`/workspace/api/.env`):**
```env
MONGO_URI=mongodb://localhost:27017/doualair_blog
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
COOKIE_DOMAIN=localhost
JWT_SECRET=doualair_blog_jwt_secret_key_very_secure_2024
JWT_REFRESH_SECRET=doualair_blog_refresh_secret_key_very_secure_2024
ADMIN_EMAIL=flashalen100@gmail.com
ADMIN_PASSWORD=@Bghack10
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
BASE_URL=http://localhost:3000
```

**Frontend (`/workspace/client/.env`):**
```env
VITE_FIREBASE_API_KEY=AIzaSyDOhzHnFaoffdmuoFCZ4BdI_jI0EVDMA1s
VITE_FIREBASE_AUTH_DOMAIN=doualair-blog.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=doualair-blog
VITE_FIREBASE_STORAGE_BUCKET=doualair-blog.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=475502260197
VITE_FIREBASE_APP_ID=1:475502260197:web:e7a98c74fa74af058c490c
VITE_FIREBASE_MEASUREMENT_ID=G-YY1FCRB1G1
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Scénarios de Test

### A. Authentification Admin

#### Test 1: Connexion Admin Classique
1. Aller sur `http://localhost:5173/sign-in`
2. Saisir:
   - Email: `flashalen100@gmail.com`
   - Mot de passe: `@Bghack10`
3. Cliquer sur "Se connecter"
4. **Résultat attendu:** Redirection vers `/dashboard` avec message "Bienvenue dans l'interface d'administration !"

#### Test 2: Connexion Admin via Google (si configuré)
1. Cliquer sur "Continuer avec Google"
2. Se connecter avec le compte Google lié à `flashalen100@gmail.com`
3. **Résultat attendu:** Redirection vers `/dashboard` avec message admin

### B. Authentification Utilisateur Normal

#### Test 3: Création et Connexion Utilisateur
1. Créer un compte via `/sign-up`
2. Se connecter avec ces credentials sur `/sign-in`
3. **Résultat attendu:** Redirection vers `/profile` avec message "Connexion réussie !"

#### Test 4: Connexion via Google (nouvel utilisateur)
1. Se connecter avec un compte Google différent de l'admin
2. **Résultat attendu:** Création automatique du compte + redirection vers `/profile`

### C. Tests de Validation

#### Test 5: Validation en Temps Réel
1. Saisir un email invalide
2. **Résultat attendu:** Icône rouge (FiX) à droite du champ
3. Saisir un email valide
4. **Résultat attendu:** Icône verte (FiCheck) à droite du champ
5. Saisir un mot de passe court
6. **Résultat attendu:** Barre de force rouge "Faible"
7. Saisir un mot de passe fort
8. **Résultat attendu:** Barre de force verte "Fort"

#### Test 6: États des Boutons
1. Avec champs vides
2. **Résultat attendu:** Bouton "Se connecter" désactivé
3. Avec email valide + mot de passe valide
4. **Résultat attendu:** Bouton "Se connecter" activé

### D. Tests d'Erreur

#### Test 7: Credentials Incorrects
1. Saisir un email existant avec mauvais mot de passe
2. **Résultat attendu:** Toast d'erreur "Email ou mot de passe incorrect"

#### Test 8: Compte Inexistant
1. Saisir un email qui n'existe pas
2. **Résultat attendu:** Toast d'erreur "Aucun compte trouvé avec cet email"

### E. Tests OAuth/Firebase

#### Test 9: Redirection Google
1. Cliquer sur "Continuer avec Google"
2. **Résultat attendu:** Redirection vers Google (pas de popup bloquée)
3. Se connecter
4. **Résultat attendu:** Retour sur l'app avec connexion réussie

## 🔧 Points de Vérification Technique

### API Endpoints Disponibles
- `POST /api/auth/login` - Connexion unifiée
- `POST /api/auth/signin` - Alias de login
- `POST /api/auth/google` - OAuth Google
- `GET /api/auth/verify` - Vérification token
- `POST /api/auth/logout` - Déconnexion

### Cookies à Vérifier (DevTools)
- `access_token` - Token JWT principal
- `refresh_token` - Token de rafraîchissement

### Redux State (Redux DevTools)
```json
{
  "user": {
    "currentUser": {
      "id": "...",
      "email": "...",
      "username": "...",
      "role": "admin|user",
      "firstName": "...",
      "lastName": "...",
      "profilePicture": "..."
    },
    "loading": false,
    "error": null
  }
}
```

## ⚠️ Problèmes Potentiels et Solutions

### 1. MongoDB Non Démarré
**Erreur:** Connection failed
**Solution:** `sudo systemctl start mongod` ou démarrer MongoDB localement

### 2. Port 3000 Occupé
**Erreur:** EADDRINUSE
**Solution:** `lsof -ti:3000 | xargs kill -9` puis redémarrer

### 3. Variables Firebase Manquantes
**Erreur:** Console errors Firebase
**Solution:** Vérifier `.env` frontend et Firebase Console

### 4. CORS Errors
**Erreur:** CORS policy blocked
**Solution:** Vérifier `CORS_ORIGIN` dans `.env` backend

### 5. Google OAuth Fail
**Erreur:** popup-blocked ou auth/cancelled
**Solution:** Désactiver bloqueur de popup OU utiliser navigation privée

## 📱 Test Responsive

1. Tester sur mobile (DevTools responsive)
2. Vérifier que les animations restent fluides
3. S'assurer que les boutons sont accessibles
4. Vérifier le comportement des modales/popups

## 🎯 Critères de Succès

- ✅ Admin se connecte → `/dashboard`
- ✅ User se connecte → `/profile`
- ✅ OAuth fonctionne sans popup bloquée
- ✅ Validation temps réel active
- ✅ Messages d'erreur spécifiques
- ✅ Animations fluides
- ✅ Responsive design
- ✅ Redux state correct
- ✅ Cookies sécurisés définis