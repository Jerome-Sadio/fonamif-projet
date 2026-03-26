# Utiliser Maven pour compiler le projet
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app

# Copier le fichier pom.xml et les sources
COPY pom.xml .
COPY src ./src

# Compiler le projet en sautant les tests
RUN mvn clean package -DskipTests

# Utiliser une image OpenJDK légère pour l'exécution
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copier le fichier jar généré depuis l'étape précédente
COPY --from=build /app/target/attendance-system-0.0.1-SNAPSHOT.jar app.jar

# Exposer le port de l'application (Spring Boot utilise 8080 par défaut)
EXPOSE 8080

# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]
