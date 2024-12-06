import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilChartPie, cilSpeedometer, cilStar, cilChart, cilBarChart } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Analysis chart',
    to: '/analysis',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Clsuter chart',
    to: '/cluster',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Spider chart',
    to: '/spider-chart',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Tomorrow's temp",
    to: '/predict-temp-next-day',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Prediction chart',
    to: '/prediction',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
]

export default _nav
