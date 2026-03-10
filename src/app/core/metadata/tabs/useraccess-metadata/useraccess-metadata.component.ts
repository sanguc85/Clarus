import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UseraccessService } from './useraccess.service';
import { IgxGridComponent, RowType } from 'igniteui-angular';
import { MetadataService } from '../../metadata.service';

@Component({
  selector: 'app-useraccess-metadata',
  templateUrl: './useraccess-metadata.component.html',
  styleUrls: ['./useraccess-metadata.component.scss'],
})
export class UseraccessMetadataComponent implements OnInit {
  constructor(
    private userAccessService: UseraccessService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    public metaDataService: MetadataService
  ) {}
  userAccessList: any[] = [];
  isNewRow: boolean = false;
  newRowUserName: string = '';
  editedCells: any[] = [];
  newRows: any[] = [];
  deletedRows: any[] = [];
  editableCells = [];

  @ViewChild('grid', { static: true }) grid: IgxGridComponent;
  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.userAccessService.getUsers().subscribe(
      (data: any[]) => {
        this.userAccessList = data;
        if (data.length === 0) {
          this.toasterService.toast('No data found.');
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }

  handleCellEditEnter(event: any) {
    if (event.rowID < 0) {
      this.isNewRow = true;
      this.editableCells = ['UserName', 'FullName', 'Initials', 'ADName'];
    } else {
      this.editableCells = ['FullName', 'Initials','ADName'];
      if (event.column.field === 'UserName') {
        event.cancel = true;
        this.isNewRow = false;
      }
    }
  }

  handleCellEdit(event: any) {
    const editedRowId = event.rowData.Id;
    const editedColumn = event.column.field;
    const newValue = event.newValue;
    if (editedRowId >= 0) {
      this.editedCells.push({
        Id: editedRowId,
        Column: editedColumn,
        NewValue: newValue,
      });
    }
  }

  handleRowAdded(event: any) {
    const newRowData = event.data;
    if (newRowData) {
      // Add only if the row is newly added (ID < 0)
      if (newRowData.Id < 0) {
        this.newRows.push(newRowData);
      } else {
      }
    }
  }

  handleRowDeleted(event: any) {
    if (
      confirm(
        'Are you sure you want to remove this User? Please click save to confirm the changes.'
      )
    ) {
      const deletedRowData = event.data;
      if (deletedRowData) {
        // Add the deleted row data to the deletedRows array
        this.deletedRows.push(deletedRowData);
      }
    }
  }

  saveUsers(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const editedCells = this.editedCells;
    const newRows = this.newRows;
    const deletedRows = this.deletedRows;
    // Reset isNewRow flag to false
    this.isNewRow = false;
    this.userAccessService
      .saveUsers(editedCells, newRows, deletedRows)
      .subscribe(
        (data) => {
          this.toasterService.toast('Changes successfully saved.');
          this.clearAll();
        },
        (error) => {
          // Handle error
          console.error('An error occurred:', error);
          this.toasterService.toast('Error saving data.');
          this.clearAll();
        }
      );
  }

  clearAll() {
    this.getUsers();
    this.spinner.hide();
    this.editedCells = [];
    this.newRows = [];
    this.deletedRows = [];
    this.isNewRow = false;
  }
}
