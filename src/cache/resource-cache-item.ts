import { HttpResponse } from '@angular/common/http';

import { ResourceBase } from '../resource/resource';


/**
 * Enum for response object markers.
 */
export enum ResourceCacheItemMarker {
    CACHED = '__cached_response__',
    PREPOPULATED = '__prepopulated_response__',
}


/**
 * Class definition for items on the cache. An item on the cache needs to hold the actual response from the
 * HTTP call, the resource used to make the HTTP call and the action options of the method used for
 * the HTTP call.
 */
export class ResourceCacheItem {

    protected _timestamp: number;

    constructor(protected _response: HttpResponse<any>,
                protected _resource: ResourceBase,
                protected _ttl: number) {
        this._timestamp = new Date().getTime();
    }

    /**
     * Gets a clone of the HTTP response we got from the HTTP call.
     * @returns {HttpResponse<any>}
     */
    get response() {
        let
            response = this._response.clone();

        // Set a marker that the response objects comes from a cache
        response[ResourceCacheItemMarker.CACHED] = true;

        return response;
    }

    /**
     * Gets the resource used for the HTTP call.
     * @returns {ResourceBase}
     */
    get resource() {
        return this._resource;
    }

    /**
     * Gets the timestamp the cache item was created at.
     * @returns {number}
     */
    get timestamp() {
        return this._timestamp / 1000;
    }

    /**
     * Gets if the cache item is already stale (exceeded its TTL).
     * @returns {boolean}
     */
    get stale() {
        return (this.timestamp + this._ttl) < (new Date().getTime() / 1000);
    }
}


export class PrepopulatedResourceCacheItem extends ResourceCacheItem {

    /**
     * Gets a clone of the HTTP response we got from the HTTP call.
     * @returns {HttpResponse<any>}
     */
    get response() {
        let
            response = this._response.clone();

        // Set a marker that the response objects comes from a cache and was prepopulated
        response[ResourceCacheItemMarker.CACHED] = true;
        response[ResourceCacheItemMarker.PREPOPULATED] = true;

        return response;
    }

}


export type ResourceCacheItemPromisable = ResourceCacheItem | Promise<ResourceCacheItem>;
