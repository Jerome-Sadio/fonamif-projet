# Guide de Déploiement Complet A à Z - FONAMIF

Ce guide détaille chaque étape pour mettre votre projet en ligne.

---

## Étape 1 à 4 : (Déjà faites)

---

## Étape 5 : Déploiement du Backend (Serveur Java) sur Render.com

1. **Créez un compte sur [Render.com](https://render.com/)**.
2. **Créez une Base de Données (PostgreSQL)** :
   - Cliquez sur **"New"** > **"PostgreSQL"**. Nommez-la `fonamif-db`.
   - **IMPORTANT** : Copiez la **"Internal Database URL"**. 
   - **Attention** : Si l'URL ne commence pas par `jdbc:`, ajoutez-le au début plus tard (voir ci-dessous).
3. **Créez le Service Web** :
   - Cliquez sur **"New"** > **"Web Service"**, liez votre dépôt.
   - **Root Directory** : `backend`
   - **Runtime** : `Docker`
   - **Dockerfile Path** : `Dockerfile`
4. **Variables d'Environnement (C’est ici que ça se joue !)** :
   Allez dans l'onglet **"Environment"** de votre service `fonamif-backend` et ajoutez ces **4 variables** :
   
   - **Key** : `SPRING_DATASOURCE_URL` 
     - **Value** : `jdbc:postgresql://...` (Collez votre URL de DB, mais ajoutez bien **`jdbc:`** au tout début !)
   - **Key** : `SPRING_DATASOURCE_DRIVER` 
     - **Value** : `org.postgresql.Driver`
   - **Key** : `SPRING_JPA_DIALECT` 
     - **Value** : `org.hibernate.dialect.PostgreSQLDialect`
   - **Key** : `SPRING_JPA_HIBERNATE_DDL_AUTO` 
     - **Value** : `update`
   - **Key** : `BEZCODER_APP_JWTSECRET` 
     - **Value** : `UnePhraseSecreteTresLongueEtAleatoire`

5. **Déployez** : Enregistrez et attendez le message "Live".

---

## Étape 6 : Relier le Frontend (Netlify) au Backend (Render)

1. Sur Netlify, allez dans **Environment variables**.
2. Ajoutez `VITE_API_URL` avec la valeur `https://votre-backend.onrender.com/api`.
3. Re-déployez le site Netlify (Clear cache and deploy).
