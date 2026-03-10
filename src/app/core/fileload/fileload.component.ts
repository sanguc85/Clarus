import { Component, ElementRef, OnInit,ViewChild,ViewEncapsulation  } from '@angular/core';
import { DefaultSortingStrategy, ISortingExpression, SortingDirection } from 'igniteui-angular';
import { IgxDialogComponent,IgxSelectComponent,IGridCellEventArgs,ISelectionEventArgs, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent, IgxTreeGridComponent,IgxDatePickerComponent  } from '@infragistics/igniteui-angular';
import { DatePipe,DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup,FormControl,NgModel,Validators,NgForm } from '@angular/forms';
import { DateService } from 'src/app/shared/services/dateService';
import { FileloadService } from './fileload.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-fileload',
  templateUrl: './fileload.component.html',
  styleUrls: ['./fileload.component.scss']
})
export class FileloadComponent implements OnInit {
  defaultDate !: any;
  sharedDate!: any;
  todayDate: Date = this.date_service.GetTodayDate();
  unsubscribe$: Subject<any> = new Subject();
  gridData!:any[];
  entityDet!:any[];
  fileLoadData!:any[];
  SelectedCounterparty!:any;
  SelectedSource!:any;
  SelectedEntity!:any;
  comments!:any;
  rateNames:any = {
    "Fed Funds Rate": "FFR",
    "LIBOR Rate": "LIBOR",
    "All": "All"
};
selectedFiles: any = [];
uploadFileError:string ="";
MetaData: { [key: string]: any } = {};
  MetaDataTables: { [key: string]: any } = {};
  MetaDataNames: { [key: string]: any } = {};
  metaDataTables: string[]=[
    "AgreementType",
    "ApplicableType",
    "CollateralMovementType",
    "CollateralType",
    "Counterparty",
    "Country",
    "Currency",
    "DayCountConvention",
    "DeterminingParty",
    "DocumentationLaw",
    "Entity",
    "EntityAccountType",
    "IndexChangeType",
    "InterestBenchmark",
    "InterestCalculationMethod",
    "MasterAgreementType",
    "Outlook",
    "Party",
    "RatingSource",
    "RepoType",
    "RepoCollateralType",
    "SettlementType",
    "Status",
    "TransactionType",
    "ReportType"
];
metaDataMiscMap: { [key: string]: any } = {
  "Outlook": [
      "SnPOutlook",
      "FitchOutlook",
      "MoodysOutlook"
  ],
  "Counterparty": [
      "CounterpartyName",
      "Description"
  ],
  "IndexChangeType": [
      "IndexCancellation",
      "IndexDisruption",
      "IndexModification"
  ]
};
@ViewChild('uploadForm') uploadForm!: NgForm;
@ViewChild('uploadDialog') uploadDialog!: IgxDialogComponent;
@ViewChild('fileUpload', { static: false }) fileUpload!: ElementRef;
public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(private date_service: DateService,
    private datepipe: DatePipe,
    private fileloadservice: FileloadService,
    private formBuilder: FormBuilder,
    private excelExportService: IgxExcelExporterService,
    private spinner:SpinnerService,readonly errorHandler: CustomErrorHandler,readonly toasterService: ToasterService) { }

  ngOnInit(): void {
    
    // this.date_service.selectedDate$.subscribe(date => {
    //   this.sharedDate = date;
    // });
    //this.defaultDate = this.date_service.ConvertDatetoString(this.date_service.getDefaultDate());
    let sessionDate=this.getSelectedDate();
    this.sharedDate =sessionDate?sessionDate: new Date();
    //this.defaultDate = this.date_service.ConvertDatetoString(this.date_service.getDefaultDate());
    //this.defaultDate = new Date(this.date_service.AddNDays(this.sharedDate,-1));
    this.defaultDate = this.date_service.ConvertDatetoString(this.date_service.getPreviousDateForgivenDate(this.sharedDate));
    let formattedDate: any = this.date_service.GetSpecficDateString(this.defaultDate);
    this.setMetaDataTable(["Entity", "Counterparty"]);
    this.loadAllFileStatus(formattedDate);
    this.loadFileStatus(formattedDate);
  }
  getSelectedDate(): Date {
    const storedDate = sessionStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : null;
  }
  onDateChange() {
    //this.startDate = updatedDate;
    //let formattedDate : any = this.date_service.ConvertDatetoString(updatedDate);
    //this.defaultDate = formattedDate;
    let formattedDate : any = new DateService().GetSpecficDateString(this.defaultDate);
    this.date_service.setDate(formattedDate);

  }

  loadAllFileStatus(formattedDate:any){
    this.spinner.show();
    this.fileloadservice.getAllFileLoadStatus(formattedDate).subscribe((result: any) => {
      if (result.length > 0) {
        this.gridData = result;
      } else {
        this.gridData = [];
      }
      this.spinner.hide();
    }, error => {
      console.error("Error loading file status:", error);
      this.gridData = [];
      this.spinner.hide();
    });
  }

  loadFileStatus(formattedDate: any) {
    this.spinner.show();
    this.fileloadservice.getFileLoadStatus(formattedDate).subscribe((result: any) => {
      if (result.length > 0) {
        this.fileLoadData = result;
        console.log(result);
      } else {
        this.fileLoadData = [];
      }
      this.spinner.hide();
    }, error => {
      console.error("Error loading file status:", error);
      this.fileLoadData = [];
      this.spinner.hide();
    });
  }

  getData(){
    let formattedDate: any = new DateService().GetSpecficDateString(this.defaultDate);
    this.loadAllFileStatus(formattedDate);
    this.loadFileStatus(formattedDate);
  }

  loadFiles(name:string, loadType:any) {
    this.errorHandler.clearErrorList();
    let formattedDate: any = new DateService().GetSpecficDateString(this.defaultDate);
    var parameters = [formattedDate];

    if (name == "Valuation") {
        parameters.push('');
    }
    else if (name == "BaseRates") {
        var rate = this.rateNames[loadType];

        if (!rate) return;

        parameters.push(rate);
    }
    else if (name == "All") {
      this.loadVLDT(formattedDate,'');
      this.loadBaseRates(formattedDate,'All');
      this.loadSecurityPrices(formattedDate);
    }
    else {
        if (name != "SecurityPrices") {
            return;
        }
    }    
    this.loadData(formattedDate,name, parameters);
  }
  loadVLDT(formattedDate:any,entity:any){
    this.spinner.show();
    this.fileloadservice.loadVLDT(formattedDate,entity).subscribe((response: any) => {
      this.toasterService.toast("Files successfully loaded");        
      this.loadFileStatus(formattedDate);
      this.spinner.hide();
    }, error => {
      this.handleError(error);
    });
    
  
  }
  loadBaseRates(formattedDate:any,rateName:any){
    this.spinner.show();
    this.fileloadservice.loadBaseRates(formattedDate,rateName).subscribe((response: any) => {      
      this.toasterService.toast("Files successfully loaded");
      this.loadFileStatus(formattedDate);      
      this.spinner.hide();
    }, error => {
      this.handleError(error);
    });
  }
  loadSecurityPrices(formattedDate:any){
    this.spinner.show();
    this.fileloadservice.loadSecurityPrices(formattedDate).subscribe((response: any) => { 
      this.toasterService.toast("Files successfully loaded");
      this.loadFileStatus(formattedDate);      
      this.spinner.hide();
    }, error => {
      this.handleError(error);
    });
  }
  loadData(dataDate:any,loaderType:any, parameters:any)  {  
    this.spinner.show();  
    this.fileloadservice.loadData(dataDate,loaderType, parameters).subscribe((result: any) => {
      this.toasterService.toast("Files successfully loaded");
      this.loadFileStatus(dataDate);
      this.spinner.hide();
    }, error => {
      this.handleError(error);
    });
  }

  handleError(error: any, fallbackMessage: string = "Load failed") {
    this.errorHandler.handleErrorWithMessage(error, fallbackMessage);
    this.spinner.hide();
  }
isValidTicker(ticker:any) {
  var ind = Object.keys(this.rateNames).indexOf(ticker);

  return ind === -1;
  }
  
  openUploadDialog() {
    this.uploadDialog.open();
  }
  
  closeUploadDialog(){
    this.uploadDialog.close();
    this.SelectedCounterparty = null;
    this.SelectedSource = null;
    this.SelectedEntity = null;
    this.comments = null;
    // Reset the file input value to clear the selection
    if (this.fileUpload) {
      this.fileUpload.nativeElement.value = '';
    }
    this.uploadForm.resetForm();
    this.uploadFileError="";
    this.selectedFiles = [];
  }

  onFileupload(files: any) {
    this.selectedFiles = [];
    if (files.length == 0)
      return;

    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
    this.validateUpload();
  }

  setEntity(cp:string){
    this.entityDet=this.gridData.filter((x:any) => x.Counterparty == cp);
    this.SelectedEntity=this.entityDet[0].Entity;
  }
  validateUpload(){
    if (
      (this.SelectedCounterparty != null && this.SelectedCounterparty != undefined) &&
      (this.SelectedSource != null && this.SelectedSource != undefined) &&
      (this.SelectedEntity != null && this.SelectedEntity != undefined) 
    ) {
      if (this.SelectedCounterparty=="MSIP" && this.SelectedSource == "Exposure") {
      
        if (this.selectedFiles.length < 2) {        
          this.uploadFileError="Please select both MSC and MSI files to Upload";
        }
        else if (this.selectedFiles.length > 2) {
          this.uploadFileError="Please select both MSC and MSI files to Upload";
        }
        else {
          const mscOrMsiFiles = this.selectedFiles.filter((file: any) => {
            const fileName = file.name.toUpperCase();
            return fileName.includes("MSC") || fileName.includes("MSI");
          });
  
          if (mscOrMsiFiles.length < 2) {
            this.uploadFileError="Please select both MSC and MSI files to Upload";
            return; // Return early to avoid executing further code
          }
          this.uploadFileError="";
          //this.uploadFiles();
        }      
      }
      else {
        if (this.selectedFiles.length == 0) {
          this.uploadFileError="Select atleast one file.";
        } 
        else if (this.selectedFiles.length >= 2) {
          this.uploadFileError="Select only one file.";
        }
        else {
          this.uploadFileError="";
          //this.uploadFiles();
        }
      }
    }
    
  }
  uploadFileToUrl() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (
      (this.SelectedCounterparty === null || this.SelectedCounterparty === undefined) ||
      (this.SelectedSource === null || this.SelectedSource === undefined) ||
      (this.SelectedEntity === null || this.SelectedEntity === undefined)||
      (this.comments === null || this.comments === undefined)
    ) {
      this.spinner.hide();
      this.uploadFileError="Please select all the fields"; // Show a toast message for field selection error
      return; // Return early to avoid executing further code
    }
   
    if (this.SelectedCounterparty=="MSIP" && this.SelectedSource == "Exposure") {
      
      if (this.selectedFiles.length < 2) {        
        this.uploadFileError="Please select both MSC and MSI files to Upload";
        this.spinner.hide();       
      }
      else if (this.selectedFiles.length > 2) {
        this.uploadFileError="Please select both MSC and MSI files to Upload";
        this.spinner.hide();
      }
      else {
        const mscOrMsiFiles = this.selectedFiles.filter((file: any) => {
          const fileName = file.name.toUpperCase();
          return fileName.includes("MSC") || fileName.includes("MSI");
        });

        if (mscOrMsiFiles.length < 2) {
          this.uploadFileError="Please select both MSC and MSI files to Upload";
          this.spinner.hide();
          return; // Return early to avoid executing further code
        }
        
        this.uploadFiles();
      }      
    }
    else {
      if (this.selectedFiles.length == 0) {
        this.uploadFileError="Select atleast one file.";
        this.spinner.hide();
      } 
      else if (this.selectedFiles.length >= 2) {
        this.uploadFileError="Select only one file.";
        this.spinner.hide();
      }
      else {
        this.uploadFileError="";
        this.uploadFiles();
      }
    }
  }
  uploadFiles() {
    let errorM="";
    let formattedDate: any = new DateService().GetSpecficDateString(this.defaultDate);
    let formData = new FormData();
    this.selectedFiles.forEach((f: any) => formData.append('file', f, f.name));
    this.fileloadservice.uploadFile(formattedDate, this.SelectedCounterparty, this.SelectedEntity, this.SelectedSource, formData,this.comments).subscribe(() => {
      this.fileloadservice.loadFiles(formattedDate, this.SelectedCounterparty, this.SelectedEntity, this.SelectedSource,this.comments).subscribe((result: any) => {
        if (result.Response[0].Result == "Success") {
          this.toasterService.toast("Files successfully loaded");
          this.loadAllFileStatus(formattedDate);
          this.loadFileStatus(formattedDate);
        } else {
          if(result.Response[0].Result != "Fail")
            errorM=result.Response[0].Result.replace("Fail ","");
          else
            errorM="Failed to load the file";
          this.errorHandler.appendMessageToErrorList("Load failed");
          this.errorHandler.appendMessageToErrorList(errorM +". Please contact DQG Support");
          this.errorHandler.setIsError(true);
        }
        this.spinner.hide();
        this.closeUploadDialog();
      }, err => {
        let msg = (err.status == 0 ? "Server Error" : err.message ? err.message : err.error);
        this.errorHandler.appendMessageToErrorList(msg);
        this.errorHandler.appendMessageToErrorList("Failed to load the file. Please contact DQG Support");
        this.errorHandler.setIsError(true);
        this.spinner.hide();
      });
    }, err => {
      let msg = (err.status == 0 ? "Server Error" : err.message ? err.message : err.error);
      this.errorHandler.appendMessageToErrorList(msg);
      if(err.error.error!="")
        this.errorHandler.appendMessageToErrorList(err.error.error);
      else
        this.errorHandler.appendMessageToErrorList("Failed to load the file. Please contact DQG Support");
      this.errorHandler.setIsError(true);
      this.spinner.hide();
    });
  }
  setMetaDataTable(names: string[]): void {
    this.spinner.show();
    if (!names) {
      names = this.metaDataTables;
    }
    this.fileloadservice.setMetaDataTableList(names).subscribe((result: any) => {
      if (result) {
        this.MetaData = result;
        for (const key in result) {
          if (!this.MetaDataNames[key]) {
            this.MetaDataNames[key] = [];
          }
          for (const item of result[key]) {
            if (
              !this.MetaDataNames[key].some(
                (x: any) => x.Name === item.Name
              )
            ) {
              this.MetaDataNames[key].push({ Name: item.Name });
            }
          }
        }
        for (const name of names) {
          if (
            this.metaDataTables.includes(name) &&
            this.MetaData[name]
          ) {
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
          this.MetaDataNames['Counterparty'].sort((a: any, b: any) => a.Name.localeCompare(b.Name));
        }
      } else {
        this.MetaData = {};
      }
      this.spinner.hide();
    }, error => {
      console.error("Error setting meta data table:", error);
      this.spinner.hide();
    });
  }

}
