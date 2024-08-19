# +------------------------------------------------+
# |         REDTETRIS FRONTEND DOCKERFILE          |
# +------------------------------------------------+

FROM    node:19-alpine

WORKDIR /app

COPY    . .

RUN     npm install

EXPOSE  ${FRONTEND_PORT}

CMD     ["npm", "start"]
