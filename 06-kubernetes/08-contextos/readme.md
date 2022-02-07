# Contextos

### Para ver el contexto actual

```
kubectl config current-context
```

### Para listar todos los Contextos

```
kubectl config view
```

### Crear un contexto

```
kubectl config set-context ctx-uat --cluster=docker-desktop --user=docker-desktop
```

### Para cambiar de contexto

```
kubectl config use-context ctx-uat
```
