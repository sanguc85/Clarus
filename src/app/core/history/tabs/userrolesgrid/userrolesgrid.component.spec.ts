import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserrolesgridComponent } from './userrolesgrid.component';

describe('UserrolesgridComponent', () => {
  let component: UserrolesgridComponent;
  let fixture: ComponentFixture<UserrolesgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserrolesgridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserrolesgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
