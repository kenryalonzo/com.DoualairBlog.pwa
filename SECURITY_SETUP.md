# 🔒 Configuration de Sécurité - Doualair Blog

## Variables d'Environnement Requises

Ajoutez ces variables à votre fichier `.env` à la racine du projet :

```env
# Configuration de la base de données
MONGO_URI=mongodb://localhost:27017/doualair_blog

# Clés secrètes JWT (OBLIGATOIRE - Générer des clés sécurisées)
JWT_SECRET=votre_jwt_secret_tres_securise_ici_minimum_32_caracteres
JWT_REFRESH_SECRET=votre_jwt_refresh_secret_tres_securise_ici_minimum_32_caracteres

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration CORS (en production)
FRONTEND_URL=http://localhost:5173

# Configuration des cookies (en production)
COOKIE_DOMAIN=localhost
```

## 🔑 Génération de Clés Secrètes Sécurisées

### Méthode 1 : Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Méthode 2 : OpenSSL

```bash
openssl rand -hex 32
```

### Méthode 3 : En ligne (pour les tests uniquement)

- https://generate-secret.vercel.app/32

## 🛡️ Fonctionnalités de Sécurité Implémentées

### 1. **JWT (JSON Web Tokens)**

- **Access Token** : 15 minutes (courte durée pour la sécurité)
- **Refresh Token** : 7 jours (stocké en base de données)
- **Rotation automatique** des tokens
- **Révocation** lors de la déconnexion

### 2. **Cookies Sécurisés**

- `httpOnly: true` (inaccessible via JavaScript)
- `secure: true` en production (HTTPS uniquement)
- `sameSite: 'strict'` (protection CSRF)
- **Expiration automatique**

### 3. **CORS (Cross-Origin Resource Sharing)**

- Configuration stricte des origines autorisées
- Support des credentials (cookies)
- Headers sécurisés

### 4. **Rate Limiting**

- **Authentification** : 5 tentatives / 15 minutes
- **Général** : 100 requêtes / 15 minutes
- Protection contre les attaques par force brute

### 5. **Helmet.js**

- Headers de sécurité HTTP
- Protection XSS
- Content Security Policy (CSP)
- Désactivation de la mise en cache pour les données sensibles

### 6. **Validation et Nettoyage**

- Sanitisation des entrées utilisateur
- Validation des types de contenu
- Protection contre les injections

### 7. **Gestion des Sessions**

- Stockage sécurisé des tokens de rafraîchissement
- Nettoyage automatique des tokens expirés
- Traçabilité des appareils connectés

## 🔄 Routes d'Authentification

### Routes Publiques

- `POST /api/auth/signup` - Inscription
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Routes Protégées

- `GET /api/auth/profile` - Profil utilisateur
- `GET /api/auth/check` - Vérifier l'authentification
- `PUT /api/user/profile` - Mettre à jour le profil
- `GET /api/user/all` - Tous les utilisateurs (admin)

## 🚀 Démarrage Sécurisé

1. **Générer les clés secrètes** :

```bash
# Générer JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET"

# Générer JWT_REFRESH_SECRET
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
```

2. **Ajouter au fichier .env** :

```env
JWT_SECRET=votre_clé_générée_ici
JWT_REFRESH_SECRET=votre_clé_refresh_générée_ici
```

3. **Démarrer le serveur** :

```bash
npm run dev
```

## 🔍 Test de Sécurité

### Test de Connexion

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Test de Route Protégée

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -b cookies.txt
```

### Test de Rate Limiting

```bash
# Essayer plusieurs connexions rapides
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "Status: %{http_code}\n"
done
```

## ⚠️ Points d'Attention

1. **Ne jamais commiter les clés secrètes** dans Git
2. **Utiliser HTTPS** en production
3. **Changer régulièrement** les clés secrètes
4. **Monitorer** les tentatives de connexion échouées
5. **Sauvegarder** régulièrement la base de données

## 🛠️ Dépannage

### Erreur "JWT_SECRET non défini"

- Vérifier que le fichier `.env` existe à la racine
- Vérifier que `JWT_SECRET` et `JWT_REFRESH_SECRET` sont définis

### Erreur CORS

- Vérifier que `FRONTEND_URL` est correctement configuré
- En développement, vérifier que le frontend tourne sur le bon port

### Tokens expirés

- Le système de rafraîchissement automatique devrait gérer cela
- Vérifier que les cookies sont bien envoyés avec les requêtes

## 📚 Ressources

- [JWT.io](https://jwt.io/) - Documentation JWT
- [Helmet.js](https://helmetjs.github.io/) - Sécurité Express
- [OWASP](https://owasp.org/) - Bonnes pratiques de sécurité
