# Despliegue local

### Crear contenedor de las imágenes al cual tenga acceso el cluster de K8S

```
docker run -d -p 5000:5000 --name registry --restart=always registry:2
```
