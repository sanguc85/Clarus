import { Component, OnInit, ViewChild } from '@angular/core';
import { MetadataService } from '../../metadata.service';
import { MetadataMetadataService } from './metadata-metadata.service';
import { IgxGridComponent } from 'igniteui-angular';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { Observable, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-metadata-metadata',
  templateUrl: './metadata-metadata.component.html',
  styleUrls: ['./metadata-metadata.component.scss'],
})
export class MetadataMetadataComponent implements OnInit {
  referenceTable: any = 'AgreementType';
  metaDataTables: string[] = [
    'AgreementType',
    'ApplicableType',
    'CollateralMovementType',
    'CollateralType',
    'Counterparty',
    'Country',
    'Currency',
    'DayCountConvention',
    'DeterminingParty',
    'DocumentationLaw',
    'Entity',
    'EntityAccountType',
    'IndexChangeType',
    'InterestBenchmark',
    'InterestCalculationMethod',
    'MasterAgreementType',
    'Outlook',
    'Party',
    'RatingSource',
    'RepoType',
    'Account',
    'Position',
    'RepoCollateralType',
    'SettlementType',
    'Status',
    'TransactionType',
    'ReportType',
  ];
  referenceTableList: string[] = [];
  referenceTableDict: { Name: string }[] = [];
  gridData: any[] = [];
  editedCells: any[] = [];
  newRows: any[] = [];
  deletedRows: any[] = [];
  entityOptions: string[] = [];
  positionOptions: string[] = [];
  @ViewChild('grid', { read: IgxGridComponent })
  public grid: IgxGridComponent;
  get isAccount(): boolean { return this.referenceTable === 'Account'; }
  get isPosition(): boolean { return this.referenceTable === 'Position'; }

  constructor(
    public metaDataService: MetadataService,
    private metaDataMetaDataService: MetadataMetadataService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadReferenceTableData();
  }

  loadReferenceTableData() {
  this.errorHandler.clearErrorList();
  this.spinner.show();

  if (!this.referenceTable) { this.spinner.hide(); return; }

  if (this.referenceTable === 'Account') {
    // Load entities, positions, and rows together
    forkJoin({
      entities: this.metaDataMetaDataService.getEntityNames(),
      positions: this.metaDataMetaDataService.getPositionNames(),
      rows: this.metaDataService.getReferenceData('Account')
    })
    .pipe(finalize(() => this.spinner.hide()))
    .subscribe({
      next: ({ entities, positions, rows }) => {
        this.entityOptions = entities || [];
        this.positionOptions = positions || []
          .filter(p => {
          return p.IsActive === true;
        })
        .map(p => p.Name);
        this.gridData = rows || [];
        if (!this.gridData.length) this.toasterService.toast('No data found.');
      },
      error: (err) => {
        console.error('Error loading Account data:', err);
        this.toasterService.toast('Error loading data.');
      }
    });

  } else if (this.referenceTable === 'Position') {
    this.metaDataService.getReferenceData('Position')
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (rows: any[]) => {
          this.gridData = rows || [];
          if (!this.gridData.length) this.toasterService.toast('No data found.');
        },
        error: (err) => {
          console.error('Error loading Position data:', err);
          this.toasterService.toast('Error loading data.');
        }
      });

  } else {
    // Generic tables
    this.metaDataService.getReferenceData(this.referenceTable)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (data: any[]) => {
          this.gridData = data || [];
          if (!this.gridData.length) this.toasterService.toast('No data found.');
        },
        error: (err) => {
          console.error('Error loading data for', this.referenceTable, err);
          this.toasterService.toast('Error loading data.');
        }
      });
  }
}

onCellValueChange(newValue: any, cell: any, columnName?: string): void {
  if (!cell || typeof cell !== 'object' || typeof cell.update !== 'function') return;

  const col   = (columnName ?? cell.column?.field) || '';
  const row   = cell.row?.data;
  const rowId = cell.row?.key ?? cell.rowData?.Id;

  if (col === 'IsDefault' && newValue === true) {
    const e = row?.Entity;
    const p = row?.Position;

    if (this.isDefaultTaken(e, p, rowId)) {
      this.toasterService.toast(`Default account already exist for ${e} + ${p}.`);
      setTimeout(() => cell.update(false));
      return; 
    }
  }

  cell.update(newValue);
  this.editedCells.push({ Id: rowId, Column: col, NewValue: newValue });
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
      }
    }
  }

  handleRowDelete(event: any) {
  const rowData = event.rowData;
  if (this.isAccount && rowData?.IsDefault) {
    event.cancel = true;
    this.toasterService.toast('Cannot delete default account. Set another as default first.');
    return;
  }
  if (!confirm('Are you sure you want to delete this row?')) {
    event.cancel = true;
  }
}

  handleRowDeleted(event: any) {
  const deletedRowData = event.data;
  if (deletedRowData) {
    this.deletedRows.push(deletedRowData);
  }
}

  onSaveData(): void {
    this.spinner.show();
    const referenceTable = this.referenceTable;
    const editedCells = this.editedCells;
    const newRows = this.newRows;
    const deletedRows = this.deletedRows;
    let save$: Observable<any>;
    if (referenceTable === 'Account') {
      save$ = this.metaDataMetaDataService.saveAccount(editedCells, newRows, deletedRows);
  } else if (referenceTable === 'Position') {
      save$ = this.metaDataMetaDataService.savePosition(editedCells, newRows, deletedRows);
  } else {
      save$ = this.metaDataMetaDataService.saveData(referenceTable, editedCells, newRows, deletedRows);}

  save$.subscribe(
    _ => {
      this.toasterService.toast('Changes successfully saved.');
      this.clearAll();
    },
    error => {
      console.error('An error occurred:', error);
      this.toasterService.toast('Error saving data.');
      this.clearAll();
    }
  );
}

  clearAll() {
    this.loadReferenceTableData();
    this.spinner.hide();
    this.editedCells = [];
    this.newRows = [];
    this.deletedRows = [];
  }

  private isDefaultTaken(entity: string, position: string, exceptId: number | string): boolean {
    if (!entity || !position) return false; // no grouping if either is missing
    return (this.gridData || []).some(r =>
      r?.Entity === entity &&
      r?.Position === position &&
      r?.IsDefault === true &&
      r?.Id !== exceptId
    );
  }
}
