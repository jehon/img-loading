
FROM node:latest

ENV DEBIAN_FRONTED=noninteractive

RUN apt update -y \
    && curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -O \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm -f google-chrome-*.deb
