import {HttpRequest, HttpResponse} from "@angular/common/http";

import {ResourceCache} from "./resource-cache";


export class ResourceMemoryCache implements ResourceCache {
    put (request: HttpRequest<any>, response: HttpResponse<any>) {
        // TODO
    };

    pop (request: HttpRequest<any>) {
        // TODO
        return null;
    };

    get (request: HttpRequest<any>) {
        // TODO
        return null;
    };

    invalidate (related: boolean) {
        // TODO
    };

}