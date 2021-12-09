import { Injectable, Type } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Resource } from './resource';
import { ResourceInstance } from './resource-instance';
import { ResourceConfiguration } from './resource-configuration';
import { ResourceConfigurationOptions } from './resource-configuration-options';
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


describe('ResourceRegistry', () => {
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

    it('Does collect tree-like dependencies',
        waitForAsync(
            inject([], () => {
                class TestResource1 extends TestResource {
                }

                class TestResourceDep1 extends TestResource {
                }

                class TestResourceDep2 extends TestResource {
                }

                const
                    registry = TestBed.get(ResourceRegistry, null),
                    testResource1 = createResource(TestResource1, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dependent: [
                            'TestResourceDep1'
                        ]
                    }),
                    testResource2 = createResource(TestResourceDep1, {
                        name: 'TestResourceDep1',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    testResource3 = createResource(TestResourceDep2, {
                        name: 'TestResourceDep2',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                    }),
                    dependencies = registry.getDependentResources(testResource1);

                expect(dependencies).toContain(testResource1);
                expect(dependencies).toContain(testResource2);
                expect(dependencies).not.toContain(testResource3);
            })
        )
    );

    it('Does collect circular dependencies',
        waitForAsync(
            inject([], () => {
                class TestResource1 extends TestResource {
                }

                class TestResourceDep1 extends TestResource {
                }

                class TestResourceDep2 extends TestResource {
                }

                const
                    registry = TestBed.get(ResourceRegistry, null),
                    testResource1 = createResource(TestResource1, {
                        name: 'TestResource',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dependent: [
                            'TestResourceDep1'
                        ],
                    }),
                    testResource2 = createResource(TestResourceDep1, {
                        name: 'TestResourceDep1',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dependent: [
                            'TestResourceDep2'
                        ],
                    }),
                    testResource3 = createResource(TestResourceDep2, {
                        name: 'TestResourceDep2',
                        url: 'http://test/res/:pk/',
                        pkAttr: 'id',
                        instanceClass: TestModel,
                        dependent: [
                            'TestResource'
                        ],
                    }),
                    dependencies = registry.getDependentResources(testResource1);

                expect(dependencies).toContain(testResource1);
                expect(dependencies).toContain(testResource2);
                expect(dependencies).toContain(testResource3);
            })
        )
    );

});
