# Playwright image sudah menyertakan browser dan dependensi OS.
# Versi dipatok sama dengan package.json.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

ENV CI=1 \
    NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    SIAKAD_BASE_URL=https://siakad.polinema.ac.id \
    HEADLESS=true

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY playwright.config.js ./
COPY src ./src
COPY tests ./tests

RUN mkdir -p /app/reports

CMD ["npx", "playwright", "test"]
