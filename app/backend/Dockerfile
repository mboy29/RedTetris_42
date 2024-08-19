# +------------------------------------------------+
# |          REDTETRIS BACKEND DOCKERFILE          |
# +------------------------------------------------+

FROM    node:14

WORKDIR /usr/src/app/backend

COPY    . .

RUN     npm install

EXPOSE  ${BACKEND_PORT}

CMD     ["npm", "run", "dev"]
