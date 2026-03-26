# Guide de Déploiement Complet A à Z - FONAMIF

Ce guide détaille chaque étape pour mettre votre projet en ligne.

---

## Étape 1 à 4 : (Déjà faites ?)
*Si vous avez poussé sur GitHub et lié Netlify, passez à l'étape 5.*

---

## Étape 5 : Déploiement du Backend (Serveur Java) sur Render.com

Le "Backend" est le moteur de votre application. Sans lui, le bouton "Se connecter" ne fonctionnera pas.

1. **Créez un compte sur [Render.com](https://render.com/)** : Connectez-vous avec votre compte **GitHub**.
2. **Créez une Base de Données (PostgreSQL)** :
   - Cliquez sur **"New"** (bouton bleu) > **"PostgreSQL"**.
   - Nommez-la `fonamif-db`.
   - Cliquez sur **"Create Database"** en bas.
   - **IMPORTANT** : Une fois créée, cherchez la ligne **"Internal Database URL"** et copiez cette adresse (elle commence par `postgres://...`). Gardez-la de côté.
3. **Créez le Service Web (Le code Java)** :
   - Cliquez sur **"New"** > **"Web Service"**.
   - Sélectionnez votre dépôt `fonamif-projet`.
   - **Configuration** :
     - **Name** : `fonamif-backend`
     - **Root Directory** : `backend`  <-- TRÈS IMPORTANT
     - **Runtime** : **Docker**  <-- (Sélectionnez "Docker" à la place de Java)
4. **Ajoutez les Variables d'Environnement (Les réglages)** :
   - Cliquez sur l'onglet **"Environment"** dans votre service `fonamif-backend`.
   - Cliquez sur **"Add Environment Variable"** :
     - **Key** : `SPRING_DATASOURCE_URL` / **Value** : (Collez l'URL que vous avez copiée à l'étape 2.2)
     - **Key** : `SPRING_DATASOURCE_USERNAME` / **Value** : (Disponible dans les infos de votre DB sur Render)
     - **Key** : `SPRING_DATASOURCE_PASSWORD` / **Value** : (Disponible dans les infos de votre DB sur Render)
     - **Key** : `BEZCODER_APP_JWTSECRET` / **Value** : `UnePhraseSecreteTresLongueEtAleatoire`
5. **Lancez le déploiement** : Attendez que le statut devienne "Live" (vert). Render vous donnera une adresse comme `https://fonamif-backend.onrender.com`.

---

## Étape 6 : Relier le Frontend (Netlify) au Backend (Render)

Maintenant, vous devez dire à Netlify où se trouve votre moteur (Render).

1. Allez sur votre tableau de bord **Netlify**.
2. Cliquez sur votre site, puis sur **Site configuration** > **Environment variables**.
3. Cliquez sur **"Add a variable"** > **"Add single variable"**.
   - **Key** : `VITE_API_URL`
   - **Value** : `https://fonamif-backend.onrender.com/api`  <-- (Mettez votre adresse Render suivie de `/api`)
4. Cliquez sur **Save**.
5. **Dernière étape** : Pour que Netlify prenne en compte ce changement, allez dans l'onglet **"Deploys"** et cliquez sur le bouton **"Trigger deploy"** > **"Clear cache and deploy site"**.

---

## C'EST FINI !
Votre application est maintenant en ligne. Si vous allez sur l'adresse fournie par Netlify, vous devriez pouvoir vous connecter.
