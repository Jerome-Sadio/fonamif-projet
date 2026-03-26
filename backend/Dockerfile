# Utiliser Maven avec Eclipse Temurin pour compiler le projet
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copier le fichier pom.xml et les sources
COPY pom.xml .
COPY src ./src

# Compiler le projet en sautant les tests
RUN mvn clean package -DskipTests

# Utiliser l'image JRE d'Eclipse Temurin pour l'exécution
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copier le fichier jar généré depuis l'étape précédente
COPY --from=build /app/target/attendance-system-0.0.1-SNAPSHOT.jar app.jar

# Exposer le port de l'application
EXPOSE 8080

# Commande de démarrage avec limites mémoire pour Render (Free Tier: 512MB RAM)
ENTRYPOINT ["java", "-Xmx300m", "-Xms300m", "-jar", "app.jar"]
