FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    tar \
    && rm -rf /var/lib/apt/lists/*

