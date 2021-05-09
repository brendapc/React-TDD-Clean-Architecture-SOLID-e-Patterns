import Styles from './input-styles.scss'
import React from 'react'

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export const Input: React.FC<Props> = (props: Props) => {
  const enableInput = (event: React.FocusEvent<HTMLInputElement>): void => {
    event.target.readOnly = false
  }

  return (
    <div className={Styles.inputWrapper}>
      <input {...props} readOnly onFocus={enableInput} />
      <span className={Styles.status}>❗</span>
    </div>
  )
}