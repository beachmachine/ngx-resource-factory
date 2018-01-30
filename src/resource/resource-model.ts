import {ResourceModelActionMethod} from "./resource-action-method";
import {ResourceInstance} from "./resource-instance";


export type ResourceModelMethods<T> = {
    /**
     * Calls the request action instance method.
     */
    [$requestAction: string]: ResourceModelActionMethod<T>;
}


export type ResourceModel<T> = T & ResourceModelMethods<T> & ResourceInstance;
