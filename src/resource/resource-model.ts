import {HttpRequest, HttpResponse} from "@angular/common/http";

import {Observable} from "rxjs/Observable";

import {ResourceBase} from "./resource";
import {ResourceModelActionMethod} from "./resource-action-method";


export type ResourceModelMethods<T> = {
    /**
     * Calls the request action instance method.
     */
    [$requestAction: string]: ResourceModelActionMethod<T>;
}


export type ResourceModel<T> = ResourceModelMethods<T> & T & {
    /**
     * Indicates if the resource result is resolved and holding data the server sent.
     */
    $resolved: boolean;

    /**
     * Contains an `Observable` for the asynchronous result.
     */
    $observable: Observable<any>;

    /**
     * Contains an `Promise` for the asynchronous result.
     */
    $promise: Promise<any>;

    /**
     * Reference to the `Resource` instance that created the model object.
     */
    $resource: ResourceBase;

    /**
     * Reference to the `HttpRequest` instance.
     */
    $request?: HttpRequest<any>;

    /**
     * Reference to the `HttpResponse` instance.
     */
    $response?: HttpResponse<any>;
}
