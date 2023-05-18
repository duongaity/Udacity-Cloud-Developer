# Udacity Cloud Developer

Project Overview

## Project 1: Deploy Static Website on AWS

The cloud is perfect for hosting static websites that only include HTML, CSS, and JavaScript files that require no server-side processing. The whole project has two major intentions to implement:
- Hosting a static website on S3 and
- Accessing the cached website pages using CloudFront content delivery network (CDN) service. Recall that CloudFront offers low latency and high transfer speeds during website rendering.

## Project 2: Your Own Instagram on AWS

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

## Project 3: Refactor Monolith to Microservices and Deploy

The project application, Udagram - an Image Filtering application, allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice. It has two components:
- Frontend - Angular web application built with Ionic framework
- Backend RESTful API - Node-Express application

Note:

#config
```
kubectl apply -f aws-secret.yaml
kubectl apply -f env-secret.yaml
kubectl apply -f env-configmap.yaml
```

#deployment
```
kubectl apply -f reverseproxy-deployment.yaml
kubectl apply -f backend-feed-deployment.yaml
kubectl apply -f backend-user-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

#service
```
kubectl apply -f reverseproxy-service.yaml
kubectl apply -f backend-feed-service.yaml
kubectl apply -f backend-user-service.yaml
kubectl apply -f frontend-service.yaml
```

#loadbalancer
```
kubectl expose deployment frontend --type=LoadBalancer --name=publicfrontend
kubectl expose deployment reverseproxy --type=LoadBalancer --name=publicreverseproxy
```

#scalling
```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl get deployment metrics-server -n kube-system
kubectl autoscale deployment frontend --cpu-percent=70 --min=3 --max=5
```

```
[default]
aws_access_key_id=[INPUT_KEY]
aws_secret_access_key=[INPUT_KEY]
aws_session_token=[INPUT_KEY]
```

## Project 4: Serverless Application

In this project you will develop and deploy a simple "TODO" application using AWS Lambda and Serverless framework. This application will allow users to create/remove/update/get TODO items. Each TODO item contains the following fields:
- todoId (string) - a unique id for an item
- createdAt (string) - date and time when an item was created
- name (string) - name of a TODO item (e.g. "Change a light bulb")
- dueDate (string) - date and time by which an item should be completed
- done (boolean) - true if an item was completed, false otherwise
- attachmentUrl (string) (optional) - a URL pointing to an image attached to a TODO item

You might also store an id of a user who created a TODO item. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

## Project 5: Capstone

In this project, I will develop and deploy a simple "TODO" application using AWS Lambda and Serverless framework.

Functionality of the application:
- The application will allow users to create/remove/update/read (CRUD) TODO items.
- The application requires the user to login.
- The application includes the backend and the frontend.
- Each TODO item can optionally have an attachment image.
- Each user only has access to TODO items that he/she has created.
