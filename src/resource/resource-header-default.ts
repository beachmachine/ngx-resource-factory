import { ResourceActionOptions } from "./resource-action-options";


/**
 * Type that describes the value signature for a `ResourceHeaderDefault`
 * instance.
 */
export type ResourceHeaderDefaultValue = ((query: Object, payload: Object, options: ResourceActionOptions) => string) | string;


/**
 * Class that defines a http header default for building
 * requests on resources.
 */
export class ResourceHeaderDefault {

    /**
     * Gets the key of the http header.
     * @returns {string}
     */
    get key(): string {
        return this._key;
    }

    /**
     * Gets the value of the http header.
     * @returns {string}
     */
    getValue(query: Object, payload: Object, options: ResourceActionOptions): string {
        if (this._value instanceof Function) {
            return this._value(query, payload, options);
        }
        else {
            return this._value;
        }
    }

    /**
     * @param {string} _key Key of the url parm.
     * @param {ResourceHeaderDefaultValue} _value Value of the url param as string or as getter function.
     */
    constructor(protected _key: string,
                protected _value: ResourceHeaderDefaultValue) {
    }
}


/**
 * Class that defines a http header default that takes the value from the
 * payload object for building requests on resources.
 */
export class ResourceHeaderDefaultFromPayload extends ResourceHeaderDefault {

    constructor(key: string, value: string) {
        super(key, (query: Object, payload: Object) => payload && payload[value] !== undefined ? '' + payload[value] : null);
    }

}