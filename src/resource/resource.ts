import {Injectable, Type} from "@angular/core";
import {
    HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpRequest,
    HttpResponse
} from "@angular/common/http";

import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";

import "rxjs/add/observable/of";
import "rxjs/add/operator/shareReplay";
import "rxjs/add/operator/toPromise";

import {ResourceModel} from "./resource-model";
import {ResourceConfigurationOptions} from "./resource-configuration-options";
import {ResourceActionOptions} from "./resource-action-options";
import {ResourceInstance} from "./resource-instance";
import {ResourceAction} from "./resource-action";
import {ResourceActionMethod} from "./resource-action-method";
import {ResourceActionHttpMethod} from "./resource-action-http-method";
import {clean} from "./resource-utils";
import {PhantomIdGenerator} from "./phantom-id/phantom-id-generator";


/**
 * Type alias for a `ResourceInstance` enriched with `ResourceModel` properties.
 */
export type ResourceModelObject = ResourceModel<ResourceInstance>;


/**
 * Type alias for a `ResourceInstance` list enriched with `ResourceModel` properties.
 */
export type ResourceModelList = ResourceModel<ResourceModelObject[]>;


/**
 * Type alias for a result objects of resource action methods.
 */
export type ResourceModelResult = ResourceModelObject & ResourceModelList;


/**
 * Base class for resources without any resource actions defined.
 */
@Injectable()
export abstract class ResourceBase {
    /**
     * Map of action methods. Populated by the `@ResourceAction` decorator. Used to create the
     * resource action methods on `ResourceModel` objects.
     * @type {Map<string, Function>}
     */
    private actionMethods: Map<string, Function>;

    /**
     * Singleton instance of the configured phantom ID generator class.
     * @type {PhantomIdGenerator}
     */
    private phantomIdGenerator: PhantomIdGenerator;

    constructor(protected http: HttpClient) {}

    /**
     * Gets the resource configurations. This method is just a stub method and will be replaced by the
     * `ResourceConfiguration` decorator.
     * @returns {ResourceConfigurationOptions}
     */
    getOptions(): ResourceConfigurationOptions {
        return null;
    }

    /**
     * Register an resource action method for the resource. This is usually done by the `@ResourceAction`
     * decorator.
     * @param {string} name Name of the resource action.
     * @param {Function} fn Function of the resource action.
     */
    registerActionMethod(name: string, fn: Function) {
        // Initialize the action methods map, if not already existing.
        if (!this.actionMethods) {
            this.actionMethods = new Map<string, Function>();
        }

        this.actionMethods.set(name, fn);
    }

    /**
     * Gets the phantom ID generator class instance.
     * @returns {PhantomIdGenerator}
     */
    @NeedsOptions()
    protected getPhantomIdGenerator(): PhantomIdGenerator {
        let
            options = this.getOptions(),
            phantomIdGeneratorClass = options.phantomIdGeneratorClass;

        /*
         * The phantom ID generator is a singleton, so only instantiate if not already
         * instantiated.
         */
        if (!this.phantomIdGenerator) {
            this.phantomIdGenerator = new phantomIdGeneratorClass();
        }

        return this.phantomIdGenerator;
    }

    /**
     * Creates a resource model from the given payload.
     * @param {object} payload Payload for the created object
     * @param {Type<ResourceInstance>} instanceClass Class to instantiate (defaults to `instanceClass` on `options`)
     * @returns {ResourceModelObject}
     */
    @NeedsOptions()
    protected makeResourceModel(payload: object, instanceClass?: Type<ResourceInstance>): ResourceModelObject {
        payload = payload || {};

        let
            options = this.getOptions(),
            obj = new (instanceClass || options.instanceClass)();

        obj = Object.assign(obj, payload);
        obj = this.contributeResourceModelProperties(obj);

        /*
         * If the resource is configured to set phantom IDs on object instantiation, we
         * get the phantom ID generator class instance and let in generate the phantom id. This
         * also implies that the `pkAttr` has to be configured.
         */
        if (obj && !obj[options.pkAttr] && options.generatePhantomIds && options.pkAttr) {
            obj[options.pkAttr] = this.getPhantomIdGenerator().generate(obj);
        }

        return <ResourceModelObject>obj;
    }

    /**
     * Creates a resource model list from the given payload list.
     * @param payload
     * @returns {ResourceModelList}
     */
    @NeedsOptions()
    protected makeResourceModelList(payload: any[]): ResourceModelList {
        payload = payload || [];

        let
            objs = [];

        for (let obj of payload) {
            objs.push(this.makeResourceModel(obj));
        }

        return <ResourceModelList>this.contributeResourceModelProperties(objs);
    }

    /**
     * Processes the request for a resource. Builds the query from the given query data and the payload from the given
     * payload data. Executes the request according to the given action options and the configuration on the
     * resource itself. Will call the success callback if everything went fine and call the error callback in case
     * of an failure.
     * @param query Query data.
     * @param payload Payload data.
     * @param {Function} success Success callback function.
     * @param {Function} error Error callback function.
     * @param {ResourceActionOptions} actionOptions Options for the action to execute.
     * @returns {ResourceModel}
     */
    protected executeResourceAction(query: any, payload: any, success: Function, error: Function, actionOptions: ResourceActionOptions): ResourceModelResult {
        let
            /*
             * Model class to instantiate for the resource action.
             */
            instanceClass = actionOptions.instanceClass,

            /*
             * Object that contains the actual result. Will be populated with the response data as soon as the response
             * is complete.
             */
            resultObject = <ResourceModelResult>(actionOptions.isList ? this.makeResourceModelList([]) : this.makeResourceModel({}, instanceClass)),

            /*
             * The request method verb. We need to explicitly ensure string type here so we can use it in the
             * constructor of `HttpRequest`.
             */
            method = <string>actionOptions.method,

            /*
             * The URL for the request from built from the action configuration, the query and the payload.
             */
            url = this.buildUrl(query, payload, actionOptions),

            /*
             * Build the http request headers from the action configuration, the query and the payload.
             */
            headers = this.buildHeaders(query, payload, actionOptions),

            /*
             * Use the `dump` method on the payload object if it is an `ResourceInstance` object to get the
             * data representation that should be sent to the server. If the given payload is not a
             * `ResourceInstance` object, then we give it directly to the `clean` method.
             */
            cleanedPayload = clean(payload instanceof ResourceInstance ? payload.dump() : payload),

            /*
             * The request object for angular's `HttpClient` service.
             */
            request = new HttpRequest(method, url, cleanedPayload, {
                reportProgress: actionOptions.reportProgress,
                responseType: actionOptions.responseType,
                withCredentials: actionOptions.withCredentials,
                headers: headers,
            }),

            /*
             * The action response object.
             */
            actionModel = this.executeResourceActionRequest(resultObject, request, actionOptions);

        // Attach to the action model observable to call the given `success` and `error` callbacks.
        actionModel.$observable
            .subscribe(
                function (result) {
                    return success ? success(result) : undefined;
                },
                function (response) {
                    return error ? error(response) : undefined;
                }
            );

        return actionModel;
    }

    /**
     * Executes the given request and contributes the result to the given resource model object.
     * @param {ResourceModelResult} obj The object that should hold the result data.
     * @param {HttpRequest} request The request to execute.
     * @param {ResourceActionOptions} actionOptions Configuration options of the resource action.
     * @returns {ResourceModelResult}
     */
    protected executeResourceActionRequest(obj: ResourceModelResult, request: HttpRequest<any>, actionOptions: ResourceActionOptions): ResourceModelResult {
        let
            self = this,
            resolved = false,
            httpObservable = this.http.request(request),
            observable = Observable.create((observer: Observer<ResourceModelResult>) => {
                httpObservable.subscribe(
                    function next(event: HttpEvent<ResourceInstance>) {
                        switch (event.type) {
                            case HttpEventType.Sent:
                                // TODO
                                break;
                            case HttpEventType.UploadProgress:
                                // TODO
                                break;
                            case HttpEventType.ResponseHeader:
                                // TODO
                                break;
                            case HttpEventType.DownloadProgress:
                                // TODO
                                break;
                            case HttpEventType.Response:
                                resolved = true;

                                /*
                                 * Contribute the request and response as properties to the object.
                                 */
                                obj = self.contributeResourceModelRequestResponse(obj, request, event);

                                /*
                                 * In case we expect a JSON list, process the list result and notify the observer.
                                 */
                                if (actionOptions.responseType === 'json' && actionOptions.isList) {
                                    obj = self.processListResponse(obj, event, actionOptions);
                                    observer.next(obj);
                                }

                                /*
                                 * In case we expect a JSON object, process the object result and notify the observer.
                                 */
                                else if (actionOptions.responseType === 'json' && !actionOptions.isList) {
                                    obj = self.processObjectResponse(obj, event, actionOptions);
                                    observer.next(obj);
                                }

                                /*
                                 * In case we expect anything else, there is no need to process the result. We just
                                 * need to notify the observer with the resource model object.
                                 */
                                else {
                                    observer.next(obj);
                                }

                                break;
                            case HttpEventType.User:
                                // TODO
                                break;
                        }
                    },
                    function error(errorResponse: HttpErrorResponse) {
                        observer.error(errorResponse);
                    },
                    function complete() {
                        observer.complete();
                    }
                )
            }).shareReplay(-1);

        /*
         * Contribute the request as property to the object.
         */
        obj = this.contributeResourceModelRequestResponse(obj, request);

        /*
         * Contribute the request/response related model properties to the object.
         */
        Object.defineProperty(obj, '$resolved', {
            get: function () {
                return resolved;
            },
        });
        Object.defineProperty(obj, '$observable', {
            writable: false,
            value: observable,
        });
        Object.defineProperty(obj, '$promise', {
            get: function () {
                // If already resolved, we return a promise of the resolved object.
                if (resolved) {
                    return Observable.of(obj).toPromise();
                }

                // Else we return a promise of our subject, so the promise resolves
                // as soon as the subject is completed.
                else {
                    return observable.toPromise();
                }

            },
        });

        return obj;
    }

    /**
     * Builds an URL from the given query data, the payload data and resource action options. Will use the options
     * of the resource instance to build the URL.
     * @param {Object} query Query data.
     * @param {Object} payload Payload data.
     * @param {ResourceActionOptions} options Resource action options.
     * @returns {string}
     */
    protected buildUrl(query: Object, payload: Object, options: ResourceActionOptions): string {
        query = Object.assign({}, query);
        payload = Object.assign({}, payload);

        let
            urlSuffix = options.urlSuffix || '',
            url = new URL(urlSuffix ? options.url + urlSuffix : options.url, window.location.href || null),
            urlRegex = new RegExp('(:)(\\w+)(\\W|$)', 'g'),
            pathname = url.pathname || '',
            search = url.search || '',
            paramDefaults = options.paramDefaults || [],
            paramDefaultKeys = paramDefaults.map(v => v.key);

        /*
         * Build the pathname with the query and the param defaults
         */
        pathname = pathname.replace(urlRegex, function (match, keyPrefix, key, keySuffix) {
            // If the url param is part of the query object
            if (query.hasOwnProperty(key)) {
                let
                    paramValue = query['key'];

                delete query[key];
                return encodeURIComponent(paramValue) + keySuffix;
            }

            // Else check if we have a default for the url param
            else {
                let
                    paramDefaultIndex = paramDefaultKeys.indexOf(key);

                // If we found a default param, put its value on the URL
                if (paramDefaultIndex !== -1) {
                    let
                        paramDefaultValue = options.paramDefaults[paramDefaultIndex].getValue(query, payload, options);

                    // If the param default getter returns a value that can be put in the url, put it in the url
                    if (paramDefaultValue !== undefined && paramDefaultValue !== null) {
                        return encodeURIComponent(options.paramDefaults[paramDefaultIndex].getValue(query, payload, options)) + keySuffix;
                    }

                    // Else just remove the url param from the url
                    else {
                        return '';
                    }
                }

                // Else just remove the url param from the url
                else {
                    return '';
                }
            }
        });

        /*
         * Build the search params
         */
        search = (search ? search.substring(1) + '&' : '') + Object.keys(query).map(function (key) {
            let
                value = query[key];

            // If the given value is an array, add each value with the given key
            if (Array.isArray(value)) {
                return value.map(function (innerValue) {
                    return key + '=' + encodeURIComponent(innerValue);
                }).join('&');
            }

            // Else we just return the key with its value
            else {
                return key + '=' + encodeURIComponent(query[key]);
            }
        }).join('&');

        /*
         * Strip all trailing slashes from path if configured so
         */
        if (options.stripTrailingSlashes) {
            pathname = pathname.replace(/[/]+$/g, '');
        }

        url.pathname = pathname;
        url.search = search ? '?' + search : '';

        return url.href;
    }

    /**
     * Builds the HTTP headers from the given query data, the payload data and resource action options. Will use the
     * options of the resource instance to build the headers.
     * @param {Object} query Query data.
     * @param {Object} payload Payload data.
     * @param {ResourceActionOptions} options Resource action options.
     * @returns {HttpHeaders}
     */
    protected buildHeaders(query: Object, payload: Object, options: ResourceActionOptions): HttpHeaders {
        query = Object.assign({}, query);
        payload = Object.assign({}, payload);

        let
            headers = new HttpHeaders();

        /*
         * Build the headers object if there is a default headers configuration on the
         * action options.
         */
        if (options.headerDefaults) {
            for (let headerDefault of options.headerDefaults) {
                headers = headers.set(
                    headerDefault.key,
                    headerDefault.getValue(query, payload, options),
                );
            }
        }

        return headers;
    }

    /**
     * Contributes the core attributes for a resource model object to the given object. Returns the given
     * object with the type assurance of a `ResourceModelResult` object.
     * @param obj Object to contribute resource model properties to.
     * @returns {ResourceModelResult}
     */
    protected contributeResourceModelProperties(obj: any): ResourceModelResult {
        let
            self = this,
            contributedObject = <ResourceModelResult>obj;

        /*
         * First we contribute the model properties to the object.
         */
        Object.defineProperty(contributedObject, '$resolved', {
            writable: false,
            value: true,
        });
        Object.defineProperty(contributedObject, '$observable', {
            get: function () {
                return Observable.of(contributedObject);
            },
        });
        Object.defineProperty(contributedObject, '$promise', {
            get: function () {
                return contributedObject.$observable.toPromise();
            },
        });
        Object.defineProperty(contributedObject, '$resource', {
            writable: false,
            value: self,
        });

        /*
         * Now we go on and contribute the resource action instance methods.
         */
        for (let name of Array.from(this.actionMethods.keys())) {
            let
                fn = this.actionMethods.get(name);

            contributedObject['$' + name] = function (...args: any[]) {
                let
                    query = null,
                    success = null,
                    error = null;

                /*
                 * Handle method signature where the method can be called as follows:
                 * - query, successCb, errorCb
                 * - query, successCb
                 * - successCb, errorCb
                 * - successCb
                 */
                switch (args.length) {
                    // case: query, successCb, errorCb
                    case 3:
                        query = args[0];
                        success = args[1];
                        error = args[2];

                        break;

                    case 2:
                        // case: successCb, errorCb
                        if (typeof args[0] === 'function') {
                            success = args[0];
                            error = args[1];
                        }

                        // case: query, successCb
                        else {
                            query = args[0];
                            success = args[1];
                        }

                        break;

                    // case: successCb
                    case 1:
                        success = args[0];

                        break;
                }

                return fn.apply(self, [query, Array.isArray(obj) ? null : contributedObject, success, error]);
            }
        }

        return contributedObject;
    }

    /**
     * Contributes the http attributes (request and response) for a resource model object to the given object. Returns
     * the given object with the type assurance of a `ResourceModelResult` object.
     * @param obj Object to contribute resource model properties to.
     * @param {HttpRequest} request Request instance to contribute.
     * @param {HttpResponse} response Response instance to contribute.
     * @returns {ResourceModelResult}
     */
    protected contributeResourceModelRequestResponse(obj: any, request?: HttpRequest<ResourceInstance>, response?: HttpResponse<ResourceInstance>): ResourceModelResult {
        let
            contributedObject = <ResourceModelResult>obj;

        /*
         * Define the request and the response as properties on the object.
         */
        Object.defineProperty(contributedObject, '$request', {
            writable: false,
            value: request || null,
        });
        Object.defineProperty(contributedObject, '$response', {
            writable: false,
            value: response || null,
        });

        return contributedObject;
    }

    /**
     * Processes the list response, meaning that it iterates through the JSON list in the response, and
     * pushes each item as resource model object on the result list.
     * @param {ResourceModelResult} result The result list that should contain the data.
     * @param {HttpResponse} response The response object.
     * @param {ResourceActionOptions} actionOptions The resource action configuration.
     * @returns {ResourceModelResult}
     */
    protected processListResponse(result: ResourceModelResult, response: HttpResponse<ResourceInstance>, actionOptions: ResourceActionOptions): ResourceModelResult {
        let
            instanceClass = actionOptions.instanceClass,
            useDataAttr = actionOptions.dataAttr && response.body,
            dataAttr = actionOptions.dataAttr,
            responseList = useDataAttr ? response.body[dataAttr] : response.body;

        // If the response does not contain a JSON list, we log an error and add nothing to the result array.
        if (!Array.isArray(responseList)) {
            throw new ResourceUnexpectedResponseError(
                "Response does not contain a list of objects but `isList` is set " +
                "to `true`."
            );
        }

        // First we make sure the result array is empty.
        result.length = 0;

        // Now we add the response items, contributed with the resource model properties, to the result object.
        for (let item of responseList) {
            let
                obj = this.makeResourceModel(item, instanceClass);

            obj.load(item);
            result.push(obj);
        }

        return result;
    }

    /**
     * Processes the object response, meaning that it checks if the response was a valid object response and
     * contributes the response data to the result object.
     * @param {ResourceModelResult} result The result list that should contain the data.
     * @param {HttpResponse} response The response object.
     * @param {ResourceActionOptions} actionOptions The resource action configuration.
     * @returns {ResourceModelResult}
     */
    protected processObjectResponse(result: ResourceModelResult, response: HttpResponse<ResourceInstance>, actionOptions: ResourceActionOptions): ResourceModelResult {
        let
            useDataAttr = actionOptions.dataAttr && response.body,
            dataAttr = actionOptions.dataAttr,
            responseObject = useDataAttr ? response.body[dataAttr] : response.body;

        // If the response does not contain a JSON object, we log an error and add nothing to the result array.
        if (Array.isArray(responseObject)) {
            throw new ResourceUnexpectedResponseError(
                "Response does contain a list of objects but `isList` is set " +
                "to `false`."
            );
        }

        result = <ResourceModelResult>result.load(responseObject);

        return result;
    }
}


/**
 * Resource class that most of the application specific resource classes will inherit from. Has a reasonable set
 * of resource actions predefined. You may want to override these in order to customize their behaviour. If you do
 * not want any predefined actions, consider inheriting from `ResourceBase` instead.
 */
@Injectable()
export abstract class Resource<T extends ResourceInstance> extends ResourceBase {

    /**
     * Creates a resource instance with the given payload.
     * @param {object} payload Payload for the instance.
     * @returns {ResourceModel<T extends ResourceInstance>}
     */
    create(payload?: object): ResourceModel<T> {
        payload = payload || {};
        return <ResourceModel<T>>this.makeResourceModel(payload);
    }

    @ResourceAction({
        method: ResourceActionHttpMethod.GET,
        isList: true,
    })
    query: ResourceActionMethod<any, any, T[]>;

    @ResourceAction({
        method: ResourceActionHttpMethod.GET,
        isList: false,
    })
    get: ResourceActionMethod<any, any, T>;

    @ResourceAction({
        method: ResourceActionHttpMethod.POST,
        isList: false,
    })
    save: ResourceActionMethod<any, any, T>;

    @ResourceAction({
        method: ResourceActionHttpMethod.PATCH,
        isList: false,
    })
    update: ResourceActionMethod<any, any, T>;

    @ResourceAction({
        method: ResourceActionHttpMethod.DELETE,
        isList: false,
    })
    remove: ResourceActionMethod<any, any, T>;

}


/**
 * Exception that is thrown when a `Resource` method is used that needs the resource instance to be set up, before
 * it is actually set up.
 */
export class ResourceNeedsOptionsError extends Error {}


/**
 * Exception that is thrown when a `Resource` method is used that needs the resource instance to be set up, before
 * it is actually set up.
 */
export class ResourceUnexpectedResponseError extends Error {}


/**
 * Decorator that marks a method on `Resource` classes that needs the resource instance to be set up before it
 * is called.
 * @constructor
 */
function NeedsOptions() {

    return function decorator(target: ResourceBase, key: string, descriptor: PropertyDescriptor) {
        let
            originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            // First we need to check if the resource instance is set up correctly
            if (!this.getOptions()) {
                throw new ResourceNeedsOptionsError(
                    "The resource is not setup correctly. Did you use the " +
                    "@ResourceConfiguration decorator?"
                );
            }

            // Now we can call the original method
            return originalMethod.apply(this, args);
        };

        return descriptor;
    }
}