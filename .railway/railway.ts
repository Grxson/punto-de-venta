import { Project, Service } from '@railway/config'

export default new Project({
  name: 'punto-de-venta',
  plugins: [],
  environments: {
    production: {
      name: 'production'
    }
  },
  services: {
    backend: new Service({
      name: 'backend',
      source: {
        type: 'github',
        owner: 'Grxson',
        repo: 'punto-de-venta',
        branch: 'main',
        path: 'backend'
      },
      variables: {
        SPRING_PROFILES_ACTIVE: 'railway',
        DATABASE_URL: 'postgresql://postgres:cdDJQnOfSNBZzYLyIqobxyWGxyKfwIMn@postgres.railway.internal:5432/railway',
        JWT_SECRET: 'cambiar-en-produccion-con-valor-seguro',
        CORS_ALLOWED_ORIGINS: 'https://*.up.railway.app,capacitor://localhost',
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'admin123'
      }
    }),
    'frontend-web': new Service({
      name: 'frontend-web',
      source: {
        type: 'github',
        owner: 'Grxson',
        repo: 'punto-de-venta',
        branch: 'main',
        path: 'frontend-web'
      },
      variables: {
        VITE_API_URL_PROD: 'https://punto-de-venta-backend.up.railway.app/api',
        VITE_API_TIMEOUT: '30000',
        VITE_APP_ENV: 'production',
        NODE_ENV: 'production'
      }
    })
  }
})
