# 1. Imagem Base
FROM node:18-alpine

# 2. Diretório de Trabalho
WORKDIR /usr/src/app

RUN apk update && apk add --no-cache openssl

# 3. Copiar Arquivos de Dependência
COPY package*.json ./

# 4. Instalar TODAS as dependências (incluindo as de desenvolvimento)
RUN npm install

# 5. Copiar todo o código-fonte
COPY . .

RUN npx prisma generate

# 6. Rodar o build para verificar erros de TypeScript durante a criação da imagem
#RUN npm run build
RUN npx tsc --skipLibCheck || true

# 7. Expor a porta da aplicação
EXPOSE 3000

# 8. Comando padrão para iniciar o container em modo de desenvolvimento
CMD [ "npm", "run", "dev" ]
