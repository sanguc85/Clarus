import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsdagridComponent } from './isdagrid.component';

describe('IsdagridComponent', () => {
  let component: IsdagridComponent;
  let fixture: ComponentFixture<IsdagridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsdagridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IsdagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
