import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McagridComponent } from './mcagrid.component';

describe('McagridComponent', () => {
  let component: McagridComponent;
  let fixture: ComponentFixture<McagridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McagridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
