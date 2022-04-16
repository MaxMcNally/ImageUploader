FROM node
WORKDIR /app
RUN apt-get update &&\
  apt-get install python -y
COPY package-lock.json /app/
COPY package.json /app/
RUN npm install
COPY . /app/
CMD ["npm", "run", "start"]