import { Component, OnInit, ViewChild } from '@angular/core';
import { DateService } from 'src/app/shared/services/dateService';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { CounterpartycollateralService } from './counterpartycollateral.service';
import { ISortingExpression, IgxExcelExporterOptions, IgxExcelExporterService, SortingDirection } from 'igniteui-angular';
import { Subject, takeUntil } from 'rxjs';
import { IgxGridComponent } from '@infragistics/igniteui-angular';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';

@Component({
  selector: 'app-counterpartycollateral',
  templateUrl: './counterpartycollateral.component.html',
  styleUrls: ['./counterpartycollateral.component.scss'],
})
export class CounterpartycollateralComponent implements OnInit {
  Path: string = 'Clarus > Counterparty Collateral';
  todayDate: Date = this.date_service.GetTodayDate();
  defaultDate!: Date;
  unsubscribe$: Subject<any> = new Subject();
  Counterparty: string = '';
  Entity: string = '';
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
  contentTab = 'collateral';
  gridData!: any[];
  group!: ISortingExpression[];
  CounterpartyCollateralData!: any[];
  CounterPartyExposureData!: any[];
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  @ViewChild('grid') grid!: IgxGridComponent;
  public sortingExpressions = [
    { fieldName: 'Counterparty', dir: SortingDirection.Asc },
  ];
  constructor(
    private counterpartycollateralservice: CounterpartycollateralService,
    private date_service: DateService,
    private spinner: SpinnerService,
    private excelExportService: IgxExcelExporterService,
    readonly toasterService: ToasterService,
    readonly errorHandler: CustomErrorHandler,
  ) {}

  ngOnInit(): void {
    this.errorHandler.clearErrorList();
    let sessionDate = this.getSelectedDate();
    this.defaultDate = sessionDate ? sessionDate : new Date();
    this.setMetaDataTable(['Entity', 'Counterparty']);
    this.getData();
  }

  getSelectedDate(): Date {
    const storedDate = sessionStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : null;
  }

  getData() {
    this.spinner.show();
    let dataDate = new DateService().GetSpecficDateString(this.defaultDate);
    if (this.contentTab == 'collateral') {
      this.spinner.show();
      this.counterpartycollateralservice
        .getCollateralDetails(dataDate, this.Counterparty, this.Entity)
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              const dateFields = ['DataDate'];
              const formattedData = this.formatDateFields(result, dateFields);
              this.CounterpartyCollateralData = formattedData;
            } else {
              this.CounterpartyCollateralData = [];
              this.toasterService.toast('No Data Found');
            }
            this.spinner.hide();
          },
          (err: any) => {
            this.CounterPartyExposureData = [];
            this.errorHandler.handleErrorWithMessage(err, 'Error fetching collateral data');
            this.spinner.hide();
          },
          () => {
            this.spinner.hide();
          }
        );
    } else {
      this.spinner.show();
      this.counterpartycollateralservice
        .getExposureData(dataDate, this.Counterparty, this.Entity)
        .subscribe(
          (result: any) => {
            if (result.length > 0) {
              const dateFields = ['DataDate', 'TradeDate', 'MaturityDate'];
              const formattedData = this.formatDateFields(result, dateFields);
              this.CounterPartyExposureData = formattedData;
            } else {
              this.CounterPartyExposureData = [];
              this.toasterService.toast('No Data Found');
            }
            this.spinner.hide();
          },
          (err: any) => {
            this.CounterPartyExposureData = [];
            this.errorHandler.handleErrorWithMessage(err, 'Error fetching exposure data');
            this.spinner.hide();
          },
          () => {
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

  onDateChange() {
    let formattedDate: any = new DateService().GetSpecficDateString(this.defaultDate);
    this.date_service.setDate(formattedDate);
  }

  onTabChange(tabName: string): void {
    this.contentTab = tabName;
    this.errorHandler.clearErrorList();
    this.getData();
  }

  exportData() {
    this.errorHandler.clearErrorList();
    var pathName = 'CounterPartyCollateral_' + this.date_service.FormatDateToISO(this.defaultDate) + '_';
    var date = new Date().toISOString().replace(/T/gi, '_').split('.')[0];
    this.excelExportService.export(
      this.grid,
      new IgxExcelExporterOptions((pathName + date).replace(/\-|:|\s/gi, ''))
    );
  }

  setMetaDataTable(names: string[]): void {
    this.spinner.show();
    if (!names) {
      names = this.metaDataTables;
    }
    this.counterpartycollateralservice.setMetaDataTableList(names).subscribe((result: any) => {
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
}
