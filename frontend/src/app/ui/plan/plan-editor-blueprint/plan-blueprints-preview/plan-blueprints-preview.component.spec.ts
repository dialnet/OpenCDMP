import { NgZone, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { of, Subject } from 'rxjs';
import { PlanBlueprintsPreviewComponent } from './plan-blueprints-preview.component';

describe('PlanBlueprintsPreviewComponent', () => {
	let component: PlanBlueprintsPreviewComponent;
	let onStable$: Subject<void>;

	const createQueryList = <T>(items: T[]): QueryList<T> => {
		const list = new QueryList<T>();
		list.reset(items);
		return list;
	};

	beforeEach(() => {
		onStable$ = new Subject<void>();

		const planBlueprintService = {
			query: jasmine.createSpy().and.returnValue(
				of({
					items: [
						{
							groupId: 'bp-1',
							label: 'Blueprint 1',
							definition: { sections: [] }
						}
					],
					count: 1
				})
			)
		};
		const descriptionTemplateService = {
			query: jasmine.createSpy().and.returnValue(of({ items: [] }))
		};
		const tenantHandlingService = {
			loadAndApplyTenantDefaultPlanBlueprint$: jasmine.createSpy().and.returnValue(of(null))
		};
		const ngZone = { onStable: onStable$.asObservable() } as NgZone;
		const httpErrorHandlingService = { handleBackedRequestError: jasmine.createSpy() };
		const enumUtils = {};

		component = new PlanBlueprintsPreviewComponent(
			planBlueprintService as any,
			descriptionTemplateService as any,
			tenantHandlingService as any,
			ngZone,
			httpErrorHandlingService as any,
			enumUtils as any
		);

		component.baseExpansionPanels = createQueryList([{ close: jasmine.createSpy() } as unknown as MatExpansionPanel]);
		component.nestedExpansionPanels = createQueryList([{ close: jasmine.createSpy() } as unknown as MatExpansionPanel]);
	});

	afterEach(() => {
		component.ngOnDestroy();
	});

	it('collapses panels once after view/data are ready and zone becomes stable', () => {
		const collapseAllSpy = spyOn(component, 'collapseAll').and.callThrough();

		component.ngAfterViewInit();
		component.ngOnInit();

		expect(collapseAllSpy).not.toHaveBeenCalled();

		onStable$.next();
		expect(collapseAllSpy).toHaveBeenCalledTimes(1);

		onStable$.next();
		expect(collapseAllSpy).toHaveBeenCalledTimes(1);
	});
});
