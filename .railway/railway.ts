import { Project } from '@railway/config'

export const project = new Project()

// Backend Service
const backend = project.service('backend', {
  source: {
    type: 'repo',
    repo: 'punto-de-venta',
    rootDirectory: 'backend',
    branch: 'main'
  },
  variables: {
    SPRING_PROFILES_ACTIVE: 'railway',
    PORT: '8080'
  }
})

// Frontend Web Service
const frontend = project.service('frontend-web', {
  source: {
    type: 'repo',
    repo: 'punto-de-venta',
    rootDirectory: 'frontend-web',
    branch: 'main'
  },
  variables: {
    PORT: '3000'
  }
})

// Database already created - just reference
export default project
