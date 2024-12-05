import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilChartPie, cilSpeedometer, cilStar } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },

  {
    component: CNavItem,
    name: 'Charts',
    to: '/charts',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Clsuter chart',
        to: '/cluster',
      },
      {
        component: CNavItem,
        name: `Tomorrow's temp`,
        to: '/predict-temp-next-day',
      },
      {
        component: CNavItem,
        name: `Predict season for day`,
        to: '/predict-season-for-day',
      },
      {
        component: CNavItem,
        name: `Spider chart`,
        to: '/spider-chart',
      },
    ],
  },
]

export default _nav
