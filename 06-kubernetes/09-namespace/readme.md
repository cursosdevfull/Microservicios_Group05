# Namespaces

### Para listar los Namespaces

```
kubectl get namespaces
kubectl get ns
```

### Para listar elementos en un namespace específico

```
kubectl get po -n default
```

### Para crear un namespace

```
kubectl create ns test-ns
```

### Para eliminar un namespace

```
kubectl delete ns test-ns
```
