# +------------------------------------------------+
# |          REDTETRIS BACKEND DOCKERFILE          |
# +------------------------------------------------+

FROM    node:14

WORKDIR /usr/src/app/backend

COPY    package*.json ./

RUN     npm install
RUN     apt-get update && apt-get install -y sqlite3

COPY    . .

EXPOSE  ${BACKEND_PORT}

CMD     ["npm", "run", "dev"]
