import {
    ApplicationRef,
    EnvironmentInjector,
    Injectable,
    Type,
    createComponent,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
    constructor(
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector
    ) { }

    open<T extends object, R = any>(
        component: Type<T>,
        options?: Partial<T>
    ): Promise<R | null> {
        return new Promise((resolve) => {
            const componentRef = createComponent(component, {
                environmentInjector: this.injector,
            });

            if (options) {
                Object.assign(componentRef.instance, options);
            }

            if ((componentRef.instance as any).success) {
                (componentRef.instance as any).success.subscribe((res: R) => {
                    this.close(componentRef);
                    resolve(res);
                });
            }

            if ((componentRef.instance as any).cancel) {
                (componentRef.instance as any).cancel.subscribe(() => {
                    this.close(componentRef);
                    resolve(null);
                });
            }

            this.appRef.attachView(componentRef.hostView);

            const domElem = (componentRef.hostView as any).rootNodes[0];
            document.body.appendChild(domElem);
        });
    }

    private close(componentRef: any) {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
    }
}