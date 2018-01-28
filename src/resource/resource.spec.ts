import {Injectable, Type} from "@angular/core";
import {async, inject, TestBed} from "@angular/core/testing";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import {Resource} from "./resource";
import {ResourceInstance} from "./resource-instance";
import {ResourceConfiguration} from "./resource-configuration";
import {ResourceConfigurationOptions} from "./resource-configuration-options";
import {ResourceActionHttpMethod} from "./resource-action-http-method";


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
class TestResource extends Resource<TestModel> { }


describe('Resource', () => {
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
            httpClient = TestBed.get(HttpClient, null);

        return Injectable()(
            new (ResourceConfiguration(resourceConfiguration)(cls))(httpClient)
        );
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                HttpClientModule,
                HttpClientTestingModule,
            ],
        });
    });

    afterEach(
        inject([HttpTestingController], (backend: HttpTestingController) => {
            backend.verify();
        })
    );

    it('Does have all resource REST methods',
        inject([], () => {
            let
                testResource = createResource(TestResource, {
                    url: 'http://test/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                });

            expect(testResource.get).toBeDefined();
            expect(testResource.query).toBeDefined();
            expect(testResource.save).toBeDefined();
            expect(testResource.update).toBeDefined();
            expect(testResource.remove).toBeDefined();
        })
    );

    it('Does have all instance REST methods',
        inject([], () => {
            let
                testResource = createResource(TestResource, {
                    url: 'http://test/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                }),
                instance = testResource.create();

            expect(instance.$get).toBeDefined();
            expect(instance.$query).toBeDefined();
            expect(instance.$save).toBeDefined();
            expect(instance.$update).toBeDefined();
            expect(instance.$remove).toBeDefined();
        })
    );

    it('Does keep trailing slash if PK omitted',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does strip trailing slash if PK omitted',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        stripTrailingSlashes: true,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does keep trailing slash if PK given',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.get({id: 1});

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does strip trailing slash if PK given',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        stripTrailingSlashes: true,
                    });

                testResource.get({id: 1});

                backend.expectOne({
                    url: 'http://test/res/1',
                    method: ResourceActionHttpMethod.GET,
                });
            })
        )
    );

    it('Does give a result',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    result = testResource.query();

                result.$observable
                    .subscribe(() => {
                        expect(result.length).toBe(2);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does give an observable',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query().$observable
                    .subscribe((result) => {
                        expect(result.length).toBe(2);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does give a promise',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does resolve result',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    result = testResource.query();

                expect(result.$resolved).toBe(false);

                result.$promise
                    .then(() => {
                        expect(result.$resolved).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );
});
