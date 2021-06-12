import React from 'react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { render, RenderResult, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { AuthenticationSpy, ValidationStub } from '@/presentation/mocks'
import faker from 'faker'
import { InvalidCredentialsError } from '@/domain/errors'
import { Login } from './Login'
import { SaveAccessTokenMock } from '@/presentation/mocks/'

type SutTypes = {
  sut: RenderResult
  authenticationSpy: AuthenticationSpy
  saveAccessTokenMock: SaveAccessTokenMock
}
type SutParams = {
  validationError: string
}
const history = createMemoryHistory({ initialEntries: ['/login'] })

const makeSystemUnderTest = (params?: SutParams): SutTypes => {
  const validationStub = new ValidationStub()
  const authenticationSpy = new AuthenticationSpy()
  const saveAccessTokenMock = new SaveAccessTokenMock()
  validationStub.errorMessage = params?.validationError
  const sut = render(
    <Router history={history}>
      <Login validation={validationStub} authentication={authenticationSpy} saveAccessToken={saveAccessTokenMock}/>
    </Router>
  )
  return {
    sut,
    authenticationSpy,
    saveAccessTokenMock
  }
}

const simulateValidSubmit = (sut: RenderResult, email = faker.internet.email(), password = faker.internet.password()): void => {
  populateEmailField(sut, email)
  populatePasswordField(sut, password)
  const submitButton = sut.getByTestId('submit-button')
  fireEvent.click(submitButton)
}

const populateEmailField = (sut: RenderResult, email = faker.internet.email()): void => {
  const emailInput = sut.getByTestId('email')
  fireEvent.input(emailInput, { target: { value: email } })
}

const populatePasswordField = (sut: RenderResult, password = faker.internet.password()): void => {
  const passwordInput = sut.getByTestId('password')
  fireEvent.input(passwordInput, { target: { value: password } })
}

const testStatusForField = (sut: RenderResult, fieldName: string, validationError?: string): void => {
  const fieldStatus = sut.getByTestId(`${fieldName}-status`)
  expect(fieldStatus.title).toBe(validationError || 'Everything ok')
  expect(fieldStatus.textContent).toBe(validationError ? '❗' : '✔️')
}

describe('Login compoenent', () => {
  afterEach(cleanup)

  test('should mount components with inital state', () => {
    const validationError = faker.random.words()
    const { sut } = makeSystemUnderTest({ validationError })
    const errorWrap = sut.getByTestId('error-wrap') // we have to check if the wrapper has any child, since we expect the elements inside it dont exist at first
    expect(errorWrap.childElementCount).toBe(0)
    const submitButton = sut.getByTestId('submit-button') as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)
    testStatusForField(sut, 'email', validationError)
    testStatusForField(sut, 'password', validationError)
  })

  test('should show email error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSystemUnderTest({ validationError })
    populateEmailField(sut)
    testStatusForField(sut, 'email', validationError)
  })

  test('should show password error if Validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSystemUnderTest({ validationError })
    populatePasswordField(sut)
    testStatusForField(sut, 'password', validationError)
  })

  test('should show valid status if email validation succeeds', () => {
    const { sut } = makeSystemUnderTest()
    populateEmailField(sut)
    testStatusForField(sut, 'email')
  })

  test('should show valid status if password validation succeeds', () => {
    const { sut } = makeSystemUnderTest()
    populatePasswordField(sut)
    testStatusForField(sut, 'password')
  })

  test('should enable submit button if form values are valid', () => {
    const { sut } = makeSystemUnderTest()
    populateEmailField(sut)
    populatePasswordField(sut)
    const submitButton = sut.getByTestId('submit-button') as HTMLButtonElement
    expect(submitButton.disabled).toBe(false)
  })

  test('should show spinner on submit', () => {
    const { sut } = makeSystemUnderTest()
    simulateValidSubmit(sut)
    const spinner = sut.getByTestId('spinner')
    expect(spinner).toBeTruthy()
  })

  test('should call Authentication with correct values', () => {
    const { sut, authenticationSpy } = makeSystemUnderTest()
    const fakePassword = faker.internet.password()
    const fakeEmail = faker.internet.email()
    simulateValidSubmit(sut, fakeEmail, fakePassword)
    expect(authenticationSpy.params).toEqual({
      email: fakeEmail,
      password: fakePassword
    })
  })

  test('should not allow authentication to be called multiple times', () => {
    const { sut, authenticationSpy } = makeSystemUnderTest()
    simulateValidSubmit(sut)
    simulateValidSubmit(sut)
    expect(authenticationSpy.callsCount).toBe(1)
  })
  test('should not call Authentication if form values are invalid', () => {
    const validationError = faker.random.words()
    const { sut, authenticationSpy } = makeSystemUnderTest({ validationError })
    populateEmailField(sut)
    fireEvent.submit(sut.getByTestId('login-form'))
    expect(authenticationSpy.callsCount).toBe(0)
  })

  test('should present error if submit fails', async () => {
    const { sut, authenticationSpy } = makeSystemUnderTest()
    const error = new InvalidCredentialsError()
    jest.spyOn(authenticationSpy, 'auth').mockReturnValueOnce(Promise.reject(error))
    simulateValidSubmit(sut)
    const errorWrap = sut.getByTestId('error-wrap')
    await waitFor(() => errorWrap) // awaits for the error wrap to change before contnuing test
    const mainError = sut.getByTestId('main-error')
    expect(mainError.textContent).toBe(error.message)
    expect(errorWrap.childElementCount).toBe(1)
  })

  test('should call SaveAccessToken on success', async () => {
    const { sut, authenticationSpy, saveAccessTokenMock } = makeSystemUnderTest()
    simulateValidSubmit(sut)
    await waitFor(() => sut.getByTestId('login-form'))
    expect(saveAccessTokenMock.accessToken).toBe(authenticationSpy.fakeAccount.accessToken)
    expect(history.length).toBe(1)
    expect(history.location.pathname).toBe('/')
  })

  test('should send user to signup page', () => {
    const { sut } = makeSystemUnderTest()
    const signup = sut.getByTestId('signup')
    fireEvent.click(signup)
    expect(history.length).toBe(2)
    expect(history.location.pathname).toBe('/signup')
  })
})
