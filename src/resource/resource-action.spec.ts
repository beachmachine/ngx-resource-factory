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
class TestResource extends Resource<TestModel> {

}


describe('ResourceAction', () => {
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

    it('Does take `query`, `payload`, `successCb` and `errorCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, testInstance, cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, `payload` and `successCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, testInstance, cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `payload`, `successCb` and `errorCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update(testInstance, cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `successCb` and `errorCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update(cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `payload` and `successCb` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update(testInstance, cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query` and `payload` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update({a: 1, b: 2}, testInstance);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `payload` on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update(testInstance);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take nothing on resource',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testResource.update();

                backend.expectOne({
                    url: 'http://test/res/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, `successCb` and `errorCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update({a: 1, b: 2}, cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query`, and `successCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update({a: 1, b: 2}, cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `successCb` and `errorCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update(cbs.success, cbs.error);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `successCb` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update(cbs.success);

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take `query` on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update({a: 1, b: 2});

                backend.expectOne({
                    url: 'http://test/res/1/?a=1&b=2',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );

    it('Does take nothing on instance',
        async(
            inject([HttpTestingController], (backend: HttpTestingController) => {
                let
                    cbs = {
                        success: () => {},
                        error: () => {}
                    },
                    testResource = createResource(TestResource, {
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testInstance = testResource.create({
                        id: 1,
                        title: 'a',
                    });

                spyOn(cbs, 'success');
                spyOn(cbs, 'error');

                testInstance.$update();

                backend.expectOne({
                    url: 'http://test/res/1/',
                    method: ResourceActionHttpMethod.PATCH,
                }).flush({id: 1, test: 'a'});

                expect(cbs.success).not.toHaveBeenCalled();
                expect(cbs.error).not.toHaveBeenCalled();
            })
        )
    );
});
