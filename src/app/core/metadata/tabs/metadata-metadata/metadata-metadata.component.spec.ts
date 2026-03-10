import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataMetadataComponent } from './metadata-metadata.component';

describe('MetadataMetadataComponent', () => {
  let component: MetadataMetadataComponent;
  let fixture: ComponentFixture<MetadataMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataMetadataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetadataMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
