#!/bin/sh

# 이미지 이름
IMAGE_NAME="frontend-ide"

# Docker 레지스트리 주소
DOCKER_REGISTRY=amdp-registry.skamdp.org/mydev-ywyi
DOCKER_REGISTRY_USER=robot$amdp-registry-robot-account
DOCKER_REGISTRY_PASSWORD=0Ohfvw1Fv0fETInThs4waSyCitLTMrfi
# 버전 태그
VERSION="1.0"

# Docker 이미지 빌드
docker build --tag ${IMAGE_NAME}:${VERSION} --platform=linux/amd64 --no-cache .
docker tag  ${IMAGE_NAME}:${VERSION} ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}

# Docker 이미지 푸시
docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}

