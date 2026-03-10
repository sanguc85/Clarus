import { Component, OnInit, ViewChild } from '@angular/core';
import { DateService } from 'src/app/shared/services/dateService';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ValuationdataService } from './valuationdata.service';
import { ISortingExpression, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent } from 'igniteui-angular';
import { MetadataService } from 'src/app/core/metadata/metadata.service';
import { DatePipe } from '@angular/common';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-valuationdata',
  templateUrl: './valuationdata.component.html',
  styleUrls: ['./valuationdata.component.scss'],
})
export class ValuationdataComponent implements OnInit {
  startDate!: Date;
  todayDate: Date = new Date();
  valuationData: any[] = [];
  groupingExpressions: ISortingExpression[] = [];
  @ViewChild('ValuationData') ValuationData!: IgxGridComponent;
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private date_service: DateService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    public valuationDataService: ValuationdataService,
    private excelExportService: IgxExcelExporterService,
    public metaDataService: MetadataService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();

    // Minus one day to get the final start date
    const currentDateMinusOne = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1
    );

    //this.startDate = currentDateMinusOne;
    this.startDate = this.date_service.getDefaultDate();
    this.getValuationData();
  }

  getValuationData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const Date: any = new DateService().GetSpecficDateString(this.startDate);
    this.valuationDataService.getValuationData(Date).subscribe({
      next: (data) => {
        this.spinner.hide();
        const dateFields = ['ObservationDate', 'TradeDate', 'ExpirationDate'];
        const formattedData = this.formatDateFields(data, dateFields);
        this.valuationData = formattedData;
      },
      error: (err) => {
        this.valuationData = [];
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

  exportToExcel() {
    const confirmation = confirm(
      'Exporting large amounts of data can take some time. Do you wish to continue?'
    );
    if (!confirmation) return;     
    this.spinner.show();
    const specificDate: string = new DateService().GetSpecficDateString(this.startDate);
    // const currentDate = new Date().toISOString().replace(/T/gi, '_').split('.')[0];
    const currentDate: string = new Date().toISOString().replace(/T/gi, '_').split('.')[0].replace(/:/g, '');

    const pathName = `Valuation_Data_${specificDate}_${currentDate}`;

    try {
      // Call the export method
      this.excelExportService.export(
        this.ValuationData,
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
