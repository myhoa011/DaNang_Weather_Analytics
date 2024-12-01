import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div className="ms-auto">
        <span className="me-1">Developed by </span>
        <a href="https://www.google.com/search?q=MU&oq=Mu&gs_lcrp=EgZjaHJvbWUqEwgAEEUYJxg7GEYY_QEYgAQYigUyEwgAEEUYJxg7GEYY_QEYgAQYigUyBggBEEUYQDIGCAIQRRg7MgwIAxAjGCcYgAQYigUyDQgEEAAYgwEYsQMYgAQyBggFEEUYPTIGCAYQRRg8MgYIBxBFGDzSAQgxNDc2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8" target="_blank" rel="noopener noreferrer">
          You will be surprised when click
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
