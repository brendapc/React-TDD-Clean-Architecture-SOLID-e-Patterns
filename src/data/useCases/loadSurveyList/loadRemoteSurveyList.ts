import { ILoadSurveyList } from '@/domain/useCases/loadSurveyList'
import { IHttpGetClient } from '@/data/protocols/http'

export class RemoteLoadSurveyList {
  constructor (private readonly url: string,
    private readonly httpGetClient: IHttpGetClient) {}

  async loadAll (): Promise<void> {
    await this.httpGetClient.get({ url: this.url })
  }
}
