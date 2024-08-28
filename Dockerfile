FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
RUN npm i -D @sveltejs/adapter-node
COPY . .
RUN sed -i 's/adapter-auto/adapter-node/g' /app/svelte.config.js
RUN npm run build
ENV PORT=8080
ENV HOST=0.0.0.0
CMD ["node", "build/index.js"]
