import { Component, OnInit, ViewChild } from '@angular/core';
import { DefaultSortingStrategy, ISortingExpression, SortingDirection } from 'igniteui-angular';
import {
  IgxDialogComponent,
  IgxSelectComponent,
  IGridCellEventArgs,
  ISelectionEventArgs,
  IgxExcelExporterOptions,
  IgxExcelExporterService,
  IgxGridComponent,
  IgxToastComponent,
  IgxTreeGridComponent,
  IgxDatePickerComponent,
} from '@infragistics/igniteui-angular';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, NgModel, Validators, FormArray } from '@angular/forms';
import { DateService } from 'src/app/shared/services/dateService';
import { MonthlyinterestService } from './monthlyinterest.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { CommentdialogComponent } from '../commentdialog/commentdialog.component';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { RulesMetadataService } from '../metadata/tabs/rules-metadata/rules-metadata.service';
import { EmailDialogConstants, MIRecepients, COUPON_INTEREST_TAB } from 'src/app/shared/constants';
import { ReportsService } from '../reports/reports.service';
import { HttpResponse } from '@angular/common/http';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
import { SecuritymasterService } from '../metadata/tabs/referencedata-metadatagrid/subtabs/securitymaster/securitymaster.service';
@Component({
  selector: 'app-monthlyinterest',
  templateUrl: './monthlyinterest.component.html',
  styleUrls: ['./monthlyinterest.component.scss'],
})
export class MonthlyinterestComponent implements OnInit {
  defaultDate!: Date;
  todayDate: Date = this.date_service.GetTodayDate();
  unsubscribe$: Subject<any> = new Subject();
  StartDate!: Date;
  EndDate!: Date;
  contentTab = 'Summary';
  error: string = '';
  monthlyInterestData!: any[];
  detailData!: any[];
  securityCouponData!: any[];
  group!: ISortingExpression[];
  currentComment: any = [];
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
    IndexChangeType: ['IndexCancellation', 'IndexDisruption', 'IndexModification'],
  };
  Counterparty: string = 'BAC';
  Entity: string = 'SBLIC';
  RateType: string = 'FFR';
  CalculationMethod: any = 'Simple';
  NoCPMailId: string = '';
  sendMIDialogForm: FormGroup;
  removeRecipients: any = [];
  emailRecipients: any = [];
  validEmails: any;
  rulesList: any = [];
  MIReportRecepients = MIRecepients;
  COUPON_INTEREST_TAB = COUPON_INTEREST_TAB;
  PamParty = 'Bilateral';
  ActualemailsRecipients: any = [];
  sendMIReportData: any;
  reportName = "MonthlyInterest";
  dataDate!: any;

  @ViewChild('commentDialog') commentDialog!: IgxDialogComponent;
  @ViewChild('grid') grid!: IgxGridComponent;
  @ViewChild('detailGrid') detailGrid!: IgxGridComponent;
  @ViewChild('sendMIDialog', { static: true }) sendMIDialog: IgxDialogComponent;

  public formatOptions = {
    digitsInfo: '1.2-2',
  };
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private date_service: DateService,
    private datepipe: DatePipe,
    private monthlyinterestService: MonthlyinterestService,
    private fb: FormBuilder,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    private validationService: ValidationService,
    private rulesMetadataService: RulesMetadataService,
    private reportsService: ReportsService,
    private securitymasterService: SecuritymasterService
  ) { }
  ngOnInit(): void {
    this.date_service.selectedDate$.pipe(takeUntil(this.unsubscribe$)).subscribe(value => {
      this.defaultDate = value;
    });
    let sessionDate = this.getSelectedDate();
    this.defaultDate = sessionDate ? sessionDate : new Date();
    let formattedDate: any = new DateService().GetSpecficDateString(this.defaultDate);
    this.StartDate = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), 1);

    this.EndDate = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth() + 1, 0);
    this.group = [
      {
        dir: SortingDirection.Asc,
        fieldName: 'Party',
        ignoreCase: false,
        strategy: DefaultSortingStrategy.instance(),
      },
    ];
    this.setMetaDataTable(['Entity', 'Counterparty']);
    this.getData(this.contentTab);
    this.initSendMIForm();

  }

  onDateChange(date: string) {
    console.log(this.StartDate);
    if (date == 'startDate') {
      this.EndDate = new Date(this.StartDate.getFullYear(), this.StartDate.getMonth() + 1, 0);
    } else if (date == 'endDate') {
      this.StartDate = new Date(this.EndDate.getFullYear(), this.EndDate.getMonth(), 1);
    }
  }
  exportToExcel() {
    var pathName = 'monthly_interest_' + this.StartDate.toISOString().split('T')[0] + '_';
    pathName += this.EndDate.toISOString().split('T')[0] + '_';
    // replace T in datetime with underscore
    var date = new Date().toISOString().replace(/T/gi, '_').split('.')[0];
    if (this.contentTab == 'Summary') {
      this.excelExportService.export(
        this.grid,
        new IgxExcelExporterOptions((pathName + date).replace(/\-|:|\s/gi, ''))
      );
    } else {
      this.excelExportService.export(
        this.detailGrid,
        new IgxExcelExporterOptions((pathName + date).replace(/\-|:|\s/gi, ''))
      );
    }
  }

  getData(tabName?: string) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let startDate: any = new DateService().GetSpecficDateString(this.StartDate);
    let endDate: any = new DateService().GetSpecficDateString(this.EndDate);
    if (this.contentTab == 'Summary') {
      this.monthlyinterestService.getMonthlyInterestSummary(startDate, endDate).subscribe((result: any) => {
        if (result.length > 0) {
          this.monthlyInterestData = result;
          this.currentComment = result[0];
          //console.log(this.monthlyInterestData);
        } else {
          this.monthlyInterestData = [];
          this.toasterService.toast('No Data Found');
        }
        this.spinner.hide();
      },
        (err: any) => {
          let msg = err.status == 0 ? 'Server Error' : err.message ? err.error : err.message;
          this.monthlyInterestData = [];
          this.errorHandler.appendMessageToErrorList(msg);
          this.errorHandler.setIsError(true);
          this.spinner.hide();
        }
      );
    } else {
      this.spinner.show();
      this.monthlyinterestService
        .getMonthlyInterestDetail(
          startDate,
          endDate,
          this.Counterparty,
          this.Entity,
          this.RateType,
          this.CalculationMethod
        )
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              const dateFields = ['AccrualDate'];
              const formattedData = this.formatDateFields(result, dateFields);
              this.detailData = formattedData;
            } else {
              this.detailData = [];
              this.toasterService.toast('No Data Found');
            }
            this.spinner.hide();
          },
          (err: any) => {
            let msg = err.status == 0 ? 'Server Error' : err.message ? err.error : err.message;
            this.detailData = [];
            this.errorHandler.appendMessageToErrorList(msg);
            this.errorHandler.setIsError(true);
            this.spinner.hide();
          }
        );
    }
  }


  formatDateFields(data: any[], dateFields: string[]): any[] {
    return data.map((item) => {
      let newItem = { ...item };
      dateFields.forEach((field) => {
        if (newItem[field]) {
          newItem[field] = new Date(newItem[field]).toISOString().split('T')[0];
        }
      });
      return newItem;
    });
  }

  getCommentDetails(cell: any) {
    this.currentComment = cell.row.data;
    this.commentDialog.open();
  }

  saveComment(data: any) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let startDate: any = new DateService().GetSpecficDateString(this.StartDate);
    let endDate: any = new DateService().GetSpecficDateString(this.EndDate);
    this.monthlyinterestService.saveComment(data, startDate, endDate).subscribe({
      next: (response: any) => {
      for (let i = 0; i < this.monthlyInterestData.length; i++) {
        if (
          this.monthlyInterestData[i].Entity === data.Entity &&
          this.monthlyInterestData[i].Counterparty === data.Counterparty
        ) {
          this.monthlyInterestData[i] = data;
          break;
        }
      }
      this.toasterService.toast('Comment saved successfully');
      this.spinner.hide();
      this.commentDialog.close();
    },
    error: (error: any) => {
      if (error) {
        if (error.status == 500) {
          this.error = error.error;
        } else {
          this.error = 'Unknown error occurred. Failed to save comment';
        }
      } else {
        this.error = 'Data services may not be running, Please check!';
      }
      this.errorHandler.appendMessageToErrorList(this.error);
      this.errorHandler.setIsError(true);
      this.spinner.hide();
    }
    });
  }

  closeComment() {
    this.commentDialog.close();
  }

  saveData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let startDate: any = new DateService().GetSpecficDateString(this.StartDate);
    let endDate: any = new DateService().GetSpecficDateString(this.EndDate);
    this.monthlyinterestService.saveMonthlyInterest(this.monthlyInterestData, startDate, endDate).subscribe({
      next: (response: any) => {
      this.toasterService.toast('Changes successfully saved');
      this.spinner.hide();
    },
    error: (error: any) => {
      if (error) {
        if (error.status == 500) {
          this.error = error.error  ? error.error : error.message;
        } else {
          this.error = 'Unknown error occurred. Failed to save comment';
        }
      } else {
        this.error = 'Data services may not be running, Please check!';
      }
      this.errorHandler.appendMessageToErrorList(this.error);
      this.errorHandler.setIsError(true);
      this.spinner.hide();
      }
    });    

  }

  onCheck(cell: any) {
    cell.row.data.changed = cell.row.data.changed == 1 ? 0 : 1;
    cell.row.data.MonthlyApproval = cell.row.data.changed == 1;
    for (let i = 0; i < this.monthlyInterestData.length; i++) {
      if (this.monthlyInterestData[i].Id === cell.row.data.Id) {
        this.monthlyInterestData[i].MonthlyApproval = cell.row.data.MonthlyApproval;
      }
    }
    // console.log(cell.row.data.changed);
    // console.log(cell.row.data);
  }

  sendWire(cell: any) {
    this.errorHandler.clearErrorList();
    if (confirm("Are you sure you wish to send the wire request?")){
      this.spinner.show();
      let startDate: any = new DateService().GetSpecficDateString(this.StartDate);
      let endDate: any = new DateService().GetSpecficDateString(this.EndDate);
      let cp = cell.row.data.Counterparty;
      let entity = cell.row.data.Entity;
      let Value = Math.abs(cell.row.data.Interest);
      if (cell.row.data.Interest > 0) {
        this.toasterService.toast('Cannot send wire with positive value');
      } else {
        this.monthlyinterestService
          .sendWireRequest(endDate, startDate, endDate, cp, entity, this.RateType, Value)
          .subscribe({
            next: (response: any) => {
            this.toasterService.toast('Request successfully sent');
            this.spinner.hide();
          },
          error: (error: any) => {
            if (error) {
              if (error.status == 500) {
                this.error = error.error  ? error.error : error.message;
              } else {
                this.error = 'Unknown error occurred. Failed to save comment';
              }
            } else {
              this.error = 'Data services may not be running, Please check!';
            }
            this.errorHandler.appendMessageToErrorList(this.error);
            this.errorHandler.setIsError(true);
            this.spinner.hide();
            }
          });
      }
    }
    
  }

  setContent(tabName: string) {
    this.contentTab = tabName;
    if (tabName == 'Details') {
      this.setCalculationMethod();
    }
    else if (tabName == COUPON_INTEREST_TAB) {
      this.getSecurityCouponData();
    }
    else {
      this.getData(tabName);
    }
  }

  getSecurityCouponData(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();

    const dataDate = this.date_service.GetSpecficDateString(this.defaultDate);

    this.securitymasterService.getSecurityMasterWithCounterparty(dataDate)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (result: any) => {
          if (result?.length > 0) {
            // Note: Filtering logic has been moved to the backend (GetSecurityMasterWithCounterparty).
            // The API now returns only securities with valid coupon payments where:
            // - BC_DES_CASH_FLOW_CPN_AMT ≠ 0 (non-zero coupon amount)
            // - BC_DT matches the selected date
            // This ensures consistent filtering across all clients and avoids duplicate logic.
            this.securityCouponData = result;
            this.sortsecurityCouponData();

            if (this.securityCouponData.length === 0) {
              this.toasterService.toast('No Data Found');
            }
          } else {
            this.securityCouponData = [];
            this.toasterService.toast('No Data Found');
          }
        },
        error: (error: any) => {
          if (error) {
            if (error.status === 500) {
              this.error = error.error ? error.error : error.message;
            } else {
              this.error = 'Unknown error occurred. Failed to fetch security coupon data';
            }
          } else {
            this.error = 'Data services may not be running, Please check!';
          }
          this.securityCouponData = [];
          this.errorHandler.appendMessageToErrorList(this.error);
          this.errorHandler.setIsError(true);
        }
      });
  }

  setMetaDataTable(names: string[]): void {
    if (!names) {
      names = this.metaDataTables;
    }
    this.monthlyinterestService.setMetaDataTableList(names).subscribe((result: any) => {
      if (result) {
        this.MetaData = result;
        for (const key in result) {
          if (!this.MetaDataNames[key]) {
            this.MetaDataNames[key] = [];
          }
          for (const item of result[key]) {
            if (!this.MetaDataNames[key].some((x: any) => x.Name === item.Name)) {
              this.MetaDataNames[key].push({ Name: item.Name });
            }
          }
        }
        //var names = this.metaDataTables;
        for (const name of names) {
          if (this.metaDataTables.includes(name) && this.MetaData[name]) {
            this.MetaDataTables[name] = this.MetaData[name];
            this.MetaDataNames[name] = this.MetaDataNames[name];
          } else {
            for (const key in this.metaDataMiscMap) {
              if (this.metaDataMiscMap[key].includes(name) && this.MetaData[key]) {
                this.MetaDataTables[name] = this.MetaData[key];
                this.MetaDataNames[name] = this.MetaDataNames[key];
              }
            }
          }
        }
        if (this.MetaDataNames['Counterparty']) {
          this.MetaDataNames['Counterparty'].sort((a: any, b: any) => a.Name.localeCompare(b.Name));
        }
      } else {
        this.MetaData = {};
      }
    });
  }

  setCalculationMethod() {
    this.getCalculationMethod(this.Counterparty, this.Entity);
  }

  setCounterparty() {
    this.getCalculationMethod(this.Counterparty, this.Entity);
  }

  getCalculationMethod(cp: string, entity: string) {
    this.spinner.show();
    this.monthlyinterestService.getCalculationMethod(cp, entity).subscribe(
      (result) => {
        if (result.status === 200) {
          this.CalculationMethod = result.body;
        }
        this.getData();
        this.spinner.hide();
      },
      (error: any) => {
        if (error) {
          if (error.status == 500) {
            this.error = error.error;
          } else {
            this.error = 'Unknown error occurred.';
          }
        } else {
          this.error = 'Data services may not be running. Please check!';
        }
        this.errorHandler.appendMessageToErrorList(this.error);
        this.errorHandler.setIsError(true);
        this.spinner.hide();
      }
    );
  }

  getSelectedDate(): Date {
    const storedDate = sessionStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : null;
  }

  cancelEmail() {
    this.emailRecipients = [];
    this.removeRecipients = [];
    this.sendMIDialog.close();

  }

  initSendMIForm() {
    this.sendMIDialogForm = this.fb.group({
      emailList: this.fb.array([]),
      Comments: new FormControl('',
        [
          Validators.minLength(5),
          this.validationService.noLeadingTrailingSpacesValidator(),
          Validators.pattern('^[a-zA-Z0-9 ]+(\\.[a-zA-Z0-9 ]+)*\\.?$')])
    });

    // Add email recipients to the form array
    this.emailRecipients.forEach(email => {
      this.addRecipient(email);
    });
  }
  get emailListControls(): FormArray {
    return this.sendMIDialogForm.get('emailList') as FormArray;
  }
  public notRecipientCondition = (index: number): boolean => {
    let recipient = this.getEmailAddress(index);
    return this.removeRecipients.some(removedRecipient => removedRecipient == recipient);
  }
  public getEmailAddress(index: number): string {
    const emailControl = this.emailListControls.at(index).get('email');
    return emailControl.value;
  }
  public hideRecipient(index: number) {
    let address = this.getEmailAddress(index);
    if (address.trim() === '') {
      const emailList = this.sendMIDialogForm.get('emailList') as FormArray;
      if (index < emailList.length) {
        emailList.removeAt(index);
      } else {
        console.error('Invalid index for removing email control');
      }
      return true; // No need to add to removeRecipients if already empty
    }
    for (let i = 0; i < this.removeRecipients.length; i++) {
      if (address == this.removeRecipients[i]) {
        return this.removeRecipients.splice(i, 1)
      }
    }
    return this.removeRecipients.push(address);
  }
  addRecipient(email: string = ''): void {
    let isFound = false;
    if (email.trim() !== '') {
      for (let i = 0; i < this.emailRecipients.length; i++) {
        if (email == this.emailRecipients[i].Address) {
          isFound = true;
        }
      }
      if (isFound == false)
        this.emailRecipients.push(email);
    }
    const emailList = this.sendMIDialogForm.get('emailList') as FormArray;
    emailList.push(this.createEmailControl(email));
    this.NoCPMailId = '';
  }
  createEmailControl(email: string): FormGroup {
    return this.fb.group({
      email: [email, [Validators.required, Validators.email]]
    });
  }
  public isEmailListEmpty(): boolean {

    const emailListControls = this.sendMIDialogForm.get('emailList') as FormArray;
    this.validEmails = emailListControls.controls.filter(control => {
      const email = control.get('email').value;
      return email.trim() !== '' && !this.removeRecipients.includes(email);
    });
    if (emailListControls.length === 0 && this.validEmails.length === 0)
      return true;
    else
      return false;
  }
  isAnyEmailVisible(): boolean {
    const emailListControls = this.sendMIDialogForm.get('emailList') as FormArray;
    return emailListControls.controls.some((control) => !this.notRecipientCondition(emailListControls.controls.indexOf(control)));
  }
  openSendMIEmailDialog(rowData: any) {
    this.sendMIReportData = rowData;
    this.getRules(rowData);

  }
  getRules(rowData: any) {
    this.errorHandler.clearErrorList();
    this.rulesMetadataService.getRules()
      .subscribe({
        next: (data: any[]) => {
          if (data) {
            data.forEach(item => {
              if (item.RuleName === this.MIReportRecepients) {
                if(rowData.Counterparty === item.Key)
                {
                  let emailArray = item.Value.split(';');
                  emailArray.forEach(email => {
                    email = email.trim();
                    if (email && !this.emailRecipients.includes(email)) {
                      this.emailRecipients.push(email);
                    }
                  });
                }
                else if (item.Key === "All" || item.Key === "Default") {
                  let emailArray = item.Value.split(';');
                  emailArray.forEach(email => {
                    email = email.trim();
                    if (email && !this.emailRecipients.includes(email)) {
                      this.emailRecipients.push(email);
                    }
                  });
                }
              }
            });
            if (this.emailRecipients.length === 0) {
              this.NoCPMailId = EmailDialogConstants.NoCPMailId;
            }
            else {
              this.NoCPMailId = '';
            }
          }
          else {
            this.NoCPMailId = EmailDialogConstants.NoCPMailId;
          }
          this.initSendMIForm();
          this.sendMIDialog.open();
        },
        error: err => {
          let msg = (err.status == 500) ? (err.error ? err.error : err.message) : "Unknown error occurred. Failed to fetch the rules";
          this.toasterService.toast(msg);
          this.errorHandler.appendMessageToErrorList(msg);
          this.errorHandler.setIsError(true);         
        }
      })
  }
  extractEmails() {
    this.ActualemailsRecipients = [];
    this.validEmails.forEach((formGroup: FormGroup) => {
      const emailValue = formGroup.get('email')?.value;
      if (emailValue) {
        this.ActualemailsRecipients.push(emailValue);
      }
    });
    return this.ActualemailsRecipients;
  }
  sendMIReportEmail() {
    this.errorHandler.clearErrorList();
    if (this.sendMIDialogForm.valid) {
      let extraParams: any = {
        DataDate: this.date_service.getDateAsString(this.defaultDate),
        EndDate: this.date_service.getDateAsString(this.EndDate),
        StartDate: this.date_service.getDateAsString(this.StartDate),
        Counterparty: this.sendMIReportData.Counterparty,
        Entity: this.sendMIReportData.Entity,
        Party: this.sendMIReportData.Party,
        Method: this.CalculationMethod,
        Comments: this.sendMIDialogForm.get('Comments')?.value,
        Addresses: this.extractEmails()
      };

      this.spinner.show();
      this.reportsService.sendReport(this.reportName, extraParams)
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.toasterService.toast("Report successfully sent");
              this.spinner.hide();
              this.cancelEmail();
            }
            else {
              this.toasterService.toast("Report sending failed");
              this.spinner.hide();
              this.cancelEmail();
            }

          },
          error: error => {
            if (error) {
              if (error.status == 500) {
                if (error.error == 'Sequence contains no elements') {
                  this.error = "No data found for the period selected";
                }
                else {
                  this.error = "An Error has occurred. Please try again. If this reoccurs, please contact DSG";
                }
              } else {
                this.error = "Unknown error occurred. Failed to send report";
              }
            }
            this.cancelEmail();
            this.errorHandler.appendMessageToErrorList(this.error);
            this.errorHandler.setIsError(true);
            this.spinner.hide();

          }
        }

        );
    }

  }
  private editableCellcolorCondition = (rowData: any, columnKey: any): boolean => {
    return columnKey == "SettleDate"||columnKey == "RecievedfromCP"||columnKey == "MatchedwithCP"||columnKey == "Followups"||columnKey == "Reconcile";
  }
  public editableCellcolor = {
    blue: this.editableCellcolorCondition
  };
  
  /**
   * Sorts securityCouponData by:
   * 1. CurrentlyPledgedAsset (descending - Yes first)
   * 2. Counterparty (ascending, case-insensitive)
   * 3. Cusip (ascending, case-insensitive)
   */
  sortsecurityCouponData(): void {
    if (!this.securityCouponData?.length) {
      return;
    }

    this.securityCouponData.sort((a, b) => {
      // 1. Sort by CurrentlyPledgedAsset (descending - true/Yes first)
      const pledgedDiff = Number(!!b.CurrentlyPledgedAsset) - Number(!!a.CurrentlyPledgedAsset);
      if (pledgedDiff !== 0) {
        return pledgedDiff;
      }

      // 2. Sort by Counterparty (ascending, case-insensitive)
      const counterpartyCompare = (a.Counterparty || '').localeCompare(b.Counterparty || '', undefined, { sensitivity: 'base' });
      if (counterpartyCompare !== 0) {
        return counterpartyCompare;
      }

      // 3. Sort by Cusip (ascending, case-insensitive)
      return (a.Cusip || '').localeCompare(b.Cusip || '', undefined, { sensitivity: 'base' });
    });
  }
}
