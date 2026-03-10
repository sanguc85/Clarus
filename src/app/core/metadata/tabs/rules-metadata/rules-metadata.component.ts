import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { RulesMetadataService } from './rules-metadata.service';
import { IgxDialogComponent, IgxGridComponent } from 'igniteui-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataService } from '../../metadata.service';

@Component({
  selector: 'app-rules-metadata',
  templateUrl: './rules-metadata.component.html',
  styleUrls: ['./rules-metadata.component.scss'],
})
export class RulesMetadataComponent implements OnInit {
  rulesList: any[] = [];
  isAdmin = true;
  ruleSearch: any = {};

  isNewRow: boolean = false;
  editedCells: any[] = [];
  newRows: any[] = [];
  deletedRows: any[] = [];
  editableCells = [];
  constructor(
    private rulesMetadataService: RulesMetadataService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    private formBuilder: FormBuilder,
    public metaDataService: MetadataService
  ) {}

  @ViewChild('grid', { static: true }) grid: IgxGridComponent;
  @ViewChild('addNewRuleDialog')
  addNewRuleDialog!: IgxDialogComponent;
  rulesForm: FormGroup;

  ngOnInit(): void {
    this.getRules();
    this.rulesForm = this.formBuilder.group({
      Id: [''],
      RuleName: ['', Validators.required],
      Key: ['', Validators.required],
      Value: ['', Validators.required],
    });
  }

  getRules() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.rulesMetadataService.getRules().subscribe(
      (data: any[]) => {
        this.rulesList = data;
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

  // openRuleDialog() {
  //   this.addNewRuleDialog.open();
  // }

  // closeRuleDialog() {
  //   this.addNewRuleDialog.close();
  //   this.rulesForm.reset();
  // }

  //remove after testing
  // saveRules(): void {
  //   if (this.rulesForm.invalid) {
  //     // Handle form validation errors
  //     return;
  //   }

  //   const formData = this.rulesForm.value;

  //   this.rulesMetadataService.saveRules(formData).subscribe(
  //     (response) => {
  //       // Handle successful response if needed
  //       console.log('Save Rules response:', response);
  //     },
  //     (error) => {
  //       // Handle error if needed
  //       console.error('Save Rules error:', error);
  //     }
  //   );
  // }

  handleCellEditEnter(event: any) {
    if (event.rowID < 0) {
      this.isNewRow = true;
      this.editableCells = ['RuleName', 'Key', 'Value'];
    } else {
      this.editableCells = ['Key', 'Value'];
      if (event.column.field === 'RuleName') {
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

  saveRules(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const editedCells = this.editedCells;
    const newRows = this.newRows;
    const deletedRows = this.deletedRows;
    // Reset isNewRow flag to false
    this.isNewRow = false;
    this.rulesMetadataService
      .saveRules(editedCells, newRows, deletedRows)
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
    this.getRules();
    this.spinner.hide();
    this.editedCells = [];
    this.newRows = [];
    this.deletedRows = [];
    this.isNewRow = false;
  }
}
