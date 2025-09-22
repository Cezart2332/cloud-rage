FROM ubuntu:latest

WORKDIR /opt/ragemp

# Copy the entire server files into the image
COPY . /opt/ragemp

# If the Linux server archive exists, extract it to a temp dir and place the binary in a known path
RUN set -eux; \
		if [ -f linux_x64.tar.gz ]; then \
			mkdir -p /opt/ragemp/.linux; \
			tar -xzf linux_x64.tar.gz -C /opt/ragemp/.linux; \
			# If the binary wasn't copied yet, try to locate and move it
			if [ ! -f /opt/ragemp/ragemp-server ]; then \
				f=$(find /opt/ragemp/.linux -type f -name ragemp-server -print -quit || true); \
				if [ -n "$f" ]; then mv "$f" /opt/ragemp/ragemp-server; fi; \
			fi; \
		fi; \
		# Ensure binary is executable if present
		if [ -f /opt/ragemp/ragemp-server ]; then chmod +x /opt/ragemp/ragemp-server; fi

# Expose default RAGE:MP ports
EXPOSE 22005/udp 22006

# Start the RAGE:MP server; try to locate the binary if not at default path
CMD ["/bin/sh", "-lc", "\
	set -e; \
	if [ -x /opt/ragemp/ragemp-server ]; then \
		exec /opt/ragemp/ragemp-server; \
	else \
		f=$(find /opt/ragemp -maxdepth 4 -type f -name ragemp-server -print -quit || true); \
		if [ -n \"$f\" ]; then chmod +x \"$f\" || true; exec \"$f\"; fi; \
		echo 'ERROR: ragemp-server binary not found in image.'; \
		echo 'Contents of /opt/ragemp:'; ls -la /opt/ragemp; \
		exit 1; \
	fi \
"]