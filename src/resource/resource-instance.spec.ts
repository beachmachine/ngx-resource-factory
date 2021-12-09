import { Injectable, Type } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Resource } from './resource';
import { ResourceInstance } from './resource-instance';
import { ResourceConfiguration } from './resource-configuration';
import { ResourceConfigurationOptions } from './resource-configuration-options';
import { ResourceActionHttpMethod } from './resource-action-http-method';
import { ResourceAction } from './resource-action';
import { ResourceActionMethod } from './resource-action-method';
import { ResourceRegistry } from './resource-registry';
import { NgxResourceFactoryModule } from '../module';


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


describe('ResourceInstance', () => {
    /**
     * Creates a resource service for the given resource class with
     * the given resource configuration.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @param {ResourceConfigurationOptions} resourceConfiguration Resource configuration to use
     * @returns {T}
     */
    function createResource<T extends TestResource>(cls: Type<T>, resourceConfiguration: ResourceConfigurationOptions): T {
        const
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

    it('Does recognize phantom instance',
        inject([], () => {
            const
                testResource = createResource(TestResource, {
                    name: 'TestResource',
                    url: 'http://test/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                }),
                testInstance = testResource.create({
                    title: 'a',
                });

            expect(testInstance.isPhantom()).toBe(true);
        })
    );

    it('Does recognize non-phantom instance',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                const
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        title: 'a',
                    });

                testInstance.$save().$promise
                    .then((result) => {
                        expect(result.isPhantom()).toBe(false);
                    });

                backend.expectOne({
                    url: 'http://test/',
                    method: ResourceActionHttpMethod.POST,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `GET` on `$get` method',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                const
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$get();

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `GET` on `$query` method',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                const
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does execute HTTP `POST` on `$save` method',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                const
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$save();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.POST,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `PATCH` on `$update` method',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                const
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$update();

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `DELETE` on `$remove` method',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                const
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$remove();

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.DELETE,
                }).flush('');
            })
        )
    );

    it('Does execute HTTP `PUT` on custom `$test` method',
        waitForAsync(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: false,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                const
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$test();

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush({id: 1, test: 'a'});
            })
        )
    );

    it('Does have defined custom methods only',
        waitForAsync(
            inject([], () => {
                class TestSpecific1Resource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: false,
                    })
                    test1: ResourceActionMethod<any, any, TestModel>;
                }
                class TestSpecific2Resource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: false,
                    })
                    test2: ResourceActionMethod<any, any, TestModel>;
                }

                const
                    test1Resource = createResource(TestSpecific1Resource, {
                        name: 'TestSpecific1Resource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    test2Resource = createResource(TestSpecific2Resource, {
                        name: 'TestSpecific2Resource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    test1Instance = test1Resource.create({
                        id: 1,
                        title: 'a',
                    }),
                    test2Instance = test2Resource.create({
                        id: 1,
                        title: 'a',
                    });

                expect(test1Instance['$test1']).toBeDefined();
                expect(test1Instance['$test2']).not.toBeDefined();

                expect(test2Instance['$test1']).not.toBeDefined();
                expect(test2Instance['$test2']).toBeDefined();
            })
        )
    );
});
