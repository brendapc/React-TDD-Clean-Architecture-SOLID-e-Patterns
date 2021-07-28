import React from 'react'
import { render, screen } from '@testing-library/react'
import { SurveyList } from './SurveyList'
import { ISurveyModel } from '@/domain/models'
import { ILoadSurveyList } from '@/domain/useCases'

type SutTypes = {
  loadSurveyListSpy: LoadSurveyListSpy
}

class LoadSurveyListSpy implements ILoadSurveyList {
  callsCount = 0
  async loadAll (): Promise<ISurveyModel[]> {
    this.callsCount++
    return []
  }
}

const makeSystemUnderTest = (): SutTypes => {
  const loadSurveyListSpy = new LoadSurveyListSpy()
  render(<SurveyList loadSurveyList={loadSurveyListSpy}/>)
  return {
    loadSurveyListSpy
  }
}

describe('SurveyList Component', () => {
  test('should present 4 empty items on start', () => {
    makeSystemUnderTest()
    const surveyList = screen.getByTestId('survey-list')
    expect(surveyList.querySelectorAll('li:empty').length).toBe(4)
  })

  test('should call LoadSurveyList', () => {
    const { loadSurveyListSpy } = makeSystemUnderTest()
    expect(loadSurveyListSpy.callsCount).toBe(1)
  })
})