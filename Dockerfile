FROM node:20

ENV TZ=America/Argentina/Buenos_Aires

WORKDIR /usr/src/app

# Instalar paquetes necesarios
RUN apt-get update && apt-get install -y graphicsmagick ghostscript

# Copiar archivos de dependencias
COPY package*.json ./

## Instalar todas las dependencias (incluyendo devDependencies) para el build
RUN npm ci --ignore-scripts

# Instalar PM2 globalmente
RUN npm install -g pm2

# Copiar el esquema de Prisma primero
COPY prisma ./prisma

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto de archivos
COPY . .


# Construir la aplicación
RUN npm run build

# Eliminar devDependencies para producción
RUN npm prune --production

EXPOSE 9000

# Usa PM2 para ejecutar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && pm2-runtime start ecosystem.config.js"]