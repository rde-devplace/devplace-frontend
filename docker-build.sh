 #!/bin/bash
 DOCKER_NAME="frontend-ide"

 docker build --tag $DOCKER_NAME:1.0 --platform=linux/arm64 --no-cache .
