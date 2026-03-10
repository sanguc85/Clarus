import { Component, Input, OnInit,EventEmitter,ViewChild,Output} from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-userrolesgrid',
  templateUrl: './userrolesgrid.component.html',
  styleUrls: ['./userrolesgrid.component.scss']
})
export class UserrolesgridComponent implements OnInit {
  @Input() auditData!: any[];
  @ViewChild('grid', { static: true }) grid!: IgxGridComponent;
  @Output() gridReady: EventEmitter<IgxGridComponent> = new EventEmitter<IgxGridComponent>();
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  ngAfterViewInit(): void {
    this.gridReady.emit(this.grid);
  }
  constructor() { }

  ngOnInit(): void {
  }

}
