import React, { useContext } from 'react'
import SurveyContext from '../../context/SurveyContext'

export const Error: React.FC = () => {
  const { state } = useContext(SurveyContext)

  return (
    <div>
        <span data-testid="error">{state.error}</span>
        <button>Recarregar</button>
  </div>
  )
}