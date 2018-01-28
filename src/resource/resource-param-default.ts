import {ResourceActionOptions} from "./resource-action-options";

/**
 * Class that defines a parameter default for building
 * URLs on resources.
 */
export class ResourceParamDefault {
    protected _key: string = null;
    protected _value: (query: Object, payload: Object, options: ResourceActionOptions) => string = null;

    /**
     * Gets the key of the url param.
     * @returns {string}
     */
    get key(): string {
        return this._key;
    }

    /**
     * Gets the value of the url param.
     * @returns {string}
     */
    getValue(query: Object, payload: Object, options: ResourceActionOptions): string {
        return this._value(query, payload, options);
    }

    /**
     * @param {string} key Key of the url parm.
     * @param {(() => string) | string} value Value of the url param as string or as getter function.
     */
    constructor(key: string, value: ((query: Object, payload: Object, options: ResourceActionOptions) => string) | string) {
        this._key = key;

        if (value instanceof Function) {
            this._value = value;
        }
        else {
            this._value = function (query: Object, payload: Object, options: ResourceActionOptions) {
                return value;
            };
        }
    }
}


/**
 * Class that defines a parameter default that takes the value from the
 * payload object for building URLs on resources.
 */
export class ResourceParamDefaultFromPayload extends ResourceParamDefault {

    constructor(key: string, value: string) {
        super(key, (query: Object, payload: Object) => payload && payload[value] !== undefined ? '' + payload[value] : null);
    }

}