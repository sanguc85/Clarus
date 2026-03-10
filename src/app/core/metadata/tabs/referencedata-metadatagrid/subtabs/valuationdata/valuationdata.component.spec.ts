import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuationdataComponent } from './valuationdata.component';

describe('ValuationdataComponent', () => {
  let component: ValuationdataComponent;
  let fixture: ComponentFixture<ValuationdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValuationdataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValuationdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
