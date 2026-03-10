import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  IgxDialogComponent,
  IgxExcelExporterOptions,
  IgxExcelExporterService,
  IgxGridComponent,
} from '@infragistics/igniteui-angular';

import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormatDateStringPipe } from 'src/app/shared/filter.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver/dist/FileSaver';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  NgModel,
  Validators,
  NgForm,
} from '@angular/forms';
import { DateService } from 'src/app/shared/services/dateService';
import { CounterpartydetailsService } from './counterpartydetails.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { HttpResponse } from '@angular/common/http';
import { ContactsModel } from '../models/contactsmodel';
import { IColumnPipeArgs } from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE, YEAR_MONTH_DAY_PIPE_WITH_TIME, RULE_NAMES } from 'src/app/shared/constants';
import { RulesMetadataService } from '../metadata/tabs/rules-metadata/rules-metadata.service';
@Component({
  selector: 'app-counterpartydetails',
  templateUrl: './counterpartydetails.component.html',
  styleUrls: ['./counterpartydetails.component.scss'],
})
export class CounterpartydetailsComponent implements OnInit {
  selectedCounterparty!: any;
  //selectedRows: any[] = [];
  New: any = {};
  @ViewChild('grid') grid!: IgxGridComponent;
  gridData!: any[];
  ratingData!: any[];
  focusData!: any[];
  ISDAData: any = {};
  MCAData: any = {};
  CSAData: any = {};
  signedDate!: Date;
  ContactDetails!: any[];
  DeliveryInstructions!: any[];
  NotificationTimes!: any[];
  EligibleAssets!: any[];
  RepoDetails!: any[];
  AuthorizedProducts!: any[];
  rawHaircut!: any[];
  formvalid: { [type: string]: boolean } = {};
  CurrentHaircut!: any[];
  formatDateStringPipe!: FormatDateStringPipe;
  RepoHaircut!: any[];
  RatingsEvent: any = {};
  selectedRow: any;
  MetaData: { [key: string]: any } = {};
  MetaDataTables: { [key: string]: any } = {};
  MetaDataNames: { [key: string]: any } = {};
  NewCP: any = {};
  NewISDA: any = {};
  NewCSA: any = {};
  NewMCA: any = {};
  documentFocus = 'All';
  notificationError = '';
  @ViewChild('addNewCounterPartyDialog')
  addNewCounterPartyDialog!: IgxDialogComponent;
  @ViewChild('addNewDocumentDialog') addNewDocumentDialog!: IgxDialogComponent;
  newCPForm!: FormGroup;
  newISDAForm!: FormGroup;
  newCSAForm!: FormGroup;
  newMCAForm!: FormGroup;
  dynamicFormGroups: { [key: string]: FormGroup } = {};
  @ViewChild('ISDAForm') ISDAForm!: NgForm;
  @ViewChild('CSAForm') CSAForm!: NgForm;
  @ViewChild('MCAForm') MCAForm!: NgForm;
  @ViewChild('contactsForm') contactsForm!: NgForm;
  @ViewChild('notificationForm') notificationForm!: NgForm;
  @ViewChild('eligibleAsetForm') eligibleAsetForm!: NgForm;
  @ViewChild('RatingsEventForm') RatingsEventForm!: NgForm;
  @ViewChild('deliveryInstructionsForm') deliveryInstructionsForm!: NgForm;
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
  currentData: any = {
    Entity: 'SBLIC',
    Counterparty: 'BAC',
  };
  editStarted = false;
  editingDialog = false;
  editingCurrentTab = false;
  editingEventType = false;
  currentCounterparty = null;
  currentState = 'Counterparty';
  currentRow: any = -1;
  mcaTab: any = -1;
  csaTab: string = 'Main';
  contentTab: string = 'ISDA';
  repoTab: string = 'RepoDetails';
  hasISDA: boolean = false; // You may set these values according to your requirements
  hasCSA: boolean = false;
  hasMCA: boolean = false;
  CurrentDocumentTab!: string;
  counts: { [key: string]: number } = {};
  currentProduct: any = {};
  CurrentMCA: any = {};
  productsCounted: { [key: string]: boolean } = {};
  deliveryInstructionsEnabled: any = {};
  deliveryFormEnabled: any = {};
  contactsEnabled = false;
  contactObj = {};
  public Keys: string[] = [];
  allRules: any[] = [];
  securityNameMapRules: any[] = [];
  error: string = '';
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private date_service: DateService,
    private percentPipe: PercentPipe,
    private datepipe: DatePipe,
    private cpService: CounterpartydetailsService,
    private formBuilder: FormBuilder,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    private rulesMetadataService: RulesMetadataService,
  ) { }

  ngOnInit(): void {
    this.setMetaDataTable([
      'Entity',
      'Counterparty',
      'Party',
      'Country',
      'Status',
      'AgreementType',
      'DocumentationLaw',
      'Currency',
      'DayCountConvention',
      'InterestBenchmark',
      'InterestCalculationMethod',
      'MasterAgreementType',
      'ApplicableType',
      'IndexChangeType',
      'DeterminingParty',
      'SettlementType',
      'RepoType',
      'CollateralType',
    ]);
    this.initForm();
    this.getCounterpartySummary(this.currentData.Counterparty);
    this.getAllRules();
  }

  initForm() {
    const dynamicFormGroupName = 'ISDAForm'; // You can change this dynamically
    this.newISDAForm = this.formBuilder.group({
      Counterparty: ['', Validators.required],
      Entity: ['', Validators.required],
      Status: ['', Validators.required],
      AgreementType: ['', Validators.required],
      SignedDate: ['', Validators.required],
      Currency: ['', Validators.required],
      DocumentationLaw: [''],
    });
    this.newCSAForm = this.formBuilder.group({
      Counterparty: ['', Validators.required],
      Entity: ['', Validators.required],
      Status: ['', Validators.required],
      SignedDate: ['', Validators.required],
      MatchToleranceDollar: [''],
      MatchTolerancePercent: [''],
      ResolutionTime: [''],
      DayCountConvention: [''],
      InterestBenchmark: [''],
      BPS: [''],
      Floor: [''],
      InterestCalculationMethod: [''],
      IndependentAmount: [''],
      ThresholdAmount: [''],
      RoundingAmount: [''],
      MinTransfer: [''],
      ResolutionThresholdDays: [''],
      ResolutionThresholdAmount: [''],
    });
    this.newMCAForm = this.formBuilder.group({
      Counterparty: ['', Validators.required],
      Entity: ['', Validators.required],
      AgreementType: [''],
      Status: ['', Validators.required],
      SignedDate: ['', Validators.required],
      SettlementCurrency: ['', Validators.required],
      SettlementType: [''],
      FuturesPriceValuation: [''],
      ExchangeTradedContract: [''],
      AveragingDateDisruption: [''],
      AutomaticExercise: [''],
      IndexCancellation: [''],
      IndexModification: [''],
      IndexDisruption: [''],
      DeterminingParty: [''],
      ChangeInLaw: [''],
      IndexSponsorDisruption: [''],
      HedgingDisruption: [''],
      IncreasedCostOfHedging: [''],
      LossOfStockBorrow: [''],
      IncreasedCostOfStockBorrow: [''],
      NonReliance: [''],
      Name: [''],
      Index: [''],
      NID: [''],
      IndexDisclaimer: [''],
      Score: [''],
    });
    this.newCPForm = this.formBuilder.group({
      Counterparty: ['', Validators.required],
      Description: [''],
      Guarantor: [''],
      Entity: [''],
      Party: [''],
      CountryCode: [''],
      Custodian: [''],
      Cleared: [false],
      Repo: [false],
      LEI: [''],
    });
  }

  createCounterparty() {
    this.editStarted = true;
    this.addNewCounterPartyDialog.open();
    this.editingDialog = true;
    this.currentState = 'Counterparty';
  }
  public wrapTextClass = {
    wrapText: true,
  };
  // onDateChange(updatedDate: Date,formName: string, controlName: string) {
  //   if (formName && !formName.includes('new')) {
  //     this.setCurrentEdit();
  //     this[formName].get(controlName).setValue(this.date_service.ConvertDatetoString(new Date(updatedDate)));

  //   }
  //   else
  //   {
  //     this[formName].controls[controlName].setValue(this.date_service.ConvertDatetoString(new Date(updatedDate)));
  //   }
  // }
  createDocument() {
    this.CurrentDocumentTab = !this.hasISDA
      ? 'ISDA'
      : !this.hasCSA
        ? 'CSA'
        : 'MCA';
    this.editStarted = true;
    this.documentFocus = 'All';
    this.addNewDocumentDialog.open();
    this.editingDialog = true;
    this.currentState = 'Document';
  }
  getDynamicFormGroup(formGroupName: string): FormGroup {
    return this.dynamicFormGroups[formGroupName];
  }
  saveNewDocument(docType: string) {
    this.errorHandler.clearErrorList();
    this.editingCurrentTab = false;
    this.editStarted = false;
    this.spinner.show();
    let newData;
    let formValid;
    const timeFormat = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    this.NewISDA.ResolutionTime = this.NewISDA.ResolutionTime != null ?
      (!timeFormat.test(this.NewISDA.ResolutionTime) ? this.NewISDA.ResolutionTime + ":00" : this.NewISDA.ResolutionTime) : null;
    //docForm!:FormGroup=docType+"Form";
    if (docType == 'ISDA') {
      newData = this.NewISDA;
      formValid = this.newISDAForm.valid;
    } else if (docType == 'CSA') {
      this.NewCSA.ResolutionTime = this.NewCSA.ResolutionTime != null ? (!timeFormat.test(this.NewCSA.ResolutionTime) ? this.NewCSA.ResolutionTime + ":00" : this.NewCSA.ResolutionTime) : null;
      newData = this.NewCSA;
      formValid = this.newCSAForm.valid;
    } else if (docType == 'MCA') {
      newData = this.NewMCA;
      formValid = this.newMCAForm.valid;
    }
    if (formValid) {
      this.cpService.saveNewDocument(docType, newData).subscribe(
        (data) => {
          this.spinner.hide();
          this.addNewDocumentDialog.close();
          //console.log('Changes successfully saved:', data);
          this.toasterService.toast(
            'New ' + docType + ' document has been added'
          );
          this.getDocument(
            'MCA',
            this.currentData.Counterparty,
            this.currentData.Entity
          );
          this.editingDialog = false;
          // Reset the form or do any other necessary actions
          this.newISDAForm.reset();
          this.newCSAForm.reset();
          this.newMCAForm.reset();
        },
        (error) => {
          this.spinner.hide();
          this.editingDialog = false;
          this.handleError(error);
        }
      );
    }
    //counterpartyDetailsService.saveNewDocument(docType, $scope["New" + documentType]);
    this.documentFocus = 'All';
  }
  openEntityDialog() {
    this.addNewCounterPartyDialog.open();
  }
  closeDocDialog(docType: string) {
    this.addNewDocumentDialog.close();
    if (docType == 'ISDA') {
      this.newISDAForm.reset();
      //this.NewISDA.SignedDate=null;
    } else if (docType == 'CSA') {
      this.newCSAForm.reset();

    } else if (docType == 'MCA') {
      this.newMCAForm.reset();
      //this.NewMCA.SignedDate=null;
    }
    else {
      this.newISDAForm.reset();
      this.newCSAForm.reset();
      this.newMCAForm.reset();
    }


  }
  closeCPDialog() {
    this.addNewCounterPartyDialog.close();
    this.newCPForm.reset();
  }
  exportToExcel(counterparty: string, entity: string) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let fileName =
      'CounterpartyDetails_' + counterparty + '_' + entity + '.xlsx';
    this.cpService.ExportToExcel(counterparty, entity).subscribe(
      (response) => {
        saveAs(response.body, fileName);
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        console.error('Export to Excel failed:', error);
        this.toasterService.toast('An error occurred while exporting excel');
        this.spinner.hide(); // Hide the spinner when an error occurs
      }
    );
  }
  onCellEdit(event: any): void {
    // Get the edited cell's information
    const rowData = event.rowData;

  }
  saveData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const c = confirm('Please confirm that you want to save');
    if (c) {
      const dataObj = JSON.stringify(this.focusData[0]);
      this.cpService.saveData(dataObj).subscribe(
        (data) => {
          this.spinner.hide();
          if (data.length === 0) {
            this.toasterService.toast('No Data found');
          } else {
            // Update focusData with the saved data
            this.focusData = [data];
            this.getCounterpartyDetails(data);
            this.toasterService.toast('Changes successfully saved');
          }
        },
        (error) => {
          this.spinner.hide();
          this.handleError(error);
        }
      );
    } else {
      this.spinner.hide();
    }
  }
  getCounterpartySummary(counterparty: any) {
    this.errorHandler.clearErrorList();
    if (this.editStarted || this.editingCurrentTab) {
      const confirmation = window.confirm(
        'Are you sure you want to discard your changes?'
      );
      if (!confirmation) {
        // Reset the form to the original values
        this.currentData.Counterparty = this.currentCounterparty;
        return;
      }
    }
    this.spinner.show();
    // Continue with other actions if confirmation is true
    this.editingCurrentTab = false;
    this.editStarted = false;

    // Call the service to get the counterparty summary
    //this.cpService.getCounterpartySummary(this.currentData.Counterparty);
    this.cpService
      .getCounterpartySummary(this.currentData.Counterparty)
      .subscribe(
        (result: any) => {
          if (result.length > 0) {
            this.gridData = result;
            this.selectedRow = result[0];
            this.clickRow(result[0]);
          } else {
            this.gridData = [];
            this.ratingData = [];
            this.focusData = [];
            this.AuthorizedProducts = [];
            this.setContent(this.contentTab);
          }
          this.spinner.hide(); // Hide the spinner in both success and error cases
        },
        (error: any) => {
          this.spinner.hide(); // Hide the spinner when an error occurs
          this.handleError(error);
        }
      );
  }
  setMetaDataTable(names: string[]): void {
    this.spinner.show();
    if (!this.MetaDataTables) {
      this.MetaDataTables = {};
    }
    if (!this.MetaDataNames) {
      this.MetaDataNames = {};
    }
    if (!names) {
      names = this.metaDataTables;
    }
    this.cpService.setMetaDataTableList(names).subscribe(
      (result: any) => {
        if (result) {
          this.MetaData = result;
          for (const key in result) {
            if (!this.MetaDataNames[key]) {
              this.MetaDataNames[key] = [];
            }
            for (const item of result[key]) {
              if (!this.MetaDataNames[key].some((x: any) => x.Name == item.Name)) {
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
          // Sort the Counterparty array alphabetically by the 'Name' property
          if (this.MetaDataNames['Counterparty']) {
            this.MetaDataNames['Counterparty'].sort((a: any, b: any) =>
              a.Name.localeCompare(b.Name)
            );
          }
        } else {
          this.MetaData = {};
        }
        this.spinner.hide();
      },
      (error) => {
        console.error('Error setting meta data table:', error);
        this.errorHandler.handleErrorWithMessage(error, 'Failed to set meta data table');
        this.spinner.hide();
      }
    );
  }
  private selectedrowCondition = (row: any): boolean => {
    return this.selectedRow && this.selectedRow.Entity === row.data.Entity && this.selectedRow.Counterparty === row.data.Counterparty && this.selectedRow.Party === row.data.Party;
  };

  public rowClasses = {
    selectedrowclass: this.selectedrowCondition,

  };
  onRowClick(eventArgs: any) {
    this.clickRow(eventArgs.newSelection[0]);
    this.grid.rowList.forEach((row) => {
      if (row !== eventArgs.newSelection[0]) {
        row.nativeElement.classList.remove('selectedrowclass');
      }
    });
    this.selectedRow = eventArgs.newSelection[0];
  }
  clickRow(row: any) {
    if (this.editStarted || this.editingCurrentTab) {
      const confirmation = window.confirm(
        'Are you sure you want to discard your changes?'
      );
      if (!confirmation) {
        return;
      }
    }
    this.errorHandler.clearErrorList();
    this.editingCurrentTab = false;
    this.editStarted = false;
    this.currentRow = row;

    this.CurrentDocumentTab = this.hasISDA
      ? 'ISDA'
      : this.hasCSA
        ? 'CSA'
        : 'MCA';

    this.currentData = {
      Entity: row.Entity,
      Counterparty: row.Counterparty,
    };
    this.currentCounterparty = row.Counterparty;

    // Get all data when row is clicked
    this.getCounterpartyRating(row);
    this.getCounterpartyDetails(row);
    this.getAuthorizedProducts(row);

    this.setContent(this.contentTab);
  }
  getCounterpartyRating(row: any) {
    this.cpService.getCounterpartyRating(row.Counterparty).subscribe(
      (result: any) => {
        if (result.length === 0) {
          this.ratingData = [];
        } else if (result.length > 1) {
          this.ratingData = [result[0]];
        } else {
          this.ratingData = result;
        }
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  getCounterpartyDetails(row: any) {
    this.spinner.show();
    this.cpService
      .getCounterpartyDetails(row.Counterparty, row.Entity)
      .subscribe(
        (result: any) => {
          if (result.length === 0) {
            this.focusData = [];
            //this.currentCounterparty=null
          } else if (result.length > 1) {
            for (let i = 0; i < result.length; i++) {
              if (result[i].Party === row.Party) {

                this.focusData = [result[i]];
                this.currentCounterparty = result[i].Counterparty;
                break;
              }
            }
          } else {
            this.focusData = result;
            this.currentCounterparty = result[0].Counterparty;
          }
          this.spinner.hide(); // Hide the spinner in both success and error cases
        },
        (error: any) => {
          this.spinner.hide(); // Hide the spinner when an error occurs
          this.handleError(error);
        }
      );
  }
  getAuthorizedProducts(row: any) {
    this.spinner.show();

    this.counts = {};
    this.cpService
      .getAuthorizedProducts(row.Counterparty, row.Entity)
      .subscribe(
        (result: any) => {
          this.AuthorizedProducts = result || [];
          this.currentProduct =
            this.AuthorizedProducts.length > 0
              ? this.AuthorizedProducts[0]
              : {};

          for (let i = 0; i < this.AuthorizedProducts.length; i++) {
            const product = this.AuthorizedProducts[i].Product;
            if (!this.counts[product]) {
              this.counts[product] = 0;
              // Values are ordered, so we can assume the first product in data is also the first in the table
              this.productsCounted[
                `${product}, ${this.AuthorizedProducts[i].Name}`
              ] = true;
            }
            this.counts[product]++;
          }

          this.spinner.hide(); // Hide the spinner in both success and error cases
        },
        (error: any) => {
          this.spinner.hide(); // Hide the spinner when an error occurs
          this.handleError(error);
        }
      );
  }
  getDocument(docType: string, counterparty: string, entity: string) {
    const docFunction = 'Get' + docType;
    this.cpService.getDocument(docFunction, counterparty, entity).subscribe(
      (data: any) => {
        if (docType === 'ISDA') {
          this.ISDAData = !data ? {} : data;
          //this.signedDate = new Date(this.ISDAData.SignedDate);
          this.ISDAData.SignedDate = this.date_service.ConvertDatetoString(new Date(this.ISDAData.SignedDate))
          //this.ISDAForm.controls['SignedDate'].setValue(this.date_service.ConvertDatetoString(new Date(this.ISDAData.SignedDate)));
          this.hasISDA = !!data;
        } else if (docType === 'MCA') {
          this.MCAData = !data ? [] : data;
          if (data && data.length > 0) {
            //this.MCAForm.form.controls["SignedDate"].setValue(new Date(this.CurrentMCA.SignedDate));
            this.hasMCA = true;
          } else {
            this.hasMCA = false;
            this.CurrentMCA = { Id: -1 };
            this.setMCATab({ Id: -1 });
          }
          // Set other properties and methods related to MCAData as needed
        } else if (docType === 'CSA') {
          this.CSAData = !data ? {} : data;
          if (data) {
            this.CSAData.MinTransfer = this.CSAData.MinTransfer != null ? (this.CSAData.MinTransfer != 0 ? this.CSAData.MinTransfer.toLocaleString() : '') : '';
            this.CSAData.RoundingAmount = this.CSAData.RoundingAmount != null ? (this.CSAData.RoundingAmount != 0 ? this.CSAData.RoundingAmount.toLocaleString() : '') : '';
            this.CSAData.MatchTolerancePercent = this.CSAData.MatchTolerancePercent != null ? (this.CSAData.MatchTolerancePercent > 0 ? (this.CSAData.MatchTolerancePercent * 100).toFixed(2) + '%' : '') : '';
            if (this.CSAData.SignedDate != null)
              this.CSAData.SignedDate = this.date_service.ConvertDatetoString(new Date(this.CSAData.SignedDate));
            //this.CSAForm.controls['SignedDate'].setValue(this.date_service.ConvertDatetoString(new Date(this.CSAData.SignedDate)));

          }
          else {
            this.CSAData.MinTransfer = '';
            this.CSAData.RoundingAmount = '';
            this.CSAData.MatchTolerancePercent = '';

          }
          //  this.CSAForm.reset();
          this.editingCurrentTab = false;
          this.hasCSA = !!data;
        }
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  getHaircut(counterparty: string, entity: string, haircutType: string) {
    this.rawHaircut = [];
    this.cpService.getHaircut(counterparty, entity, haircutType).subscribe(
      (data: any) => {
        if (!data) {
          this.rawHaircut = [];
          this.CurrentHaircut = [];
          this.RepoHaircut = [];
        } else {
          this.rawHaircut = data;
          this.rawHaircut = this.rawHaircut.map((item: any) => {
            item.C1 = item.C1 > 0 ? (item.C1 * 100).toFixed(2) + '%' : 'NA';
            item.C2 = item.C2 > 0 ? (item.C2 * 100).toFixed(2) + '%' : 'NA';
            item.C5 = item.C5 > 0 ? (item.C5 * 100).toFixed(2) + '%' : 'NA';
            item.C10 = item.C10 > 0 ? (item.C10 * 100).toFixed(2) + '%' : 'NA';
            item.C15 = item.C15 > 0 ? (item.C15 * 100).toFixed(2) + '%' : 'NA';
            item.C20 = item.C20 > 0 ? (item.C20 * 100).toFixed(2) + '%' : 'NA';
            item.C30 = item.C30 > 0 ? (item.C30 * 100).toFixed(2) + '%' : 'NA';
            item.C31 = item.C31 > 0 ? (item.C31 * 100).toFixed(2) + '%' : 'NA';
            return item;
          });


        }
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  replacePercent(item: any) {
    return {
      ...item,
      C1: item.C1.replace('%', ''),
      C2: item.C2.replace('%', ''),
      C5: item.C5.replace('%', ''),
      C10: item.C10.replace('%', ''),
      C15: item.C15.replace('%', ''),
      C20: item.C20.replace('%', ''),
      C30: item.C30.replace('%', ''),
      C31: item.C31.replace('%', ''),
      // Add properties for other values as needed
    };
  }
  getRatingsEvent(counterparty: string, entity: string) {
    this.cpService.getRatingsEvent(counterparty, entity).subscribe(
      (data: any) => {
        this.RatingsEvent = !data
          ? { Counterparty: { Name: counterparty, SnP: null, Moodys: null, Fitch: null, AMBest: null }, Entity: { Name: entity, SnP: null, Moodys: null, Fitch: null, AMBest: null } }
          : data;

        // Check if Counterparty is null and set it if needed
        if (!this.RatingsEvent.Counterparty) {
          this.RatingsEvent.Counterparty = { Name: counterparty, SnP: null, Moodys: null, Fitch: null, AMBest: null };
        }
        // Check if Entity is null and set it if needed
        if (!this.RatingsEvent.Entity) {
          this.RatingsEvent.Entity = { Name: entity, SnP: null, Moodys: null, Fitch: null, AMBest: null };
        }
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  getCounterpartyContacts(counterparty: string) {
    this.spinner.show();
    this.setDefaultContact(counterparty);
    this.cpService.getCounterpartyContacts(counterparty).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this.ContactDetails = data;
          for (var key in data[0]) {
            if (!this.Keys.includes(key)) {
              this.Keys.push(key);
            }
          }
        }
        this.contactObj = {
          contacts: this.ContactDetails,
          counterparty: counterparty,
          keys: this.Keys
        }
        this.spinner.hide();
      },
      (error: any) => {
        this.spinner.hide();
        this.handleError(error);
      }
    );
  }
  setDefaultContact(counterparty: string) {
    const defaultContact = new ContactsModel();
    this.ContactDetails = [];
    this.Keys = Object.keys(defaultContact);
    this.contactObj = {
      contacts: this.ContactDetails,
      counterparty: counterparty,
      keys: this.Keys
    };
  }



  getDeliveryInstructions(counterparty: string, entity: string) {
    this.cpService.getDeliveryInstructions(counterparty, entity).subscribe(
      (data: any) => {
        this.DeliveryInstructions = !data ? [] : data;
        //this.DeliveryInstructions = Array.isArray(this.DeliveryInstructions) ? this.DeliveryInstructions : [this.DeliveryInstructions];
        /* const order = ['Trade', 'Collateral', 'Triparty'];

        const sortedData: any = order.reduce((acc, key) => {
            acc[key] = this.DeliveryInstructions[key];
            return acc;
        }, {});
        this.DeliveryInstructions = sortedData; */
        for (const key in this.DeliveryInstructions) {
          if (this.DeliveryInstructions[key] == null) {
            this.DeliveryInstructions[key] = {
              DeliveryInstructionsType: key,
            };
          }
        }
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  getNotificationTimes(counterparty: string, entity: string) {
    this.notificationError = '';
    this.cpService.getNotificationTimes(counterparty, entity).subscribe(
      (data: any) => {
        this.NotificationTimes = !data ? [] : data;
        this.NotificationTimes = this.NotificationTimes.map((item: any) => {
          item.DaysFromToday = item.DaysFromToday != 0 ? (item.DaysFromToday > 0 ? 'T+' + item.DaysFromToday : item.DaysFromToday) : 'T';
          return item;
        });
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  getEligibleAssets(counterparty: string, entity: string) {
    this.cpService.getEligibleAssets(counterparty, entity).subscribe(
      (data: any) => {
        this.EligibleAssets = !data ? [] : data;
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  getRepoDetails(counterparty: string, entity: string) {
    this.cpService.getRepoDetails(counterparty, entity).subscribe(
      (data: any) => {
        this.RepoDetails = !data ? [] : data;
        this.spinner.hide(); // Hide the spinner in both success and error cases
      },
      (error: any) => {
        this.spinner.hide(); // Hide the spinner when an error occurs
        this.handleError(error);
      }
    );
  }
  setDocumentTab(tabName: string) {
    if (!this.confirmTabChange()) {
      return;
    }
    this.CurrentDocumentTab = tabName;
  }
  setCSATab(tabName: string) {
    if (!this.confirmTabChange()) {
      return;
    }
    this.csaTab = tabName || 'Main';
    this.RatingsEvent.Entity = { Name: this.currentData.Entity, SnP: null, Moodys: null, Fitch: null, AMBest: null };
    this.RatingsEvent.Counterparty = { Name: this.currentData.Counterparty, SnP: null, Moodys: null, Fitch: null, AMBest: null };
    if (this.csaTab === 'Main') {
      this.getDocument(
        'CSA',
        this.currentData.Counterparty,
        this.currentData.Entity
      );
    } else if (this.csaTab === 'Haircut') {
      this.getHaircut(
        this.currentData.Counterparty,
        this.currentData.Entity,
        'CSA'
      );
    } else if (this.csaTab === 'RatingsEvent') {
      this.getRatingsEvent(
        this.currentData.Counterparty,
        this.currentData.Entity
      );
    }
  }
  setRepoTab(tabName: string) {
    if (!this.confirmTabChange()) {
      return;
    }
    this.repoTab = tabName;

    if (this.repoTab === 'RepoDetails') {
      this.getRepoDetails(
        this.currentData.Counterparty,
        this.currentData.Entity
      );
    } else if (this.repoTab === 'Haircut') {
      this.getHaircut(
        this.currentData.Counterparty,
        this.currentData.Entity,
        'Repo'
      );
    }
  }
  setMCATab(mca: any): void {
    if (!this.confirmTabChange()) {
      return;
    }
    // Use ID as tab identifier
    this.mcaTab = mca.Id;
    this.CurrentMCA = mca;
    this.CurrentMCA.SignedDate = this.date_service.ConvertDatetoString(new Date(this.CurrentMCA.SignedDate));
  }
  onTabChange(tabName: string): void {
    this.contentTab = tabName;
    this.setContent(tabName);
    // this.getData();
  }

  setContent(tabName: string) {
    if (!this.confirmTabChange()) {
      return;
    }

    this.contentTab = tabName;

    switch (tabName) {
      case 'ISDA':
        this.getDocument(
          'ISDA',
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        break;
      case 'CSA':
        this.setCSATab(this.csaTab); // Define setCSATab method
        break;
      case 'MCA':
        this.getDocument(
          'MCA',
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        break;
      case 'Contacts':
        this.getCounterpartyContacts(this.currentData.Counterparty);
        break;
      case 'DeliveryInfo':
        this.getDeliveryInstructions(
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        break;
      case 'RepoDetails':
        this.setRepoTab(this.repoTab); // Define setRepoTab method
        break;
      case 'NotificationTimes':
        this.getNotificationTimes(
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        break;
      case 'EligibleAssets':
        this.getEligibleAssets(
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        break;
      default:
        return;
    }
  }
  setCurrentProduct(product: any) {
    this.currentProduct = product;
  }
  filterMCA(): any[] {
    // Customize the filtering logic here
    return this.AuthorizedProducts.filter((item) => {
      // Example: Filter by a condition (e.g., item.Product includes the criteria)
      if (!item || !item.Underlyings) {
        return false;
      }

      // Check if any underlyings have an MCA
      return item.Underlyings.some((Uitem: any) => {
        return Uitem.MCA === true;
      });
    });
  }
  filterMCAProd(product: any) {
    if (!product || !product.Underlyings) {
      return false;
    }

    // Check if any underlyings have an MCA
    return product.Underlyings.some((Uitem: any) => {
      return Uitem.MCA === true;
    });
  }
  confirmTabChange(): boolean {
    if (this.editingCurrentTab) {
      const confirmation = window.confirm(
        'Are you sure you want to switch tabs? Any changes made will be lost'
      );
      if (confirmation) {
        this.editingCurrentTab = false;
      }
      return confirmation;
    } else {
      return true;
    }
  }

  setCurrentEdit(): void {
    this.editingCurrentTab = true;
  }

  saveHaircut(haircutType: string) {
    this.errorHandler.clearErrorList();

    // Validate that new rows have collateral types selected
    const collateralTypeValidation = this.validateHaircutCollateralTypes(this.rawHaircut);
    if (!collateralTypeValidation.isValid) {
      this.toasterService.toast(collateralTypeValidation.errorMessage!);
      return;
    }

    // Validate for duplicate collateral types
    const duplicateValidation = this.validateHaircutDuplicates(this.rawHaircut);
    if (!duplicateValidation.isValid) {
      this.toasterService.toast(duplicateValidation.errorMessage!);
      return;
    }

    this.spinner.show();
    /* let rawHaircutData:any = this.rawHaircut.map(item => {
      if (typeof item === 'string') {
        return item.replace('%', '');
      }
      return item; // If not a string, leave it unchanged
    }); */
    let rawHaircutData = this.rawHaircut.map((item: any) => {
      item.C1 = item.C1 != 'NA' ? item.C1.replace('%', '') / 100 : 0;
      item.C2 = item.C2 != 'NA' ? item.C2.replace('%', '') / 100 : 0;
      item.C5 = item.C5 != 'NA' ? item.C5.replace('%', '') / 100 : 0;
      item.C10 = item.C10 != 'NA' ? item.C10.replace('%', '') / 100 : 0;
      item.C15 = item.C15 != 'NA' ? item.C15.replace('%', '') / 100 : 0;
      item.C20 = item.C20 != 'NA' ? item.C20.replace('%', '') / 100 : 0;
      item.C30 = item.C30 != 'NA' ? item.C30.replace('%', '') / 100 : 0;
      item.C31 = item.C31 != 'NA' ? item.C31.replace('%', '') / 100 : 0;
      return item;
    });
    this.cpService.saveHaircut(rawHaircutData, haircutType).subscribe(
      () => {
        this.toasterService.toast('Changes successfully saved');
        this.editingCurrentTab = false;
        this.getHaircut(
          this.currentData.Counterparty,
          this.currentData.Entity,
          haircutType
        );
        this.spinner.hide();
      },
      (error: any) => {
        // Handle the error here
        this.handleError(error);
        this.getHaircut(
          this.currentData.Counterparty,
          this.currentData.Entity,
          haircutType
        );
        this.spinner.hide();
      }
    );
    //$("#dialog2").igDialog("close");
    this.editingCurrentTab = false;
  }
  saveRatingsEvent() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.cpService.saveRatingsEvent(this.RatingsEvent).subscribe(
      () => {
        this.toasterService.toast('Changes successfully saved');
        this.editingCurrentTab = false;
        this.getRatingsEvent(
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        this.spinner.hide();
      },
      (error: any) => {
        // Handle the error here
        this.handleError(error);
        this.spinner.hide();
      }
    );
    this.editingCurrentTab = false;
  }
  saveDocument(docType: string) {
    this.errorHandler.clearErrorList();
    const timeFormat = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    this.spinner.show();
    let data: any;
    if (docType == 'ISDA') {
      data = this.ISDAData;
    } else if (docType == 'CSA') {
      this.CSAData.MinTransfer = this.CSAData.MinTransfer != null ? parseFloat(this.CSAData.MinTransfer.replace(/,/g, '')) : null;
      this.CSAData.RoundingAmount = this.CSAData.RoundingAmount != null ? parseFloat(this.CSAData.RoundingAmount.replace(/,/g, '')) : null;
      this.CSAData.MatchTolerancePercent = this.CSAData.MatchTolerancePercent != null ? (this.CSAData.MatchTolerancePercent != '' ? this.CSAData.MatchTolerancePercent.replace('%', '') / 100 : 0) : null;
      this.CSAData.ResolutionTime = this.CSAData.ResolutionTime != null ? (!timeFormat.test(this.CSAData.ResolutionTime) ? this.CSAData.ResolutionTime + ":00" : this.CSAData.ResolutionTime) : null;

      data = this.CSAData;
    } else if (docType == 'MCA') {
      data = [this.CurrentMCA];
    }
    this.cpService.saveDocument(data, docType).subscribe(
      () => {
        this.toasterService.toast('Changes successfully saved');
        this.editingDialog = false;
        this.editingCurrentTab = false;
        this.getDocument(
          docType,
          this.currentData.Counterparty,
          this.currentData.Entity
        );
        this.spinner.hide();
      },
      (error: any) => {
        // Handle the error here
        this.handleError(error);
        this.spinner.hide();
        this.editingDialog = false;
      }
    );
    //$("#dialog2").igDialog("close");
    this.editStarted = false;
    this.editingCurrentTab = false;
  }
  saveNewCounterparty() {
    this.errorHandler.clearErrorList();
    this.editingCurrentTab = false;
    this.editStarted = false;
    this.spinner.show();
    if (this.newCPForm.valid) {
      let newCPData = this.newCPForm.value;
      newCPData.Cleared = newCPData.Cleared === null ? false : newCPData.Cleared;
      newCPData.Repo = newCPData.Repo === null ? false : newCPData.Repo;
      this.cpService.addNewCounterparty(newCPData).subscribe(
        (data) => {
          this.spinner.hide();
          this.editingDialog = false;
          this.toasterService.toast('New Counterparty has been added');
          // Reset the form or do any other necessary actions
          this.closeCPDialog();
          this.newCPForm.reset();
        },
        (error) => {
          this.handleError(error);
          this.editingDialog = false;
          this.spinner.hide();
        }
      );
    }
  }
  openDocument(docType: string) {
    this.editStarted = true;
    this.documentFocus = docType;
    this.addNewDocumentDialog.open();
    this.editingDialog = true;
    this.setDocumentTab(docType);
    this.currentState = 'Document';
  }
  saveRepoDetails(counterparty: string, entity: string) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.cpService
      .saveRepoDetails(counterparty, entity, this.RepoDetails)
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.addNewDocumentDialog.close();
          //console.log('Changes successfully saved:', data);
          this.toasterService.toast('Changes successfully saved');
          // Reset the form or do any other necessary actions
          this.editingCurrentTab = false;
        },
        (error) => {
          this.spinner.hide();
          this.toasterService.toast('Error saving repo details.');
        }
      );
    this.editStarted = false;
    this.editingCurrentTab = false;
  }
  addRepoDetails() {
    const repoType =
      this.MetaDataTables['RepoType'].length > 0
        ? this.MetaDataTables['RepoType'][0]
        : null;

    this.RepoDetails.push({
      RepoType: repoType.Name,
      ThresholdAmount: null,
      IndependentAmount: null,
      MinTransferAmount: null,
      RoundingAmount: null,
      SignedDate: null,
    });
  }
  saveDeliveryInstructions(
    counterparty: string,
    entity: string,
    instructions: any
  ) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.cpService
      .saveDeliveryInstructions(counterparty, entity, instructions)
      .subscribe(
        (data) => {
          this.spinner.hide();
          //console.log('Changes successfully saved:', data);
          this.toasterService.toast('Changes successfully saved');
          // Reset the form or do any other necessary actions
          this.editingCurrentTab = false;
        },
        (error) => {
          this.spinner.hide();
          this.toasterService.toast('Error saving delivery instructions');
        }
      );
    this.editStarted = false;
    this.editingCurrentTab = false;
    this.deliveryInstructionsEnabled[instructions.DeliveryInstructionsType] =
      false;
    this.formvalid[instructions.DeliveryInstructionsType] = false;
  }
  /* enableDeliveryForm(value:any){
    this.setCurrentEdit();
    this.deliveryFormEnabled[value.DeliveryInstructionsType]=
  } */
  enableDeliveryInstructions(key: any) {
    if (this.deliveryInstructionsEnabled[key] === false) {
      this.deliveryInstructionsEnabled[key] = true;
      this.formvalid[key] = true;
    } else {
      this.deliveryInstructionsEnabled[key] = false;
      this.formvalid[key] = false;
    }
  }
  enableContacts() {
    if (this.contactsEnabled) this.contactsEnabled = false;
    else this.contactsEnabled = true;
  }
  addContact() {
    this.ContactDetails.push({
      Position: null,
      Name: null,
      PhoneNumber: null,
      Email: null,
      Comment: null,
    });
  }
  saveContacts() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.cpService
      .saveContacts(this.currentData.Counterparty, this.ContactDetails)
      .subscribe(
        (data) => {
          this.spinner.hide();
          //console.log('Changes successfully saved:', data);
          this.toasterService.toast('Changes successfully saved');
          // Reset the form or do any other necessary actions
          if (!data) {
            this.ContactDetails = [];
          } else {
            this.ContactDetails = data as any[];
          }
          this.editingCurrentTab = false;
        },
        (error) => {
          this.spinner.hide();
          this.toasterService.toast('Error saving contacts');
        }
      );
    this.editStarted = false;
    this.editingCurrentTab = false;
    this.contactsEnabled = false;
  }
  deleteItem(type: string, array: any[], item: any) {
    this.notificationError = '';
    // Call your service to delete the item (replace this with your actual service call)
    // Example: this.counterpartyDetailsService.deleteItem($scope.currentData.Counterparty, $scope.currentData.Entity, item);

    this.spinner.show();
    switch (type) {
      case 'Contacts':
        this.cpService
          .deleteContacts(
            this.currentData.Counterparty,
            this.currentData.Entity,
            item
          )
          .subscribe(
            (data) => {
              this.spinner.hide();
              const ind = array.indexOf(item);

              if (ind !== -1) {
                array.splice(ind, 1);
              }
              //console.log('Changes successfully saved:', data);
              this.toasterService.toast('Item successfully deleted');
            },
            (error) => {
              this.spinner.hide();
              this.toasterService.toast('Error deleting Item');
            }
          );
        break;
      case 'NotificationTimes':
        item.DaysFromToday =
          typeof item.DaysFromToday === 'string' && item.DaysFromToday !== 'T'
            ? item.DaysFromToday.includes('T+')
              ? parseInt(item.DaysFromToday.replace('T+', ''))
              : item.DaysFromToday
            : 0;
        this.cpService
          .deleteNotificationTimes(
            this.currentData.Counterparty,
            this.currentData.Entity,
            item
          )
          .subscribe(
            (data) => {
              this.spinner.hide();
              const ind = array.indexOf(item);

              if (ind !== -1) {
                array.splice(ind, 1);
              }
              //console.log('Changes successfully saved:', data);
              this.toasterService.toast('Item successfully deleted');
            },
            (error) => {
              this.spinner.hide();
              this.toasterService.toast('Error deleting Item');
            }
          );
        break;
      case 'EligibleAssets':
        this.cpService
          .deleteEligibleAssets(
            this.currentData.Counterparty,
            this.currentData.Entity,
            JSON.stringify(item)
          )
          .subscribe(
            (data) => {
              this.spinner.hide();
              const ind = array.indexOf(item);

              if (ind !== -1) {
                array.splice(ind, 1);
              }
              //console.log('Changes successfully saved:', data);
              this.toasterService.toast('Item successfully deleted');
            },
            (error) => {
              this.spinner.hide();
              this.toasterService.toast('Error deleting Item');
            }
          );
        break;
      default:
        console.error('Invalid type');
        break;
    }
  }

  setnotificationTimeEdit(timeZone: string, i: number) {
    this.setNotificationTime(timeZone, i);
    this.setCurrentEdit();
  }
  setNotificationTime(timeZone: string, i: number) {
    const d = new Date(1970, 1, 1);
    if (timeZone === 'Eastern') {
      const time = this.NotificationTimes[i];

      const splitted = time.EasternTime.split(':');

      d.setHours(Number(splitted[0]));
      d.setMinutes(Number(splitted[1]));
      d.setHours(d.getHours() - 1);
      const centralHours = ('0' + d.getHours().toString()).slice(-2);
      const centralMinutes = ('0' + d.getMinutes().toString()).slice(-2);
      this.NotificationTimes[
        i
      ].CentralTime = `${centralHours}:${centralMinutes}`;
    } else if (timeZone === 'Central') {
      const time = this.NotificationTimes[i];

      const splitted = time.CentralTime.split(':');

      d.setHours(Number(splitted[0]));
      d.setMinutes(Number(splitted[1]));
      d.setHours(d.getHours() + 1);
      const easternHours = ('0' + d.getHours().toString()).slice(-2);
      const easternMinutes = ('0' + d.getMinutes().toString()).slice(-2);
      this.NotificationTimes[
        i
      ].EasternTime = `${easternHours}:${easternMinutes}`;
    }
  }
  addNotificationTimes() {
    this.notificationError = '';
    this.editingEventType = true;
    this.NotificationTimes.push({
      EventType: null,
      Counterparty: this.currentData.Counterparty,
      Entity: this.currentData.Entity,
      CentralTime: null,
      EasternTime: null,
      DaysFromToday: null,
    });
  }
  saveNotificationTimes() {
    this.errorHandler.clearErrorList();
    this.notificationError = '';
    const timeFormat = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

    let NotificationTimesData = this.NotificationTimes.map((item: any) => {
      item.CentralTime =
        item.CentralTime != null
          ? !timeFormat.test(item.CentralTime)
            ? item.CentralTime + ':00'
            : item.CentralTime
          : item.CentralTime;
      item.EasternTime =
        item.EasternTime != null
          ? !timeFormat.test(item.EasternTime)
            ? item.EasternTime + ':00'
            : item.EasternTime
          : item.EasternTime;

      item.DaysFromToday = item.DaysFromToday == '' ? 0 : item.DaysFromToday;

      item.DaysFromToday =
        typeof item.DaysFromToday === 'string' && item.DaysFromToday !== 'T'
          ? item.DaysFromToday.includes('T+')
            ? parseInt(item.DaysFromToday.replace('T+', ''))
            : item.DaysFromToday
          : 0;
      //item.DaysFromToday!= 'T'? (item.DaysFromToday.includes('T+') ? parseInt(item.DaysFromToday.replace('T+', '')) : item.DaysFromToday) : 0;
      return item;
    });

    for (var i = 0; i < NotificationTimesData.length; i++) {
      // Directive sets invalid values to false

      if (!Number.isInteger(NotificationTimesData[i].DaysFromToday)) {
        this.notificationError =
          'Invalid notification time for event type: ' +
          NotificationTimesData[i].EventType;
        //this.getNotificationTimes(this.currentData.Counterparty, this.currentData.Entity);
        this.NotificationTimes = this.NotificationTimes.map((item: any) => {
          if (NotificationTimesData[i].EventType != item.EventType) {
            item.DaysFromToday =
              item.DaysFromToday != 0
                ? item.DaysFromToday > 0
                  ? 'T+' + item.DaysFromToday
                  : item.DaysFromToday
                : 'T';
          }
          return item;
        });
        return;
      }
    }
    this.spinner.show();
    this.editingEventType = false;
    this.editStarted = false;
    this.editingCurrentTab = false;
    this.cpService.saveNotificationTimes(NotificationTimesData).subscribe(
      (data) => {
        this.spinner.hide();
        //console.log('Changes successfully saved:', data);
        this.toasterService.toast('Changes successfully saved');
        // Reset the form or do any other necessary actions
        this.editingCurrentTab = false;
        this.getNotificationTimes(
          this.currentData.Counterparty,
          this.currentData.Entity
        );
      },
      (error) => {
        this.handleError(error);
        this.spinner.hide();
        this.notificationError = '';
      }
    );
  }
  addEligibleAssets() {
    this.EligibleAssets.push({
      Counterparty: this.currentData.Counterparty,
      Entity: this.currentData.Entity,
      CollateralType: null,
      CUSIP: null,
      ParValue: null,
    });
  }

  saveEligibleAssets() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.editingEventType = false;
    this.cpService
      .saveEligibleCollateral(
        this.currentData.Counterparty,
        this.currentData.Entity,
        this.EligibleAssets
      )
      .subscribe(
        (data) => {
          this.spinner.hide();
          if (data) {
            this.EligibleAssets = data as any[];
          }
          //console.log('Changes successfully saved:', data);
          this.toasterService.toast('Changes successfully saved');
          // Reset the form or do any other necessary actions

          this.editingCurrentTab = false;
        },
        (error) => {
          this.spinner.hide();
          this.handleError(error);
        }
      );
    this.editStarted = false;
    this.editingCurrentTab = false;
  }
  setProduct(product: any, type: string) {
    if (type === 'Underlying') {
      // Set current Instrument Type if not yet true
      if (!this.currentProduct.Authorized) {
        this.currentProduct.Authorized = product.Authorized;
      }
      if (product.MCA === true) {
        // Set current MCA to false if product is unchecked
        product.MCA = product.Authorized;
      }
    } else if (type === 'MCA' && product.MCA === true) {
      // Only change if MCA is checked
      // Set Underlying and Instrument if MCA is set to true
      if (!this.currentProduct.Authorized) {
        this.currentProduct.Authorized = true;
      }
      if (!product.Authorized) {
        product.Authorized = true;
      }
    }
  }
  checkAll(checkDirection: boolean) {
    if (typeof checkDirection !== 'boolean') return;

    // Set authorization of current Instrument type
    this.currentProduct.Authorized = checkDirection;
    // Set MCA of current Instrument Type
    this.currentProduct.MCA = checkDirection ? true : this.currentProduct.MCA;

    if (this.currentProduct.Underlyings) {
      for (let i = 0; i < this.currentProduct.Underlyings.length; i++) {
        this.currentProduct.Underlyings[i].Authorized = checkDirection;
        // Change MCA if unchecking
        if (!checkDirection) {
          this.currentProduct.MCA = false;
        }
      }
    }
  }
  saveAuthorizedProducts() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.editingEventType = false;
    this.cpService
      .saveAuthorizedProducts(
        this.currentData.Counterparty,
        this.currentData.Entity,
        this.AuthorizedProducts
      )
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.toasterService.toast('Changes successfully saved');
          // Reset the form or do any other necessary actions

          this.editingCurrentTab = false;
        },
        (error) => {
          this.spinner.hide();
          this.handleError(error);
        }
      );
    this.editStarted = false;
    this.editingCurrentTab = false;
  }
  formValidity(type: string) {
    this.setCurrentEdit();
    console.log(
      this.deliveryInstructionsForm.controls[type + 'CashWireRepet'].valid
    );

    this.formvalid[type] = this.deliveryInstructionsEnabled[type];
    if (this.formvalid[type]) {
      this.formvalid[type] =
        this.deliveryInstructionsForm.controls[type + 'CashWireRepet'].valid &&
        this.deliveryInstructionsForm.controls[type + 'DTCNumber'].valid &&
        this.deliveryInstructionsForm.controls[type + 'CashWireABA'].valid &&
        this.deliveryInstructionsForm.controls[type + 'DTCAgentBank'].valid &&
        this.deliveryInstructionsForm.controls[type + 'CashWireBankName']
          .valid &&
        this.deliveryInstructionsForm.controls[type + 'CashWireAccountName']
          .valid &&
        this.deliveryInstructionsForm.controls[type + 'CashWireAccountNumber']
          .valid &&
        this.deliveryInstructionsForm.controls[type + 'CashWireFFC'].valid &&
        this.deliveryInstructionsForm.controls[type + 'CashWireRef'].valid;
    }
    console.log(this.formvalid[type]);
  }
  handleRefreshContacts() {
    this.errorHandler.clearErrorList();
    this.getCounterpartyContacts(this.currentData.Counterparty);
  }
  private handleError(error: any) {
    this.errorHandler.handleHttpError(error);

  }

  /**
   * Validates that all new rows have a collateral type selected.
   * @param haircutData - Array of haircut records to validate
   * @returns Object with validation result and error message if validation fails
   */
  private validateHaircutCollateralTypes(haircutData: any[]): { isValid: boolean; errorMessage?: string } {
    const newRowsWithoutType = haircutData.filter(
      item => item.Id === 0 && (!item.CollateralType || item.CollateralType.trim() === '')
    );

    if (newRowsWithoutType.length > 0) {
      return {
        isValid: false,
        errorMessage: 'Please select a collateral type for all new rows before saving.'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates that there are no duplicate collateral types in the haircut data.
   * @param haircutData - Array of haircut records to validate
   * @returns Object with validation result and error message if duplicates found
   */
  private validateHaircutDuplicates(haircutData: any[]): { isValid: boolean; errorMessage?: string } {
    const collateralTypes = haircutData
      .filter(item => item.CollateralType && item.CollateralType.trim() !== '')
      .map(item => item.CollateralType.trim().toUpperCase());

    const duplicates = collateralTypes.filter((type, index) =>
      collateralTypes.indexOf(type) !== index
    );

    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)];
      return {
        isValid: false,
        errorMessage: `Duplicate collateral type(s) found: ${uniqueDuplicates.join(', ')}. Each collateral type must be unique.`
      };
    }

    return { isValid: true };
  }

  /**
   * Adds a new empty row to the haircut table for CSA.
   * Creates a new haircut object with default values and adds it to the rawHaircut array.
   * Used when user clicks "Add Row" button in the CSA Haircut tab.
   */
  addHaircutRow(): void {
    try {
      // Ensure array is initialized
      if (!this.rawHaircut) {
        this.rawHaircut = [];
      }

      // Create a new haircut row with default/empty values
      const newHaircutRow = {
        Id: 0, // New row, will get ID from server on save
        Counterparty: this.currentData.Counterparty,
        Entity: this.currentData.Entity,
        CollateralType: '', // Empty, user will select
        C1: 'NA',
        C2: 'NA',
        C5: 'NA',
        C10: 'NA',
        C15: 'NA',
        C20: 'NA',
        C30: 'NA',
        C31: 'NA'
      };

      // Add the new row to the haircut array
      this.rawHaircut.push(newHaircutRow);

      // Mark as edited
      this.setCurrentEdit();

      // Show success message
      this.toasterService.toast('New haircut row added. Please select collateral type and enter values.');
    } catch (error) {
      this.toasterService.toast('Failed to add new haircut row. Please try again.');
    }
  }

  /**
   * Fetches all rules from RulesMetadataService once and caches them.
   * This cached data can be filtered by different rule names as needed,
   * avoiding multiple API calls for different rule types.
   */
  private getAllRules(): void {
    this.rulesMetadataService.getRules().subscribe({
      next: (rules: any[]) => {
        // Store all rules in cache
        this.allRules = rules || [];
        
        // Filter for specific rule names needed
        this.securityNameMapRules = this.filterRulesByName(RULE_NAMES.SecurityNameMap);
        
        // You can add more filtered arrays here if needed
        // Example: this.otherRules = this.filterRulesByName('OtherRuleName');
      },
      error: (error) => {
        this.errorHandler.handleErrorWithMessage(error, 'Failed to load rules');
        // Initialize as empty arrays on error
        this.allRules = [];
        this.securityNameMapRules = [];
      }
    });
  }

  /**
   * Filters the cached rules array by RuleName.
   * This method allows reusing the cached rules data without making additional API calls.
   * 
   * @param ruleName - The name of the rule to filter by
   * @returns Array of rules matching the specified RuleName
   */
  private filterRulesByName(ruleName: string): any[] {
    if (!this.allRules || this.allRules.length === 0) {
      console.warn(`Attempting to filter rules, but allRules is empty. RuleName: ${ruleName}`);
      return [];
    }
    
    return this.allRules.filter(rule => rule.RuleName === ruleName);
  }

  /**
   * Deletes a haircut row from the table at the specified index.
   * Shows confirmation dialog before deletion.
   * Deletes all maturity cuts for the given Counterparty, Entity, and CollateralType from the database.
   * 
   * @param index - The index of the haircut row to delete in the rawHaircut array
   */
  deleteHaircutRow(index: number): void {
    this.errorHandler.clearErrorList();

    // Validate index
    if (index < 0 || index >= this.rawHaircut.length) {
      this.toasterService.toast('Invalid row selection.');
      return;
    }

    const haircutRow = this.rawHaircut[index];

    // Confirm deletion
    const confirmDelete = confirm(
      `Are you sure you want to delete the haircut row for "${haircutRow.CollateralType || 'this collateral type'}"?`
    );

    if (!confirmDelete) {
      return;
    }

    // Check if this is a new unsaved row
    // New rows have Id = 0 (set in addHaircutRow) and may have empty CollateralType
    const isNewRow = haircutRow.Id === 0;

    if (!isNewRow) {
      // Row exists in database and needs to be deleted from server
      this.spinner.show();

      // Only send Counterparty, Entity, and CollateralType - backend will delete all maturity cuts
      const haircutForDeletion = {
        Counterparty: haircutRow.Counterparty,
        Entity: haircutRow.Entity,
        CollateralType: haircutRow.CollateralType
      };

      // Call service to delete from database - API expects array
      this.cpService.deleteHaircut([haircutForDeletion]).subscribe({
        next: () => {
          // Remove from array after successful deletion from database
          this.rawHaircut.splice(index, 1);
          this.toasterService.toast('Haircut row deleted successfully.');
          this.spinner.hide();
        },
        error: (error) => {
          this.handleError(error);
          this.spinner.hide();
        }
      });
    } else {
      // Row doesn't exist in database yet (newly added), just remove from array
      this.rawHaircut.splice(index, 1);
      this.toasterService.toast('Haircut row removed.');
    }
  }
}
