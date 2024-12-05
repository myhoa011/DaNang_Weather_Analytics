import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Charts = React.lazy(() => import('./views/charts/Charts'))
const Cluster = React.lazy(() => import('./views/pages/cluster/Cluster'))
const TomorrowTemp = React.lazy(() => import('./views/pages/cluster/PredictTemTomorrow'))
const PredictSeason = React.lazy(() => import('./views/pages/cluster/PredictSeasonForDay'))
const SpiderChart = React.lazy(() => import('./views/pages/Spider'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/cluster', name: 'Cluster', element: Cluster },
  { path: '/predict-temp-next-day', name: `Tomorrow's temp`, element: TomorrowTemp },
  { path: '/predict-season-for-day', name: `Predict season`, element: PredictSeason },
  { path: '/spider-chart', name: `Spider chart`, element: SpiderChart },
]

export default routes
