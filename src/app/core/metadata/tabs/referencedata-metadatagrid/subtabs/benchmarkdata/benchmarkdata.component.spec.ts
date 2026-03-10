import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchmarkdataComponent } from './benchmarkdata.component';

describe('BenchmarkdataComponent', () => {
  let component: BenchmarkdataComponent;
  let fixture: ComponentFixture<BenchmarkdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenchmarkdataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BenchmarkdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
