import React from 'react'

const Cluster = React.lazy(() => import('./views/cluster/Cluster'))
const TomorrowTemp = React.lazy(() => import('./views/cluster/PredictTemTomorrow'))
const SpiderChart = React.lazy(() => import('./views/cluster/Spider'))
const Analysis = React.lazy(() => import('./views/analysis/Analysis'))
const Prediction = React.lazy(() => import('./views/prediction/Prediction'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/cluster', name: 'Cluster', element: Cluster },
  { path: '/predict-temp-next-day', name: `Tomorrow's temp`, element: TomorrowTemp },
  { path: '/spider-chart', name: `Spider chart`, element: SpiderChart },
  { path: '/analysis', name: 'Analysis', element: Analysis},
  { path: '/prediction', name: 'Prediction', element: Prediction},
]

export default routes
