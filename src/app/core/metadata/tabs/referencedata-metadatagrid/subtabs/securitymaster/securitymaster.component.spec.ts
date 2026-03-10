import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuritymasterComponent } from './securitymaster.component';

describe('SecuritymasterComponent', () => {
  let component: SecuritymasterComponent;
  let fixture: ComponentFixture<SecuritymasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecuritymasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecuritymasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
