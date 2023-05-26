FROM ubuntu
MAINTAINER Team Mongoose
ADD . /home/project/
EXPOSE 5000 3000
ARG DEBIAN_FRONTEND=noninteractive
COPY docker/dockerStart /home/dockerStart
RUN apt-get update \
    && apt-get install -y redis \
    && apt-get install -y gnupg \
    && apt-get install -y wget \
    && echo "deb http://apt.postgresql.org/pub/repos/apt focal-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && wget --no-check-certificate --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get install -y postgresql \
    && apt-get install -y libpq-dev python-dev python3-pip \
    && pip3 install -r /home/project/backend/requirements.txt \
    && apt-get install -y nodejs npm \
    && chmod 755 /home/dockerStart
USER postgres
RUN service postgresql start \
    && createdb trip_collab \
    && psql -c "create user root with password 'password'; grant all privileges on database trip_collab to root;alter role root with login;"
USER root
RUN service postgresql start \
    && psql trip_collab < /home/project/backend/data.sql \
    && rm -f /home/project/frontend/node_modules/.bin/next \
    && npm --prefix /home/project/frontend/ install \
    && npm --prefix /home/project/frontend/ install next 
CMD ["/bin/bash", "/home/dockerStart"]
