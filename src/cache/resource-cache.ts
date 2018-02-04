import {HttpRequest} from "@angular/common/http";

import {ResourceCacheItem} from "./resource-cache-item";


export type ResourceCacheItemPromisable = ResourceCacheItem | Promise<ResourceCacheItem>;


/**
 * Interface defining the signature of a resource cache class.
 */
export interface ResourceCache {

    /**
     * Put that request/response pair on the cache.
     * @param {HttpRequest<any>} request
     * @param {any} obj
     */
    put: (request: HttpRequest<any>, obj: ResourceCacheItemPromisable) => ResourceCacheItemPromisable;

    /**
     * Pop the response for a request from the cache.
     * @param {HttpRequest<any>} request
     * @returns {any}
     */
    pop: (request: HttpRequest<any>) => ResourceCacheItemPromisable;

    /**
     * Get the response for a request from the cache.
     * @param {HttpRequest<any>} request
     * @returns {any}
     */
    get: (request: HttpRequest<any>) => ResourceCacheItemPromisable;

    /**
     * Checks if the given request is on the cache.
     * @param {HttpRequest<any>} request
     * @returns {boolean}
     */
    has: (request: HttpRequest<any>) => boolean;

    /**
     * Invalidate all data from the cache.
     */
    invalidate: () => void;

}