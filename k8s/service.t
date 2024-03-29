apiVersion: v1
kind: Service
metadata:
  name: ${IMAGE_NAME}-service
  namespace: ${NAMESPACE}
spec:
  selector:
    app: ${IMAGE_NAME}
  ports:
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8888
  type: ClusterIP

