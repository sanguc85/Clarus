import { Component, OnInit, Input,EventEmitter, Output  } from '@angular/core';

@Component({
  selector: 'app-commentdialog',
  templateUrl: './commentdialog.component.html',
  styleUrls: ['./commentdialog.component.scss']
})
export class CommentdialogComponent implements OnInit {
  
  @Input() commentData: any;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter();
  constructor() {
    
   }

  ngOnInit(): void {
  }
  saveComment()  {
    this.save.emit(this.commentData);
  }

}
