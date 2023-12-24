  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: ${IMAGE_NAME}-deployment
    labels:
      app: ${IMAGE_NAME}
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: ${IMAGE_NAME}
    template:
      metadata:
        annotations: 
            update: ${HASHCODE}
        labels:
          app: ${IMAGE_NAME}
      spec:
        containers:
          - name: ${IMAGE_NAME}
            image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}
            imagePullPolicy: Always


