import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuritypricesComponent } from './securityprices.component';

describe('SecuritypricesComponent', () => {
  let component: SecuritypricesComponent;
  let fixture: ComponentFixture<SecuritypricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecuritypricesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecuritypricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
