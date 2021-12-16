import { Type } from '@angular/core/core';

import { ResourceParamDefault } from './resource-param-default';
import { ResourceInstance } from './resource-instance';
import { ResourceHeaderDefault } from './resource-header-default';
import { PhantomGenerator } from './phantom-generator/phantom-generator';
import { HeaderBuilder } from './header-builder/header-builder';
import { UrlBuilder } from './url-builder/url-builder';
import { ResourceCache } from '../cache/resource-cache';


/**
 * Interface that defines the configuration options of a rest resource.
 */
export interface ResourceConfigurationOptions {

    /**
     * URL to the resource.
     */
    url: string;

    /**
     * Name of the resource service.
     */
    name: string;

    /**
     * Strip trailing slashes from request URLs.
     */
    stripTrailingSlashes?: boolean;

    /**
     * Include credentials in CORS calls.
     */
    withCredentials?: boolean;

    /**
     * Phantom ID generator class used for generating phantom IDs.
     */
    phantomGeneratorClass?: Type<PhantomGenerator>;

    /**
     * Class to use to build the headers.
     */
    headerBuilderClass?: Type<HeaderBuilder>;

    /**
     * Class to use to build the url.
     */
    urlBuilderClass?: Type<UrlBuilder>;

    /**
     * List of resource services to clean the cache for on modifying requests.
     */
    dependent?: string[];

    /**
     * Default values for url parameters.
     */
    paramDefaults?: ResourceParamDefault[];

    /**
     * Default values for http headers.
     */
    headerDefaults?: ResourceHeaderDefault[];

    /**
     * Attribute name where to find the ID of objects.
     */
    pkAttr?: string;

    /**
     * Attribute name where to find the URL of objects.
     */
    urlAttr?: string;

    /**
     * Attribute name where to find the data on results.
     */
    dataAttr?: string;

    /**
     * Attribute name where to find the total amount of items on the query call (resource list calls).
     */
    totalAttr?: string;

    /**
     * Use the `dataAttr` for list calls (e.g. `query`).
     */
    useDataAttrForList?: boolean;

    /**
     * Use the `dataAttr` for object calls (e.g. `get`).
     */
    useDataAttrForObject?: boolean;

    /**
     * Resource cache class to use.
     */
    cacheClass?: Type<ResourceCache>;

    /**
     * Time to live for cache entries in seconds.
     */
    cacheTtl?: number;

    /**
     * Class to use to instantiate resource instances.
     */
    instanceClass?: Type<ResourceInstance>;

    /**
     * Pattern for private attribute names.
     */
    privatePattern?: RegExp;
}
