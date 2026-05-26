FROM node:20-slim

# Install Java (needed for compilation)
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk maven && \
    apt-get clean;

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
