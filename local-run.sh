 #!/bin/bash
 DOCKER_NAME="frontend-ide"

 docker run -i -t --name $DOCKER_NAME -p 8888:8888 $DOCKER_NAME:1.0
