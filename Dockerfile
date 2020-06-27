FROM node:14

ENV couchUserDB "http://localhost:5984/_users"
ENV secret "myverycoolsecrettosigntokenswith"
ENV token_timeout "86400"
ENV token_path = "/auth/token"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]