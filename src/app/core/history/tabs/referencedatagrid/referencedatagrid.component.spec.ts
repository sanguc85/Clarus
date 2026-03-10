import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencedatagridComponent } from './referencedatagrid.component';

describe('ReferencedatagridComponent', () => {
  let component: ReferencedatagridComponent;
  let fixture: ComponentFixture<ReferencedatagridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferencedatagridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferencedatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
