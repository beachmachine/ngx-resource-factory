import { Injectable, Type } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';

import { from as observableFrom, Observable, Observer, of as observableOf, Subject, } from 'rxjs';
import { shareReplay as observableShareReplay } from 'rxjs/operators';

import { ResourceModel } from './resource-model';
import { ResourceConfigurationOptions } from './resource-configuration-options';
import { ResourceActionOptions } from './resource-action-options';
import { ResourceInstance } from './resource-instance';
import { ResourceAction } from './resource-action';
import { ResourceActionMethod } from './resource-action-method';
import { ResourceActionHttpMethod } from './resource-action-http-method';
import { PhantomGenerator } from './phantom-generator/phantom-generator';
import { ResourceRegistry } from './resource-registry';
import { ResourceCache } from '../cache/resource-cache';
import { ResourceNoopCache } from '../cache/resource-noop-cache';
import { PrepopulatedResourceCacheItem, ResourceCacheItem, ResourceCacheItemMarker } from '../cache/resource-cache-item';
import { clean, isPromiseLike } from '../utils/resource-utils';


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
    protected actionMethods: Map<string, Function>;

    /**
     * Singleton instance of the configured phantom ID generator class.
     * @type {PhantomGenerator}
     */
    protected phantomGenerator: PhantomGenerator;

    /**
     * Singleton instance of the configured cache class.
     * @type {ResourceCache}
     */
    protected cache: ResourceCache;

    constructor(protected registry: ResourceRegistry,
                protected http: HttpClient) {
        // Register the resource on the registry
        this.registry.register(this);
    }

    /**
     * Binds the given resource instance to the resource.
     * @param {T} obj Resource instance
     * @returns {T} The given resource instance bound to the resource
     */
    @NeedsOptions()
    bind<T extends Object>(obj: T): ResourceModel<T> {
        const
            /*
             * Options for the resource
             */
            options = this.getOptions(),

            /*
             * Given instance with the contributed resource instance methods
             */
            boundObj: any = this.contributeResourceModelProperties(obj),

            /*
             * Phantom ID generator instance
             */
            phantomGenerator = this.getPhantomGenerator();

        /*
         * If the resource is configured to set phantom IDs on object instantiation, we
         * get the phantom ID generator class instance and let in generate the phantom id. This
         * also implies that the `pkAttr` has to be configured.
         */
        if (boundObj && !boundObj[options.pkAttr] && phantomGenerator && options.pkAttr) {
            boundObj[options.pkAttr] = phantomGenerator.generate(boundObj);
        }

        return boundObj;
    }

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
        // Initialize the action methods map, if not already existing on the current class.
        if (!this.hasOwnProperty('actionMethods')) {
            const
                selfActionMethods = new Map<string, Function>();

            // If the current class does not have defined action methods, but a class in the prototype chain
            // does, then we need to copy the definition.
            if (this.actionMethods) {
                for (const name of Array.from(this.actionMethods.keys())) {
                    selfActionMethods.set(name, this.actionMethods.get(name));
                }
            }

            this.actionMethods = selfActionMethods;
        }

        this.actionMethods.set(name, fn);
    }

    /**
     * Gets the phantom ID generator class instance.
     * @returns {PhantomGenerator}
     */
    @NeedsOptions()
    getPhantomGenerator(): PhantomGenerator {
        const
            options = this.getOptions(),
            phantomGeneratorClass = options.phantomGeneratorClass;

        /*
         * If the phantom ID generator class is set to `null`, we do not instantiate
         * anything.
         */
        if (!phantomGeneratorClass) {
            this.phantomGenerator = null;
        }

        /*
         * The phantom ID generator is a singleton, so only instantiate if not already
         * instantiated.
         */
        else if (!this.phantomGenerator) {
            this.phantomGenerator = new phantomGeneratorClass();
        }

        return this.phantomGenerator;
    }

    /**
     * Gets the cache class instance.
     * @returns {ResourceCache}
     */
    @NeedsOptions()
    getCache(): ResourceCache {
        const
            options = this.getOptions(),
            cacheClass = options.cacheClass;

        /*
         * The phantom ID generator is a singleton, so only instantiate if not already
         * instantiated.
         */
        if (!this.cache) {
            this.cache = new cacheClass();
        }

        return this.cache;
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

        const options = this.getOptions();
        let obj = new (instanceClass || options.instanceClass)();

        obj = Object.assign(obj, payload);
        obj = this.bind(obj);

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

        const
            objs = [];

        for (const obj of payload) {
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

        /*
         * Model class to instantiate for the resource action.
         */
        const instanceClass = actionOptions.instanceClass;

            /*
             * Object that contains the actual result. Will be populated with the response data as soon as the response
             * is complete.
             */
        const resultObject = <ResourceModelResult>(actionOptions.isList ?
                this.makeResourceModelList([]) :
                this.makeResourceModel({}, instanceClass));

            /*
             * The request method verb. We need to explicitly ensure string type here so we can use it in the
             * constructor of `HttpRequest`.
             */
            const method = <string>actionOptions.method;

            /*
             * The URL for the request from built from the action configuration, the query and the payload.
             */
            const url = (new actionOptions.urlBuilderClass()).buildUrl(query, payload, actionOptions);

            /*
             * Build the http request headers from the action configuration, the query and the payload.
             */
            const headers = (new actionOptions.headerBuilderClass()).buildHeaders(query, payload, actionOptions);

            /*
             * Use the `dump` method on the payload object if it is an `ResourceInstance` object to get the
             * data representation that should be sent to the server. If the given payload is not a
             * `ResourceInstance` object, then we give it directly to the `clean` method.
             */
            const cleanedPayload = clean(payload instanceof ResourceInstance ? payload.dump() : payload, actionOptions.privatePattern);

            /*
             * The request object for angular's `HttpClient` service.
             */
            const request = new HttpRequest(method, url, cleanedPayload, {
                reportProgress: actionOptions.reportProgress,
                responseType: actionOptions.responseType,
                withCredentials: actionOptions.withCredentials,
                headers: headers,
            });

            /*
             * The action response object.
             */
            const actionModel = this.executeResourceActionRequest(resultObject, request, actionOptions);

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
    @NeedsOptions()
    protected executeResourceActionRequest(obj: ResourceModelResult, request: HttpRequest<any>, actionOptions: ResourceActionOptions): ResourceModelResult {

            const self = this;

            /*
             * Indicates whether the response object is resolved.
             */
            const resolved = false;

            /*
             * Cache instance used for the request.
             */
            const cache = actionOptions.useCache ? this.getCache() : new ResourceNoopCache();

            /*
             * TTL for cache items in seconds.
             */
            const cacheTtl = this.getOptions().cacheTtl;

            /*
             * The actual `HTTPClient` observable used for the request.
             */
            const httpObservable = this.http.request(request);

            /*
             * The subject used to publish http events.
             */
            const httpEventSubject = new Subject<HttpEvent<ResourceInstance>>();

            /*
             * The observable created from the http event subject.
             */
            const httpEventObservable = observableFrom(httpEventSubject);

            /*
             * Hot observable that wraps the `HTTPClient` observable.
             */
           const observable = Observable.create((observer: Observer<ResourceModelResult>) => {
                const
                    /*
                     * Helper function that starts the actual HTTP request/response cycle by
                     * subscribing to the `HTTPClient` observable.
                     */
                    progressWithHttpObservable = (httpObservable) => {
                        let
                            /*
                             * Cache promise resolve function.
                             */
                            cacheResolve: Function = null,

                            /*
                             * Cache promise reject function.
                             */
                            cacheReject: Function = null;

                            /*
                             * Cache promise.
                             */
                            const cachePromise = new Promise((resolve, reject) => {
                                cacheResolve = resolve;
                                cacheReject = reject;
                            });

                        // Put the cache promise on the cache.
                        cache.put(request, <Promise<ResourceCacheItem>>cachePromise);

                        // Register a default error handler on cache promise, so we do not get a console error
                        cachePromise.catch(() => {
                            // Nothing to do here
                        });

                        // Now we can execute the actual HTTP request/response cycle.
                        httpObservable.subscribe(
                            function next(event: HttpEvent<ResourceInstance>) {
                                switch (event.type) {
                                    /*
                                     * On non-response events we process publish the event on the http event subject.
                                     */
                                    case HttpEventType.User:
                                    case HttpEventType.Sent:
                                    case HttpEventType.UploadProgress:
                                    case HttpEventType.ResponseHeader:
                                    case HttpEventType.DownloadProgress:
                                        httpEventSubject.next(event);
                                        break;

                                    /*
                                     * On response events we process the response data.
                                     */
                                    case HttpEventType.Response:
                                        let
                                            cachedObj = new ResourceCacheItem(event, self, cacheTtl);

                                        /*
                                         * If `invalidateCache` is set to `true` than we invalidate the
                                         * cached data on the cache instance.
                                         */
                                        if (actionOptions.invalidateCache) {
                                            // Invalidate cache of all dependent caches (including self)
                                            for (const resource of self.registry.getDependentResources(self)) {
                                                resource.getCache().invalidate();
                                            }
                                        }

                                        /*
                                         * Now we put the result on the cache. Mind that it is the final
                                         * decision of the cache implementation if the response is actually
                                         * put on the cache. Usually a cache implementation only accepts HTTP
                                         * `GET` responses with "text" or "json" data.
                                         */
                                        cachedObj = <ResourceCacheItem>cache.put(request, cachedObj);

                                        // Process the response
                                        obj = self.contributeResourceModelRequestResponseProperties(obj, request, event);
                                        obj = self.processResponse(obj, request, event, actionOptions);

                                        // Notify the observer
                                        observer.next(obj);

                                        // Resolve the cache promise
                                        cacheResolve(cachedObj);

                                        break;
                                }
                            },
                            function error(errorResponse: HttpErrorResponse) {
                                cache.pop(request);

                                httpEventSubject.error(errorResponse);
                                observer.error(errorResponse);

                                cacheReject(errorResponse);
                            },
                            function complete() {
                                httpEventSubject.complete();
                                observer.complete();
                            }
                        );
                    },

                    /*
                     * Helper function that processes the response from the cache.
                     */
                    progressWithCachedItem = (cachedItem) => {
                        const
                            cacheObjResponse = cachedItem.response;

                        // Process the response
                        obj = self.contributeResourceModelRequestResponseProperties(obj, request, cacheObjResponse);
                        obj = self.processResponse(obj, request, cacheObjResponse, actionOptions);

                        // Notify the observer
                        observer.next(obj);
                        observer.complete();
                    };

                /*
                 * If we have data for the given request on the cache, we publish it directly and complete
                 * the observer.
                 */
                if (cache.has(request)) {
                    const
                        cacheObj = cache.get(request);

                    /*
                     * If we got a promise-like object from the cache, this means there is already an request in
                     * progress, but we did not get a response yet. We need to wait for the promise to get
                     * resolved and progress with the cached response then. In case the promise rejects (e.g. an
                     * error occurred during the request/response), we progress with the http observable.
                     */
                    if (isPromiseLike(cacheObj)) {
                        (<Promise<ResourceCacheItem>>cacheObj)
                            /*
                             * Promise resolved, so we can progress with the cached result.
                             */
                            .then((cacheObj) => {
                                progressWithCachedItem(cacheObj);
                            })

                            /*
                             * Promise rejected, so wen need to re-execute the HTTP call.
                             */
                            .catch((_er) => {
                                progressWithHttpObservable(httpObservable);
                            });
                    }

                    /*
                     * If we directly get a cached result from the cache, we can progress with this
                     * result without any further ado.
                     */
                    else {
                        progressWithCachedItem(cacheObj);
                    }
                }

                /*
                 * If we don't have data for the given request on the cache, we need to execute the request
                 * and put the result on the cache.
                 */
                else {
                    progressWithHttpObservable(httpObservable);
                }
            }).pipe(
                observableShareReplay(-1)
            );

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
        Object.defineProperty(obj, '$http', {
            writable: false,
            value: httpEventObservable,
        });
        Object.defineProperty(obj, '$promise', {
            get: function () {
                // If already resolved, we return a promise of the resolved object.
                if (resolved) {
                    return observableOf(obj).toPromise();
                }

                    // Else we return a promise of our subject, so the promise resolves
                // as soon as the subject is completed.
                else {
                    return observable.toPromise();
                }

            },
        });

        /*
         * Contribute the request as property to the object.
         */
        obj = this.contributeResourceModelRequestResponseProperties(obj, request);

        return obj;
    }

    /**
     * Contributes the core attributes for a resource model object to the given object. Returns the given
     * object with the type assurance of a `ResourceModelResult` object.
     * @param obj Object to contribute resource model properties to.
     * @returns {ResourceModelResult}
     */
    protected contributeResourceModelProperties(obj: any): ResourceModelResult {
        const
            self = this,
            contributedObject = <ResourceModelResult>obj;

        /*
         * First we contribute the resource model properties to the resource instance.
         */
        Object.defineProperty(contributedObject, '$resolved', {
            writable: false,
            value: true,
            configurable: true
        });
        Object.defineProperty(contributedObject, '$total', {
            writable: false,
            value: null,
            configurable: true
        });
        Object.defineProperty(contributedObject, '$observable', {
            get: () => observableOf(contributedObject),
            configurable: true
        });
        Object.defineProperty(contributedObject, '$promise', {
            get: () => obj.$observable.toPromise(),
            configurable: true
        });
        Object.defineProperty(contributedObject, '$resource', {
            writable: false,
            value: self,
            configurable: true
        });
        Object.defineProperty(contributedObject, '$request', {
            writable: false,
            value: null,
            configurable: true
        });
        Object.defineProperty(contributedObject, '$response', {
            writable: false,
            value: null,
            configurable: true
        });

        /*
         * Now we go on and contribute the resource action instance methods.
         */
        for (const name of Array.from(this.actionMethods.keys())) {
            const
                fn = this.actionMethods.get(name);

            contributedObject['$' + name] = function (...args: any[]) {

                let query = null;
                let success = null;
                let error = null;

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

                    case 1:
                        // case: successCb
                        if (typeof args[0] === 'function') {
                            success = args[0];
                        }

                        // case: query
                        else {
                            query = args[0];
                        }

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
    protected contributeResourceModelRequestResponseProperties(obj: any, request?: HttpRequest<ResourceInstance>, response?: HttpResponse<ResourceInstance>): ResourceModelResult {
        const
            contributedObject = <ResourceModelResult>obj;

        /*
         * Define the request and the response as properties on the object.
         */
        Object.defineProperty(contributedObject, '$request', {
            writable: true,
            value: request || null,
            configurable: true
        });
        Object.defineProperty(contributedObject, '$response', {
            writable: false,
            value: response || null,
            configurable: true
        });

        return contributedObject;
    }

    /**
     * Contributes the list attributes (e.g. `totalAttr`) to the resource model object. Returns the given object with
     * the type assurance of a `ResourceModelResult` object.
     * @param obj Object to contribute resource model list properties to.
     * @param {number} total The value of the `totalAttr`
     */
    protected contributeResourceModelListProperties(obj: any, total?: number): ResourceModelResult {
        const
            contributedObject = <ResourceModelResult>obj;

        Object.defineProperty(contributedObject, '$total', {
            writable: false,
            value: total,
            configurable: true
        });

        return contributedObject;
    }

    /**
     * Processes the object or list response depending on the type of the given body. If it is a list
     * this method will invoke `processListResponse` and if it is an object this method will
     * invoke `processObjectResponse`. Will do nothing if the expected response type on the `actionOptions` is not
     * set to "json".
     * @param {ResourceModelResult} result The result list that should contain the data.
     * @param {HttpRequest} request Request instance to contribute.
     * @param {HttpResponse} response Response instance to contribute.
     * @param {ResourceActionOptions} actionOptions The resource action configuration.
     * @returns {ResourceModelResult}
     */
    protected processResponse(result: ResourceModelResult, request: HttpRequest<any>, response: HttpResponse<any>, actionOptions: ResourceActionOptions): ResourceModelResult {
        /*
         * In case we expect a JSON list, process the list result and notify the observer.
         */
        if (actionOptions.responseType === 'json' && actionOptions.isList) {
            result = this.processListResponse(result, request, response, actionOptions);
        } else if (actionOptions.responseType === 'json' && !actionOptions.isList) { // In case we expect a JSON object, process the object result and notify the observer.
            result = this.processObjectResponse(result, request, response, actionOptions);
        }

        return result;
    }

    /**
     * Processes the list response, meaning that it iterates through the JSON list in the response, and
     * pushes each item as resource model object on the result list.
     * @param {ResourceModelResult} result The result list that should contain the data.
     * @param {HttpRequest} request Request instance to contribute.
     * @param {HttpResponse} response Response instance to contribute.
     * @param {ResourceActionOptions} actionOptions The resource action configuration.
     * @returns {ResourceModelResult}
     */
    protected processListResponse(result: ResourceModelResult, request: HttpRequest<any>, response: HttpResponse<any>, actionOptions: ResourceActionOptions): ResourceModelResult {

        const self = this;
        const instanceClass = actionOptions.instanceClass;
        const isPrimitive = actionOptions.isPrimitive;
        const cache = actionOptions.useCache ? this.getCache() : new ResourceNoopCache();
        const cacheTtl = this.getOptions().cacheTtl;
        const body = response.body;
        const dataAttr = actionOptions.dataAttr;
        const useDataAttr = dataAttr && body && !response[ResourceCacheItemMarker.PREPOPULATED];
        const totalAttr = actionOptions.totalAttr;
        const useTotalAttr = useDataAttr && totalAttr && body && !isNaN(parseInt(body[totalAttr], 10));
        const total = useTotalAttr ? parseInt(body[totalAttr], 10) : null;
        const urlAttr = actionOptions.urlAttr;
        const responseList = (useDataAttr ? body[dataAttr] : body) || null;

        // If the response does not contain a JSON list, we log an error and add nothing to the result array.
        if (responseList !== null && (typeof responseList !== 'object' || responseList.constructor !== Array)) {
            throw new ResourceUnexpectedResponseError(
                "Response does not contain an array literal but `isList` is set " +
                "to `true`."
            );
        }

        // First we make sure the result array is empty.
        result.length = 0;

        // Now we add the response items, contributed with the resource model properties, to the result object.
        if (responseList !== null) {
            for (const item of responseList) {
                const prepopulateCache = urlAttr && item && item[urlAttr] && !response[ResourceCacheItemMarker.CACHED];
                let obj;

                if (isPrimitive) {
                    obj = item;
                } else {
                    obj = this.makeResourceModel(item, instanceClass);
                    obj.load(item);
                }

                result.push(obj);

                // Populate the cache with the raw item if we have an `urlAttr`
                if (prepopulateCache) {
                    const
                        fakeRequest = request.clone({
                            body: null,
                            method: ResourceActionHttpMethod.GET,
                            params: null,
                            url: item[urlAttr],
                        }),
                        fakeResponse = response.clone({
                            body: item,
                            url: item[urlAttr],
                        }),
                        cachedObj = new PrepopulatedResourceCacheItem(fakeResponse, self, cacheTtl);

                    cache.put(fakeRequest, cachedObj);
                }
            }
        }

        // Now we contribute the resource model list properties to the result array.
        this.contributeResourceModelListProperties(result, total);

        return result;
    }

    /**
     * Processes the object response, meaning that it checks if the response was a valid object response and
     * contributes the response data to the result object.
     * @param {ResourceModelResult} result The result list that should contain the data.
     * @param {HttpRequest} request Request instance to contribute.
     * @param {HttpResponse} response Response instance to contribute.
     * @param {ResourceActionOptions} actionOptions The resource action configuration.
     * @returns {ResourceModelResult}
     */
    protected processObjectResponse(result: ResourceModelResult, _request: HttpRequest<any>, response: HttpResponse<any>, actionOptions: ResourceActionOptions): ResourceModelResult {
        const
            body = response.body,
            useDataAttr = actionOptions.dataAttr && body && !response[ResourceCacheItemMarker.PREPOPULATED],
            dataAttr = actionOptions.dataAttr,
            isPrimitive = actionOptions.isPrimitive,
            responseObject = (useDataAttr ? body[dataAttr] : body) || null;

        // If the response does not contain a JSON object, we log an error and add nothing to the result array.
        if (!isPrimitive && responseObject !== null && (typeof responseObject !== 'object' || responseObject.constructor !== Object)) {
            throw new ResourceUnexpectedResponseError(
                "Response does not contain an object literal but `isList` is set " +
                "to `false`."
            );
        }

        // On responses with data we use the `load` method of the result object to transform the data.
        if (!isPrimitive && responseObject !== null) {
            result = <ResourceModelResult>result.load(responseObject);
        } else {
            result = responseObject;
        }

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
        paramDefaults: [],
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
        paramDefaults: [],
        isList: false,
        invalidateCache: true,
    })
    save: ResourceActionMethod<any, any, T>;

    @ResourceAction({
        method: ResourceActionHttpMethod.PATCH,
        isList: false,
        invalidateCache: true,
    })
    update: ResourceActionMethod<any, any, T>;

    @ResourceAction({
        method: ResourceActionHttpMethod.DELETE,
        isList: false,
        invalidateCache: true,
    })
    remove: ResourceActionMethod<any, any, T>;

}


/**
 * Exception that is thrown when a `Resource` method is used that needs the resource instance to be set up, before
 * it is actually set up.
 */
export class ResourceNeedsOptionsError extends Error {
}


/**
 * Exception that is thrown when a `Resource` method is used that needs the resource instance to be set up, before
 * it is actually set up.
 */
export class ResourceUnexpectedResponseError extends Error {
}


/**
 * Decorator that marks a method on `Resource` classes that needs the resource instance to be set up before it
 * is called.
 * @constructor
 */
export function NeedsOptions() {
    const
        decorator = function (_target: ResourceBase, _: string, descriptor: PropertyDescriptor) {
            const
                originalMethod = descriptor.value;

            descriptor.value = function (...args: any[]) {
                // First we need to check if the resource instance is set up correctly
                if (this.getOptions() === null) {
                    throw new ResourceNeedsOptionsError(
                        "The resource is not setup correctly. Did you use the " +
                        "@ResourceConfiguration decorator?"
                    );
                }

                // Now we can call the original method
                return originalMethod.apply(this, args);
            };

            return descriptor;
        };

    return decorator;
}
