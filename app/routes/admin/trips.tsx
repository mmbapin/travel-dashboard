import { Header } from 'components'
import React from 'react'

const Trips = () => {
  return (
    <main className='dashboard wrapper'>
        <Header 
            title="Trips"
            description="View and edit AI-generated travel plans."
            ctaText="Create New Trip"
            ctaUrl="/trips/create"
        />
    </main>
  )
}

export default Trips