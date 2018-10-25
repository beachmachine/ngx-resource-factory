import { HttpRequest, HttpResponse } from "@angular/common/http";

import { Observable } from "rxjs";

import { ResourceModelActionMethod } from "./resource-action-method";
import { ResourceInstance } from "./resource-instance";
import { ResourceBase } from "./resource";


export type ResourceModelMethods<T> = {
    /**
     * Calls the request action instance method.
     */
    [$requestAction: string]: ResourceModelActionMethod<T>;
}


export type ResourceModel<T> = T & ResourceInstance & ResourceModelMethods<T> & {

    /**
     * Indicates if the resource result is resolved and holding
     * data the server sent.
     * @returns {boolean}
     */
    $resolved: boolean;

    /**
     * The total number from the `totalAttr` on lists.
     * @returns {number}
     */
    $total: number;

    /**
     * Contains an `Observable` for subscribing to `HttpEvent` events.
     * @returns {Observable<any>}
     */
    $http: Observable<any>;

    /**
     * Contains an `Observable` for the asynchronous result.
     * @returns {Observable<any>}
     */
    $observable: Observable<any>;

    /**
     * Contains an `Promise` for the asynchronous result.
     * @returns {Promise<any>}
     */
    $promise: Promise<any>;

    /**
     * Reference to the `Resource` instance that created the
     * model object. Gives `null` if resource instance is not bound
     * to an resource.
     * @returns {ResourceBase}
     */
    $resource: ResourceBase;

    /**
     * Reference to the `HttpRequest` instance. Gives `null` if
     * resource instance does not come from a HTTP source.
     * @returns {HttpRequest<any>}
     */
    $request: HttpRequest<any>;

    /**
     * Reference to the `HttpResponse` instance. Gives `null` if
     * resource instance does not come from a HTTP source.
     * @returns {HttpResponse<any>}
     */
    $response: HttpResponse<any>;

};
