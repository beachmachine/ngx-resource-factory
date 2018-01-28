import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";

/*
 * Angular module declaration
 */
@NgModule({
    imports: [
        HttpClientModule,
    ],
    exports: [],
    declarations: [],
    providers: [ /* declare in `forRoot()` */ ],
})
export class NgxResourceFactoryModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxResourceFactoryModule,
            providers: []
        };
    }

}
