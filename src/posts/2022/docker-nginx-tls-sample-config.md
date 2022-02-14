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

Next, an nginx config file should be created and saved to `etc/nginx.conf`. For example, copy and update
[this template](https://github.com/nginx-proxy/nginx-proxy/blob/main/nginx.tmpl) to suit your needs.

The server sections should be similar to the following. Note again that the redirect urls contain
the explicity guest port 8443.

```nginx

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
