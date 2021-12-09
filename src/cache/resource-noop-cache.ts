
import { HttpRequest } from '@angular/common/http';

import { ResourceCache } from './resource-cache';
import { ResourceCacheItem, ResourceCacheItemPromisable } from './resource-cache-item';


/**
 * This is a cache class that implements the cache interface, but does no actual caching.
 */
export class ResourceNoopCache implements ResourceCache {

    constructor() {
    }

    put(_request: HttpRequest<any>, obj: ResourceCacheItemPromisable): ResourceCacheItemPromisable {
        return obj;
    }

    pop(_request: HttpRequest<any>): ResourceCacheItemPromisable {
        return null;
    }

    get(_request: HttpRequest<any>): ResourceCacheItemPromisable {
        return null;
    }

    has(_request: HttpRequest<any>): boolean {
        return false;
    }

    populate(_urlAttr: string, _items: ResourceCacheItem[]) {
    }

    invalidate() {
    }

}
