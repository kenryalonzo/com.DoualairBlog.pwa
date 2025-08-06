// Fichier d'initialisation des modèles
// Importe tous les modèles dans le bon ordre pour éviter les erreurs de référence

import './user.model.js';
import './category.model.js';
import './tag.model.js';
import './article.model.js';

console.log('✅ Tous les modèles Mongoose ont été initialisés');

export { default as User } from './user.model.js';
export { default as Category } from './category.model.js';
export { default as Tag } from './tag.model.js';
export { default as Article } from './article.model.js';
