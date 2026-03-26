# Guide de Déploiement Complet A à Z - FONAMIF

Ce guide détaille chaque commande pour mettre votre projet en ligne.

---

## Étape 1 : Préparation de votre dossier Local (Git)

Avant tout, il faut s'assurer que votre dossier de projet est prêt à être envoyé sur Internet.

1. **Ouvrez un terminal** dans votre projet (`c:\Users\MONA-LISA\Documents\Projet_Amdy`).
2. **Initialisez Git** (si ce n'est pas déjà fait) :
   ```bash
   git init
   ```
3. **Ajoutez vos fichiers** à Git :
   ```bash
   git add .
   ```
4. **Enregistrez vos changements** (Premier Commit) :
   ```bash
   git commit -m "Nettoyage et préparation Netlify terminés"
   ```

---

## Étape 2 : Création du Dépôt sur GitHub

1. Allez sur [votre compte GitHub](https://github.com/).
2. Cliquez sur le bouton **"+"** en haut à droite, puis sur **"New repository"**.
3. Donnez un nom (ex: `fonamif-projet`) et laissez en **Public** ou **Private**.
4. **NE PAS** cocher "Initialize this repository with a README".
5. Cliquez sur **"Create repository"**.

---

## Étape 3 : Relier et Envoyer le code sur GitHub

Copiez les 3 lignes que GitHub vous donne dans la section "...or push an existing repository from the command line" :

```bash
git remote add origin https://github.com/VOTRE_PSEUDO/fonamif-projet.git
git branch -M main
git push -u origin main
```
*(Remplacez `VOTRE_PSEUDO` par votre vrai nom d'utilisateur GitHub).*

---

## Étape 4 : Déploiement sur Netlify

1. Allez sur [Netlify](https://www.netlify.com/) et connectez-vous.
2. Cliquez sur **"Add new site"** > **"Import an existing project"**.
3. Choisissez **GitHub**. Une fenêtre va s'ouvrir pour vous demander l'autorisation.
4. Sélectionnez votre dépôt `fonamif-projet`.
5. **Configuration du Build (TRÈS IMPORTANT)** :
   - **Base directory** : `frontend`
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
6. Cliquez sur **"Deploy site"**.

---

## Étape 5 : Configuration Finale (URL Backend)

1. Après avoir déployé votre backend (Railway ou Render), copiez son URL.
2. Sur Netlify, allez dans **Site configuration** > **Environment variables**.
3. Ajoutez cette variable :
   - **Key** : `VITE_API_URL`
   - **Value** : `https://votre-backend-url.com/api`
4. Re-déployez le site Netlify pour prendre en compte le changement.
