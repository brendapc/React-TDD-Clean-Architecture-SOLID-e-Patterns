import { IGetStorage } from "@/data/protocols/cache";
import { IHttpGetClient, IHttpGetParams, IHttpResponse } from "@/data/protocols/http";

export class AuthorizeHttpGetClientDecorator implements IHttpGetClient{

    constructor(
        private readonly getStorage: IGetStorage,
        private readonly httpGetClient: IHttpGetClient
        ){}

    async get(params: IHttpGetParams): Promise<IHttpResponse>{
        this.getStorage.get('account')
        await this.httpGetClient.get(params)
        return null
    }

}