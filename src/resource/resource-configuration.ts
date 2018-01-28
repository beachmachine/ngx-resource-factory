import {ResourceConfigurationOptions} from "./resource-configuration-options";
import {ResourceInstance} from "./resource-instance";
import {NegativeIntGenerator} from "./phantom-id/negative-int-generator";
import {ResourceMemoryCache} from "../cache/resource-memory-cache";
import {ResourceParamDefaultFromPayload} from "./resource-param-default";


export const DEFAULT_RESOURCE_CONFIGURATION_OPTIONS: ResourceConfigurationOptions = {
    url: null,
    name: null,
    stripTrailingSlashes: false,
    withCredentials: true,
    generatePhantomIds: true,
    phantomIdGeneratorClass: NegativeIntGenerator,
    dependent: [],
    paramDefaults: [],
    pkAttr: 'pk',
    urlAttr: null,
    dataAttr: null,
    totalAttr: null,
    useDataAttrForList: false,
    useDataAttrForObject: false,
    cacheClass: ResourceMemoryCache,
    instanceClass: ResourceInstance,
};


/**
 * Decorator to configure a resource class.
 * @param {ResourceConfigurationOptions} resourceOptions Resource configuration options.
 * @constructor
 */
export function ResourceConfiguration(resourceOptions?: ResourceConfigurationOptions) {

    return function decorator(target: any) {
        let
            /**
             * Options for the resource.
             * @type {ResourceConfigurationOptions}
             */
            options: ResourceConfigurationOptions = Object.assign({}, DEFAULT_RESOURCE_CONFIGURATION_OPTIONS, resourceOptions);

        /*
         * Compute dynamic configuration
         */
        options.paramDefaults.push(
            new ResourceParamDefaultFromPayload('pk', options.pkAttr)
        );

        target.prototype.getOptions = function () {
            return options;
        };

        return target;
    }
}