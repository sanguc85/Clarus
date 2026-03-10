import { Component, OnInit, ViewChild } from '@angular/core';
import { DateService } from 'src/app/shared/services/dateService';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { SecuritypricesService } from './securityprices.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IgxDialogComponent, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent } from 'igniteui-angular';
import { MetadataService } from 'src/app/core/metadata/metadata.service';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-securityprices',
  templateUrl: './securityprices.component.html',
  styleUrls: ['./securityprices.component.scss'],
})
export class SecuritypricesComponent implements OnInit {
  startDate!: Date;
  endDate!: Date;
  securityPricesData: any[] = [];
  todayDate: Date = this.date_service.GetTodayDate();
  NewSecurityPrice: any = {}; // Initialize NewSecurityPrice object
  currentSecurities: any[] = [];
  @ViewChild('securityPrices') securityPrices!: IgxGridComponent;
  @ViewChild('addSecurityPricesDialog')
  addSecurityPricesDialog!: IgxDialogComponent;
  newSecurityPricesForm!: FormGroup;
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private date_service: DateService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    public securityPricesService: SecuritypricesService,
    private excelExportService: IgxExcelExporterService,
    public metaDataService: MetadataService
  ) {}

  ngOnInit(): void {
    this.newSecurityPricesForm = new FormGroup({
      ObservationDate: new FormControl('', Validators.required),
      Cusip: new FormControl('', Validators.required),
      DirtyBID: new FormControl('', Validators.required),
      DirtyMID: new FormControl('', Validators.required),
      DirtyASK: new FormControl('', Validators.required),
    });
    // this.startDate = new Date();
    // this.endDate = new Date();
    this.startDate = this.date_service.getDefaultDate();
    this.endDate = this.date_service.getDefaultDate();
    this.getSecurityPrices();
  }

  getSecurityPrices() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let startDate: any = new DateService().GetSpecficDateString(this.startDate);
    let endDate: any = new DateService().GetSpecficDateString(this.endDate);
    this.securityPricesService
      .getSecurityPricesByData(startDate, endDate)
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          const dateFields = ['ObservationDate', 'IssueDate', 'MaturityDate'];
          const formattedData = this.formatDateFields(data, dateFields);
          this.securityPricesData = formattedData;
        },
        error: (err) => {
          this.securityPricesData = [];
          this.spinner.hide();
        },
      });
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

  openSecurityPriceDialog() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.securityPricesService.getAllSecurityMaster().subscribe(
      (data: any) => {
        if (data) {
          this.currentSecurities = data;
        } else {
          this.currentSecurities = [];
        }
        this.spinner.hide();
        this.addSecurityPricesDialog.open();
      },
      (error: any) => {
        this.spinner.hide();
        this.toasterService.toast(
          'Unknown error occurred.Failed to get current securitites'
        );
        this.addSecurityPricesDialog.close();
        this.newSecurityPricesForm.reset();
        this.currentSecurities = [];
      }
    );
  }

  closeSecurityPriceDialog() {
    this.addSecurityPricesDialog.close();
    this.newSecurityPricesForm.reset();
    this.currentSecurities = [];
  }

  saveSecurityPrice() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (this.newSecurityPricesForm.valid) {
      const newSecurityPricesData = this.newSecurityPricesForm.value;
      // Extract the date part from ObservationDate
      const date = new Date(newSecurityPricesData.ObservationDate);
      const datePart = date.toISOString().split('T')[0];

      // Update newSecurityPricesData with the date part
      newSecurityPricesData.ObservationDate = datePart;
      this.securityPricesService
        .saveSecurityPrice(newSecurityPricesData)
        .subscribe(
          (data) => {
            this.spinner.hide();
            this.toasterService.toast('Security Prices saved');
            this.getSecurityPrices();
            // Reset the form
            this.newSecurityPricesForm.reset();
            this.currentSecurities = [];
            this.addSecurityPricesDialog.close();
          },
          (error) => {
            this.spinner.hide();
            this.toasterService.toast('Error saving Security Prices.');
            this.addSecurityPricesDialog.close();
            this.newSecurityPricesForm.reset();
            this.currentSecurities = [];
          }
        );
    }
  }

  exportToExcel() {
    const confirmation = confirm(
      'Exporting large amounts of data can take some time. Do you wish to continue?'
    );
    if (!confirmation) return;
    this.spinner.show();
    const date: string = new Date().toISOString().replace(/T/gi, '_').split('.')[0].replace(/:/g, '');
    const pathName = `Security_Prices__${date}`;

    try {
      // Call the export method
      this.excelExportService.export(
        this.securityPrices,
        new IgxExcelExporterOptions(pathName)
      );

      // Introduce a delay before hiding the spinner (e.g., 500 milliseconds)
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
      this.toasterService.toast('File exported successfully.');
    } catch (error) {
      // If an error occurs during export, hide the spinner and log the error
      this.spinner.hide();
      console.error('An error occurred during export:', error);
    }
  }
}
