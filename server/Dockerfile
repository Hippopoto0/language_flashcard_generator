FROM openjdk:21-jdk


ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

ENTRYPOINT ["java","-jar","/app.jar"]
# ENTRYPOINT [ "./" ]
EXPOSE 8080

# CMD [ "mvn", "spring-boot:run" ]