FROM ubuntu:latest

WORKDIR /opt/app

COPY ./app /opt/app

RUN chmod +x ragemp-server

CMD ["./ragemp-server"]