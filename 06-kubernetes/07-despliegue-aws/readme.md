# Despliegue en AWS

### Herramientas a instalar

- Chocolatey (Windows)
- Brew (MAC)
- aws-cli (https://awscli.amazonaws.com/AWSCLIV2.msi)
- eksctl (choco install eksctl -y)
- helm (choco install kubernetes-helm -y)

### Configurar usuario que acceda a AWS

```
aws configure
```

### Cluster

```
eksctl create cluster --name cluster-ms05 --without-nodegroup --region us-east-2 --zones us-east-2a,us-east-2b
```

### Agregar nodos

```
eksctl create nodegroup --cluster cluster-ms05 --name cluster-m05-nodegroup --node-type t3.medium --nodes 1 --nodes-min 1 --nodes-max 3 --asg-access
```

### Crear IAM Provider

```
eksctl utils associate-iam-oidc-provider --cluster cluster-ms05 --approve
```

### Descargar política para el Cluster

```
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.1.2/docs/install/iam_policy.json
```

### Crear la política

```
aws iam create-policy --policy-name AWSLoadBalancerPolicy --policy-document file://iam_policy.json
```

### Crear cuenta ServiceAccount para el Cluster

```
eksctl create iamserviceaccount --cluster cluster-ms05 --namespace=kube-system --name=aws-load-balancer-ms-05 --attach-policy-arn=arn:aws:iam::282865065290:policy/AWSLoadBalancerPolicy --override-existing-serviceaccounts --approve
```

### Verificar si existe el ingress controller del balanceador

```
kubectl get deploy -n kube-system alb-ingress-controller
```

### Instalar el target group binding

```
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"
```

### Agregar los repositorios

```
helm repo add eks https://aws.github.com/eks-charts
```

### Actualizar los repositorios

```
helm repo update
```

### Instalar el ingress controller del balanceador

```
helm upgrade -i aws-load-balancer-controller eks/aws-load-balancer-controller --set clusterName=cluster-ms05 --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-ms-05 -n kube-system
```

### Verificar que ahora exista el ingress controller del balanceador

```
kubectl get deploy -n kube-system aws-load-balancer-controller
```

### Crear las imágenes con los tags correspondientes

- Ir a ECR y crear los repositoios para cada imagen
- Usar las url de los repositorios con tagnames de cada una de las imágenes
  > _Revisar docker-compose-aws.yaml_

```
docker compose -f docker-compose-aws.yaml build
```

### Vincular la cuenta de AWS con la cuenta local de Docker

```
docker login -u AWS -p $(aws ecr get-login-password --region us-east-2) 282865065290.dkr.ecr.us-east-2.amazonaws.com
```

### Subir las imágenes al ECR

```
docker compose -f docker-compose-aws.yaml push
```
