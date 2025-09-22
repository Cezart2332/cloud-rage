FROM ubuntu:latest

WORKDIR /opt/ragemp

# Copy the entire server files into the image
COPY . /opt/ragemp

# If the Linux server archive exists, extract it (ignore if already extracted)
RUN if [ -f linux_x64.tar.gz ]; then \
			tar -xzf linux_x64.tar.gz -C /opt/ragemp || true; \
		fi && \
		chmod +x /opt/ragemp/ragemp-server || true

# Expose default RAGE:MP ports
EXPOSE 22005/udp 22006

# Start the RAGE:MP server
CMD ["/opt/ragemp/ragemp-server"]