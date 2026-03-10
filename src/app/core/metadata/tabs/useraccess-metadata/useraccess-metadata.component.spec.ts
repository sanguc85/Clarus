import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseraccessMetadataComponent } from './useraccess-metadata.component';

describe('UseraccessMetadataComponent', () => {
  let component: UseraccessMetadataComponent;
  let fixture: ComponentFixture<UseraccessMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseraccessMetadataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UseraccessMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
