import { ResourceActionOptions } from './resource-action-options';


/**
 * Type that describes the value signature for a `ResourceParamDefault`
 * instance.
 */
export type ResourceParamDefaultValue = ((query: Object, payload: Object, options: ResourceActionOptions) => string) | string;


/**
 * Class that defines a parameter default for building
 * URLs on resources.
 */
export class ResourceParamDefault {

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
        if (this._value instanceof Function) {
            return this._value(query, payload, options);
        } else {
            return this._value;
        }
    }

    /**
     * @param {string} _key Key of the url parm.
     * @param {ResourceParamDefaultValue} _value Value of the url param as string or as getter function.
     */
    constructor(protected _key: string,
                protected _value: ResourceParamDefaultValue) {
    }
}


/**
 * Class that defines a parameter default that takes the value from the
 * payload object for building URLs on resources.
 */
export class ResourceParamDefaultFromPayload extends ResourceParamDefault {

    constructor(key: string, value: string) {
        super(key, (_query: Object, payload: Object) => payload && payload[value] !== undefined ? '' + payload[value] : null);
    }

}
