import { Injectable, Type } from "@angular/core";
import { async, inject, TestBed } from "@angular/core/testing";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { Resource, ResourceBase } from "./resource";
import { ResourceInstance } from "./resource-instance";
import { ResourceConfiguration } from "./resource-configuration";
import { ResourceConfigurationOptions } from "./resource-configuration-options";
import { ResourceActionHttpMethod } from "./resource-action-http-method";
import { ResourceAction } from "./resource-action";
import { ResourceActionMethod } from "./resource-action-method";
import { NegativeIntGenerator } from "./phantom-generator/negative-int-generator";
import { Uuid4Generator } from "./phantom-generator/uuid4-generator";
import { ResourceModel } from "./resource-model";
import { ResourceRegistry } from "./resource-registry";
import { NgxResourceFactoryModule } from "../module";
import { ResourceHeaderDefault } from "./resource-header-default";


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


describe('Resource', () => {
    /**
     * Creates an instance of the given resource class.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @returns {T}
     */
    function instantiateResource<T extends ResourceBase>(cls: Type<T>): T {
        let
            registry = TestBed.get(ResourceRegistry, null),
            httpClient = TestBed.get(HttpClient, null);

        return new cls(registry, httpClient);
    }

    /**
     * Creates a resource service for the given resource class with
     * the given resource configuration.
     *
     * @param {Type<T extends TestResource>} cls Resource class
     * @param {ResourceConfigurationOptions} resourceConfiguration Resource configuration to use
     * @returns {T}
     */
    function createResource<T extends ResourceBase>(cls: Type<T>, resourceConfiguration: ResourceConfigurationOptions): T {
        return instantiateResource((Injectable()(ResourceConfiguration(resourceConfiguration)(cls))));
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

    it('Does have all resource REST methods',
        inject([], () => {
            let
                testResource = createResource(TestResource, {
                    name: 'TestResource',
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
                    name: 'TestResource',
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

    it('Does keep trailing slash if `pkAttr` omitted',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does strip trailing slash if `pkAttr` omitted',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        stripTrailingSlashes: true,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1}, {id: 2}]);
            })
        )
    );

    it('Does keep trailing slash if `pkAttr` given',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.get({pk: 1});

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1});
            })
        )
    );

    it('Does strip trailing slash if `pkAttr` given',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        stripTrailingSlashes: true,
                    });

                testResource.get({pk: 1});

                backend.expectOne({
                    url: 'http://test/res/1',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1});
            })
        )
    );

    it('Does give a result',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
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
                        name: 'TestResource',
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
                        name: 'TestResource',
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
                        name: 'TestResource',
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

    it('Does handle errors on observable',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    result = testResource.query();

                result.$observable.subscribe({
                    next: () => {
                        expect(false).toBe(true);
                    },
                    error: () => {
                        expect(true).toBe(true);
                    }
                });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({}, {
                    status: 500,
                    statusText: 'Server error'
                });
            })
        )
    );

    it('Does handle errors on promise',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    result = testResource.query();

                result.$promise
                    .then(() => {
                        expect(false).toBe(true);
                    })
                    .catch(() => {
                        expect(true).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({}, {
                    status: 500,
                    statusText: 'Server error'
                });
            })
        )
    );

    it('Does instantiate as resource instance class on lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result[0] instanceof TestModel).toBe(true);
                        expect(result[1] instanceof TestModel).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does instantiate as resource instance class on objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    resultStub = testResource.get({pk: 1});

                resultStub.$promise
                    .then((result) => {
                        expect(result instanceof TestModel).toBe(true);
                    });

                expect(resultStub instanceof TestModel).toBe(true);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does instantiate as resource action instance class on lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        instanceClass: TestSpecificModel,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test().$promise
                    .then((result) => {
                        expect(result[0] instanceof TestSpecificModel).toBe(true);
                        expect(result[1] instanceof TestSpecificModel).toBe(true);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does instantiate as resource action instance class on objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        instanceClass: TestSpecificModel,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    resultStub = testResource.test({pk: 1});

                resultStub.$promise
                    .then((result) => {
                        expect(result instanceof TestSpecificModel).toBe(true);
                    });

                expect(resultStub instanceof TestSpecificModel).toBe(true);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `load` method on resource REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    });

                testResource.test().$promise
                    .then((result) => {
                        expect(result[0].title).toBe('ok-a');
                        expect(result[1].title).toBe('ok-b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `load` method on resource REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    });

                testResource.test({pk: 1}).$promise
                    .then((result) => {
                        expect(result.title).toBe('ok-a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `load` method on instance REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create();

                delete testInstance['id'];
                testInstance.$test().$promise
                    .then((result) => {
                        expect(result[0].title).toBe('ok-a');
                        expect(result[1].title).toBe('ok-b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `load` method on instance REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public load(data: object): ResourceInstance {
                        data['title'] = 'ok-' + data['title'];

                        return super.load(data);
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({id: 1});

                testInstance.$test().$promise
                    .then((result) => {
                        expect(result.title).toBe('ok-a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `dump` method on resource REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        title: 'a',
                    });

                testResource.test(null, testInstance);

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `dump` method on resource REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testResource.test(null, testInstance);

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does use `dump` method on instance REST methods for lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        isList: true,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        title: 'a',
                    });

                delete testInstance['id'];
                testInstance.$test();

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does use `dump` method on instance REST methods for objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                class TestSpecificModel extends TestModel {

                    public dump(): object {
                        let
                            data = super.dump();

                        data['title'] = 'ok-' + data['title'];
                        return data;
                    }

                }

                @Injectable()
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                    })
                    test: ResourceActionMethod<any, any, TestSpecificModel>;
                }

                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestSpecificModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                testInstance.$test();

                backend.expectOne(req => {
                    return req.body['title'] === 'ok-a';
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does respect `useDataAttrForList` resource configuration option on lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dataAttr: 'data',
                        useDataAttrForList: true,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);
                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: [{id: 1, title: 'a'}, {id: 2, title: 'b'}]});
            })
        )
    );

    it('Does ignore `useDataAttrForList` resource configuration option on objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dataAttr: 'data',
                        useDataAttrForList: true,
                    });

                testResource.get({pk: 1}).$promise
                    .then((result) => {
                        expect(result.title).toBe('a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does ignore `useDataAttrForObject` resource configuration option on lists',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dataAttr: 'data',
                        useDataAttrForObject: true,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);
                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does respect `useDataAttrForObject` resource configuration option on objects',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dataAttr: 'data',
                        useDataAttrForObject: true,
                    });

                testResource.get({pk: 1}).$promise
                    .then((result) => {
                        expect(result.title).toBe('a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({'data': {id: 1, title: 'a'}});
            })
        )
    );

    it('Does ignore `useDataAttrForList` resource configuration option if `dataAttr` not set',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        useDataAttrForList: true,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.length).toBe(2);
                        expect(result[0].title).toBe('a');
                        expect(result[1].title).toBe('b');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does ignore `useDataAttrForObject` resource configuration option if `dataAttr` not set',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        useDataAttrForObject: true,
                    });

                testResource.get({pk: 1}).$promise
                    .then((result) => {
                        expect(result.title).toBe('a');
                    });

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does bind instance using `create` method',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create();

                expect(testInstance.$resource).toBe(testResource);
            })
        )
    );

    it('Does bind instance using `bind` method',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = new TestModel(),
                    testBoundInstance = testResource.bind(testInstance);

                expect(testBoundInstance.$resource).toBe(testResource);
            })
        )
    );

    it('Does not bind instance using `new`',
        async(
            inject([HttpTestingController], () => {
                createResource(TestResource, {
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                });

                let
                    testInstance = <ResourceModel<TestModel>>new TestModel();

                expect(testInstance.$resource).toBe(undefined);
            })
        )
    );

    it('Does rebind instance using `bind`',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource1 = createResource(TestResource, {
                        name: 'TestResource1',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testResource2 = createResource(TestResource, {
                        name: 'TestResource2',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource1.create();

                expect(testInstance.$resource).toBe(testResource1);

                testResource2.bind(testInstance);

                expect(testInstance.$resource).toBe(testResource2);
            })
        )
    );

    it('Does generate phantom id using `create` method',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create();

                expect(testInstance.id).toBeDefined();
            })
        )
    );

    it('Does generate phantom id using `bind` method',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = new TestModel();

                expect(testInstance.id).not.toBeDefined();

                testResource.bind(testInstance);

                expect(testInstance.id).toBeDefined();
            })
        )
    );

    it('Does set default phantom generator',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                expect(testResource.getPhantomGenerator() instanceof NegativeIntGenerator).toBe(true);
            })
        )
    );

    it('Does set custom phantom generator',
        async(
            inject([HttpTestingController], () => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        phantomGeneratorClass: Uuid4Generator,
                        instanceClass: TestModel,
                    });

                expect(testResource.getPhantomGenerator() instanceof Uuid4Generator).toBe(true);
            })
        )
    );

    it('Does execute HTTP `GET` on `get` method',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.get({pk: 1});

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `GET` on `query` method',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.query();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does execute HTTP `POST` on `save` method',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
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

                testResource.save(null, testInstance);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.POST,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `PATCH` on `update` method',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
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

                testResource.update(null, testInstance);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does execute HTTP `DELETE` on `remove` method',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
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

                testResource.remove(null, testInstance);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.DELETE,
                }).flush('');
            })
        )
    );

    it('Does execute HTTP `PUT` on custom `test` method',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.PUT,
                        isList: false,
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
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

                testResource.test(null, testInstance);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PUT,
                }).flush({id: 1, test: 'a'});
            })
        )
    );

    it('Does get `arraybuffer` data',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        responseType: 'arraybuffer',
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    intArray = new Uint8Array([1, 2, 3, 4]),
                    intArrayBuffer = intArray.buffer,
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test().$promise
                    .then((result) => {
                        let
                            resultIntArray = new Uint8Array(result.$response.body);

                        expect(resultIntArray[0]).toBe(1);
                        expect(resultIntArray[1]).toBe(2);
                        expect(resultIntArray[2]).toBe(3);
                        expect(resultIntArray[3]).toBe(4);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush(intArrayBuffer);
            })
        )
    );

    it('Does get `blob` data',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        responseType: 'blob',
                    })
                    test: ResourceActionMethod<any, any, TestModel>;
                }

                let
                    dataBlob = new Blob(['a', 'b', 'c', 'd'], {type: 'application/x-custom'}),
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestSpecificResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                testResource.test().$promise
                    .then((result) => {
                        let
                            reader = new FileReader();

                        reader.addEventListener("loadend", function () {
                            expect(reader.result).toBe('abcd');
                        });

                        reader.readAsText(result.$response.body, 'utf-8');
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush(dataBlob);
            })
        )
    );

    it('Does get total from `totalAttr` set on configuration',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        totalAttr: 'total',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.$total).toBe(100);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({total: 100, data: [{id: 1, title: 'a'}, {id: 2, title: 'b'}]});
            })
        )
    );

    it('Does not get total from missing `totalAttr` set on configuration',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        totalAttr: 'total',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.$total).toBe(null);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: [{id: 1, title: 'a'}, {id: 2, title: 'b'}]});
            })
        )
    );

    it('Does not get total from `totalAttr` not set on configuration',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        dataAttr: 'data',
                        useDataAttrForList: true,
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.$total).toBe(null);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({total: 100, data: [{id: 1, title: 'a'}, {id: 2, title: 'b'}]});
            })
        )
    );

    it('Does not get total from `totalAttr` set when `dataAttr` not set on configuration',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        totalAttr: 'total',
                        instanceClass: TestModel,
                    });

                testResource.query().$promise
                    .then((result) => {
                        expect(result.$total).toBe(null);
                    });

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush([{id: 1, title: 'a'}, {id: 2, title: 'b'}]);
            })
        )
    );

    it('Does clean private attributes before submit',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        totalAttr: 'total',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                        $private: true
                    });

                testInstance.$update();

                backend.expectOne((request) => {
                    return request.body.$private === undefined;
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does clean private attributes before submit recursively',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        totalAttr: 'total',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                        tests: [
                            {
                                id: 1,
                                $private: true
                            },
                            {
                                id: 2,
                                $private: true
                            },
                        ]
                    });

                testInstance.$update();

                backend.expectOne((request) => {
                    return request.body.tests[0].$private === undefined &&
                           request.body.tests[1].$private === undefined;
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does clean custom private attributes before submit',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        totalAttr: 'total',
                        instanceClass: TestModel,
                        privatePattern: /^[$_].*/
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                        _private: true
                    });

                testInstance.$update();

                backend.expectOne((request) => {
                    return request.body._private === undefined;
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does clean custom private attributes before submit recursively',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    testResource = createResource(TestResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        totalAttr: 'total',
                        instanceClass: TestModel,
                        privatePattern: /^[$_].*/
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                        tests: [
                            {
                                id: 1,
                                _private: true
                            },
                            {
                                id: 2,
                                _private: true
                            },
                        ]
                    });

                testInstance.$update();

                backend.expectOne((request) => {
                    return request.body.tests[0]._private === undefined &&
                           request.body.tests[1]._private === undefined;
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does upload multipart/form-data with `FormData` payloads',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestSpecificResource extends TestResource {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.POST,
                        headerDefaults: [
                            new ResourceHeaderDefault('Content-Type', 'multipart/form-data'),
                        ],
                    })
                    upload: ResourceActionMethod<any, any, any>;
                }


                let
                    testResource = createResource(TestSpecificResource, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        totalAttr: 'total',
                        instanceClass: TestModel,
                    }),
                    formData = new FormData();

                formData.append('file', new Blob(['FILE_DATA']), 'file.name');

                testResource.upload({}, formData).$promise
                    .then((result) => {
                        expect(result).not.toBe(null);
                    });

                backend.expectOne(req => {
                    return req.headers.get('Content-Type') === 'multipart/form-data' &&
                           req.body instanceof FormData;
                }).flush({id: 1, title: 'a'});
            })
        )
    );

    it('Does get primitive data lists if `dataAttr` not set',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        dataAttr: null,
                        isList: true,
                        isPrimitive: true
                    })
                    action1: ResourceActionMethod<any, any, string[]>;
                }

                let
                    cbs = {
                        success: (r: string[]) => {
                            expect(r[0]).toEqual('a');
                            expect(r[1]).toEqual('b');
                            expect(r[2]).toEqual('c');
                        }
                    },
                    resource = instantiateResource(TestResource);

                resource.action1(cbs.success);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush(['a', 'b', 'c']);
            })
        )
    );

    it('Does get primitive data lists if `dataAttr` set',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        dataAttr: 'data',
                        isList: true,
                        isPrimitive: true
                    })
                    action1: ResourceActionMethod<any, any, string[]>;
                }

                let
                    cbs = {
                        success: (r: string[]) => {
                            expect(r[0]).toEqual('a');
                            expect(r[1]).toEqual('b');
                            expect(r[2]).toEqual('c');
                        }
                    },
                    resource = instantiateResource(TestResource);

                resource.action1(cbs.success);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: ['a', 'b', 'c']});
            })
        )
    );

    it('Does get primitive data if `dataAttr` not set',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        dataAttr: null,
                        isList: false,
                        isPrimitive: true
                    })
                    action1: ResourceActionMethod<any, any, string[]>;
                }

                let
                    cbs = {
                        success: (r: string) => {
                            expect(r).toEqual('a');
                        }
                    },
                    resource = instantiateResource(TestResource);

                resource.action1(cbs.success);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush('a');
            })
        )
    );

    it('Does get primitive data if `dataAttr` set',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                @Injectable()
                @ResourceConfiguration({
                    name: 'TestResource',
                    url: 'http://test/res/:pk/',
                    pkAttr: 'id',
                    instanceClass: TestModel,
                })
                class TestResource extends ResourceBase {
                    @ResourceAction({
                        method: ResourceActionHttpMethod.GET,
                        paramDefaults: [],
                        dataAttr: 'data',
                        isList: false,
                        isPrimitive: true
                    })
                    action1: ResourceActionMethod<any, any, string[]>;
                }

                let
                    cbs = {
                        success: (r: string) => {
                            expect(r).toEqual('a');
                        }
                    },
                    resource = instantiateResource(TestResource);

                resource.action1(cbs.success);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.GET,
                }).flush({data: 'a'});
            })
        )
    );
});
