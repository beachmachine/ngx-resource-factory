# ngx-resource-factory

ngx-resource-factory is an Angular library that enables you to work with RESTful APIs in an easy way. The main 
features include a resource store for holding changes on resource instances and related resource instances to commit
them at once, and an advanced resource caching.

**Note:** This library is for Angular 8.x and above!


## In development

This library is currently in an early stage of development and is missing lots of features as well as a proper 
documentation.

You can find a tutorial on using this library at [this blog entry](https://nezhar.com/blog/consume-rest-api-in-angular-with-ngx-resource-factory/) by [@nezhar](https://github.com/nezhar)


## Usage


### Install

To use ngx-resource-factory in your project you have to install it via npm:

    npm i ngx-resource-factory --save


### Add resource

The next step is defining a resource. Typically you create a services folder which will hold a `ServicesModule` in 
which the resources will be declared. Resources should also have their own directory. E.g. the `UserResource` would 
be located in **`app/services/resources/user.resource.ts`**

```typescript
import { Injectable } from "@angular/core";

import { environment } from '../../../environments/environment';

import { Resource } from 'ngx-resource-factory/resource/resource';
import { ResourceConfiguration } from 'ngx-resource-factory/resource/resource-configuration';
import { ResourceInstance } from 'ngx-resource-factory/resource/resource-instance';


export class User extends ResourceInstance {
    pk: number;
    url: string;
    username: string;
    email: string;
}

@Injectable()
@ResourceConfiguration({
    name: 'UserResource',
    url: environment.apiUrl + 'user/:pk/',
    pkAttr: 'pk',
    instanceClass: User,
    stripTrailingSlashes: false,
})
export class UserResource extends Resource<User> {

}
```


### Create Service module

After defining the first resource service it is required to declare it in a module so that we can inject it into 
components. Here, in **`app/services/services.module.ts`**, we are going to define the `ServicesModule`, which will 
load the `UserResource`.

```typescript
import { ModuleWithProviders, NgModule } from '@angular/core';

import { UserResource } from './resources/user.resource';


@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [/* declare in `forRoot()` */],
})
export class ServicesModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ServicesModule,
            providers: [
                UserResource
            ]
        }
    }

}
```


### Add module

Finally we have to add the NgxResourceFactoryModule and the ServicesModule to the main Angular module.

```typescript
import { NgxResourceFactoryModule } from 'ngx-resource-factory';
import { ServicesModule } from './services/services.module';


@NgModule({
declarations: [
    AppComponent
],
imports: [
    BrowserModule,
    
    // ...
    NgxResourceFactoryModule.forRoot(),
    ServiceModule.forRoot(),
    // ...
],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule { 

}
```


## Usage

You can now inject the resource into your component and start using it.

```typescript
import { Component, OnInit } from '@angular/core';

import { ResourceModel } from 'ngx-resource-factory/resource/resource-model';

import { UserResource, User } from './services/resources/user.resource';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'app';

    users: ResourceModel<User>[] = [];

    constructor(private userResource: UserResource) {
    }

    ngOnInit() {
        const queryParam = {};

        this.userResource.query(queryParam).$promise
            .then((data) => {
                this.users = data;

                console.log(data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

}
```


## Action methods

ngx-resource-factory exposes the REST APIs methods via its `ActionMethod` methods. The default defines the typical
RESTful methods on the resource class as follows:

* `.query()` executes `GET` for getting lists
* `.get()` executes `GET` for getting instances 
* `.save()` executes `POST` for creating instances 
* `.update()` executes `PATCH` for updating instances
* `.remove()` executes `DELETE` for removing instances

Each of this resource methods can take the parameters, in the given order, as follows:

* `query` optional parameter for URL query data as object
* `payload` optional parameter for the requests payload as object
* `successCb` optional parameter for the success callback as function
* `errorCb` optional parameter for the error callback as function

Each of this resource methods is also available on a resource instance, prefixed with a `$`:

* `.$query()` executes `GET` for getting lists
* `.$get()` executes `GET` for getting instances 
* `.$save()` executes `POST` for creating instances 
* `.$update()` executes `PATCH` for updating instances
* `.$remove()` executes `DELETE` for removing instances

This resource instance methods can take the parameters, in the given order, as follows:

* `query` optional parameter for URL query data as object
* `successCb` optional parameter for the success callback as function
* `errorCb` optional parameter for the error callback as function


## Define custom action methods

For a better understanding how to define custom action methods, have a look at the `Resource<T>` type that defines
the default methods.

```typescript
import { Injectable } from "@angular/core";

import { ResourceBase } from "ngx-resource-factory/resource/resource";
import { ResourceInstance } from "ngx-resource-factory/resource/resource-instance";
import { ResourceAction } from "ngx-resource-factory/resource/resource-action";
import { ResourceActionMethod } from "ngx-resource-factory/resource/resource-action-method";
import { ResourceActionHttpMethod } from "ngx-resource-factory/resource/resource-action-http-method";


@Injectable()
export abstract class Resource<T extends ResourceInstance> extends ResourceBase {

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
```

Your resource class may inherit from `Resource<T>` or from `ResourceBase`, if you do not want to
have the default action methods. Define custom action methods on your resource class as shown above.

```typescript
@Injectable()
@ResourceConfiguration({
    name: 'UserResource',
    url: environment.apiUrl + 'user/:pk/',
    pkAttr: 'pk',
    instanceClass: User,
    stripTrailingSlashes: false,
})
export class UserResource extends Resource<User> {
    @ResourceAction({
        method: ResourceActionHttpMethod.POST,
        isList: false,
        invalidateCache: true,
        urlSuffix: 'deactive/'
    })
    deactivate: ResourceActionMethod<any, any, T>;
}
```


## Handle responses

Action methods give you three ways to handle responses. You can use the stub object returned
by an action method, that gets filled with data as soon as the response was received, you can use
the `.$promise` property to handle the response with a `Promise`, or you can use the `.$observable` 
property to handle the response with an `Observable`.

This may look as follows:

```typescript
import { Component, OnInit } from '@angular/core';

import { ResourceModel } from 'ngx-resource-factory/resource/resource-model';

import { UserResource, User } from './services/resources/user.resource';


@Component({
    selector: 'app-my',
    templateUrl: './my.component.html',
    styleUrls: ['./my.component.scss']
})
export class MyComponent implements OnInit {
    users: ResourceModel<User>[] = [];

    constructor(private userResource: UserResource) {
    }

    ngOnInit() {
        // Stub
        this.users = this.userResource.query();
        
        // Promise
        this.userResource.query().$promise
            .then((data) => {
                this.users = data;
            });
        
        // Observable
        this.userResource.query().$observable
            .subscribe((data) => {
                this.users = data;
            });
    }

}
```

## Notes

#### Usage with Angular 6.x

Angular 6.x is using RxJS 6.x. This has brings some changes in the API of RxJS and requires to additionally install [rxjs-compat](https://www.npmjs.com/package/rxjs-compat). Make sure the version of `rxjs` and `rxjs-compat` are compatible.

This can be removed and `rxjs-compat` can be moved to peer dependencies once the support for Angular 5.x will be dropped.

#### Internet Explorer Support

The package makes use of the URL API, which is not provided in IE11 or earlier: https://caniuse.com/#feat=url
Make sure to install the URL API polyfill (`npm install url-polyfill --save`) and add it into polyfills.ts:

```
import 'url-polyfill';
```


## Examples

#### File Upload

A file upload service can be easily realized by adding a custom action for the POST-method, here's an example-implementation.

Add a ResourceAction for POST and an 'upload'-[ResourceActionMethod](#define-custom-action-methods) to your File-Service (Which we will then use in the component further down):


```typescript
@app/services/resource/file.resource.ts:

import { environment } from '../../../environments/environment';

import { Resource } from 'ngx-resource-factory/resource/resource';
import { ResourceConfiguration } from 'ngx-resource-factory/resource/resource-configuration';
import { ResourceInstance } from 'ngx-resource-factory/resource/resource-instance';
import { ResourceAction } from 'ngx-resource-factory/resource/resource-action';
import { ResourceActionMethod } from 'ngx-resource-factory/resource/resource-action-method';
import { ResourceActionHttpMethod } from 'ngx-resource-factory/resource/resource-action-http-method';

export class UploadableFile extends ResourceInstance {
    pk: number;
    parent_pk: number;
}

@Injectable()
@ResourceConfiguration({
    name: 'FileResource',
    url: `${environment.api_url}/file/:pk/`,
    pkAttr: 'pk',
    instanceClass: UploadableFile,
    stripTrailingSlashes: false,
    dataAttr: 'results',
    useDataAttrForList: true,
    useDataAttrForObject: false,
    totalAttr: 'count',
})
export class FileResource extends Resource<UploadableFile> {

    @ResourceAction({
        method: ResourceActionHttpMethod.POST,
        paramDefaults: [],
        isList: false,
        invalidateCache: true,
    })
    upload: ResourceActionMethod<any, any, any>;

}
```

The content-type will be automatically set by the browser.


In your component's upload-function, set up the payload with FormData() and append the file to it, which we will then POST to the backend with the 'upload'-ResourceActionMethod we have implemented in the service above:

```typescript
@app/screens/fileupload/fileupload.component.ts:
[..]
import { FileResource } from '@app/services/resource/file.resource';

export class FileUploadComponent extends ModalBaseComponent implements OnInit, OnDestroy {
    file: File;
[..]

    constructor(
        public fileResource: FileResource
    )

[..]

    onFileChange(event) {
        if ( event.target.files.length > 0 ) {
            this.file = event.target.files[0]
        }
    }

    uploadAppBinary() {
        const payload: FormData = new FormData();
        payload.append('path', this.file, this.file.name);
        payload.append('parent_pk', this.parent.pk);
        this.fileResource.upload({}, payload).$promise
            .then((data) => {
                console.log('Fileupload success:');
                console.log(data);
            })
            .catch((reason) => {
                console.log('Fileupload error:');
                console.log(reason);
            });
    }
```


