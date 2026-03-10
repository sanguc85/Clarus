import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesMetadataComponent } from './rules-metadata.component';

describe('RulesMetadataComponent', () => {
  let component: RulesMetadataComponent;
  let fixture: ComponentFixture<RulesMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesMetadataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
