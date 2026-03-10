import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseraccessgridComponent } from './useraccessgrid.component';

describe('UseraccessgridComponent', () => {
  let component: UseraccessgridComponent;
  let fixture: ComponentFixture<UseraccessgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseraccessgridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UseraccessgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
