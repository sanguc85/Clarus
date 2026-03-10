import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsagridComponent } from './csagrid.component';

describe('CsagridComponent', () => {
  let component: CsagridComponent;
  let fixture: ComponentFixture<CsagridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsagridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
