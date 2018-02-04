import {HttpResponse} from "@angular/common/http";

import {ResourceActionOptions} from "../resource/resource-action-options";
import {ResourceBase} from "../resource/resource";


/**
 * Class definition for items on the cache. An item on the cache needs to hold the actual response from the
 * HTTP call, the resource used to make the HTTP call and the action options of the method used for
 * the HTTP call.
 */
export class ResourceCacheItem {

    protected _timestamp: number;

    constructor(protected _response: HttpResponse<any>, protected _resource: ResourceBase, protected _actionOptions: ResourceActionOptions, protected _ttl: number) {
        this._timestamp = new Date().getTime();
    }

    /**
     * Gets a clone of the HTTP response we got from the HTTP call.
     * @returns {HttpResponse<any>}
     */
    get response() {
        return this._response.clone();
    }

    /**
     * Gets the resource used for the HTTP call.
     * @returns {ResourceBase}
     */
    get resource() {
        return this._resource;
    }

    /**
     * Gets the action options used for the HTTP call.
     * @returns {ResourceActionOptions}
     */
    get actionOptions() {
        return this._actionOptions;
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

    /**
     * Update the response body with the data from the given new response object.
     * @param {HttpResponse<any>} newResponse
     */
    update(newResponse: HttpResponse<any>) {
        // TODO
    }
}


export type ResourceCacheItemPromisable = ResourceCacheItem | Promise<ResourceCacheItem>;
