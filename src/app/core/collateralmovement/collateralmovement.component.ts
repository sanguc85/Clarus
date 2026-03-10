import { Component, OnInit, ViewChild } from '@angular/core';
import { DefaultSortingStrategy, ISortingExpression, SortingDirection } from 'igniteui-angular';
import { IgxDialogComponent, IgxSelectComponent, IGridCellEventArgs, ISelectionEventArgs, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent, IgxToastComponent, IgxTreeGridComponent, IgxDatePickerComponent, IgxSummaryOperand, IgxSummaryResult } from '@infragistics/igniteui-angular';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, take, takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, NgModel, Validators } from '@angular/forms';
import { DateService } from 'src/app/shared/services/dateService';
import { CollateralmovementService } from './collateralmovement.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { GridExportUtilsService } from 'src/app/shared/services/grid-export-utils.service';
import { SourceMV_Counterparty, SourceMV_Internal, ESTIMATED_MOVEMENT_TAB } from 'src/app/shared/constants';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { IColumnPipeArgs } from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE, YEAR_MONTH_DAY_PIPE_WITH_TIME, EstimatedMovementRecipients } from 'src/app/shared/constants';
import { RulesMetadataService } from 'src/app/core/metadata/tabs/rules-metadata/rules-metadata.service';
import { ReportsService } from 'src/app/core/reports/reports.service';

/**
 * Interface for email submission data structure.
 */
interface EmailSubmissionData {
  recipients: { email: string }[];
  comments: string;
}

/**
 * Custom summary operand for calculating totals in grid columns containing cash/monetary values.
 * 
 * This class extends IgxSummaryOperand from Ignite UI Angular to provide custom summary 
 * calculations for the collateral movement grids. It's specifically designed to:
 * - Calculate totals for monetary columns (cash flows, margin values, etc.)
 * - Handle null/undefined values properly in financial calculations
 * - Provide consistent labeling for summary rows across all grids
 * 
 * Used in: collateral movement grid, summary grid, and estimated movement grid
 * Applied to columns: cash-related fields that require totaling
 */
class CustomSummaryOperand extends IgxSummaryOperand {
  /**
   * Constructor - calls the parent IgxSummaryOperand constructor
   */
  constructor() {
    super();
  }

  /**
   * Main calculation method that processes column data to generate summary results.
   * 
   * @param data - Array of values from a grid column (can contain null/undefined values)
   * @returns Array of summary results with calculated totals
   */
  public override operate(data?: any[]): IgxSummaryResult[] {
    // Filter out null/undefined values and sum all valid numeric values
    // This is crucial for financial data where null values should not affect calculations
    const total = data ? data.filter(x => x != null).reduce((a, b) => a + b, 0) : 0;

    // Return summary result in the format expected by Ignite UI grid
    return [
      {
        key: 'total',           // Unique identifier for this summary operation
        label: 'Total',         // Display text shown in the grid footer
        summaryResult: total    // The calculated total value
      }
    ];
  }
}

@Component({
  selector: 'app-collateralmovement',
  templateUrl: './collateralmovement.component.html',
  styleUrls: ['./collateralmovement.component.scss']
})
export class CollateralmovementComponent implements OnInit {
  startDate!: Date;
  endDate!: Date;
  dataDate!: any;
  todayDate: Date = this.date_service.GetTodayDate();
  collateralMovements!: any[];
  collateralSummaryData!: any[];
  estimatedMovementData!: any[];
  contentTab = 'collateralMovement';
  public group = [
    {
      dir: SortingDirection.Asc,
      fieldName: 'Party',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance(),
    },
  ];
  @ViewChild('grid') grid!: IgxGridComponent;
  @ViewChild('summaryGrid') summaryGrid!: IgxGridComponent;
  @ViewChild('estimatedGrid') estimatedGrid!: IgxGridComponent;
  public options = {
    digitsInfo: '1.2-2',
    currencyCode: ''
  };
  public formatOptions = this.options;
  public sourceMVItems = [{ key: 1, value: "Internal Valuation" }, { key: 1, value: "Counterparty MV" }];
  public cpDailyMargin: any[];
  error: string = '';
  public DailyMargin: any[];
  reportDataList: any[];
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  public customSummaryOperand = CustomSummaryOperand;

  // === Email dialog state for Estimated Movement ===
  estimateEmailDialogVisible = false;
  estimateEmailSpinner = false;

  // list of recipients the dialog will render
  estimateEmailRecipients: { email: string }[] = [];

  // message shown when there are no recipients
  estimateNoEmailMessage: string = '';

  // Row classes for styling footer rows
  public rowClasses = {
    'footer-row': (row: any) => !!row?.IsFooter
  };

  constructor(private date_service: DateService, private datepipe: DatePipe,
    private collateralmovementService: CollateralmovementService,
    private formBuilder: FormBuilder,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService, readonly errorHandler: CustomErrorHandler, readonly toasterService: ToasterService,
    private gridExportUtils: GridExportUtilsService,
    private rulesMetadataService: RulesMetadataService,
    private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.startDate = new Date();
    this.endDate = new Date();
    this.dataDate = this.endDate;
    this.getData();
  }

  onDateChange(date: Date) {
    if (date < this.startDate) {
      this.startDate = date;
      this.endDate = date;
      this.dataDate = this.endDate;
    }
    let dtDate = new DateService().GetSpecficDateString(date);
    this.dataDate = dtDate;
  }

  onTabChange(tabName: string): void {
    // Validate date range before switching to estimated movement tab
    if (tabName === ESTIMATED_MOVEMENT_TAB && !this.validateAndNotifyEstimatedMovementDateRange()) {
      return; // Don't switch tabs if validation fails
    }

    this.contentTab = tabName;
    this.getData();
  }

  getData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let startDate: any = new DateService().GetSpecficDateString(this.startDate);
    let endDate: any = new DateService().GetSpecficDateString(this.endDate);
    let dataDate: any = new DateService().GetSpecficDateString(this.dataDate);

    if (this.contentTab == 'collateralMovement') {

      this.getCounterpartyDailyMarginAndGetDailyMarginList(startDate, endDate);


    } else if (this.contentTab == 'collateralSummary') {
      this.collateralmovementService.getCollateralSummary(dataDate).subscribe(
        (result: any) => {
          this.spinner.hide();
          if (result.length > 0) {
            const dateFields = ['DataDate'];
            const formattedData = this.gridExportUtils.formatDateFields(result, dateFields);
            this.collateralSummaryData = formattedData;
            // Set the initial sort direction for the "Counterparty" column to ascending
            const counterpartyColumn = this.summaryGrid.getColumnByName('Counterparty');
            // Set the initial sorting for the "Counterparty" column to ascending
            this.summaryGrid.sort({ fieldName: 'Counterparty', dir: SortingDirection.Asc, ignoreCase: true });
            this.summaryGrid.data = this.collateralSummaryData;
          } else {
            this.collateralSummaryData = [];
            this.toasterService.toast('No data found.');
          }
        },
        (error: any) => {
          this.spinner.hide();
        }
      );
    } else if (this.contentTab === ESTIMATED_MOVEMENT_TAB) {
      // Validate date range for estimated movement - only allow today's date
      if (!this.validateAndNotifyEstimatedMovementDateRange()) {
        this.spinner.hide();
        return;
      }

      const start = this.date_service.GetSpecficDateString(this.startDate);
      const end = this.date_service.GetSpecficDateString(this.endDate);

      this.collateralmovementService.getEstimateMovementData(start, end).subscribe({
        next: (rows: any[]) => {
          this.estimatedMovementData = rows ?? [];
          this.estimatedGrid.data = this.estimatedMovementData;

          if (this.estimatedMovementData.length === 0) {
            this.toasterService.toast('No data found.');
          }
        },
        error: (error: any) => {
          this.handleError(error);
          this.estimatedMovementData = [];
        },
        complete: () => {
          this.spinner.hide();
        }
      });
    }
  }


  /**
   * Exports the current grid data to Excel with proper date normalization.
   * Handles both collateral movement and collateral summary tabs.
   * Uses date range format for filename: <prefix>_<startDate>_<endDate>_<timestamp>
   */
  exportToExcel(): void {
    if (!this.confirmExport()) {
      return;
    }

    // Validate date range for estimated movement export
    if (this.contentTab === ESTIMATED_MOVEMENT_TAB && !this.validateAndNotifyEstimatedMovementDateRange()) {
      return;
    }

    this.spinner.show();

    try {
      const { grid, prefix } = this.getExportConfiguration();
      const fileName = this.buildDateRangeFileName(prefix);

      this.gridExportUtils.exportLikeGrid(grid, fileName);

      this.toasterService.toast('Export completed successfully');
    } catch (error) {
      this.errorHandler.handleErrorWithMessage(error, 'Failed to export data');
      this.toasterService.toast('Export failed. Please try again.');
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Prompts user confirmation for potentially long-running export operation.
   * @returns True if user confirms, false otherwise
   */
  private confirmExport(): boolean {
    return confirm('Exporting large amounts of data can take some time. Do you wish to continue?');
  }

  /**
   * Validates that the date range is only for today's date for estimated movement.
   * Estimated movement data should only be generated for 1 business day (today).
   * Uses existing todayDate property and DateService for consistent date handling.
   * @returns Object with validation result and error message if invalid
   */
  private validateEstimatedMovementDateRange(): { isValid: boolean; errorMessage?: string } {
    // Use existing todayDate property and DateService for consistent date formatting
    const todayString = this.date_service.GetSpecficDateString(this.todayDate);
    const startString = this.date_service.GetSpecficDateString(this.startDate);
    const endString = this.date_service.GetSpecficDateString(this.endDate);

    // Validate that both start and end dates are today
    const isStartDateValid = startString === todayString;
    const isEndDateValid = endString === todayString;
    const isValidRange = isStartDateValid && isEndDateValid;

    if (!isValidRange) {
      return {
        isValid: false,
        errorMessage: "Estimated movement data is only available for today's date. Please select today's date in the date range."
      };
    }

    return { isValid: true };
  }

  /**
   * Validates estimated movement date range and shows appropriate user feedback.
   * Separated from core validation logic for better testability and separation of concerns.
   * @returns True if date range is valid, false otherwise
   */
  private validateAndNotifyEstimatedMovementDateRange(): boolean {
    const validation = this.validateEstimatedMovementDateRange();

    if (!validation.isValid && validation.errorMessage) {
      this.toasterService.toast(validation.errorMessage);
    }

    return validation.isValid;
  }

  /**
   * Determines the appropriate grid and filename prefix based on current content tab.
   * @returns Object containing the target grid component and filename prefix
   */
  private getExportConfiguration(): { grid: IgxGridComponent; prefix: string } {
    switch (this.contentTab) {
      case 'collateralMovement':
        return { grid: this.grid, prefix: 'collateral_movements' };
      case 'collateralSummary':
        return { grid: this.summaryGrid, prefix: 'collateral_summary' };
      case ESTIMATED_MOVEMENT_TAB:
        return { grid: this.estimatedGrid, prefix: 'estimated_movement' };
      default:
        return { grid: this.grid, prefix: 'export' };
    }
  }

  /**
   * Builds a filename with date range format for collateral movement exports.
   * Format: 
   * - Estimated Movement: collateral_estimate_<YYYYMMDD>
   * - Others: <prefix>_<YYYYMMDD>_<YYYYMMDD>_<YYYYMMDD_HHMMSS>
   * @param prefix - The filename prefix
   * @returns Formatted filename string
   */
  private buildDateRangeFileName(prefix: string): string {
    const formatDate = (date: Date): string => {
      return this.date_service.FormatDateToISO(date).replace(/-/g, '');
    };

    // Special handling for estimated movement - simpler format
    if (this.contentTab === ESTIMATED_MOVEMENT_TAB) {
      const reportDate = formatDate(this.startDate); // Use start date as report date
      return `collateral_estimate_${reportDate}`;
    }

    // Standard format for other tabs
    const startDateStr = formatDate(this.startDate);
    const endDateStr = formatDate(this.endDate);

    // Use shared service for consistent timestamp generation
    const timestamp = new Date()
      .toISOString()
      .replace(/T/, '_')
      .slice(0, 19)
      .replace(/[-:]/g, '');

    return `${prefix}_${startDateStr}_${endDateStr}_${timestamp}`;
  }

  sendMovementReport() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let dtDate = new DateService().GetSpecficDateString(this.dataDate);

    let sourceMVList = this.collateralMovements.filter(a => new DateService().GetSpecficDateString(a.DataDate) == dtDate).map((movement: any) => {
      return {
        SourceMV: movement.MVValue, Counterparty: movement.Counterparty, Entity: movement.Entity,
        HaircutMVDifference: movement.HaircutMVDifference
      };
    });



    this.collateralmovementService.sendMovementReport(dtDate, sourceMVList).subscribe(
      (data) => {
        this.toasterService.toast('Report successfully sent');
        this.spinner.hide();
      },
      (error) => {
        this.errorHandler.handleErrorWithMessage(error, 'Failed to send report');
        this.spinner.hide();
      }
    );
  }

  onSourceMVChange(event: any, cell: any, key: any) {
    if (key == SourceMV_Internal) {
      cell.row.data.SourceMV = SourceMV_Internal;
      cell.row.data.MVValue = this.calculateMargin(cell.row.data, false);
      cell.row.data.HaircutMVDifference = cell.row.data.MVValue * cell.row.data.HaircutPercent;

    }
    else if (key == SourceMV_Counterparty) {
      cell.row.data.SourceMV = SourceMV_Counterparty;
      cell.row.data.MVValue = this.calculateMargin(cell.row.data, true);
      cell.row.data.HaircutMVDifference = cell.row.data.MVValue * cell.row.data.HaircutPercent;
    }
  }

  findHairCutMvPersentage(row: any) {
    /* check HaircutPercent is empty or not */
    if (row.HaircutPercent == null || row.HaircutPercent == 0 || row.HaircutPercent == undefined) {
      return 0;
    } else {
      return row.HaircutMVDifference = (row.MV * row.HaircutPercent)
    }
  }


  getCounterpartyDailyMarginAndGetDailyMarginList(startDate: any, endDate: any) {

    startDate = new DateService().GetSpecficDateString(startDate);
    this.spinner.show();
    forkJoin({
      dailyMargin: this.getCounterpartyDailyMargin(startDate, endDate),
      counterpartyMargin: this.getGetDailyMarginList(startDate, endDate),
      ReportDataList: this.getReportDataList(startDate, endDate),
    })
      .subscribe({
        next: ({ dailyMargin, counterpartyMargin }) => {
          this.getCollatralMovements(startDate, endDate);
          this.spinner.hide();
        },
        error: (error: any) => {
          this.handleError(error);
        }
      });
  }
  getCollatralMovements(startDate: any, endDate: any) {
    this.spinner.show();
    this.collateralmovementService.getCollateralMovements(startDate, endDate).subscribe(
      (result: any) => {
        this.spinner.hide();
        if (result.length > 0) {
          const dateFields = ['MaturityDate', 'DataDate', 'CollateralMovementDate', 'SettleDate'];
          const formattedData = this.gridExportUtils.formatDateFields(result, dateFields);
          this.collateralMovements = formattedData;
          this.collateralMovements.forEach(element => {
            element.Substitution = element.Substitution ? 'Yes' : 'No',
              element.IsCollatral = this.checkIsInternalOrNot(element),
              element.SourceMV = element.IsCollatral ? 'Counterparty MV' : 'Internal Valuation',
              element.MVValue = this.calculateMargin(element, element.IsCollatral)
            element.HaircutMVDifference = element.MVValue * element.HaircutPercent;
          });
          // Set the initial sort direction for the "Counterparty" column to ascending
          const counterpartyColumn = this.grid.getColumnByName('Counterparty');
          // Set the initial sorting for the "Counterparty" column to ascending
          this.grid.sort({ fieldName: 'Counterparty', dir: SortingDirection.Asc, ignoreCase: true });

          this.grid.data = this.collateralMovements;

          console.log(this.grid.data);
        } else {
          this.collateralMovements = [];
          this.toasterService.toast('No data found.');
        }
      },
      (error: any) => {
        this.spinner.hide();
      }
    );
  }
  getCounterpartyDailyMargin(startDate: any, endDate: any) {
    return this.collateralmovementService.getCounterpartyDailyMargin(startDate, endDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          const dateFields = ['DataDate'];
          this.cpDailyMargin = this.gridExportUtils.formatDateFields(result, dateFields);
        } else {
          this.cpDailyMargin = [];
        }
      }),
      catchError((error: any) => {
        this.cpDailyMargin = [];
        this.handleError(error);
        return of([]); // Return an empty observable to continue the forkJoin
      })
    );
  }
  getGetDailyMarginList(startDate: any, endDate: any) {
    return this.collateralmovementService.getDailyMargin(startDate, endDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          const dateFields = ['DataDate'];
          this.DailyMargin = this.gridExportUtils.formatDateFields(result, dateFields);
        } else {
          this.DailyMargin = [];
        }
      }),
      catchError((error: any) => {
        this.DailyMargin = [];
        this.handleError(error);
        return of([]); // Return an empty observable to continue the forkJoin
      })
    );
  }
  handleError(error: any) {
    if (error) {
      this.errorHandler.handleHttpError(error);
    } else {
      this.error = 'Data services may not be running, Please check!';
    }
    this.spinner.hide();
  }
  public editableCellcolor = {
    blue: (rowData: any, columnKey: any) => {
      return columnKey == "SourceMV"
    }
  };
  getMvValue(movement: any, ListItems: any = [], convert: boolean = false) {
    var items = ListItems.filter(a => a.Counterparty == movement.Counterparty && a.Entity == movement.Entity && a.DataDate == movement.DataDate);
    if (items.length == 0) {
      return movement.MV;
    } else {
      if (convert) {
        return items[0].CollateralizedMTM * -1;
      }
      return items[0].CollateralizedMTM;
    }
  }

  calculateMargin(movement: any, useCpExposure: boolean) {

    var cpDailyMarginValues = this.cpDailyMargin.filter(a => a.Counterparty == movement.Counterparty && a.Entity == movement.Entity && a.DataDate == movement.DataDate);
    var dailyMarginValues = this.DailyMargin.filter(a => a.Counterparty == movement.Counterparty && a.Entity == movement.Entity && a.DataDate == movement.DataDate);

    if (cpDailyMarginValues.length == 0 || dailyMarginValues.length == 0) return 0;

    let exposure = useCpExposure
      ? -1 * cpDailyMarginValues[0].CollateralizedMTM
      : dailyMarginValues[0].CollateralizedMTM;

    let collateral = -1 * cpDailyMarginValues[0].CollateralValue;

    let rounding = dailyMarginValues[0].RoundingAmount;

    let marginCalc = exposure + collateral;

    if (Math.abs(marginCalc) < dailyMarginValues[0].MinTransfer) return 0;

    let margin =
      rounding !== 0 ? Math.ceil(marginCalc / rounding) * rounding : marginCalc;

    return margin;
  }

  getReportDataList(startDate: any, endDate: any) {
    return this.collateralmovementService.getReportDataList(startDate, endDate).pipe(
      tap((result: any) => {
        if (result.length > 0) {
          const dateFields = ['DataDate'];
          this.reportDataList = this.gridExportUtils.formatDateFields(result, dateFields);
        } else {
          this.reportDataList = [];
        }
      }),
      catchError((error: any) => {
        this.reportDataList = [];
        this.handleError(error);
        return of([]); // Return an empty observable to continue the forkJoin
      })
    );
  }

  checkIsInternalOrNot(row: any) {
    var useCpType = "UseCpExposure";
    var result = false;
    var collatral = this.reportDataList.filter(a => a.Counterparty == row.Counterparty
      && a.Entity == row.Entity
      && a.DataDate == row.DataDate
      && a.ReportName == "CollateralCall"
      && a.Name == useCpType);
    if (collatral.length != 0 && (collatral[0].Value != null || collatral[0].Value != "")) {
      console.log("CP" + collatral[0].Counterparty + " result  " + collatral[0].Value);
      result = JSON.parse(collatral[0].Value.toLowerCase())

    }
    return result;

  }
  // Email dialog methods for Estimated Movement
  public onSendEstimateReport(): void {
    this.getEstimateRulesAndOpen();
  }

  /**
   * Loads email rules from metadata service and opens the email dialog.
   * Handles rule parsing and email recipient extraction.
   */
  private getEstimateRulesAndOpen(): void {
    this.estimateEmailSpinner = true;

    this.rulesMetadataService.getRules().subscribe({
      next: (rules: any[]) => {
        try {
          const emails = this.extractEmailsFromRules(rules);
          this.estimateEmailRecipients = emails.map(email => ({ email }));
          this.estimateNoEmailMessage = emails.length ? '' : 'No default email recipients found.';
          this.estimateEmailDialogVisible = true;
        } catch (error) {
          this.handleEmailExtractionError(error);
        } finally {
          this.estimateEmailSpinner = false;
        }
      },
      error: (err) => {
        this.estimateEmailSpinner = false;
        this.errorHandler.handleErrorWithMessage(err, 'Failed to load email recipients');
      }
    });
  }

  /**
   * Extracts unique email addresses from rules metadata.
   * @param rules - Array of rule objects from the metadata service
   * @returns Array of unique email addresses
   */
  private extractEmailsFromRules(rules: any[]): string[] {
    if (!Array.isArray(rules)) {
      return [];
    }

    const relevantRules = rules.filter(rule => 
      rule?.RuleName === EstimatedMovementRecipients
    );

    const emailSet = new Set<string>();

    for (const rule of relevantRules) {
      if (rule?.Value && typeof rule.Value === 'string') {
        const emailsFromRule = this.parseEmailsFromValue(rule.Value);
        emailsFromRule.forEach(email => emailSet.add(email));
      }
    }

    return Array.from(emailSet);
  }

  /**
   * Parses email addresses from a semicolon-separated string.
   * @param value - Semicolon-separated string of email addresses
   * @returns Array of valid, trimmed email addresses
   */
  private parseEmailsFromValue(value: string): string[] {
    return value
      .split(';')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }

  /**
   * Handles errors that occur during email extraction.
   * @param error - The error that occurred
   */
  private handleEmailExtractionError(error: any): void {
    this.estimateEmailRecipients = [];
    this.estimateNoEmailMessage = 'Error loading email recipients.';
    this.errorHandler.handleErrorWithMessage(error, 'Failed to process email recipients');
  }

  /**
   * Cancels the email dialog operation and resets all related state.
   * Called when user cancels the email dialog without sending.
   */
  public onEstimateEmailCancel(): void {
    this.resetEmailDialogState();
  }

  /**
   * Resets all email dialog state variables to their default values.
   * Used for cleanup when canceling or completing email operations.
   */
  private resetEmailDialogState(): void {
    this.estimateEmailDialogVisible = false;
    this.estimateEmailSpinner = false;
    this.estimateEmailRecipients = [];
    this.estimateNoEmailMessage = '';
  }

  /**
   * Submits the estimated movement email report.
   * Validates input data and date range before sending the report via ReportsService.
   * @param emailData - Object containing recipients and comments for the email
   */
  public onEstimateEmailSubmit(emailData: EmailSubmissionData): void {
    // Validate date range before sending estimated movement report
    if (!this.validateAndNotifyEstimatedMovementDateRange()) {
      return;
    }

    // Validate email data
    if (!this.isValidEmailSubmissionData(emailData)) {
      this.toasterService.toast('Please provide valid email recipients.');
      return;
    }

    this.estimateEmailSpinner = true;

    const extraParams = this.buildReportParameters(emailData);

    this.reportsService.sendReport('EstimatedMovement', extraParams).subscribe({
      next: () => {
        this.handleEmailSubmissionSuccess();
      },
      error: (error: any) => {
        this.handleEmailSubmissionError(error);
      }
    });
  }

  /**
   * Validates email submission data for completeness and correctness.
   * @param emailData - The email data to validate
   * @returns True if data is valid, false otherwise
   */
  private isValidEmailSubmissionData(emailData: EmailSubmissionData): boolean {
    if (!emailData || !Array.isArray(emailData.recipients)) {
      return false;
    }

    const validEmails = emailData.recipients.filter(r => 
      r && typeof r.email === 'string' && r.email.trim().length > 0
    );

    return validEmails.length > 0;
  }

  /**
   * Builds the parameter object for the report service.
   * @param emailData - Email submission data containing recipients and comments
   * @returns Object with all required parameters for the report
   */
  private buildReportParameters(emailData: EmailSubmissionData): any {
    return {
      DataDate: this.date_service.getDateAsString(this.dataDate),
      StartDate: this.date_service.getDateAsString(this.startDate),
      EndDate: this.date_service.getDateAsString(this.endDate),
      Comments: emailData.comments || '',
      Addresses: emailData.recipients
        .filter(r => r && r.email && r.email.trim())
        .map(r => r.email.trim())
    };
  }

  /**
   * Handles successful email submission.
   * Resets dialog state and shows success message.
   */
  private handleEmailSubmissionSuccess(): void {
    this.resetEmailDialogState();
    this.toasterService.toast('Estimated Movement report sent successfully!');
  }

  /**
   * Handles email submission errors.
   * Resets loading state and shows appropriate error messages.
   * @param error - The error that occurred during submission
   */
  private handleEmailSubmissionError(error: any): void {
    this.estimateEmailSpinner = false;
    this.errorHandler.handleErrorWithMessage(error, 'Failed to send report');
  }

}
