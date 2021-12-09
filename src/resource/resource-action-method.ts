import { HttpErrorResponse } from '@angular/common/http';

import { ResourceModel } from './resource-model';


/**
 * Interface describing a request action method.
 */
export interface ResourceActionMethod<Q, P, T> {
    (query?: Q, payload?: P, success?: (result: ResourceModel<T>) => any, error?: (response: HttpErrorResponse) => any): ResourceModel<T>;
}


/**
 * Interface describing a request action method on an resource model.
 */
export interface ResourceModelActionMethod<T> {
    (query?: any, success?: (result: ResourceModel<T>) => any, error?: (response: HttpErrorResponse) => any): ResourceModel<T>;
}
