---
title: Docker nginx reverse proxy sample config
permalink: posts/docker-nginx-tls-sample-config/
date: 2022-01-09
tags: ['nginx', 'docker']
---

Local development configuration for setting up docker-compose to run nginx as reverse proxy to a dynamic web
application or static site, for example.


## Update hosts


Assuming the site domain is **devtest.local**,  update `/etc/hosts` (or `C:/Windows/System32/drivers/etc/hosts`)
by adding this line to the end of the file:

    127.0.0.1   devtest.local


## Server Certificates

In the directory where the `docker-compose.yml` file lives, create `etc` and `etc/certs` sub-directories and copy the
server's certificate and private key to the latter directory.

For example, using the script described in [the previous post](/posts/x509-certs-javascript/):

```bash
$ node mkcert.js devtest.local
Creating self-signed certificate (CN=devtest.local)...

$ chmod 400 devtest.local.key

$ ls
devtest.local.crt devtest.local.key

```

## docker-compose.yml

Then the `docker compose` configuration file should look similar to:

```yaml

version: '3'
services:

  nginx:
    image: nginx:latest
    volumes:
      - ./etc/certs:/etc/nginx/certs
      - ./etc/nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "8443:443"
    networks:
      - backend
    depends_on:
      - server54
    links:
      - server54

networks:
  backend:
    driver: bridge

```

Notice that in this example the container's 443 port is mapped to 8443 in the host. So the url to visit, after
running `docker compose up`, is:

```
    https://devtest.local:8443
```

But you could also have 443 on both host and container so as not to require the explicit port in the url.


## nginx.conf (sample)

The following is a generic nginx configuration file based on
[this template](https://github.com/nginx-proxy/nginx-proxy/blob/main/nginx.tmpl) - update to suit your needs.
This should exist as `etc/nginx.conf` to match the docker compose config above.

```nginx

map $http_x_forwarded_proto $proxy_x_forwarded_proto {
  default $http_x_forwarded_proto;
  ''      $scheme;
}
map $http_x_forwarded_port $proxy_x_forwarded_port {
  default $http_x_forwarded_port;
  ''      $server_port;
}
map $http_upgrade $proxy_connection {
  default upgrade;
  '' close;
}
# Apply fix for very long server names
server_names_hash_bucket_size 128;
# Set appropriate X-Forwarded-Ssl header based on $proxy_x_forwarded_proto
map $proxy_x_forwarded_proto $proxy_x_forwarded_ssl {
  default off;
  https on;
}
gzip_types text/plain text/css application/javascript application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
log_format vhost '$host $remote_addr - $remote_user [$time_local] '
                 '"$request" $status $body_bytes_sent '
                 '"$http_referer" "$http_user_agent" '
                 '"$upstream_addr"';
access_log off;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
# resolver 127.0.0.11;
# HTTP 1.1 support
proxy_http_version 1.1;
proxy_buffering off;
proxy_set_header Host $http_host;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $proxy_connection;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
proxy_set_header X-Forwarded-Ssl $proxy_x_forwarded_ssl;
proxy_set_header X-Forwarded-Port $proxy_x_forwarded_port;
# Mitigate httpoxy attack (see README for details)
proxy_set_header Proxy "";
server {
        server_name _; # This is just an invalid value which will never trigger on a real hostname.
        server_tokens off;
        listen 80;
        access_log /var/log/nginx/access.log vhost;
        return 503;
}
server {
        server_name devtest.local;
        listen 80 ;
        access_log /var/log/nginx/access.log vhost;
        location / {
                return 301 https://$host:8443$request_uri;
        }
}
server {
        server_name devtest.local;
        listen 443 ssl http2;
        access_log /var/log/nginx/access.log vhost;
        ssl_session_timeout 5m;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        ssl_certificate /etc/nginx/certs/devtest.local.crt;
        ssl_certificate_key /etc/nginx/certs/devtest.local.key;

        add_header Strict-Transport-Security "max-age=31536000" always;

        root /usr/share/nginx;

        location = / {
            return 301 https://$host:8443/;
        }
}
```
