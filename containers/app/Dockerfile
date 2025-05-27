# FROM nikolaik/python-nodejs:python3.12-nodejs22
FROM node:22-slim

WORKDIR /app

COPY ./frontend ./frontend
COPY ./public ./public
COPY ./bin ./bin
COPY ./src ./src
COPY ./types ./types
COPY ./package.json ./
COPY ./Makefile ./

# Install base system dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        wget curl sudo apt-utils git jq tmux bash curl ca-certificates file make \
        libgl1-mesa-glx \
        libasound2-plugins libatomic1 && \
    # Remove packages with CVEs and no updates yet, if present
    (apt-get remove -y libaom3 || true) && \
    (apt-get remove -y libjxl0.7 || true) && \
    (apt-get remove -y libopenexr-3-1-30 || true) && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER root


RUN ls
RUN pwd
RUN make init
RUN npx playwright install
RUN npx playwright install-deps
RUN mkdir workspace
