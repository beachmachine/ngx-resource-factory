import {HttpRequest, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

import {clean, clone} from "./resource-utils";
import {ResourceBase} from "./resource";


/**
 * Class that represent an resource instance. Any model definition should inherit
 * from this class.
 */
export class ResourceInstance {

    constructor(data?: object) {
        data = data || {};
        Object.assign(this, data);
    }

    /**
     * Indicates if the resource result is resolved and holding
     * data the server sent.
     * @returns {boolean}
     */
    get $resolved(): boolean {
        return true;
    }

    /**
     * Contains an `Observable` for the asynchronous result.
     * @returns {Observable<any>}
     */
    get $observable(): Observable<any> {
        return Observable.of(this);
    }

    /**
     * Contains an `Promise` for the asynchronous result.
     * @returns {Promise<any>}
     */
    get $promise(): Promise<any> {
        return this.$observable.toPromise();
    }

    /**
     * Reference to the `Resource` instance that created the
     * model object. Gives `null` if resource instance is not bound
     * to an resource.
     * @returns {ResourceBase}
     */
    get $resource(): ResourceBase {
        return null;
    }

    /**
     * Reference to the `HttpRequest` instance. Gives `null` if
     * resource instance does not come from a HTTP source.
     * @returns {HttpRequest<any>}
     */
    get $request(): HttpRequest<any> {
        return null;
    }

    /**
     * Reference to the `HttpResponse` instance. Gives `null` if
     * resource instance does not come from a HTTP source.
     * @returns {HttpResponse<any>}
     */
    get $response(): HttpResponse<any> {
        return null;
    }

    /**
     * Load data coming from an external (HTTP) source.
     * @param {Object} data
     * @returns {ResourceInstance}
     */
    public load(data: object): ResourceInstance {
        data = clean(data);
        return Object.assign(this, data);
    }

    /**
     * Dump data fro an external (HTTP) source.
     * @returns {Object}
     */
    public dump(): object {
        return clone(this);
    }

    /**
     * Checks if the instance is a phantom instance, meaning that it has not yet been
     * submitted to the server and does not come from the server.
     * @returns {boolean}
     */
    public isPhantom(): boolean {
        let
            resource = this.$resource,
            phantomIdGenerator = resource ? resource.getPhantomIdGenerator() : null,
            pkAttr = resource ? resource.getOptions().pkAttr : null;

        /*
         * Return `null` if the instance is not bound to an resource, the bound
         * resource does not have a configured `phantomIdGeneratorClass`, or the bound
         * resource does not have a configured `pkAttr`.
         */
        if (!phantomIdGenerator || !pkAttr) {
            return null;
        }

        return phantomIdGenerator.is(this[pkAttr]);
    }
}