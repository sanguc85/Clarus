import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzureOidcCoreCallbackComponent } from './azure-oidc-core-callback.component';

describe('AzureOidcCoreCallbackComponent', () => {
  let component: AzureOidcCoreCallbackComponent;
  let fixture: ComponentFixture<AzureOidcCoreCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AzureOidcCoreCallbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AzureOidcCoreCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
