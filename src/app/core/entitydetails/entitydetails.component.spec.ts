import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitydetailsComponent } from './entitydetails.component';

describe('EntitydetailsComponent', () => {
  let component: EntitydetailsComponent;
  let fixture: ComponentFixture<EntitydetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitydetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitydetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
