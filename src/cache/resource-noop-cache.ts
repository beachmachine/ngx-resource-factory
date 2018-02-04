import {HttpRequest} from "@angular/common/http";

import {ResourceCache} from "./resource-cache";
import {ResourceCacheItemPromisable} from "./resource-cache-item";


/**
 * This is a cache class that implements the cache interface, but does no actual caching.
 */
export class ResourceNoopCache implements ResourceCache {

    constructor() {}

    put (request: HttpRequest<any>, obj: ResourceCacheItemPromisable): ResourceCacheItemPromisable {
        return obj;
    };

    pop (request: HttpRequest<any>): ResourceCacheItemPromisable {
        return null;
    };

    get (request: HttpRequest<any>): ResourceCacheItemPromisable {
        return null;
    };

    has (request: HttpRequest<any>): boolean {
        return false;
    };

    invalidate () {};

}