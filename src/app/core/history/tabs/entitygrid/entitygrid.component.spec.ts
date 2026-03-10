import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitygridComponent } from './entitygrid.component';

describe('EntitygridComponent', () => {
  let component: EntitygridComponent;
  let fixture: ComponentFixture<EntitygridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitygridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitygridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
