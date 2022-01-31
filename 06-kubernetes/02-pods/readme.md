# Pods

### Para crear un pod

```
kubectl run server --image=nginx:alpine
```

### Listar Pods

```
kubectl get pods
kubectl get po
```

### Para vincular a un puerto de un pod

```
kubectl port-forward server 9000:80
```

### Para acceder a la información de un pod

```
kubectl get po <nombre del pod>
kubectl get po <nombre del pod> -o yaml
kubectl get po <nombre del pod> -o json
```

### Para describir lo que sucede dentro de un pod

```
kubectl describe po server
```

### Para ejecutar un manifiesto

```
kubectl apply -f 01-pod.yaml
```

### Para eliminar un manifiesto

```
kubectl delete -f 01-pod.yaml
```

### Para eliminar un pod

```
kubectl delete po server
```

### Para acceder a un contenedor único dentro de un pod

```
kubectl exec -it <nombre del pod> -- <bash | sh>
```

### Para acceder a un contenedor dentro de un pod (tiene más de un contenedor)

```
kubectl exec -it <nombre del pod> -c <nombre del contenedor> -- <bash | sh>
```

### Para acceder a los logs de un contenedor único de un pod

```
kubectl logs <nombre del pod>
```

### Para acceder a los logs de un contenedor de un pod (tiene más de un contenedor)

```
kubectl logs <nombre del pod> -c <nombre del contenedor>
```

### Para listar los pods mostrando etiquetas

```
kubectl get pods --show-labels
```

### Para filtrar pods usando etiquetas

```
kubectl get pods --show-labels -l env=dev
```
