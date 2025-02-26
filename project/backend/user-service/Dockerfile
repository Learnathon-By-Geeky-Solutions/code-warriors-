FROM gradle:8.5-jdk21 as builder
WORKDIR /app
COPY . .
RUN gradle build -x test

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]