import React, { useEffect, useState } from 'react'
import { Footer, LoginHeader } from '@/presentation/components/layout'
import { Input, FormStatus } from '@/presentation/components/utils'
import Styles from './login-styles.scss'
import Context from '../../contexts/form/FormContext'
import { IValidation } from '../../protocols/validation'
import { IAuthentication } from '@/domain/useCases'

type Props = {
  validation: IValidation
  authentication: IAuthentication
}

export const Login: React.FC<Props> = ({ validation, authentication }: Props) => {
  const [formState, setFormState] = useState({
    isLoading: false,
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    mainError: ''
  })

  useEffect(() => {
    setFormState({
      ...formState,
      emailError: validation.validate('email', formState.email),
      passwordError: validation.validate('password', formState.password)
    })
  }, [formState.email, formState.password])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    try {
      event.preventDefault()
      if (formState.isLoading || formState.emailError || formState.passwordError) return
      setFormState({ ...formState, isLoading: true })
      await authentication.auth({ email: formState.email, password: formState.password })
    } catch (err) {
      setFormState({
        ...formState,
        isLoading: false,
        mainError: err.message
      })
    }
  }

  return (
    <div className={Styles.login}>
      <LoginHeader />
      <Context.Provider value={{ formState, setFormState }}>
        <form data-testid="login-form" className={Styles.form} onSubmit={handleSubmit}>
          <h2>Login</h2>
          <Input type="email" name="email" placeholder="Digite seu e-mail" />
          <Input type="password" name="password" placeholder="Digite sua senha" />
          <button data-testid="submit-button" className={Styles.submit} disabled={!!formState.emailError || !!formState.passwordError} type="submit">Entrar</button>
          <span className={Styles.link}>Criar conta</span>
          <FormStatus />
        </form>
      </Context.Provider>
      <Footer />
    </div>
  )
}
