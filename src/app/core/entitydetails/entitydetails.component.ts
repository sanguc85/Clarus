import { Component, OnInit, ViewChild } from '@angular/core';
import { EntitydetailsService } from './entitydetails.service';
import { IgxDialogComponent, IgxGridComponent } from 'igniteui-angular';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ContactsModel } from '../models/contactsmodel';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-entitydetails',
  templateUrl: './entitydetails.component.html',
  styleUrls: ['./entitydetails.component.scss'],
})
export class EntitydetailsComponent implements OnInit {
  MetaData: { [key: string]: any } = {};
  MetaDataTables: { [key: string]: any } = {};
  MetaDataNames: { [key: string]: any } = {};
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
    'RepoCollateralType',
    'SettlementType',
    'Status',
    'TransactionType',
    'ReportType',
  ];
  metaDataMiscMap: { [key: string]: any } = {
    Outlook: ['SnPOutlook', 'FitchOutlook', 'MoodysOutlook'],
    Counterparty: ['CounterpartyName', 'Description'],
    IndexChangeType: [
      'IndexCancellation',
      'IndexDisruption',
      'IndexModification',
    ],
  };
  // Define an array of entities with their corresponding counterparties
  entitiesWithCounterparties: { entity: string; counterparty: string }[] = [
    { entity: 'SBLIC', counterparty: 'BAC' },
    { entity: 'PIASA', counterparty: 'NT' },
    { entity: 'SGTV', counterparty: 'UBS' },
  ];
  // Initialize currentData with default values
  currentData: any = {
    Entity: 'SBLIC',
    Counterparty: 'BAC',
  };
  EntityAccount!: string;
  Entity: string = 'SBLIC';
  currentEntity: string = '';
  currentCounterparty: string = '';
  currentRow = null;
  NewEntity: any = {};
  tabData: any[] = [];
  fxAccounts: any[] = [];
  gridData: any[] = [];
  selectedRow: any;
  focusData: any[] = [];
  ratingData: any[] = [];
  Contacts: any[] = [
    { Name: null, Position: null, Email: null, PhoneNumber: null },
  ];
  DeliveryInstructions: any = {};
  newDeliveryInstructions: any = {};
  contentTab = 'deliveryInstructions';
  contactsEnabled: boolean = false;
  deliveryInstructionsEnabled: boolean = false;
  editStarted: boolean = false;
  editingCurrentTab: boolean = false;
  @ViewChild('grid') grid!: IgxGridComponent;
  @ViewChild('ratingGrid') ratingGrid!: IgxGridComponent;
  @ViewChild('contactsForm') contactsForm!: NgForm;
  columnNames: any[] | undefined;
  metaDataOptionDict: any = {
    Entity: 'Entity',
    Counterparty: 'Counterparty',
    Custodian: 'Entity',
  };
  editedData: any[] = [];
  dataSources: any = {
    Entity: null,
    Counterparty: null,
    Custodian: null,
    AccountType: null,
  };
  @ViewChild('addNewEntityDialog')
  addNewEntityDialog!: IgxDialogComponent;
  newEntityForm!: FormGroup;
  contactObj={

  };
  public Keys: string[] = [];
  public newRow: string[];
  error: string = '';
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private entityDetailsService: EntitydetailsService,
    private formBuilder: FormBuilder,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
  ) {}

  ngOnInit(): void {
    this.setMetaDataTable(['Entity', 'Counterparty', 'EntityAccountType']);
    this.onEntitySelected();
    this.initForm();
  }

  initForm() {
    this.newEntityForm = this.formBuilder.group({
      Entity: ['', Validators.required],
      Description: [''],
      Account: [''],
      AccountType: [''],
      Custodian: [''],
      LEI: [''],
    });
  }

  openEntityDialog() {
    this.addNewEntityDialog.open();
  }

  closeEntityDialog() {
    this.addNewEntityDialog.close();
    this.newEntityForm.reset();
  }

  saveNewEntity() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (this.newEntityForm.valid) {
      const newEntityData = this.newEntityForm.value;

      this.entityDetailsService.addNewEntity(newEntityData).subscribe(
        (data) => {
          this.spinner.hide();
          console.log('Changes successfully saved:', data);
          this.toasterService.toast('New Entity has been added');

          // Update MetaDataTables['Entity'] with the new entity
          this.MetaDataTables['Entity'].push({ Name: newEntityData.Entity });

          // Reset the form
          this.newEntityForm.reset();
          this.addNewEntityDialog.close();
        },
        (error:any) => {
          this.spinner.hide();
          this.errorHandler.handleErrorWithMessage(error, 'Error adding new Entity');
          this.addNewEntityDialog.close();
        }
      );
    }
  }

  onEntitySelected(): void {
    const selectedEntityDet = this.currentData.Entity;
    this.getEntitySummary(selectedEntityDet);
  }

  setMetaDataTable(names: string[]): void {
    if (!names) {
      names = this.metaDataTables;
    }
    this.entityDetailsService
      .setMetaDataTableList(names)
      .subscribe((result: any) => {
        if (result) {
          this.MetaData = result;
          for (const key in result) {
            if (!this.MetaDataNames[key]) {
              this.MetaDataNames[key] = [];
            }
            for (const item of result[key]) {
              if (
                !this.MetaDataNames[key].some((x: any) => x.Name === item.Name)
              ) {
                this.MetaDataNames[key].push({ Name: item.Name });
              }
            }
          }
          for (const name of names) {
            if (this.metaDataTables.includes(name) && this.MetaData[name]) {
              this.MetaDataTables[name] = this.MetaData[name];
              this.MetaDataNames[name] = this.MetaDataNames[name];
            } else {
              for (const key in this.metaDataMiscMap) {
                if (
                  this.metaDataMiscMap[key].includes(name) &&
                  this.MetaData[key]
                ) {
                  this.MetaDataTables[name] = this.MetaData[key];
                  this.MetaDataNames[name] = this.MetaDataNames[key];
                }
              }
            }
          }
        } else {
          this.MetaData = {};
        }
      });
  }

  getEntitySummary(entity: string): void {
    this.errorHandler.clearErrorList();
    if (this.editStarted || this.editingCurrentTab) {
      const confirmDiscardChanges = confirm(
        'Are you sure you want to discard your changes?'
      );
      if (!confirmDiscardChanges) {
        this.currentData.Entity = this.currentEntity;
        return;
      }
    }
    this.editingCurrentTab = false;
    this.editStarted = false;
    this.currentEntity = entity;
    this.spinner.show();
    this.entityDetailsService.getEntitySummary(entity).subscribe(
      (data) => {
        this.spinner.hide();
        if (data.length === 0) {
          this.gridData = [];
          this.focusData = [];
          this.ratingData = [];
          this.DeliveryInstructions=[];
          this.Contacts=[];
          this.currentCounterparty = '';
          this.currentData.Counterparty = '';
        } else {
          this.gridData = data;
          this.selectedRow = data[0];
          this.clickRow(data[0]);
        }
        
      },
      (error:any) => {
        // Handle error
        this.spinner.hide();
        console.error(error);
        this.gridData = [];
        this.focusData = [];
        this.ratingData = [];
        this.DeliveryInstructions=[];
        this.Contacts=[];
        this.currentCounterparty = '';
        this.currentData.Counterparty = '';
        this.errorHandler.handleErrorWithMessage(error, 'Error getting Entity Summary');
      }
    );
  }

  getEntityDetails(entity: string, counterparty: string): void {
    this.spinner.show();
    this.entityDetailsService.getEntityDetails(entity, counterparty).subscribe(
      (data) => {
        if (!data) {
          this.focusData = [];
          this.currentCounterparty = '';
          this.currentEntity = '';
        } else {
          this.focusData = [data];
          this.currentCounterparty = data.Counterparty;
          this.currentEntity = data.Entity;
        }
        this.spinner.hide();
      },
      (error:any) => {
        this.spinner.hide();
        this.errorHandler.handleErrorWithMessage(error, 'Error getting Entity Details');
      }
    );
  }

  handleCellEdit(event: any) {
    const editedRowId = event.rowData.Id;
    const editedColumn = event.column.field;
    const newValue = event.newValue;

    // Find the corresponding row in the focus data
    const focusRowIndex = this.focusData.findIndex(
      (row) => row.Id === editedRowId
    );
    // Update the value of the edited cell in the focusData array
    if (focusRowIndex !== -1) {
      // Clone the original row object to avoid mutating the original data
      const updatedRow = { ...this.focusData[focusRowIndex] };
      updatedRow[editedColumn] = newValue;

      // Update the focusData array with the updated row
      this.focusData[focusRowIndex] = updatedRow;
    }
  }

  // Save edited data
  saveData(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const c = confirm('Please confirm that you want to save');
    if (c) {
      const dataObj = JSON.stringify(this.focusData[0]);
      this.entityDetailsService.saveData(dataObj).subscribe(
        (data) => {
          this.spinner.hide();
          if (data.length === 0) {
            this.toasterService.toast('No Data found');
          } else {
            // Update focusData with the saved data
            this.focusData = [data];
            this.toasterService.toast('Changes successfully saved');
          }
        },
        (error:any) => {
          this.spinner.hide();
          this.errorHandler.handleErrorWithMessage(error, 'Error saving Entity data');
          this.addNewEntityDialog.close();
        }
      );
    } else {
      this.spinner.hide();
    }
  }

  //grid
  private selectedrowCondition = (row: any): boolean => {
    return this.selectedRow && this.selectedRow.Entity === row.data.Entity && this.selectedRow.Counterparty === row.data.Counterparty;
  };
 
  public rowClasses = {    
    selectedrowclass: this.selectedrowCondition,
  };
  onCellClick(eventArgs: any) {
    this.clickRow(eventArgs.newSelection[0]);
    // Remove the selected row class from other rows
    this.grid.rowList.forEach((row) => {
      if (row !== eventArgs.newSelection[0]) {
      row.nativeElement.classList.remove('selectedrowclass');
      }
    });
   
    this.selectedRow = eventArgs.newSelection[0];
  }
  clickRow(row: any) {
    if (this.editStarted || this.editingCurrentTab) {
      const confirmDiscard = confirm(
        'Are you sure you want to discard your changes?'
      );
      if (!confirmDiscard) {
        return;
      }
    }

    this.editStarted = false;
    this.editingCurrentTab = false;
    this.currentRow = row;
    this.currentCounterparty= row.Counterparty;
    this.currentEntity = row.Entity;
    this.currentData.Counterparty = row.Counterparty;
    // Call your service methods here to fetch data as needed
    this.getEntityRating(this.currentEntity);
    this.getEntityDetails(
      this.currentEntity,
      this.currentCounterparty
    );
    this.getEntityContacts(this.currentEntity);
    this.getDeliveryInstructions(this.currentEntity);
  }

  getEntityRating(entity: any): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.entityDetailsService.getRatingsTable(entity).subscribe(
      (data) => {
        if (data.length === 0) {
          this.ratingData = [];
        } else {
          this.ratingData = data;
        }
        this.spinner.hide();
      },
      (error:any) => {
        this.spinner.hide();
        this.errorHandler.handleErrorWithMessage(error, 'Error getting Ratings');
      }
    );
  }

  onTabChange(tabName: string): void {
    this.contentTab = tabName;
  }

  setCurrentEdit(): void {
    this.editingCurrentTab = !this.editingCurrentTab;
  }

  saveDeliveryInstructions(instructions: any): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.entityDetailsService
      .saveDeliveryInstructions(instructions, this.currentEntity)
      .subscribe(
        () => {
          this.spinner.hide(); // Hide the spinner on success
          this.editingCurrentTab = false;
          this.deliveryInstructionsEnabled = false;
        },
        (error:any) => {
          this.spinner.hide(); // Hide the spinner on error
          this.errorHandler.handleErrorWithMessage(error, 'Error saving Delivery Instructions');
        }
      );
  }

  getDeliveryInstructions(entity: any): void {
    this.spinner.show();
    this.entityDetailsService.getDeliveryInstructions(entity).subscribe(
      (data: any) => {
        if (!data) {
          this.DeliveryInstructions = {};
        } else {
          this.DeliveryInstructions = data;
          this.DeliveryInstructions.CashWireABA = '';
        }
        this.spinner.hide();
      },
      (error: any) => {
        this.spinner.hide();
        this.errorHandler.handleErrorWithMessage(error, 'Error getting Delivery Instructions');
      }
    );
  }

  getEntityContacts(entity: string): void {
    this.spinner.show();
    this.setDefaultContact(entity);
    this.entityDetailsService.getEntityContacts(entity).subscribe(
      (data) => {
        if (data.length > 0) {
          this.Contacts = data;
          for(var key in data[0]){
            if (!this.Keys.includes(key)) {
              this.Keys.push(key);
            }
          }
        } 
        this.contactObj={
          contacts: this.Contacts,
          entity: entity,
          keys: this.Keys
        }
          this.spinner.hide();
      },
      (error:any) => {
        this.spinner.hide();
        this.errorHandler.handleErrorWithMessage(error, 'Error getting Entity Contacts');
      }
    );
  }

  getEmailError(index: number) {
    const emailControl = this.contactsForm.controls[`Email_${index}`];
    return emailControl?.hasError('email') && emailControl?.dirty;
  }
  handleRefreshContacts() {
    this.errorHandler.clearErrorList();
    this.getEntityContacts(this.currentEntity);
  }

  setDefaultContact(entity: string) {
     const defaultContact = new ContactsModel();
     this.Contacts = [];
     this.Keys = Object.keys(defaultContact);
     this.contactObj = {
      contacts: this.Contacts,
      entity: entity,
      keys: this.Keys
    };
  }
}
