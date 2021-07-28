import { ISurveyModel } from '@/domain/models'
import { ILoadSurveyList } from '@/domain/useCases'
import { Footer, LoggedInHeader } from '@/presentation/components/layout'
import React, { useEffect, useState } from 'react'
import { SurveyItem, SurveyItemEmpty } from './components'
import Styles from './surveyList.styles.scss'

type Props = {
  loadSurveyList: ILoadSurveyList
}

export const SurveyList: React.FC<Props> = ({ loadSurveyList }: Props) => {
  const [state, setState] = useState({
    surveys: [] as ISurveyModel[]
  })
  useEffect(() => {
    (async function () {
      await loadSurveyList.loadAll().then(surveys => setState({ surveys }))
    })()
  }, [])

  return (
    <div className={Styles.surveyListWrapper}>
      <LoggedInHeader />
      <div className={Styles.contentWrapper}>
        <h2>Enquetes</h2>
        <ul data-testid="survey-list">
          {state.surveys.length
            ? (
                state.surveys.map((survey: ISurveyModel) =>
              <SurveyItem key={survey.id} survey={survey} />
                )
              )
            : (
            <SurveyItemEmpty />
              )}
        </ul>
      </div>
      <Footer />
    </div>
  )
}
