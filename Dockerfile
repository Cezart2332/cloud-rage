FROM debian:bullseye-slim

WORKDIR /opt/ragemp

# Copy the entire server files into the image
COPY . /opt/ragemp

# System deps: runtime libs for ragemp-server and Node.js for server scripts
RUN set -eux; \
		apt-get update; \
		apt-get install -y --no-install-recommends \
			ca-certificates curl gnupg \
			libunwind8 libssl1.1 libatomic1 libstdc++6; \
		rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x for Prisma and other server-side deps
RUN set -eux; \
		apt-get update; \
		curl -fsSL https://deb.nodesource.com/setup_18.x | bash -; \
		apt-get install -y --no-install-recommends nodejs; \
		rm -rf /var/lib/apt/lists/*; \
		node -v && npm -v

# Extract Linux server if archive exists, and ensure binary location/permissions
RUN set -eux; \
		if [ -f linux_x64.tar.gz ]; then \
			mkdir -p /opt/ragemp/.linux; \
			tar -xzf linux_x64.tar.gz -C /opt/ragemp/.linux; \
			if [ ! -f /opt/ragemp/ragemp-server ]; then \
				f=$(find /opt/ragemp/.linux -type f -name ragemp-server -print -quit || true); \
				if [ -n "$f" ]; then cp "$f" /opt/ragemp/ragemp-server; fi; \
			fi; \
		fi; \
		if [ -f /opt/ragemp/ragemp-server ]; then chmod +x /opt/ragemp/ragemp-server; fi

# Install JS deps and generate Prisma client if present
RUN set -eux; \
		if [ -f /opt/ragemp/package.json ]; then \
			cd /opt/ragemp; \
			npm i --omit=dev || true; \
			if [ -f /opt/ragemp/packages/prisma/schema.prisma ]; then \
				npx prisma generate --schema=/opt/ragemp/packages/prisma/schema.prisma || true; \
			fi; \
		fi

# Entry script to diagnose missing libs and run the server
RUN printf '#!/bin/sh\nset -e\ncd /opt/ragemp\nif [ ! -x ./ragemp-server ]; then f=$(find . -maxdepth 4 -type f -name ragemp-server -print -quit || true); [ -n "$f" ] && cp "$f" ./ragemp-server && chmod +x ./ragemp-server; fi\necho "Checking ragemp-server dependencies..."\nif [ -f ./ragemp-server ]; then ldd ./ragemp-server || true; fi\nif [ ! -f ./ragemp-server ]; then echo "ERROR: ragemp-server not found."; ls -la; exit 1; fi\nif ldd ./ragemp-server | grep -q "not found"; then echo "ERROR: Missing shared libraries above."; exit 1; fi\nexec ./ragemp-server\n' > /opt/ragemp/entrypoint.sh \
		&& chmod +x /opt/ragemp/entrypoint.sh

# Expose default RAGE:MP ports
EXPOSE 22005/udp 22006

# Start the RAGE:MP server via entrypoint
CMD ["/bin/sh", "/opt/ragemp/entrypoint.sh"]