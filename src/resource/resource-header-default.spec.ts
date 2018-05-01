import { Injectable, Type } from "@angular/core";
import { async, inject, TestBed } from "@angular/core/testing";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { Resource } from "./resource";
import { ResourceInstance } from "./resource-instance";
import { ResourceConfiguration } from "./resource-configuration";
import { ResourceConfigurationOptions } from "./resource-configuration-options";
import { ResourceActionHttpMethod } from "./resource-action-http-method";
import { ResourceAction } from "./resource-action";
import { ResourceActionMethod } from "./resource-action-method";
import { ResourceHeaderDefault } from "./resource-header-default";
import { ResourceRegistry } from "./resource-registry";
import { NgxResourceFactoryModule } from "../module";


/**
 * Model definition used for testing purposes.
 */
@Injectable()
class TestModel extends ResourceInstance {
    id: number;
    title: string;
}

/**
 * Resource definition used for testing purposes.
 */
@Injectable()
class TestResource extends Resource<TestModel> {

}


describe('ResourceHeaderDefault', () => {
    /**
     * Creates a resource service for the given resource class with
     * the given resource configuration.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @param {ResourceConfigurationOptions} resourceConfiguration Resource configuration to use
     * @returns {T}
     */
    function createResource<T extends TestResource>(cls: Type<T>, resourceConfiguration: ResourceConfigurationOptions): T {
        let
            registry = TestBed.get(ResourceRegistry, null),
            httpClient = TestBed.get(HttpClient, null);

        return new (Injectable()(ResourceConfiguration(resourceConfiguration)(cls)))(registry, httpClient);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                HttpClientModule,
                HttpClientTestingModule,
                NgxResourceFactoryModule.forRoot(),
            ],
        });
    });

    afterEach(
        inject([HttpTestingController], (backend: HttpTestingController) => {
            backend.verify();
        })
    );

    it('Does set custom default headers from strings configured on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        headerDefaults: [
                            new ResourceHeaderDefault('x-custom-header', '1234'),
                        ],
                    });

                testResource.get();

                backend.expectOne(req => {
                    return req.headers.get('x-custom-header') === '1234';
                }).flush({id: 1});
            })
        )
    );

    it('Does set custom default headers from functions configured on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        headerDefaults: [
                            new ResourceHeaderDefault('x-custom-header', () => '1234'),
                        ],
                    });

                testResource.get();

                backend.expectOne(req => {
                    return req.headers.get('x-custom-header') === '1234';
                }).flush({id: 1});
            })
        )
    );

    it('Does set custom default headers from strings configured on action',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        headerDefaults: [
                            new ResourceHeaderDefault('x-custom-header', '1234'),
                        ]
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test();

                backend.expectOne(req => {
                    return req.headers.get('x-custom-header') === '1234';
                }).flush({id: 1});
            })
        )
    );

    it('Does set custom default headers from functions configured on action',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        headerDefaults: [
                            new ResourceHeaderDefault('x-custom-header', () => '1234'),
                        ]
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test();

                backend.expectOne(req => {
                    return req.headers.get('x-custom-header') === '1234';
                }).flush({id: 1});
            })
        )
    );
});
