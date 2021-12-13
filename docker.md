# Contenedores

## Rabbit

```
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
```

_Management:_ http://localhost:15672
_user:_ guest
_pass:_ guest
