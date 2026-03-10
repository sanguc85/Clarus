import { DatePipe, DecimalPipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FilterPipe, SpaceSeparatedPipe, formatNumberTo2dp } from 'src/app/shared/filter.pipe';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {
  IgxDialogComponent,
  IgxExcelExporterOptions,
  IgxExcelExporterService,
  IgxGridComponent,
  IgxDatePickerComponent,
  IgxNumberSummaryOperand,
  IgxSummaryResult,
  SplitterType,
} from '@infragistics/igniteui-angular';
import { DateService } from 'src/app/shared/services/dateService';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { GridExportUtilsService } from 'src/app/shared/services/grid-export-utils.service';
import { DailymarginService } from './dailymargin.service';
import { SubstitutionService } from '../substitution/substitution.service';
import { DefaultSortingStrategy, SortingDirection } from 'igniteui-angular';
import { collateralDetails } from './collateraldetails';
import { counterpartyMargin } from './counterpartymargin';
import { dailyMargin } from 'src/app/core/dailymargin/dailymargin';
import { tradeDetails } from './tradedetails';
import { cpTradeDetails } from './cptradedetails';
import { securityDetails } from 'src/app/core/dailymargin/securitydetails';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { IColumnPipeArgs } from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE, YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';

export class valueNumericSummary extends IgxNumberSummaryOperand {
  override operate(data: any[] = []): IgxSummaryResult[] {
    const total = data.reduce((acc, val) => acc + parseFloat(val || 0), 0); // Ensure null safety
    const roundedTotal = Math.round(total * 100) / 100; // Round to 2 decimal places
    const formattedTotal = roundedTotal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }); // Format total with commas and 2 decimal places
    return [{ key: 'total', label: 'Total', summaryResult: formattedTotal }];
  }
}
export class parValueNumericSummary extends IgxNumberSummaryOperand {
  override operate(data: any[] = []): IgxSummaryResult[] {
    const total = data.reduce((acc, val) => acc + parseFloat(val || 0), 0); // Ensure null safety
    const roundedTotal = Math.round(total * 100) / 100; // Round to 2 decimal places
    const formattedTotal = roundedTotal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }); // Format total with commas and 2 decimal places
    return [{ key: 'total', label: '', summaryResult: formattedTotal }];
  }
}
@Component({
  selector: 'app-dailymargin',
  templateUrl: './dailymargin.component.html',
  styleUrls: ['./dailymargin.component.scss'],
})
export class DailymarginComponent implements OnInit, OnDestroy {
  public typeHorizontal = SplitterType.Horizontal;
  Path: string = 'Clarus > Daily Margin';
  myForm!: FormGroup;
  dataDate: any;
  counterParty: any;
  direction!: Boolean;
  entity: any;
  collateralDetails!: collateralDetails;
  counterpartyMargin!: counterpartyMargin;
  dailyMargin!: dailyMargin;
  securityList: any[] = [];
  securitiesHeld: any[] = [];
  cusipList: any[] = [];
  tradeDetails!: tradeDetails;
  cpTradeDetails!: cpTradeDetails;
  securityDetails!: securityDetails;
  collateralBalances: any;
  cpDailyMargin: any;
  dailyMarginDet: any;
  currentComment: any[] = [];
  bestScenarioMargin: number = -1;
  currentMargin: number = 1;
  currentMarginFilter: number = 0;
  error: string = '';
  @ViewChild('tradeDetailsDialog') tradeDetailsDialog!: IgxDialogComponent;
  @ViewChild('cpTradeDetailsGrid') cpTradeDetailsGrid!: IgxGridComponent;
  @ViewChild('collateralDetailsDialog')
  collateralDetailsDialog!: IgxDialogComponent;
  @ViewChild('collateralSubstitutionDialog')
  collateralSubstitutionDialog!: IgxDialogComponent;
  @ViewChild('commentDialog') commentDialog!: IgxDialogComponent;
  @ViewChild('refreshDialog') refreshDialog!: IgxDialogComponent;
  @ViewChild('tradeDetailsGrid') tradeDetailsGrid!: IgxGridComponent;
  @ViewChild('grid') grid!: IgxGridComponent;
  @ViewChild('gridUnSettled') gridUnSettled!: IgxGridComponent;
  @ViewChild('cpgrid') cpgrid!: IgxGridComponent;
  @ViewChild('defaultDate') defaultDate!: IgxDatePickerComponent;
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;
  selectedDate!: Date;
  dtDate!: string;
  todayDate: Date = this.date_service.GetTodayDate();
  UseCp = {
    Collateral: false,
    Exposure: false,
  };
  bestScenario = {
    Collateral: false,
    Exposure: false,
  };
  loaders = {
    main: false,
    counterparty: false,
    last: false,
    reports: false,
  };
  public localData: any;
  public options = {
    digitsInfo: '1.0-0',
    currencyCode: '',
  };
  public percentOptions = {
    digitsInfo: '1.2-3',
  };
  public formatPercentOptions = this.percentOptions;
  public formatOptions = this.options;
  public group = [
    {
      dir: SortingDirection.Asc,
      fieldName: 'Party',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance(),
    },
  ];
  public statusTypes = [
    'Dispute',
    'Agree',
    'Partial Agree',
    'Complete Fully Post',
    'Complete Partial Post',
    'Complete Fully Call',
    'Complete Partial Call',
    'Complete No Call',
  ];

  public sort = [];
  mainGridData: any[] = [];
  lastGridData: any[] = [];
  counterpartyMarginData: any[] = [];
  collateralDetailsGridData: collateralDetails[] = [];
  tradeDetailsColumns: string[] = [
    'ObservationDate',
    'InternalId',
    'Tradetype',
    'InstrumentType',
    'Counterparty',
    'TradeDate',
    'ExpirationDate',
    'BaseNotional',
    'Units',
    'InternalModel',
    'CrossNotional',
    'BaseCurrency',
    'CrossCurrency',
    'Price_BaseLeg',
    'Price_CrossLeg',
  ];
  cpTradeDetailsColumns: string[] = [
    'DataDate',
    'TradeId',
    'Counterparty',
    'TradeDate',
    'MaturityDate',
    'Notional',
    'MarketValue',
  ];
  collateralDetailsColumns: string[] = [
    'DataDate',
    'Counterparty',
    'Entity',
    'Value',
    'ParValue',
    'CUSIP',
  ];
  collteralBalanceColumns: string[] = ['CUSIP', 'ParValue', 'Value'];
  tradeDetailsGridData: tradeDetails[] = [];
  cpTradeDetailsGridData: cpTradeDetails[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  decimalPipe: DecimalPipe = new DecimalPipe('en-US');
  filterPipe!: FilterPipe;
  spaceSeparatedPipe!: SpaceSeparatedPipe;
  formatNumberTo2dp!: formatNumberTo2dp;
  CurrentSecurity: any = {};
  CurrentSecuritiesHeld: any[] = [];
  currentSecurityList: any[] = [];
  currentCounterparties: any[] = [];
  hasCash!: Boolean;
  adding!: Boolean;
  dataComplete: Boolean = false;
  isComplete: Boolean = false;
  mvCalculated: boolean = false;
  contentTab: string = 'Incomplete';
  gridTab: string = 'daily';
  searchTerm: string = '';
  showSecurityDropdown: boolean = false;
  filteredSecurityList: any[] = [];
  private documentClickListener?: (event: Event) => void;
  public valueNumericSummary = valueNumericSummary;
  public parValueNumericSummary = parValueNumericSummary;
  todayDateString: string = new DateService().GetSpecficDateString(this.todayDate);
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private dailyMarginSvc: DailymarginService,
    private date_service: DateService,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    private gridExportUtils: GridExportUtilsService,
    private substitutionService: SubstitutionService
  ) {
    this.myForm = new FormGroup({
      ParValue: new FormControl('', Validators.required),
    });
    this.setupDynamicValidators();
  }

  setupDynamicValidators() {
    const parValueControl = this.myForm.get('ParValue');
    if (parValueControl) {
      parValueControl.setValidators([
        Validators.required,
        this.minPieceSizeValidator.bind(this),
        this.signMismatchValidator.bind(this)
      ]);
    }
  }

  updateValidatorsForSecurity() {
    const parValueControl = this.myForm.get('ParValue');
    if (parValueControl && this.CurrentSecurity) {
      const validators = [
        Validators.required,
        this.minPieceSizeValidator.bind(this),
        this.signMismatchValidator.bind(this)
      ];
      
      // Add minIncrementValidator with current security's MinIncrement
      if (this.CurrentSecurity.MinIncrement) {
        validators.push(this.minIncrementValidator(this.CurrentSecurity.MinIncrement));
      }
      
      parValueControl.setValidators(validators);
      parValueControl.updateValueAndValidity();
    }
  }

  // Custom validators
  minPieceSizeValidator(control: any) {
    if (!control.value || !this.CurrentSecurity) {
      return null;
    }
    
    const parValue = this.parseNumber(control.value);
    if (parValue === null || parValue === undefined) {
      return null;
    }
    
    if (this.CurrentSecurity.Cusip === 'Cash' || this.CurrentSecurity.Cusip === 'NA') {
      return null;
    }
    
    const minPieceSize = this.CurrentSecurity.MinPieceSize;
    if (minPieceSize && Math.abs(parValue) < Math.abs(minPieceSize)) {
      return { minPieceSize: { requiredValue: minPieceSize, actualValue: parValue } };
    }
    
    return null;
  }

  minIncrementValidator(minIncrement: number) {
    return (control: any) => {
      if (!control.value || !minIncrement) {
        return null; // Don't validate if no value or no min increment
      }
      const value = this.parseNumber(control.value);
      if (value === null || value === undefined) {
        return null;
      }
      
      // Use division approach to avoid floating-point modulo issues
      const quotient = Math.abs(value) / Math.abs(minIncrement);
      const roundedQuotient = Math.round(quotient);
      
      // Use a small tolerance for floating-point precision
      const tolerance = 0.0001;
      const isMultiple = Math.abs(quotient - roundedQuotient) < tolerance;
      
      return isMultiple ? null : { minIncrement: { actualValue: value, requiredIncrement: minIncrement } };
    };
  }

  signMismatchValidator(control: any) {
    if (!control.value || !this.CurrentSecurity) {
      return null;
    }
    
    const parValue = this.parseNumber(control.value);
    if (parValue === null || parValue === undefined) {
      return null;
    }
    
    if (this.CurrentSecurity.Cusip === 'Cash') {
      return null; // Cash securities don't need sign validation
    }
    
    // For non-Cash securities, check if ParValue sign matches the original ParValue
    const originalParValue = this.CurrentSecurity.OriginalParValue || this.CurrentSecurity.ParValue;
    if (originalParValue !== null && originalParValue !== undefined) {
      const originalSign = Math.sign(originalParValue);
      const currentSign = Math.sign(parValue);
      
      if (originalSign !== 0 && currentSign !== 0 && originalSign !== currentSign) {
        return { signMismatch: { expectedSign: originalSign > 0 ? 'positive' : 'negative', actualSign: currentSign > 0 ? 'positive' : 'negative' } };
      }
    }
    
    return null;
  }

  ngOnInit(): void {
    this.selectedDate = new Date();
    let sessionDate = this.getSelectedDate();
    this.selectedDate = sessionDate ? sessionDate : new Date();
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    this.filteredSecurityList = this.availableSecurityList || [];
    this.addDocumentClickListener();
    this.getData();
  }

  ngOnDestroy(): void {
    this.removeDocumentClickListener();
  }

  ngAfterViewInit() { }
  private zeroBorderCondition = (rowData: any, columnKey: any): boolean => {
    return rowData[columnKey] == 0;
  };
  public zeroBorderClasses = {
    zeroBorder: this.zeroBorderCondition,
  };

  public totalMarginClasses = {
    totalMargin: true,
  };

  public actionClasses = {
    action: true,
  };

  openCpSelectDialog() {
    this.currentCounterparties = [];
    const tempData = this.mainGridData;
    for (let i = 0; i < tempData.length; i++) {
      this.currentCounterparties.push({
        Entity: tempData[i].Entity,
        Counterparty: tempData[i].Counterparty,
        Refresh: false,
      });
    }

    this.refreshDialog.open();
  }

  closeCpSelectDialog() {
    this.refreshDialog.close();
  }

  selectAllRefresh() {
    const direction = this.currentCounterparties.every(
      (x) => x.Refresh === true
    );

    this.currentCounterparties.forEach((counterparty) => {
      counterparty.Refresh = !direction;
    });
  }

  refreshData() {
    this.errorHandler.clearErrorList();
    const c = confirm(
      'Are you sure you wish to refresh? All progress will be lost'
    );
    if (
      !c ||
      !this.currentCounterparties ||
      this.currentCounterparties.length === 0
    ) {
      return;
    }
    this.spinner.show();
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    const dataDate = new DateService().GetSpecficDateString(
      this.mainGridData[0].DataDate
    );

    const res = this.dailyMarginSvc
      .clearAndRefreshDailyMargin(dataDate, this.currentCounterparties)
      .subscribe(
        (result: any) => {
          if (result.length > 0) {
            const dateFields = ['DataDate', 'AsOfDate', 'CollateralMovementDate', 'SettlementStatusDate'];
            this.mainGridData = this.gridExportUtils.formatDateFields(result, dateFields);
            this.calculateCPExposureDiff();
          }
          this.getCounterpartyDailyMargin(this.dtDate).subscribe(
            (data) => {
              this.calculateCPExposureDiff();
              this.spinner.hide();
              this.cpgrid.endEdit(true);
            },
            (error: any) => {
              console.error('Error in getCounterpartyDailyMargin called from refreshData:', error);
              this.spinner.hide();
            }
          );
          this.currentCounterparties = [];
          this.spinner.hide();
          this.toasterService.toast('Collateral Data is Refreshed.');
        },
        (error: any) => {
          this.mainGridData = [];
          this.handleError(error);
        },
      );
    this.refreshDialog.close();
  }

  isEmptyOrComplete(): boolean {
    if (!this.mainGridData || this.mainGridData.length === 0) {
      return true;
    }
    return this.mainGridData.every((item) => item.Complete);
  }
  getDailyMarginDataSub(formattedDate: any) {
    this.getDailyMarginData(formattedDate).subscribe(
      (data) => {
        this.calculateCPExposureDiff();
        this.spinner.hide();
        this.grid.endEdit(true);
      },
      (error: any) => {
        console.error('Error in getDailyMarginData', error);
        this.spinner.hide();
      }
    );
  }
  getDailyMarginData(formattedDate: any) {
    return this.dailyMarginSvc.getDailyMarginData(formattedDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          const dateFields = ['DataDate', 'AsOfDate', 'CollateralMovementDate', 'SettlementStatusDate'];
          this.mainGridData = this.gridExportUtils.formatDateFields(result, dateFields);
          this.dataComplete = this.mainGridData.every((item) => item.Complete === true);
          if (this.dataComplete) this.myForm.get('ParValue')?.disable();
          else this.myForm.get('ParValue')?.enable();
          this.currentComment = result[0];
        } else {
          this.mainGridData = [];
        }
      }),
      catchError((error: any) => {
        this.mainGridData = [];
        this.handleError(error);
        return of([]); // Return an empty observable to continue the forkJoin
      })
    );
  }



  onStatusSelection(event: any) {
    const newValue = event.newSelection.value;
  }

  getLastDailyMarginData(formattedDate: any) {
    return this.dailyMarginSvc.getLastDailyMargin(formattedDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          const dateFields = ['DataDate', 'AsOfDate', 'CollateralMovementDate', 'SettlementStatusDate'];
          this.lastGridData = this.gridExportUtils.formatDateFields(result, dateFields);
          this.isComplete = this.lastGridData.every((x) => x.Complete);
        } else {
          this.lastGridData = [];
        }
      }),
      catchError((error: any) => {
        this.lastGridData = [];
        this.handleError(error);
        return of([]);
      })
    );
  }

  getCounterpartyDailyMargin(formattedDate: any) {
    return this.dailyMarginSvc.getCounterpartyDailyMargin(formattedDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          const dateFields = ['DataDate', 'AsOfDate'];
          this.counterpartyMarginData = this.gridExportUtils.formatDateFields(result, dateFields);
        } else {
          this.counterpartyMarginData = [];
        }
      }),
      catchError((error: any) => {
        this.counterpartyMarginData = [];
        this.handleError(error);
        return of([]);
      })
    );
  }

  getData(fromButtonClick: boolean = false) {
    this.errorHandler.clearErrorList();
    if (fromButtonClick && this.grid) {
      this.grid.endEdit(true);
    }
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    this.spinner.show();
    forkJoin({
      dailyMargin: this.getDailyMarginData(this.dtDate),
      counterpartyMargin: this.getCounterpartyDailyMargin(this.dtDate),
      allSecurities: this.getAllSecurities(this.dtDate),
      allsecuritiesHeld: this.getSecurities(this.dtDate),
      lastDailyMargin: this.getLastDailyMarginData(this.dtDate),
      collateralBalances: this.getCollateralBalances(this.dtDate)
    }).subscribe({
      next: (results: any) => {
        this.calculateCPExposureDiff();
        // Initialize filtered security list after data is loaded
        this.filteredSecurityList = this.availableSecurityList || [];
        this.spinner.hide();
      },
      error: (error: any) => {
        this.handleError(error);
      }
    });
  }

  calculateCPExposureDiff() {
    this.mainGridData.forEach((mainItem) => {
      const matchingCounterparty = this.counterpartyMarginData.find(
        (cpItem) => cpItem.Counterparty === mainItem.Counterparty && cpItem.DataDate === mainItem.DataDate
          && cpItem.Portfolio === mainItem.Portfolio && cpItem.party === mainItem.party
      );
      if (matchingCounterparty) {
        mainItem.cpSbExposureDiff = Math.abs(mainItem.Exposure) - Math.abs(matchingCounterparty.Exposure);
        mainItem.differencePercent = Math.abs(mainItem.cpSbExposureDiff) / Math.abs(mainItem.Exposure) * 100;
      } else {
        mainItem.CPExposureDiff = null;
      }
    });
  }

  handleError(error: any) {
    this.errorHandler.handleHttpError(error);
    this.spinner.hide();
  }

  getCollateralBalances(formattedDate: any) {
    return this.dailyMarginSvc.getCollateralBalances(formattedDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          this.collateralBalances = result;
        } else {
          this.collateralBalances = [];
        }
      }),
      catchError((error: any) => {
        this.collateralBalances = [];
        this.handleError(error);
        return of([]);
      })
    );
  }

  getAllSecurities(formattedDate: any) {
    return this.dailyMarginSvc.getAllSecurities(formattedDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          this.securityList = result;
        } else {
          this.securityList = [];
        }
      }),
      catchError((error: any) => {
        this.securityList = [];
        this.handleError(error);
        return of([]);
      })
    );
  }

  getSecurities(formattedDate: any) {
    return this.substitutionService.getSecurities(formattedDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          this.securitiesHeld = result;
         
        } else {
          this.securitiesHeld = [];          
        }
      }),
      catchError((error: any) => {
        this.securitiesHeld = [];        
        this.handleError(error);
        return of([]);
      })
    );
  }
  /**
   * Exports the main grid data to Excel with proper date normalization.
   * Generates a timestamped filename and handles date field conversion.
   */
  exportTop(): void {
    const fileName = this.gridExportUtils.buildFileName('daily_margin', this.selectedDate);
    this.gridExportUtils.exportLikeGrid(this.grid, fileName);
  }

  /**
   * Exports the bottom grid data to Excel with proper date normalization.
   * Determines the correct grid based on current content tab selection.
   */
  exportBottom(): void {
    const targetGrid = this.contentTab === 'Incomplete' ? this.gridUnSettled : this.cpgrid;
    const fileName = this.gridExportUtils.buildFileName('daily_margin', this.selectedDate);
    this.gridExportUtils.exportLikeGrid(targetGrid, fileName);
  }

  saveFile() {
    this.spinner.show();
    const fileContent = 'Hello World!';
    const fileName = 'hello.txt';
    const fileType = 'text/plain';
    const blob = new Blob([fileContent], { type: fileType });
    saveAs(blob, fileName);
    // Delay hiding the spinner to ensure the user sees it
    setTimeout(() => {
      this.spinner.hide(); // Hide the spinner after generating and saving the file
    }, 1000); // Adjust the delay time as needed
  }
  downloadUserGuide() {
    this.spinner.show();

    this.dailyMarginSvc.downloadUserGuide().subscribe(
      (result: any) => {
        if (result) {
          saveAs(result.body, 'Clarus User Guide.pdf');
        } else {
          this.toasterService.toast('Error downloading User Guide');
        }
        this.spinner.hide();
      },
      (error: any) => {
        //console.error('An HTTP error occurred:', error);
        this.toasterService.toast('Error downloading User Guide');
        this.spinner.hide();
      }
    );
  }

  reOpen() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const c = confirm('Are you sure you wish to reopen this daily margin?');
    if (!c) {
      this.spinner.hide();
      return;
    }
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    this.dailyMarginSvc.reOpen(this.dtDate).subscribe(
      () => {
        this.toasterService.toast('Collateral Data is Reopened.');
        this.getDailyMarginDataSub(this.dtDate);
        this.spinner.hide();
      },
      (error: any) => {
        // Handle the error here
        this.handleError(error);
      }
    );
  }

  markComplete() {
    this.errorHandler.clearErrorList();
    const c = confirm(
      'Are you sure you wish to mark this data as complete? You will not be able to make any changes'
    );
    if (!c) {
      return;
    }
    this.spinner.show();
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    this.dailyMarginSvc.markComplete(this.dtDate).subscribe(
      (result: any) => {
        this.toasterService.toast('Daily Margin successfully marked complete');
        this.getDailyMarginDataSub(this.dtDate);

        this.spinner.hide();
      },
      (error: any) => {
        // Handle the error here

        this.handleError(error);
      }
    );
  }

  saveData(gridName: string) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let selectedDateString = new DateService().GetSpecficDateString(this.selectedDate);
    let tempDataGrid = [];
    if (gridName === 'main') {
      tempDataGrid = this.mainGridData;
    } else {
      tempDataGrid = this.lastGridData;
    }
    if (tempDataGrid.length === 0) {
      this.toasterService.toast('No data available to save.');
      this.spinner.hide();
      return;
    }
    this.dtDate = new DateService().GetSpecficDateString(
      tempDataGrid[0].DataDate
    );
    this.dailyMarginSvc.saveMarginData(tempDataGrid, this.dtDate).subscribe(
      () => {
        this.toasterService.toast('Changes successfully saved');
        this.getDailyMarginDataSub(selectedDateString);
        this.getLastDailyMarginData(selectedDateString).subscribe(
          (data) => {
            this.calculateCPExposureDiff();
            this.spinner.hide();
            this.gridUnSettled.endEdit(true);
          },
          (error: any) => {
            console.error('Error in getLastDailyMarginData called from saveData:', error);
            this.spinner.hide();
          }
        );
        this.spinner.hide();
      },
      (error: any) => {
        // Handle the error here

        this.handleError(error);
      }
    );
  }

  filterSecurityListByCp(counterparty: any): (element: any) => boolean {
    return (element: any): boolean => {
      const exists = this.CurrentSecuritiesHeld.some((x: securityDetails) => {
        return x.Cusip === element.Cusip;
      });

      const currentMargin = this.calculateMargin(
        this.CurrentSecurity.Counterparty,
        this.CurrentSecurity.Entity,
        this.UseCp.Collateral,
        this.UseCp.Exposure
      );

      let inCollateralBalance = this.collateralBalances.some(
        (x: collateralDetails) => {
          return (
            (x.CUSIP === element.Cusip || x.CUSIP === element.ISIN) &&
            x.Counterparty === counterparty
          );
        }
      );

      if (currentMargin > 0) {
        inCollateralBalance = true;
      }

      return exists === false && inCollateralBalance === true;
    };
  }

  getTradeDetails(cell: any, grid: string) {
    this.errorHandler.clearErrorList();
    let formattedDate: any = new DateService().GetSpecficDateString(
      cell.row.data.AsOfDate
    );
    this.counterParty = cell.row.data.Counterparty;
    this.entity = cell.row.data.Portfolio;
    this.spinner.show();
    if (grid == 'daily') {
      this.gridTab = 'daily';
      this.dailyMarginSvc
        .getTradeDetails(formattedDate, this.counterParty, this.entity)
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              this.tradeDetailsGridData = result;
            } else {
              this.tradeDetailsGridData = [];
            }
            this.spinner.hide();
            this.clearGridFilters();
            this.tradeDetailsDialog.open();
          },
          (error) => {
            this.handleError(error);
            this.tradeDetailsGridData = [];
          }
        );
    } else if (grid == 'cp') {
      this.gridTab = 'cp';
      this.dailyMarginSvc
        .getCPTradeDetails(formattedDate, this.counterParty, this.entity)
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              this.cpTradeDetailsGridData = result;
            } else {
              this.cpTradeDetailsGridData = [];
            }
            this.spinner.hide();
            this.clearGridFilters();
            this.tradeDetailsDialog.open();
          },
          (error) => {
            this.handleError(error);
            this.cpTradeDetailsGridData = [];
          }
        );
    }
  }

  clearGridFilters() {
    if (this.tradeDetailsGrid || this.cpTradeDetailsGrid) {
      this.tradeDetailsGrid.clearFilter();
      this.cpTradeDetailsGrid.clearFilter();
    }
  }

  getCollateralDetails(cell: any, grid: string) {
    this.errorHandler.clearErrorList();
    let formattedDate: any = new DateService().GetSpecficDateString(
      cell.row.data.AsOfDate
    );
    this.counterParty = cell.row.data.Counterparty;
    this.entity = cell.row.data.Portfolio;

    this.spinner.show();
    if (grid == 'daily') {
      this.dailyMarginSvc
        .getCollateralDetails(formattedDate, this.counterParty, this.entity)
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              this.collateralDetailsGridData = result;
            } else {
              this.collateralDetailsGridData = [];
            }
            this.spinner.hide();
            this.collateralDetailsDialog.open();
          },
          (error: any) => {
            // Handle the error here
            this.collateralDetailsGridData = [];

            this.handleError(error);
          });
    } else if (grid == 'cp') {
      this.dailyMarginSvc
        .getCPCollateralDetails(formattedDate, this.counterParty, this.entity)
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              this.collateralDetailsGridData = result;
            } else {
              this.collateralDetailsGridData = [];
            }
            this.spinner.hide();
            this.collateralDetailsDialog.open();
          },
          (error: any) => {
            // Handle the error here
            this.collateralDetailsGridData = [];

            this.handleError(error);
          });
    }
  }

  getCollateralSubstitutionDetails(cell: any) {
    this.errorHandler.clearErrorList();
    let formattedDate: any = new DateService().GetSpecficDateString(
      cell.row.data.DataDate
    );
    this.counterParty = cell.row.data.Counterparty;
    this.entity = cell.row.data.Portfolio;
    /* this.collateralBalances = this.collateralBalances.filter(
      (x: collateralDetails) =>
        x.Counterparty == cell.row.data.Counterparty &&
        x.Entity == cell.row.data.Portfolio
    ); */
    this.cpDailyMargin = this.counterpartyMarginData.filter(
      (x: counterpartyMargin) =>
        x.Counterparty == this.counterParty && x.Entity == this.entity
    );
    this.dailyMarginDet = this.mainGridData.filter(
      (x: dailyMargin) =>
        x.Counterparty == this.counterParty && x.Entity == this.entity
    );
    this.spinner.show();
    // Get CUSIPs filtered by counterparty and entity
    this.substitutionService.getCUSIPS(formattedDate, this.counterParty, this.entity).subscribe(
      (cusipResult: any) => {
        if (cusipResult && cusipResult.length > 0) {
          this.cusipList = cusipResult;
        } else {
          this.cusipList = [];
        }
        this.filteredSecurityList = this.availableSecurityList || [];
      },
      (error: any) => {
        this.cusipList = [];
        console.error('Error fetching CUSIPs:', error);
      }
    );
    this.dailyMarginSvc
      .getUseCp(formattedDate, this.counterParty, this.entity)
      .subscribe(
        (result: any) => {
          if (result) {
            this.UseCp = result;
            this.checkBestAmount(
              this.counterParty,
              this.entity,
              this.UseCp.Collateral,
              this.UseCp.Exposure
            );
            // Ensure that the inputElement and its nativeElement exist
            if (this.inputElement && this.inputElement.nativeElement) {
              const value = this.inputElement.nativeElement.value;
              const formattedValue = this.formatWithCommas(value);
              this.inputElement.nativeElement.value = formattedValue;
            }
          }
        },
        (error: any) => {
          this.handleError(error);
        });

    this.dailyMarginSvc
      .getSingleCollateralMovement(
        formattedDate,
        this.counterParty,
        this.entity
      )
      .subscribe(
        (result: any) => {
          if (result) {
            // Prioritize Cash security if it exists, otherwise take the first item
            if (result.length > 0) {
              const cashSecurity = result.find((x: any) => x.Cusip === 'Cash');
              this.CurrentSecurity = cashSecurity || result[0];
            } else {
              this.CurrentSecurity = {};
            }
            
            // Update wire button state when CurrentSecurity changes
            this.updateWireButtonState();
            
            // Reset MV calculation state for loaded security
            this.mvCalculated = false;
            
            //Sync with dailyMarginDet if available and newer
            const matchingDet = this.dailyMarginDet?.find(
              (d: any) =>
                d.Counterparty === this.CurrentSecurity.Counterparty &&
                d.Entity === this.CurrentSecurity.Entity &&
                new Date(d.DataDate).toISOString().split('T')[0] === formattedDate
            );
            this.CurrentSecurity.SendWire = matchingDet?.SendWire ?? false;
            this.myForm.get('ParValue')?.setValue(this.CurrentSecurity.ParValue);
            this.CurrentSecuritiesHeld = result;
            // Refresh filtered security list after CurrentSecuritiesHeld is updated
            this.filteredSecurityList = this.availableSecurityList || [];
            this.hasCash = result.some(function (x: securityDetails) {
              return x.Cusip == 'Cash';
            });
            if (result.length > 0) {
              this.adding = false;
            } else {
              this.adding = true;
            }
          } else {
            this.CurrentSecurity = {
              SendWire: false,
              Counterparty: this.counterParty,
              Entity: this.entity,
              DataDate: formattedDate,
              ParValue: null
            };
            this.CurrentSecuritiesHeld = [];
            this.myForm.get('ParValue')?.setValue(this.CurrentSecurity.ParValue);
            // Refresh filtered security list when CurrentSecuritiesHeld is empty
            this.filteredSecurityList = this.availableSecurityList || [];
            this.adding = true;
            this.hasCash = false;
            this.mvCalculated = false;
          }
          this.CurrentSecurity.Counterparty = this.counterParty;
          this.CurrentSecurity.Entity = this.entity;
          this.CurrentSecurity.DataDate = formattedDate;
          this.currentSecurityList = this.CurrentSecuritiesHeld;
          if (this.adding) {
            this.UseCp.Collateral = this.bestScenario.Collateral;
            this.UseCp.Exposure = this.bestScenario.Exposure;
          }
          this.currentMarginFilter = this.calculateMargin(
            this.CurrentSecurity.Counterparty,
            this.CurrentSecurity.Entity,
            this.UseCp.Collateral,
            this.UseCp.Exposure
          );
          // Ensure filtered security list is updated before opening dialog
          this.filteredSecurityList = this.availableSecurityList || [];
          this.spinner.hide();
          this.collateralSubstitutionDialog.open();
        },
        (error: any) => {
          // Handle the error here
          this.CurrentSecurity = {};
          this.CurrentSecuritiesHeld = [];

          this.handleError(error);
        });
  }

  checkAllUseCp() {
    this.direction = this.UseCp.Exposure && this.UseCp.Collateral;
    this.UseCp.Exposure = !this.direction;
    this.UseCp.Collateral = !this.direction;
  }
  setBestScenario() {
    this.UseCp.Collateral = this.bestScenario.Collateral;
    this.UseCp.Exposure = this.bestScenario.Exposure;
  }
  getExposure() {
    if (!this.cpDailyMargin || !this.dailyMarginDet) return null;
    if (this.UseCp.Exposure) {
      return this.cpDailyMargin[0].CollateralizedMTM * -1;
    } else {
      return this.dailyMarginDet[0].CollateralizedMTM;
    }
  }
  getCollateral() {
    if (!this.cpDailyMargin || !this.dailyMarginDet) return null;

    if (this.UseCp.Collateral) {
      return this.cpDailyMargin[0].CollateralValue * -1;
    } else {
      return this.dailyMarginDet[0].CollateralValue;
    }
  }
  getTotalSummary(columnName: string) {
    if (columnName === 'Value') {
      return this.getTotalValue();
    } else if (columnName === 'ParValue') {
      return this.getTotalParValue();
    }
    return 0;
  }

  getTotalValue() {
    return this.collateralDetailsGridData
      .map((t) => t.Value)
      .reduce((acc, value) => acc + value, 0);
  }
  getTotalParValue() {
    return this.collateralDetailsGridData
      .map((t) => t.ParValue)
      .reduce((acc, value) => acc + value, 0);
  }
  checkBestAmount(
    cp: any,
    entity: any,
    useCpCollateral: any,
    useCpExposure: any
  ) {
    var currentMargin = this.calculateMargin(
      cp,
      entity,
      useCpCollateral,
      useCpExposure
    );
    var scenario1 = this.calculateMargin(
      cp,
      entity,
      useCpCollateral,
      !useCpExposure
    );
    var scenario2 = this.calculateMargin(
      cp,
      entity,
      !useCpCollateral,
      useCpExposure
    );
    var scenario3 = this.calculateMargin(
      cp,
      entity,
      !useCpCollateral,
      !useCpExposure
    );
    var bestScenario = Math.max(currentMargin, scenario1, scenario2, scenario3);
    this.bestScenarioMargin = Math.round(bestScenario);
    this.currentMargin = Math.round(currentMargin);
    if (bestScenario == currentMargin) {
      this.bestScenario.Collateral = useCpCollateral;
      this.bestScenario.Exposure = useCpExposure;
    } else if (bestScenario == scenario1) {
      this.bestScenario.Collateral = useCpCollateral;
      this.bestScenario.Exposure = !useCpExposure;
    } else if (bestScenario == scenario2) {
      this.bestScenario.Collateral = !useCpCollateral;
      this.bestScenario.Exposure = useCpExposure;
    } else if (bestScenario == scenario3) {
      this.bestScenario.Collateral = !useCpCollateral;
      this.bestScenario.Exposure = !useCpExposure;
    }
    return true;
  }

  checkBestScenario(): boolean {
    const currentMargin = Math.round(
      this.calculateMargin(
        this.CurrentSecurity.Counterparty,
        this.CurrentSecurity.Entity,
        this.UseCp.Collateral,
        this.UseCp.Exposure
      )
    );

    if (
      (this.bestScenario.Collateral == this.UseCp.Collateral &&
        this.bestScenario.Exposure == this.UseCp.Exposure) ||
      this.bestScenarioMargin == currentMargin
    ) {
      return true;
    } else {
      return false;
    }
  }
  isValueNaN(value: any): boolean {
    return isNaN(value);
  }
  calculateMargin(
    cp: any,
    entity: any,
    useCpCollateral: any,
    useCpExposure: any
  ) {
    if (!this.cpDailyMargin || !this.dailyMarginDet) return 0;

    let exposure = useCpExposure
      ? -1 * this.cpDailyMargin[0].CollateralizedMTM
      : this.dailyMarginDet[0].CollateralizedMTM;

    let collateral = useCpCollateral
      ? -1 * this.cpDailyMargin[0].CollateralValue
      : this.dailyMarginDet[0].CollateralValue;

    let rounding = this.dailyMarginDet[0].RoundingAmount;

    let marginCalc = exposure + collateral;

    if (Math.abs(marginCalc) < this.dailyMarginDet[0].MinTransfer) return 0;

    let margin =
      rounding !== 0 ? Math.ceil(marginCalc / rounding) * rounding : marginCalc;

    return margin;
  }
  setParValue(val: any) {
    this.CurrentSecurity.ParValue = val;
    this.myForm.get('ParValue')?.setValue(val);
  }
  deleteMovement(security: any) {
    // Check if security has substitution flag set to 1
    if (security && security.Substitution === true) {
      alert("It is substitution. Please remove from substitution page.");
      return;
    }
    
    this.spinner.show();
    this.dailyMarginSvc.deleteCollateralMovement(security).subscribe(
      () => {
        const ind1 = this.CurrentSecuritiesHeld.indexOf(security);
       
        if (ind1 !== -1) {
          this.CurrentSecuritiesHeld.splice(ind1, 1);
        }
        this.hasCash = this.CurrentSecuritiesHeld.some(function (x: securityDetails) {
              return x.Cusip == 'Cash';
            });
        if (this.CurrentSecuritiesHeld.length > 0) {
          this.setCurrentSecurity(
            this.CurrentSecuritiesHeld[0],
            this.CurrentSecuritiesHeld[0].Cusip
          );
        } else {
          this.addNewSecurity(security);
        }
        this.getDailyMarginDataSub(this.dtDate);

        this.spinner.hide();
      },
      (error) => {
        this.handleError(error);
      }
    );
  }

  setNewSecurity(security: any) {
    if (!security) return;

    let newCusip=security.Cusip;
    if (newCusip == 'NA') {
      this.CurrentSecurity = { Cusip: 'NA' };
    } else if (newCusip == 'Cash') {
      this.CurrentSecurity = { Cusip: 'Cash' };
      this.CurrentSecurity.LastPrice = 100;
      this.CurrentSecurity.HaircutPercent = 0;
    } else {
      for (let i = 0; i < this.securitiesHeld.length; i++) {
        if (this.securitiesHeld[i].Cusip === security.Cusip && 
            this.securitiesHeld[i].Counterparty === security.Counterparty &&
            this.securitiesHeld[i].Entity === security.Entity) {
              this.CurrentSecurity = { ...this.securitiesHeld[i] };
              this.CurrentSecurity.ParValue="";
              // Copy all properties from matched security
              Object.assign(security, this.securitiesHeld[i]);
              break;
        }
      }
    }

    if (security.Id) this.CurrentSecurity.Id = security.Id;

    this.CurrentSecurity.Counterparty = security.Counterparty;
    this.CurrentSecurity.Entity = security.Entity;
    this.CurrentSecurity.DataDate = security.DataDate;
    
    // Update wire button state when CurrentSecurity changes
    this.updateWireButtonState();
    
    // Reset MV calculation state for new security
    this.mvCalculated = false;
    
    // Update form validators when security changes
    this.updateValidatorsForSecurity();
  }
  setCurrentSecurity(security: any, newCusip: string) {
    // TODO: Possibly change this to pull data on demand
    
    if (security) {
      this.adding=false;
      if (this.CurrentSecuritiesHeld && this.CurrentSecuritiesHeld.length > 0) {
        if (newCusip == 'NA') {
          return;
        }
        for (var i = 0; i < this.CurrentSecuritiesHeld.length; i++) {
          if (this.CurrentSecuritiesHeld[i].Cusip == newCusip && this.CurrentSecuritiesHeld[i].Substitution == security.Substitution) {
            this.CurrentSecurity = this.CurrentSecuritiesHeld[i];
            this.updateWireButtonState();
            // Reset MV calculation state for current security
            this.mvCalculated = false;
            // Update form validators when security changes
            this.updateValidatorsForSecurity();
            break;
          }
        }
      } else {
        this.CurrentSecurity = {
          DataDate: security.DataDate,
          Counterparty: security.Counterparty,
          Entity: security.Entity,
          Cusip: 'NA',
        };
        // Reset MV calculation state for new security
        this.mvCalculated = false;
        // Update form validators when security changes
        this.updateValidatorsForSecurity();
      }
    }
  }
  getCurrentSecuritiesSum(column: any) {
    if (!this.CurrentSecuritiesHeld) return 0;

    let total = this.CurrentSecuritiesHeld.reduce(
      (acc: any, cur: any) => acc + cur[column],
      0
    );

    return total;
  }
  closeDialog(dialog: any) {
    if (dialog == 'Collateral') {
      this.collateralSubstitutionDialog.close();
    }
  }
  sendWireRequest() {
    // Clear any previous errors
    this.errorHandler.clearErrorList();

    // Get formatted date
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);

    // Validate current state before confirmation
    const totalCollateralMoved = this.dailyMarginDet ? 
      (Number(this.dailyMarginDet[0].CollateralMovedIn) || 0) + (Number(this.dailyMarginDet[0].CollateralMovedOut) || 0) : 0;
    if (this.CurrentSecurity.MV > 0) {
      this.toasterService.toast(
        'Cannot send wire for positive collateral movement'
      );
      return;
    }

    // Check if wire request already sent
    const existingRow = this.mainGridData.find(
      (x) =>
        x.Counterparty === this.CurrentSecurity.Counterparty &&
        x.Entity === this.CurrentSecurity.Entity &&
        x.DataDate === this.dtDate
    );

    if (existingRow && existingRow.SendWire) {
      this.toasterService.toast('Wire request has already been sent');
      return;
    }

    // Confirm action
    const c = confirm('Are you sure you wish to send the wire request?');
    if (!c) {
      return;
    }

    // Show loading indicator
    this.spinner.show();

    // Store original state in case we need to revert
    const originalSendWireState = this.CurrentSecurity.SendWire;

    // Optimistically update UI before API call
    this.CurrentSecurity.SendWire = true;

    // Update main grid row for consistent UI
    if (existingRow) {
      existingRow.SendWire = true;
    }

    // Prepare request data
    let addressList: any[] = [];
    // TODO: Replace empty array with email address list

    // Execute API call
    this.dailyMarginSvc
      .sendWireRequest(
        this.dtDate,
        this.CurrentSecurity.Counterparty,
        this.CurrentSecurity.Entity,
        addressList,
        this.CurrentSecurity.MV
      )
      .subscribe(
        (response) => {
          // Check for API validation failures within a successful HTTP response
          if (response && response.success === false) {
            // Revert optimistic updates since the operation failed at API level
            this.CurrentSecurity.SendWire = originalSendWireState;

            if (existingRow) {
              existingRow.SendWire = originalSendWireState;
            }

            // Handle specific error codes
            if (response.code === 'WIRE_ALREADY_SENT') {
              this.toasterService.toast(response.message || 'Wire has already been sent. Please refresh.');
            } else {
              // Generic API validation failure
              this.toasterService.toast(response.message || 'Failed to send wire request');
            }
          } else {
            // Success path - API returned success:true or no validation info
            this.toasterService.toast('Request successfully sent');
            // Grid is already updated optimistically

            // Refresh the grid from backend for consistency
            this.getDailyMarginDataSub(this.dtDate);
          }

          // Always hide spinner regardless of API validation result
          this.spinner.hide();
        },
        (error) => {
          // HTTP error path (500, 404, etc.)

          // Revert optimistic updates on error
          this.CurrentSecurity.SendWire = originalSendWireState;

          if (existingRow) {
            existingRow.SendWire = originalSendWireState;
          }

          // Use existing error handler for HTTP errors
          this.handleError(error);
          this.spinner.hide();
        }
      );
  }

  sendTripartyMovement() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    const c = confirm('Are you sure you wish to send the movement request?');
    if (!c) {
      this.spinner.hide();
      return;
    }
    let addressList: any[] = [];

    // TODO: Replace empty array with email address list
    this.dailyMarginSvc
      .sendTripartyMovement(
        this.dtDate,
        this.CurrentSecurity.Counterparty,
        this.CurrentSecurity.Entity,
        addressList
      )
      .subscribe(
        (data) => {
          this.toasterService.toast('Request successfully sent');
          this.spinner.hide();
        },
        (error) => {

          this.handleError(error);
        }
      );
  }

  sendCollateralCall() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    const c = confirm('Are you sure you wish to send a collateral call?');
    if (!c) {
      this.spinner.hide();
      return;
    }

    const extraParams = {
      DataDate: this.dtDate,
      Counterparty: this.CurrentSecurity.Counterparty,
      Entity: this.CurrentSecurity.Entity,
      UseCpExposure: this.UseCp.Exposure,
      UseCpCollateral: this.UseCp.Collateral,
      Addresses: []
    };

    if (this.UseCp.Exposure) {
      extraParams["Exposure"] = this.cpDailyMargin.Exposure;
    }

    if (this.UseCp.Collateral) {
      extraParams["Collateral"] = this.cpDailyMargin.CollateralValue;
    }

    if (this.CurrentSecuritiesHeld && this.CurrentSecuritiesHeld.length > 0) {
      /* extraParams.NoticeOfTransfer = true;*/
      extraParams["Cusip"] = this.CurrentSecurity.Cusip;
    }

    extraParams["Movement"] = this.calculateMargin(
      extraParams.Counterparty,
      extraParams.Entity,
      this.UseCp.Collateral,
      this.UseCp.Exposure
    );

    this.dailyMarginSvc.sendCollateralCall(extraParams).subscribe(
      (data) => {
        this.toasterService.toast('Request successfully sent');
        this.spinner.hide();
      },
      (error) => {

        this.handleError(error);
      }
    );
  }

  addNewSecurity(security: any) {
    this.CurrentSecurity = {
      Counterparty: security.Counterparty,
      Entity: security.Entity,
      DataDate: security.DataDate,
    };
    this.adding = true;
    
    // Update wire button state when CurrentSecurity changes
    this.updateWireButtonState();
    
    // Reset MV calculation state for new security
    this.mvCalculated = false;
    
    // Update form validators when security changes
    this.updateValidatorsForSecurity();
  }
  saveCollateralMovement(security: any) {
    this.errorHandler.clearErrorList();
    // Check if MV calculation has been performed
    if (security && security.Substitution === true) {
      alert("It is substitution. Please save from substitution page.");
      return;
    }
    
    if (!this.mvCalculated) {
      alert('Please calculate Market Value before saving the security.');
      return;
    }

    this.spinner.show();

    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    const tempData = this.mainGridData;
    const filteredGrid = tempData.filter(
      (x: dailyMargin) =>
        x.Counterparty == this.counterParty && x.Entity == this.entity
    );

    if (filteredGrid && filteredGrid.length === 1) {
      if (filteredGrid[0].TotalMargin > 0 && security.ParValue < 0) {
        const c = confirm(
          'Internal action is CP Post. Do you wish to Post to CP?'
        );
        if (!c) {
          this.spinner.hide();
          return;
        }
      } else if (filteredGrid[0].TotalMargin < 0 && security.ParValue > 0) {
        const c = confirm(
          'Internal action is CP Call. Do you wish to Call CP?'
        );
        if (!c) {
          this.spinner.hide();
          return;
        }
      }
    }

    //As per the new requirement - substitution, removing the Par Value validation

    // TODO: Find better way to Map CUSIP/ISIN
    /* if (security.Cusip !== 'Cash' && security.ParValue < 0) {
      if (
        filteredGrid.length === 1 &&
        filteredGrid[0]['InternalAction'] !== 'CP POST'
      ) {
        let cusip = security.Cusip;
        if (cusip.substring(0, 2) === 'US') {
          cusip = cusip.substring(2, cusip.length - 1);
        }

        // Validate input
        const isValid = this.collateralBalances.some((x: collateralDetails) => {
          if (x.CUSIP === cusip && x.Counterparty === security.Counterparty) {
            return Math.abs(x.ParValue) >= Math.abs(security.ParValue);
          } else {
            return false;
          }
        });

        if (!isValid) {
          alert('Invalid Par Value');
          this.spinner.hide();
          return;
        }
      }
    } */

    this.collateralSubstitutionDialog.close();
    security.UseCpExposure = this.UseCp.Exposure;
    security.UseCpCollateral = this.UseCp.Collateral;
    const newDataDate = new DateService().GetSpecficDateString(
      security.DataDate || this.dtDate
    );

    // TODO: Return HttpClient Observable and use subscribe() to call based on which grid
    this.dailyMarginSvc
      .saveCollateralMovement([security], newDataDate)
      .subscribe(
        () => {
          this.toasterService.toast('Changes are successfully saved');
           // Clear the search term
          this.searchTerm = '';
          this.getDailyMarginDataSub(this.dtDate);
          this.spinner.hide();
        },
        (error: any) => {
          // Handle the error here
          console.error('Error saving collateral movement:', error);

          this.handleError(error);
        }
      );

    if (tempData && tempData.length > 0 && tempData[0].DataDate) {
      this.dataDate = new DateService().GetSpecficDateString(
        tempData[0].DataDate
      );
      this.dailyMarginSvc.saveMarginData(tempData, this.dataDate).subscribe(
        () => {
          //this.toasterService.toast('Changes are successfully saved');
          this.getDailyMarginDataSub(this.dtDate);
          this.spinner.hide();
        },
        (error: any) => {
          // Handle the error here

          this.handleError(error);
        }
      );
    }
  }
calculateMV(security :any): boolean {
    // Check if CurrentSecurity exists
    if (!this.CurrentSecurity) {
      alert('No security selected for calculation.');
      return false;
    }

    // Validate LastPrice and HaircutPercent for all securities before calculation
    let hasValidationErrors = false;
    
    // Check for par value in form controls
    const parValueControl = this.myForm.controls['ParValue'];
    const formValue = parValueControl?.value;
    
    if (!formValue || formValue === '' || isNaN(Number(formValue))) {
      alert(`Par Value is required for current security ${security.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
      hasValidationErrors = true;
    } else {
      // Check form control validation status
      if (parValueControl && parValueControl.invalid) {
        const errors = parValueControl.errors;
        if (errors?.['minPieceSize']) {
          alert(`Par Value ${formValue} is below minimum piece size ${errors['minPieceSize'].requiredValue} for current security ${security.Cusip || 'Unknown'}.`);
          hasValidationErrors = true;
        }
        if (errors?.['minIncrement']) {
          alert(`Par Value ${formValue} is not a multiple of minimum increment ${errors['minIncrement'].requiredIncrement} for current security ${security.Cusip || 'Unknown'}.`);
          hasValidationErrors = true;
        }
        if (errors?.['signMismatch']) {
          alert(`Par Value ${formValue} sign does not match reference value for current security ${security.Cusip || 'Unknown'}.`);
          hasValidationErrors = true;
        }
      }
    }
    
    // Validate security-specific requirements for non-Cash securities
    if (security && security.Cusip !== "Cash") {
      // Check for null/undefined LastPrice
      if (security.LastPrice === null || security.LastPrice === undefined) {
        alert(`Last Price is missing for security ${security.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
        hasValidationErrors = true;
      }
      // Check for null/undefined HaircutPercent
      else if (security.HaircutPercent === null || security.HaircutPercent === undefined) {
        alert(`Haircut Percent is missing for security ${security.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
        hasValidationErrors = true;
      }
    }
    
    // If validation errors exist, don't proceed with calculation
    if (hasValidationErrors) {
      alert('Cannot calculate Market Value due to validation errors.');
      return false;
    }
    
    // Update CurrentSecurity ParValue from form
    if (formValue !== null && formValue !== undefined && formValue !== '') {
      security.ParValue = Number(formValue);
    }
    
    // Apply MV calculation
    security = this.applyMV(security);
    
    // Update wire button state after MV calculation
    this.updateWireButtonState();
    
    alert("Market Values calculated based on Par Values entered.");
    
    this.mvCalculated = true;
    return true;
  }
  applyMV(data: any) {
    // Check if data is valid before proceeding
    if (!data) {
      return data;
    }
    
    // For Cash, set price to 100 and calculate simple MV
    if (data.Cusip === "Cash") {
      const parValue = data.ParValue || 0;
      data.MV = parValue; // Cash MV = Par Value
      data.MVHaircut = parValue; // No haircut for cash
      return data;
    }
    
    // For non-Cash securities, validate required fields
    if (data.LastPrice === null || data.LastPrice === undefined || 
        data.HaircutPercent === null || data.HaircutPercent === undefined) {
      return data; // Return without calculation if required fields are missing
    }
    
    const lastPrice = data.LastPrice;
    const parValue = data.ParValue || data.SubstitutionParValue || 0;
    const haircutPercent = data.HaircutPercent || 0;
    
    // Calculate Market Value: (LastPrice * ParValue) / 100
    data.MV = (lastPrice * Number(parValue)) / 100;
    
    // Calculate Market Value with Haircut: MV * (1 - HaircutPercent)
    data.MVHaircut = data.MV * (1 - haircutPercent);
    data.MV = data.MVHaircut;
    return data;
  }
  getCommentDetails(cell: any) {
    this.counterParty = cell.row.data.Counterparty;
    this.entity = cell.row.data.Portfolio;

    this.currentComment = cell.row.data;
    this.commentDialog.open();
  }
  saveComment(data: any) {
    this.spinner.show();

    let formattedDate: any = new DateService().GetSpecficDateString(
      data.DataDate
    );
    this.dailyMarginSvc
      .saveComment(data, formattedDate, data.Counterparty)
      .subscribe(() => {
        this.toasterService.toast('Comment saved successfully');

        for (let i = 0; i < this.mainGridData.length; i++) {
          if (
            this.mainGridData[i].Entity === data.Entity &&
            this.mainGridData[i].Counterparty === data.Counterparty
          ) {
            this.mainGridData[i] = data;
            break;
          }
        }

        this.spinner.hide();
        this.commentDialog.close();
      },
        (error: any) => {
          // Handle the error here

          this.handleError(error);
        });
  }

  closeComment() {
    this.commentDialog.close();
  }
  setContent(content: string) {
    this.contentTab = content;
  }
  onSelectChange(event: any, cell: any) {
    this.spinner.show();

    let formattedDate: any = new DateService().GetSpecficDateString(
      cell.row.data.DataDate
    );
    this.counterParty = cell.row.data.Counterparty;
    this.entity = cell.row.data.Entity;

    for (let i = 0; i < this.mainGridData.length; i++) {
      if (
        this.mainGridData[i].Entity === this.entity &&
        this.mainGridData[i].Counterparty === this.counterParty
      ) {
        this.mainGridData[i] = cell.row.data;
        this.mainGridData[i].CollateralStatus = event.currentTarget.innerText;

        if (
          event.currentTarget.innerText === 'Dispute' ||
          event.currentTarget.innerText == 'Complete No Call'
        ) {
          this.mainGridData[i].CollateralMovementDate = cell.row.data.DataDate;
          this.mainGridData[i].SettlementStatusDate = cell.row.data.DataDate;
          this.mainGridData[i].CollateralMovementType = 'NA';
          this.mainGridData[i].CollateralMoved = 0;
        }

        break;
      }
    }

    this.grid.data = this.mainGridData;

    if (
      event.currentTarget.innerText === 'Dispute' ||
      event.currentTarget.innerText == 'Complete No Call'
    ) {
      this.dailyMarginSvc
        .deleteAllCollateralMovements(
          formattedDate,
          this.counterParty,
          this.entity
        )
        .subscribe(() => {
          //this.toasterService.toast("Successfully deleted all collateral movements");
          this.spinner.hide();
        },
          (error: any) => {
            // Handle the error here

            this.handleError(error);
          });
    } else {
      this.spinner.hide();
    }
  }
  onDateChange() {
    sessionStorage.setItem('selectedDate', this.selectedDate.toISOString());
    // let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    // this.date_service.setDate(formattedDate);
  }
  getSelectedDate(): Date {
    const storedDate = sessionStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : null;
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler() {
    sessionStorage.clear();
  }
  
  private addDocumentClickListener(): void {
    this.documentClickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.security-dropdown') && !target.closest('igx-input-group')) {
        this.showSecurityDropdown = false;
      }
    };
    document.addEventListener('click', this.documentClickListener);
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = undefined;
    }
  }
  formatWithCommas(value: string): string {
    // Remove existing commas and non-numeric characters
    const cleanedValue = value.replace(/[^\d.]/g, '');

    // Convert cleaned value to number (if possible) and format with commas
    const numberValue = parseFloat(cleanedValue);
    if (!isNaN(numberValue)) {
      // Format with commas
      return numberValue.toLocaleString('en-US');
    } else {
      return value; // Return original value if conversion fails
    }
  }
  clearSearchAndCloseDialog(): void {
  // Clear the search term
  this.searchTerm = '';
  // Hide the dropdown
  this.showSecurityDropdown = false;
  // Reset filtered list to show all available securities
  this.filteredSecurityList = this.availableSecurityList;
  // Close the dialog
  this.collateralSubstitutionDialog.close();
}
  onParValueChange(newValue: any) {
    const parsedValue = this.parseNumber(newValue);
    this.CurrentSecurity.ParValue = parsedValue; // parseNumber handles null/undefined appropriately
  }
  private parseNumber(value: string): number | null {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      value = value.replace(/,/g, '');
    }
    let parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  get filteredCollateralBalances(): collateralDetails[] {
    if (!this.collateralBalances || !this.counterParty || !this.entity) {
      return this.collateralBalances || [];
    }
    return this.collateralBalances.filter(
      (x: collateralDetails) =>
        x.Counterparty == this.counterParty &&
        x.Entity == this.entity
    );
    /* return this.collateralBalances.filter(
        (x: collateralDetails) =>
          x.Counterparty == this.counterParty &&
          x.Entity == this.entity
    ).map((balance: collateralDetails) => {
      // Create a copy to avoid mutating original data
      const result = { ...balance };
      
      // If CUSIP is null, keep the existing Value
      if (balance.CUSIP === null || balance.CUSIP === undefined) {
        return result;
      }
      
      let lastPrice: number | null = null;
      let haircutPercent: number | null = null;
      
      // Handle Cash specially
      if (balance.CUSIP === 'Cash') {
        lastPrice = 100;
        haircutPercent = 0;
      } else {
        // Find the security details for non-Cash CUSIPs
        const security = this.securitiesHeld?.find(s => 
          s.Cusip === balance.CUSIP && 
          s.Counterparty === balance.Counterparty && 
          s.Entity === balance.Entity
        );
        
        if (!security) {
          result.Value = null;
          return result;
        }
        
        lastPrice = security.LastPrice;
        haircutPercent = security.HaircutPercent;
      }
      
      // Only calculate if both values are available
      if (lastPrice !== null && lastPrice !== undefined && 
          haircutPercent !== null && haircutPercent !== undefined) {
        // MV = (LastPrice * ParValue) / 100 * (1 - HaircutPercent)
        result.Value = (lastPrice * (balance.ParValue || 0)) / 100 * (1 - haircutPercent);
      } else {
        result.Value = null;
      }
      
      return result;
    }); */
  }

  get isSendWireEnabled(): boolean {
    return this.CurrentSecurity?.Cusip === 'Cash' && 
           this.CurrentSecurity?.ParValue < 0;
  }

  get availableSecurityList(): any[] {
    if (!this.cusipList || this.cusipList.length === 0) {
      return [];
    }
    
    return this.cusipList.filter(cusip => {
      // Check if security already exists in CurrentSecuritiesHeld
      const exists = this.CurrentSecuritiesHeld && this.CurrentSecuritiesHeld.some(held => 
        held.Cusip === cusip.Cusip
      );
      
      // Return securities that are NOT already held
      return !exists;
    });
  }

  get isCalculateMVDisabled(): boolean {
    return this.CurrentSecurity && this.CurrentSecurity.Substitution === true;
  }

  updateWireButtonState(): void {
  }

  onSecuritySearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.searchTerm = searchTerm;
    
    if (!searchTerm) {
      this.filteredSecurityList = this.availableSecurityList || [];
    } else {
      this.filteredSecurityList = (this.availableSecurityList || []).filter(security =>
        (security.Cusip && security.Cusip.toLowerCase().includes(searchTerm)) ||
        (security.SecurityName && security.SecurityName.toLowerCase().includes(searchTerm))
      );
    }
    this.showSecurityDropdown = true;
  }

  selectSecurity(cusip: string): void {
    this.CurrentSecurity.Cusip = cusip;
    this.searchTerm = cusip;
    this.showSecurityDropdown = false;
    this.setNewSecurity(this.CurrentSecurity);
  }

  private redColorConditionForDifferencePercent = (rowData: any): boolean => {
    return rowData['differencePercent'] >= 5;
  }

  public colorStatusFordifferencePercent = {
    red: this.redColorConditionForDifferencePercent,
  };

  private editableCellcolorCondition = (columnKey: any): boolean => {
    return columnKey == "CollateralStatus" || columnKey == "SettlementStatusDate";
  }

  public editableCellcolor = {
    blue: (rowData: any, columnKey: any) => {
      if (columnKey === "CollateralStatus") {
        return rowData.CollateralStatusColor !== "Red" && rowData.CollateralStatusColor !== "Orange";
      }
      return this.editableCellcolorCondition(columnKey);
    },
    orange: (rowData: any, columnKey: any) =>
      columnKey === "CollateralStatus" && rowData.CollateralStatusColor === "Orange",
    red: (rowData: any, columnKey: any) =>
      columnKey === "CollateralStatus" && rowData.CollateralStatusColor === "Red"
  };

  // Performance optimization: Move complex calculations from template to getter methods
  get dropdownMaxHeight(): string {
    const itemCount = this.filteredSecurityList.length + (this.shouldShowCashOption() ? 1 : 0);
    return itemCount > 5 ? '80px' : 'auto';
  }

  get dropdownOverflowY(): string {
    const itemCount = this.filteredSecurityList.length + (this.shouldShowCashOption() ? 1 : 0);
    return itemCount > 5 ? 'auto' : 'hidden';
  }

  get shouldShowDropdown(): boolean {
    return this.showSecurityDropdown && (this.filteredSecurityList.length > 0 || this.shouldShowCashOption());
  }

  private shouldShowCashOption(): boolean {
    return !this.hasCash && (!this.searchTerm || 'cash'.includes(this.searchTerm.toLowerCase()));
  }

  /* getTotalParValues(): number {
    if (!this.filteredCollateralBalances || this.filteredCollateralBalances.length === 0) {
      return 0;
    }
    return this.filteredCollateralBalances.reduce((sum, bal) => sum + (bal.ParValue || 0), 0);
  }

  getTotalCollateralValue(): number | null {
    if (!this.filteredCollateralBalances || this.filteredCollateralBalances.length === 0) {
      return 0;
    }
    // If any value is null, return null
    if (this.filteredCollateralBalances.some(bal => bal.Value === null || bal.Value === undefined)) {
      return null;
    }
    return this.filteredCollateralBalances.reduce((sum, bal) => sum + (bal.Value || 0), 0);
  } */

}



