import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Charts = React.lazy(() => import('./views/charts/Charts'))
const Cluster = React.lazy(() => import('./views/pages/cluster/Cluster'))
const Analysis = React.lazy(() => import('./views/pages/analysis/Analysis'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/cluster', name: 'Cluster', element: Cluster },
  { path: '/analysis', name: 'Analysis', element: Analysis},
]

export default routes
