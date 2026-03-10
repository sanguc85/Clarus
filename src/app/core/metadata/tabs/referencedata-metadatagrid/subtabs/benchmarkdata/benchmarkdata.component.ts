import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IgxDialogComponent, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent, SortingDirection } from 'igniteui-angular';
import { DateService } from 'src/app/shared/services/dateService';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { BenchmarkdataService } from './benchmarkdata.service';
import { MetadataService } from 'src/app/core/metadata/metadata.service';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-benchmarkdata',
  templateUrl: './benchmarkdata.component.html',
  styleUrls: ['./benchmarkdata.component.scss'],
})
export class BenchmarkdataComponent implements OnInit, AfterViewInit {
  startDate!: Date;
  endDate!: Date;
  benchmarkData: any[] = [];
  @ViewChild(IgxGridComponent, { static: true }) grid: IgxGridComponent;
  NewBaseRate: any = {};
  rateTypes: any[] = [];
  rateList: string[] = ['FFR', 'LIBOR'];
  @ViewChild('benchMarkData') benchMarkData!: IgxGridComponent;
  @ViewChild('addBaseRateDialog')
  addBaseRateDialog!: IgxDialogComponent;
  newBaseRateForm!: FormGroup;
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private date_service: DateService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    public benchmarkDataService: BenchmarkdataService,
    private excelExportService: IgxExcelExporterService,
    public metaDataService: MetadataService
  ) {}

  ngOnInit(): void {
    this.newBaseRateForm = new FormGroup({
      DataDate: new FormControl('', Validators.required),
      RateType: new FormControl('', Validators.required),
      Rate: new FormControl('', Validators.required),
    });
    const currentDate = new Date();
    // Calculate one month ago
    const oneMonthAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      currentDate.getDate()
    );

    // Add one day to get the final start date
    const currentDatePlusOne = new Date(
      oneMonthAgo.getFullYear(),
      oneMonthAgo.getMonth(),
      oneMonthAgo.getDate() + 1
    );
    this.startDate = this.date_service.getPreviousMonthDate(currentDate);
    this.endDate = new Date();
    this.getBenchmarkData();
  }

  ngAfterViewInit() {
    // Set the default sorting direction for the "Date" column
    this.grid.sort({
      fieldName: 'Date',
      dir: SortingDirection.Desc,
      ignoreCase: true,
    });
  }

  getBenchmarkData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const startDate: any = new DateService().GetSpecficDateString(
      this.startDate
    );
    const endDate: any = new DateService().GetSpecficDateString(this.endDate);
    this.benchmarkDataService
      .getBenchmarkData(startDate, endDate, this.rateList)
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          const dateFields = ['Date'];
          const formattedData = this.formatDateFields(data, dateFields);
          this.benchmarkData = formattedData;
        },
        error: (err) => {
          this.benchmarkData = [];
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

  openBaseRateDialog() {
    this.addBaseRateDialog.open();
  }

  closeBaseRateDialog() {
    this.addBaseRateDialog.close();
    this.newBaseRateForm.reset();
    this.rateTypes = [];
  }

  saveNewBaseRate() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (this.newBaseRateForm.valid) {
      const newBaseRateData = this.newBaseRateForm.value;
      // Extract the date part from Date
      const date = new Date(newBaseRateData.DataDate);
      const datePart = date.toISOString().split('T')[0];

      // Update newSecurityPricesData with the date part
      newBaseRateData.DataDate = datePart;
      console.log(newBaseRateData);
      this.benchmarkDataService.saveNewBaseRate(newBaseRateData).subscribe(
        (data) => {
          this.spinner.hide();
          console.log('Changes successfully saved:', data);
          this.toasterService.toast('New Base Rate saved');
          this.getBenchmarkData();
          // Reset the form
          this.newBaseRateForm.reset();
          this.rateTypes = [];
          this.addBaseRateDialog.close();
        },
        (error) => {
          this.spinner.hide();
          this.toasterService.toast('Error saving Base Rate.');
          this.addBaseRateDialog.close();
          this.newBaseRateForm.reset();
          this.rateTypes = [];
        }
      );
    }
  }

  exportToExcel() {
    const confirmation = confirm("Exporting large amounts of data can take some time. Do you wish to continue?");
    if (!confirmation) return;
    this.spinner.show();
    const startDate: string = new DateService().GetSpecficDateString(this.startDate);
    const endDate: string = new DateService().GetSpecficDateString(this.endDate);

    const now = new Date();
    const currentDate = now.toISOString();
    const currentTime = currentDate.split('T')[1].split('.')[0].replace(/:/g, '');

    const pathName = `Benchmark_Data__${startDate}_${endDate}_${currentTime}`;

    try {
      // Call the export method
      this.excelExportService.export(
        this.benchMarkData,
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
