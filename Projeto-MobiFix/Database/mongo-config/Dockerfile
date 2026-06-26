FROM mongo:latest

RUN apt-get update && apt-get install -y mongodb-database-tools && rm -rf /var/lib/apt/lists/*

COPY scripts/ /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init.sh

EXPOSE 27017