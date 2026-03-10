import { Component, ElementRef, OnInit, ViewChild,Injectable, Inject } from '@angular/core';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ReportsService } from './reports.service';
import { DateService } from 'src/app/shared/services/dateService';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IgxDatePickerComponent, IgxDialogComponent, IgxGridComponent } from 'igniteui-angular';
import { AnimationKeyFrameEffectTargetType } from 'igniteui-angular-core';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  Path: string = 'Clarus > Reports';
  DataDate: any;
  StartDate: any;
  EndDate: any;
  error: string = '';
  loading: boolean = false;
  PamParty = 'Bilateral';
  CalculationMethod = 'Simple';
  Counterparty: string = 'BAC';
  Entity: string = 'SBLIC';
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
  contentTab = 'CollateralCall';
  ReportTypes = {
    PDF: 'pdf',
    Excel: 'xls',
    HTML: 'html',
  };
  ReportType: string = 'pdf';
  reportURL = null;
  ReportTypeList: Array<string> = ['PDF', 'Excel', 'HTML'];
  CurrentReportType: string = this.ReportTypeList[0];
  CurrentReportTypeHolder = this.CurrentReportType;
  htmlText: any;
  // selectedDate: Date;
  // dtDate!: string;
  todayDate: Date = this.date_service.GetTodayDate();
  extraParams = {};
  apiName = environment.DataServiceApiUrl;
  message = '';
  reportMessage = '';
  emailRecipients:any = [];
  dialogOpen: boolean = false; // Variable to control dialog open/close
  //$: any; // Declare jQuery

  removeRecipients: any = [];
  additionalComments: string;
  emailDialogForm: FormGroup;
  contactDetails: any = [];
  NoCPMailId = '';
  isMailSent: boolean = false;
  validEmails: any;
  ActualemailsRecipients: any = [];

  @ViewChild('dataDatedatepicker', { static: true }) dataDatedatePicker: IgxDatePickerComponent;
  // @ViewChild('emailGrid', { static: true }) emailGrid: IgxGridComponent;
  @ViewChild('emailDialog', { static: true }) emailDialog: IgxDialogComponent;
  constructor(private fb: FormBuilder,
    private reportsService: ReportsService,
    private spinner: SpinnerService,
    private date_service: DateService,
    private sanitizer: DomSanitizer,readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,@Inject(DOCUMENT) private document: Document) {
    let sessionDate=this.getSelectedDate();
    this.DataDate =sessionDate?sessionDate: new Date();
    //this.DataDate = this.date_service.ConvertDatetoString(new Date(2018, 2, 12));
    this.todayDate = this.date_service.GetTodayDate();
    this.StartDate = new Date(this.DataDate.getFullYear(), this.DataDate.getMonth() - 1, 1);
    this.EndDate = new Date(this.StartDate.getFullYear(), this.StartDate.getMonth() + 1, 0);
  }

  updateDates() {
    
    this.DataDate = new Date(this.dataDatedatePicker.value);
    this.StartDate = new Date(this.DataDate.getFullYear(), this.DataDate.getMonth() - 1, 1);
    this.EndDate = new Date(this.StartDate.getFullYear(), this.StartDate.getMonth() + 1, 0);
  }
  ngOnInit(): void {
    this.setMetaDataTable(['Entity', 'Counterparty', 'Party', 'ReportType']);
    this.initForm();
    this.checkReport();
  }
  initForm() {
    this.emailDialogForm = this.fb.group({
      emailList: this.fb.array([])
    });

    
  }
  checkReport(): void {
    if (!navigator.userAgent.includes("Chrome") && this.ReportType.toLowerCase() === 'pdf') {
      this.checkIfUrlExists(this.ReportType);
    } else {
      this.getReport(this.contentTab, this.ReportType, null);
    }
  }
  createEmailControl(email: string): FormGroup {
    return this.fb.group({
      email: [email, [Validators.required, Validators.email]]
    });
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
    const emailList = this.emailDialogForm.get('emailList') as FormArray;
    emailList.push(this.createEmailControl(email));
    this.NoCPMailId = '';
  }
  public isEmailListEmpty(): boolean {
    
    const emailListControls = this.emailDialogForm.get('emailList') as FormArray;
    this.validEmails = emailListControls.controls.filter(control => {
      const email = control.get('email').value;
      return email.trim() !== '' && !this.removeRecipients.includes(email);
    });
    if (emailListControls.length === 0 && this.validEmails.length === 0)
      return true;
    else
      return false;
  }

  get emailListControls(): FormArray {
    return this.emailDialogForm.get('emailList') as FormArray;
  }

  onSubmit() {
    console.log(this.emailDialogForm.value);
    this.emailDialogForm.reset();
  }
  cancelEmail() {
    this.emailDialog.close();
    this.emailRecipients = [];
    this.removeRecipients = [];
  }

  public isAnyEmailInvalid(): boolean {
    for (let i = 0; i < this.emailListControls.length; i++) {
      const emailControl = this.emailListControls.at(i).get('email');
      if (emailControl.invalid) {
        return true;
      }
    }
    return false;
  }

  public notRecipientCondition = (index: number): boolean => {
    let recipient = this.getEmailAddress(index);
    return this.removeRecipients.some(removedRecipient => removedRecipient == recipient);
  }

  public getEmailValue(index: number): string {
    const emailControl = this.emailListControls.at(index).get('email');
    return emailControl.value.email;
  }

  public getEmailAddress(index: number): string {
    const emailControl = this.emailListControls.at(index).get('email');
    return emailControl.value;
  }

  public hideRecipient(index: number) {
    let address = this.getEmailAddress(index);
    if (address.trim() === '') {
      const emailList = this.emailDialogForm.get('emailList') as FormArray;
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
  extractEmails() {
    this.ActualemailsRecipients = []; // Reset the emails array before pushing new values
    this.validEmails.forEach((formGroup: FormGroup) => {
      const emailValue = formGroup.get('email')?.value;
      if (emailValue) {
        this.ActualemailsRecipients.push(emailValue);
      }
    });
    return this.ActualemailsRecipients;
  }

  resetForm() {
    this.emailDialogForm.reset();
    const emailsFormArray = this.emailDialogForm.get('emails') as FormArray;
    emailsFormArray?.clear();
    // Push a new empty FormGroup
    this.emailDialogForm = this.fb.group({
      emailList: this.fb.array([])
    });
  }

  isAnyEmailVisible(): boolean {
    const emailListControls = this.emailDialogForm.get('emailList') as FormArray;
    return emailListControls.controls.some((control) => !this.notRecipientCondition(emailListControls.controls.indexOf(control)));
  }

  handleChange() {
    if (this.contentTab !== 'MonthlyInterest' || this.setMonthlyInterestCalculation(this.contentTab)) {
      this.setContent(this.contentTab);
    }
  }

  setMonthlyInterestCalculation(tab: string): boolean {
    if (tab != "MonthlyInterest") {
      return true;
    }

    this.reportsService.getCalculationMethod(this.Counterparty, this.Entity).subscribe(
      (data) => {
      if (data && data.data) {
        this.CalculationMethod = data.data;
      }
    });

    return true;
  }
  getData() { }
  getReport(reportName: string, reportType: string, securityType: string) {
    this.errorHandler.clearErrorList();
    //this.updateDates();
    this.spinner.show();
    this.reportMessage=null;
    if (navigator.userAgent.indexOf("Chrome") === -1 && reportType.toLowerCase() === 'pdf') {
      this.checkIfUrlExists(reportType);
      return;
    }
    let fileFormat = reportType.toLowerCase();
    if (fileFormat == 'excel')
      fileFormat = 'xls';
 
  if (reportName == "PamCollateral" && fileFormat == "xls")
      fileFormat = "xlsx";
    this.extraParams = {
      DataDate: this.date_service.getDateAsString(this.DataDate),
      EndDate: this.date_service.getDateAsString(this.EndDate),
      StartDate: this.date_service.getDateAsString(this.StartDate),
      Counterparty: this.Counterparty,
      Entity: this.Entity,
      RateType: null,
      CollateralType: securityType,
      Type: reportType.toLowerCase(),
      Party: this.PamParty,
      Method: this.CalculationMethod
    };
    console.log(this.extraParams);
    // let errorMessage = "";
    this.reportsService.getReport(reportName, fileFormat, this.extraParams).subscribe(
      (response) => {
          this.spinner.hide();

          if (response.status=200) {
            //console.log(data);
            if (fileFormat === 'xlsx' || fileFormat === 'xls') {
              //const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8' });
              saveAs(response.body, reportName + '.' + fileFormat);
            } else if (reportType.toLowerCase() === 'html') {
              this.convertBlobToString(response.body);
            } else if (reportType.toLowerCase() === 'pdf') {
              this.reportURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(response.body));
            }
          }
          else {
            if (reportType === 'html') {
              this.htmlText = '';
            } else if (reportType.toLowerCase() === 'pdf') {
              this.reportURL = null;
            }
            // this.showProgress = false;
          }
        },
        (error: any) => {
          this.spinner.hide(); 
          if (error) {
            this.reportURL = null;
            console.log(error);
            console.log(error.status);
            console.log(error.message);
            if (error.status == 500) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const errorText = new TextDecoder().decode(e.target.result as ArrayBuffer);
                console.log('Error message:', errorText);
                this.error = errorText;
                this.reportMessage = errorText;
                this.errorHandler.appendMessageToErrorList(errorText);
                this.errorHandler.setIsError(true);
              };
              reader.readAsArrayBuffer(error.error);
            } else {
              this.error = "Unknown error occurred. Failed to generate report";
              this.errorHandler.appendMessageToErrorList(this.error);
              this.errorHandler.setIsError(true);
            }
            
          } else {
            this.error = "Data services may not be running. Please check!";
          this.errorHandler.appendMessageToErrorList(this.error);
          this.errorHandler.setIsError(true);
          } 
          if (reportType === 'html') {
            this.htmlText = '';
          } else if (reportType === 'pdf') {
            this.reportURL = null;
          }
      });
  }


  convertBlobToString(blobData: Blob): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      const htmlString = reader.result as string;
      this.htmlText = this.sanitizer.bypassSecurityTrustHtml(htmlString);
    };
    reader.readAsText(blobData);
  }
  
  setMetaDataTable(names: string[]): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (!names) {
      names = this.metaDataTables;
    }
    this.reportsService.setMetaDataTableList(names).subscribe((result: any) => {
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
        // Sort the Counterparty array alphabetically by the 'Name' property
        if (this.MetaDataNames['Counterparty']) {
          this.MetaDataNames['Counterparty'].sort((a: any, b: any) => a.Name.localeCompare(b.Name));
        }
        this.spinner.hide();
      } else {
        this.MetaData = {};
        this.spinner.hide();
      }
    });
  }
  splitName(name: string) {
    var newName = name[0];
    for (var i = 1; i < name.length; i++) {
      if (name[i].toUpperCase() == name[i] && name[i - 1].toLowerCase() == name[i - 1]) {
        newName += ' ';
      }

      newName += name[i];
    }
    return newName;
  }
  downloadReport(reportName: string, reportType: string) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (!navigator.userAgent.includes("Chrome") && reportType === 'pdf') {
      if (!this.reportURL) {
        return;
      }

      const fileName = `${reportName}.${reportType}`;
      const tempA = this.document.createElement('a');
      tempA.href = this.reportURL;
      tempA.download = fileName;
      this.document.body.appendChild(tempA);
      tempA.click();
      this.document.body.removeChild(tempA);
      return;
    }
    const extraParams = {
      DataDate: this.date_service.getDateAsString(this.DataDate),
      EndDate: this.date_service.getDateAsString(this.EndDate),
      StartDate: this.date_service.getDateAsString(this.StartDate),
      Counterparty: this.Counterparty,
      Entity: this.Entity,
      RateType: null,
      CollateralType: null,
      Type: reportType.toLowerCase(),
      Party: this.PamParty,
      Method: this.CalculationMethod
    };
    let fileFormat = reportType.toLowerCase();
    if (fileFormat == 'excel')
      fileFormat = 'xls';
 
    if (reportName == "PamCollateral" && fileFormat == "xls")
      fileFormat = "xlsx";
    this.reportsService.downloadReport(reportName, fileFormat, this.extraParams).subscribe(
      (response) => {
          this.spinner.hide();
          if (response.status=200) {
            //console.log(data);
            saveAs(response.body, reportName + '.' + fileFormat);
          }
          
        },
        (error: any) => {
          if (error) {
            if (error.status == 500) {
              this.error = "No report found for the selected date";
              
            } else {
              this.error = "Unknown error occurred. Failed to download report";
            }
            
          } else {
            this.error = "Data services may not be running. Please check!";
          }
         
          this.errorHandler.appendMessageToErrorList(this.error);
          this.errorHandler.setIsError(true);
          this.spinner.hide();           
        });
  }

  handleItemClick(name: string): void {
    
    if (name !== 'MonthlyInterest' || this.setMonthlyInterestCalculation(name)) {
      this.setContent(name);
    }
  }
  setContent(name: string): void {
    if (!this.Counterparty && this.MetaDataNames['Counterparty']) {
      this.Counterparty = this.MetaDataNames['Counterparty'][0].Name;
    }
    if (!this.Entity && this.MetaDataTables['Entity']) {
      this.Entity = this.MetaDataTables['Entity'][0].Name;
    }
    if (!this.CurrentReportType) {
      this.CurrentReportType = "PDF";
    }
    this.contentTab = name;
    let reportName = name;
    let fileFormat = this.CurrentReportType.toLowerCase();
    if (fileFormat === 'excel') {
      fileFormat = 'xls';
    }
    if (reportName === "PamCollateral" && fileFormat === "xls") {
      fileFormat = "xlsx";
    }
    if (navigator.userAgent.indexOf("Chrome") === -1 && fileFormat === 'pdf') {
      this.checkIfUrlExists(fileFormat);
    } else if (fileFormat !== 'xlsx' && fileFormat !== 'xls') {
      this.getReport(this.contentTab, fileFormat, null);
    }

    this.CurrentReportTypeHolder = this.CurrentReportType;
  }

  checkIfUrlExists(fileFormat: string): void {
    if (!this.Counterparty && this.MetaDataNames['Counterparty']) {
      this.Counterparty = this.MetaDataNames['Counterparty'][0].Name;
    }
    if (!this.Entity && this.MetaDataTables['Entity']) {
      this.Entity = this.MetaDataTables['Entity'][0].Name;
    }
    if (!this.CurrentReportType) {
      this.CurrentReportType = "PDF";
    }
    const extraParams = {
      DataDate: this.date_service.getDateAsString(this.DataDate),
      EndDate: this.date_service.getDateAsString(this.EndDate),
      StartDate: this.date_service.getDateAsString(this.StartDate),
      Counterparty: this.Counterparty,
      Entity: this.Entity,
      RateType: null,
      CollateralType: null,
      Type: fileFormat,
      Party: this.PamParty,
      Method: this.CalculationMethod
    };
    this.reportsService.checkUrl(this.CurrentReportType, this.contentTab, extraParams)
      .subscribe({
        next: data => {
          if (data && data.data) {
            const fileType = data.data.split('.')[data.data.split('.').length - 1];
            if (fileType.toLowerCase() === 'pdf') {
              this.reportURL = this.applyUrl(data.data);
            } else {
              this.getReport(this.contentTab, this.CurrentReportType, null);
            }
          } else {
            if (this.CurrentReportType.toLowerCase() === 'pdf') {
              this.generateReport(this.contentTab, this.CurrentReportType, null);
            } else {
              this.getReport(this.contentTab, this.CurrentReportType, null);
            }
          }
        },
        error: error => {
          this.reportURL = null;
          // console.log(error);
          // if (error.statusText == "Unknown Error") {
          //   errorMessage = "Unknown Error occurred. Please check with DQG";
          // }
          // else {
          //   errorMessage = error.error.error;
          // }
          // this.openToast(this.toast, "Error: " + errorMessage);
          // this.getCounterpartyExceptions();
          // this.showProgress = false;
        }
      })
  }

  applyUrl(url: string): string {
    let name = this.apiName.replace("api", "Reports") + this.contentTab + "/";
    name += url;
    return name;
  }

  generateReport(name: string, reportType: string, securityType: string): void {
    this.error = "";
    this.message = "";
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.reportMessage=null;
    if (!this.Counterparty && this.MetaDataNames['Counterparty']) {
      this.Counterparty = this.MetaDataNames['Counterparty'][0].Name;
    }
    if (!this.Entity && this.MetaDataTables['Entity']) {
      this.Entity = this.MetaDataTables['Entity'][0].Name;
    }
    const extraParams = {
      DataDate: this.date_service.getDateAsString(this.DataDate),
      EndDate: this.date_service.getDateAsString(this.EndDate),
      StartDate: this.date_service.getDateAsString(this.StartDate),
      Counterparty: this.Counterparty,
      Entity: this.Entity,
      RateType: null,
      CollateralType: securityType,
      Type: reportType.toLowerCase(),
      Party: this.PamParty,
      Method: this.CalculationMethod
    };
    this.reportsService.generateReport(name, reportType.toLowerCase(), extraParams)
      .subscribe({
        next: data => {
          if (data) {
            this.reportURL = this.applyUrl(data);
            this.toasterService.toast("Report successfully generated");
          } else {
            this.reportURL = null;
          }
          this.spinner.hide();
        },
        error: error => {
          this.reportURL = null;               
          this.spinner.hide();
          if (error) {
            console.log(error);
            if (error.status == 500) {
              
              const reader = new FileReader();
              reader.onload = (e) => {
                const errorText = new TextDecoder().decode(e.target.result as ArrayBuffer);
                console.log('Error message:', errorText);
                this.error = errorText;
                this.reportMessage = errorText;
                this.errorHandler.appendMessageToErrorList(errorText);
              };
              reader.readAsArrayBuffer(error.error);
            } else {
              this.error = "Unknown error occurred. Failed to generate report";
              this.errorHandler.appendMessageToErrorList(this.error);
              this.errorHandler.setIsError(true);
            }
            
          } else {
            this.error = "Data services may not be running. Please check!";
            this.errorHandler.appendMessageToErrorList(this.error);
            this.errorHandler.setIsError(true);
          }
        }
      })
  }

  
  closeEmailDialog() {
    this.dialogOpen = false; // Close the dialog
  }
  sendEmail() {
    let extraParams:any = {
      DataDate: this.date_service.getDateAsString(this.DataDate),
      EndDate: this.date_service.getDateAsString(this.EndDate),
      StartDate: this.date_service.getDateAsString(this.StartDate),
      Counterparty: this.Counterparty,
      Entity: this.Entity,
      Party: this.PamParty,
      Method: this.CalculationMethod,
      Addresses: this.extractEmails()
    };
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.reportsService.sendReport(this.contentTab,extraParams)
      .subscribe(
        data => {
          this.toasterService.toast("Report successfully sent");
          this.emailDialog.close();
          this.spinner.hide();
        },
        error => {
          if (error) {
            if (error.status == 500) {
              this.error = error.error;
            } else {
              this.error = "Unknown error occurred. Failed to send report";
            }
          } else {
            this.error = "Data services may not be running, Please check!";
          }
          this.errorHandler.appendMessageToErrorList(this.error);
          this.errorHandler.setIsError(true);
          this.emailDialog.close();
          this.spinner.hide();
        }
      );
  }

  onDialogClose() {
    this.cancelEmail();
  }
  
  openEmailDialog(reportName: string) {
    this.spinner.show();
    this.resetForm();
    this.reportsService.getReportRecipients(reportName)
      .subscribe(
        (data: any) => {   
          if (data) {
            if (this.Counterparty in data)
              this.emailRecipients = data[this.Counterparty];
            else if ("All" in data)
              this.emailRecipients = data["All"];
            else if ("Default" in data)
              this.emailRecipients = data["Default"];
            else
              this.emailRecipients = [];
          } else {
            this.emailRecipients = [];
          }
          // Add email recipients to the form array
          this.emailRecipients.forEach(email => {
            this.addRecipient(email.Address.trim());
          });
          // this.emailGrid.dataSource = this.emailRecipients;
          // Open dialog
          this.spinner.hide();
          this.emailDialog.open();
          
        },
        (error) => {
          if (error.status === 500) {
            this.error = error.error;
          } else {
            this.error = "Data services may not be running, Please check!";
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
  clearReportData(reportName: string): void {
    this.DataDate = this.date_service.getDateAsString(new Date()); // Adjust according to your DateService
    let cp = null;
    let entity = null;

    if (['CounterpartyRatings', 'CounterpartyExposure', 'PamCollateral'].indexOf(this.contentTab) == -1) { 
      cp = this.Counterparty; 
      entity = this.Entity; 
    }

    this.error = '';
    this.message = '';
    this.errorHandler.clearErrorList();
    this.spinner.show();

    this.reportsService.clearReportData(reportName, this.DataDate, cp, entity).subscribe({
      next: (data) => {
        this.spinner.hide();
        this.toasterService.toast("Report successfully cleared");
      },
      error: (error) => {
        this.spinner.hide();
        this.error = error.error;
        this.errorHandler.appendMessageToErrorList(this.error);
        this.errorHandler.setIsError(true);
      }
    });
  }
}


