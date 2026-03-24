export class RequestContextExtractor {
    static extract(request: any) {
        return {
            userId: request?.user?.id,
            lang: request?.headers?.lang || 'en',
        };
    }
}
