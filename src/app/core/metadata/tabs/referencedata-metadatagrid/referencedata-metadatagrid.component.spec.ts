import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencedataMetadatagridComponent } from './referencedata-metadatagrid.component';

describe('ReferencedataMetadatagridComponent', () => {
  let component: ReferencedataMetadatagridComponent;
  let fixture: ComponentFixture<ReferencedataMetadatagridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferencedataMetadatagridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferencedataMetadatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
