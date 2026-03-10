import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent } from 'igniteui-angular';
import { DateService } from 'src/app/shared/services/dateService';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { HistoryService } from './history.service';
import { ActivatedRoute, Router } from '@angular/router';

  
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

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
    IndexChangeType: [
      'IndexCancellation',
      'IndexDisruption',
      'IndexModification',
    ],
  };

  startDate!: Date;
  endDate!: Date;
  contentTab: string = 'DailyMargin';
  referenceTableList!: string[];
  referenceTable!: string;
  grid!: IgxGridComponent;

  auditData: any[] = [];
  gridColumns: { field: string; header: string }[] = []

  constructor(private dateService: DateService,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService, readonly errorHandler: CustomErrorHandler, readonly toasterService: ToasterService,
    private historyService: HistoryService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.startDate = new Date();
    //this.endDate = new Date();
    this.endDate =new Date(this.dateService.AddNDays(new Date(), 1));
    this.referenceTableList = this.metaDataTables;
    this.referenceTable = this.metaDataTables[0];
    this.getData();
  }

  onDateChange() {
    if (this.endDate < this.startDate) {
      this.endDate = this.startDate;
    }
  }

  getData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let startDate: any = new DateService().GetSpecficDateString(this.startDate);
    let endDate: any = new DateService().GetSpecficDateString(this.endDate);

    let table = this.contentTab;
    if (table === 'ReferenceData') {
      table = this.referenceTable;
    }
    this.historyService.getAudit(startDate, endDate, table).subscribe(
      (data: any[]) => {
        this.spinner.hide();
        this.auditData = data;
        if(table === 'CollateralMovements') {
          this.auditData = this.auditData.map((movement: any) => {
            return {
              ...movement,
              Substitution: movement.Substitution ? 'Yes' : 'No'
            };
          });
        }
        else if (table === 'MCA') {
          this.auditData = this.auditData.map((MCADet: any) => {
            return {
              ...MCADet,
              FuturesPriceValuation: MCADet.FuturesPriceValuation === '' || MCADet.FuturesPriceValuation === 'null' || MCADet.FuturesPriceValuation === null ? 'Refer To Doc.' : MCADet.FuturesPriceValuation === true || MCADet.FuturesPriceValuation === 1 ? 'Applicable' : 'Not Applicable',
              ExchangeTradedContract: MCADet.ExchangeTradedContract === '' || MCADet.ExchangeTradedContract === 'null' || MCADet.ExchangeTradedContract === null ? 'Refer To Doc.' : MCADet.ExchangeTradedContract === true || MCADet.ExchangeTradedContract === 1 ? 'Applicable' : 'Not Applicable',
              AveragingDateDisruption: MCADet.AveragingDateDisruption === '' || MCADet.AveragingDateDisruption === 'null' || MCADet.AveragingDateDisruption === null ? 'Refer To Doc.' : MCADet.AveragingDateDisruption === true || MCADet.AveragingDateDisruption === 1 ? 'Applicable' : 'Not Applicable',
              AutomaticExercise: MCADet.AutomaticExercise === '' || MCADet.AutomaticExercise === 'null' || MCADet.AutomaticExercise === null ? 'Refer To Doc.' : MCADet.AutomaticExercise === true || MCADet.AutomaticExercise === 1 ? 'Applicable' : 'Not Applicable',
              ChangeInLaw: MCADet.ChangeInLaw === '' || MCADet.ChangeInLaw === 'null' || MCADet.ChangeInLaw === null ? 'Refer To Doc.' : MCADet.ChangeInLaw === true || MCADet.ChangeInLaw === 1 ? 'Applicable' : 'Not Applicable',
              IndexSponsorDisruption: MCADet.IndexSponsorDisruption === '' || MCADet.IndexSponsorDisruption === 'null' || MCADet.IndexSponsorDisruption === null ? 'Refer To Doc.' : MCADet.IndexSponsorDisruption === true || MCADet.IndexSponsorDisruption === 1 ? 'Applicable' : 'Not Applicable',
              HedgingDisruption: MCADet.HedgingDisruption === '' || MCADet.HedgingDisruption === 'null' || MCADet.HedgingDisruption === null ? 'Refer To Doc.' : MCADet.HedgingDisruption === true || MCADet.HedgingDisruption === 1 ? 'Applicable' : 'Not Applicable',
              IncreasedCostOfHedging: MCADet.IncreasedCostOfHedging === '' || MCADet.IncreasedCostOfHedging === 'null' || MCADet.IncreasedCostOfHedging === null ? 'Refer To Doc.' : MCADet.IncreasedCostOfHedging === true || MCADet.IncreasedCostOfHedging === 1 ? 'Applicable' : 'Not Applicable',
              LossOfStockBorrow: MCADet.LossOfStockBorrow === '' || MCADet.LossOfStockBorrow === 'null' || MCADet.LossOfStockBorrow === null ? 'Refer To Doc.' : MCADet.LossOfStockBorrow === true || MCADet.LossOfStockBorrow === 1 ? 'Applicable' : 'Not Applicable',
              IncreasedCostOfStockBorrow: MCADet.IncreasedCostOfStockBorrow === '' || MCADet.IncreasedCostOfStockBorrow === 'null' || MCADet.IncreasedCostOfStockBorrow === null ? 'Refer To Doc.' : MCADet.IncreasedCostOfStockBorrow === true || MCADet.IncreasedCostOfStockBorrow === 1 ? 'Applicable' : 'Not Applicable',
              NonReliance: MCADet.NonReliance === '' || MCADet.NonReliance === 'null' || MCADet.NonReliance === null ? 'Refer To Doc.' : MCADet.NonReliance === true || MCADet.NonReliance === 1 ? 'Applicable' : 'Not Applicable'
              
            };
          });
        }
        
      },
      (error: any) => {
        this.auditData = [];
        this.spinner.hide();
      }
    );
  }

  onTabChange(tabName: string): void {
    this.contentTab = tabName;
    this.getData();
  }

  onReferenceTableChange() {
    this.getData();
  }
  handleGridReady(grid: IgxGridComponent) {
    this.grid = grid;
  }
  exportData(): void {
    const c = confirm(
      'Exporting large amounts of data can take some time. Do you wish to continue?'
    );
    if (!c) {
      return;
    }

    const pathName =
      'audit_' +
      this.startDate.toISOString().split('T')[0] +
      '_';
    const date = new Date()
      .toISOString()
      .replace(/T/gi, '_')
      .split('.')[0];

    this.excelExportService.export(
      this.grid,
      new IgxExcelExporterOptions((pathName + date).replace(/\-|:|\s/gi, ''))
    );
  }

}
