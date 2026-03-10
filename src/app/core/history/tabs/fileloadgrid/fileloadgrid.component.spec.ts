import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileloadgridComponent } from './fileloadgrid.component';

describe('FileloadgridComponent', () => {
  let component: FileloadgridComponent;
  let fixture: ComponentFixture<FileloadgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileloadgridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileloadgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
