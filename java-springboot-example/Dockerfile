FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app
ENV PORT=8080

COPY --from=builder /app/target/java-springboot-example-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -jar /app/app.jar --server.port=${PORT:-8080}"]
