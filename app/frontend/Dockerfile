# +------------------------------------------------+
# |         REDTETRIS FRONTEND DOCKERFILE          |
# +------------------------------------------------+

FROM    node:19-alpine

WORKDIR /app

COPY    package*.json ./

RUN     npm install

COPY    . .

EXPOSE  ${FRONTEND_PORT}

CMD     ["npm", "start"]
