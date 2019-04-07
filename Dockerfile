FROM keymetrics/pm2:8-alpine as builder
MAINTAINER  zhouyu muyu.zhouyu@outlook.com
COPY src src/
COPY test test/
COPY config config/
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY tsconfig.build.json .
RUN npm install --registry=https://registry.npm.taobao.org
RUN npm run build

FROM keymetrics/pm2:8-alpine
MAINTAINER zhouyu muyu.zhouyu@outlook.com 
COPY --from=builder dist dist/
COPY --from=builder config config/
COPY --from=builder node_modules node_modules/
RUN apk add -U tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && apk del tzdata
ENTRYPOINT pm2-runtime /dist/src/main.js