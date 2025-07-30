# Configuration Firebase

## Étapes pour configurer Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'authentification et l'analytics si nécessaire

### 2. Obtenir la configuration

1. Dans votre projet Firebase, allez dans "Project Settings" (⚙️)
2. Dans l'onglet "General", faites défiler jusqu'à "Your apps"
3. Cliquez sur l'icône Web (</>) pour ajouter une app web
4. Copiez la configuration Firebase

### 3. Créer le fichier .env

Créez un fichier `.env` dans le dossier `client/` avec le contenu suivant :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_MEASUREMENT_ID=votre_measurement_id
```

### 4. Redémarrer le serveur de développement

Après avoir créé le fichier `.env`, redémarrez votre serveur de développement :

```bash
npm run dev
```

## Variables d'environnement requises

- `VITE_FIREBASE_API_KEY` : Clé API Firebase
- `VITE_FIREBASE_AUTH_DOMAIN` : Domaine d'authentification
- `VITE_FIREBASE_PROJECT_ID` : ID du projet Firebase
- `VITE_FIREBASE_STORAGE_BUCKET` : Bucket de stockage
- `VITE_FIREBASE_MESSAGING_SENDER_ID` : ID de l'expéditeur de messages
- `VITE_FIREBASE_APP_ID` : ID de l'application
- `VITE_FIREBASE_MEASUREMENT_ID` : ID de mesure (analytics)

## Note de sécurité

Le fichier `.env` est automatiquement ignoré par Git pour des raisons de sécurité. Ne le committez jamais dans votre dépôt.
