import {HttpRequest, HttpResponse} from "@angular/common/http";


/**
 * Interface defining the signature of a resource cache class.
 */
export interface ResourceCache {

    /**
     * Put that request/response pair on the cache.
     * @param {HttpRequest<any>} request
     * @param {HttpResponse<any>} response
     */
    put: (request: HttpRequest<any>, response: HttpResponse<any>) => void;

    /**
     * Pop the response for a request from the cache.
     * @param {HttpRequest<any>} request
     * @returns {HttpResponse<any>}
     */
    pop: (request: HttpRequest<any>) => HttpResponse<any>;

    /**
     * Get the response for a request from the cache.
     * @param {HttpRequest<any>} request
     * @returns {HttpResponse<any>}
     */
    get: (request: HttpRequest<any>) => HttpResponse<any>;

    /**
     * Invalidate all data from the cache.
     * @param {boolean} related Also invalidate all related caches.
     */
    invalidate: (related: boolean) => void;

}