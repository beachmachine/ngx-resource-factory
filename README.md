# ngx-resource-factory

ngx-resource-factory is an Angular library that enables you to work with RESTful APIs in an easy way. The main 
features include a resource store for holding changes on resource instances and related resource instances to commit
them at once, and an advanced resource caching.

**Note:** This library is for Angular 5.x and above!


## In development

This library is currently in an early stage of development and is missing lots of features as well as a proper 
documentation.

## Setup

#### Install

To use ngx-resource-factory in your project you have to install it via npm:

    npm i ngx-resource-factory --save

#### Add resource

The next step would be to define a resource. Typically you would create a services folder which will hold a ServicesModule in which the resources will be declared. Resources should also have their own directory. So the UserResource would be located in **app/services/resources/user.resource.ts**

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


#### Create Service module

After defining the first resource it is recuired to declare it in a module so that we can inject it into components. Here, in **app/services/services.module.ts**, we are going to define the ServicesModule, which will load the UserResource.


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


#### Add module

Finally we have to add the NgxResourceFactoryModule and the ServicesModule to the main Angular module.

    ...
    import { NgxResourceFactoryModule } from 'ngx-resource-factory';
    import { ServicesModule } from './services/services.module';
    ...

    @NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        ...
        NgxResourceFactoryModule.forRoot(),
        ServiceModule.forRoot(),
        ...
    ],
    providers: [],
    bootstrap: [AppComponent]
    })
    export class AppModule { }


## Usage

You can now inject the resource into your component and start using it.

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

## Common methods


##### Query
    
    this.userResource.query(queryParam).$promise

##### Save

    this.userResource.save(params, object).$promise

##### Create

    this.userResource.create(object).$save().$promise

##### Update
    
    // Resource
    this.userResource.update(params, object).$promise

    // Resource model
    userInstance.$update()

##### Update
    
    // Resource
    this.userResource.remove(params, object).$promise

    // Resource model
    userInstance.$remove()
