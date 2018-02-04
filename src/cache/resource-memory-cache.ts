import {HttpRequest} from "@angular/common/http";

import {ResourceCache, ResourceCacheItemPromisable} from "./resource-cache";
import {ResourceActionHttpMethod} from "../resource/resource-action-http-method";


/**
 * Cache class that implements caching in the memory of the application. Thus this cache
 * is not persistent - an application reload will result in an empty cache.
 *
 * Note that this cache implementation only caches HTTP `GET` calls that expect a "text" or
 * "json" result. Anything else results in a cache-miss.
 */
export class ResourceMemoryCache implements ResourceCache {

    protected data: Map<string, ResourceCacheItemPromisable>;

    constructor() {
        this.invalidate();
    }

    /**
     * Put that request/response pair on the cache.
     * @param {HttpRequest<any>} request
     * @param {any} obj
     */
    put (request: HttpRequest<any>, obj: ResourceCacheItemPromisable): ResourceCacheItemPromisable {
        let
            key = this.getKey(request);

        // No key means not cacheable. Do nothing and return `null` in this case.
        if (!key) {
            return null;
        }

        // Put the result on the cache.
        this.data.set(key, obj);

        return obj;
    };

    /**
     * Pop the response for a request from the cache.
     * @param {HttpRequest<any>} request
     * @returns {any}
     */
    pop (request: HttpRequest<any>): ResourceCacheItemPromisable {
        let
            key = this.getKey(request);

        // No key means not cacheable. Do nothing and return `null` in this case.
        if (!key || !this.data.has(key)) {
            return null;
        }

        let
            obj = this.data.get(key);

        this.data.delete(key);
        return obj;
    };

    /**
     * Get the response for a request from the cache.
     * @param {HttpRequest<any>} request
     * @returns {any}
     */
    get (request: HttpRequest<any>): ResourceCacheItemPromisable {
        let
            key = this.getKey(request);

        // No key means not cacheable. Do nothing and return `null` in this case.
        if (!key || !this.data.has(key)) {
            return null;
        }

        return this.data.get(key);
    };

    /**
     * Checks if the given request is on the cache.
     * @param {HttpRequest<any>} request
     * @returns {boolean}
     */
    has (request: HttpRequest<any>): boolean {
        let
            key = this.getKey(request);

        return key && this.data.has(key);
    };

    /**
     * Invalidate all data from the cache.
     */
    invalidate () {
        this.data = new Map<string, ResourceCacheItemPromisable>();
    };

    /**
     * Get a cache key for the request. Returns `null` if the request is not
     * cacheable.
     * @param {HttpRequest<any>} request
     * @returns {string}
     */
    protected getKey(request: HttpRequest<any>): string {
        /*
         * We only want to generate cache keys for HTTP `GET` calls that expect "text" or "json" results.
         * On anything else just return `null`, meaning that the item will not be put on the cache.
         */
        if (
            request.method !== ResourceActionHttpMethod.GET &&
            ['json', 'text'].indexOf(request.responseType) !== -1
        ) {
            return null;
        }

        return `${request.method} ${request.urlWithParams}`;
    }
}