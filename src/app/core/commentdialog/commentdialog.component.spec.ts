import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentdialogComponent } from './commentdialog.component';

describe('CommentdialogComponent', () => {
  let component: CommentdialogComponent;
  let fixture: ComponentFixture<CommentdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentdialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
