import { Component, OnInit } from '@angular/core';
import { RatingsService } from './ratings.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { DateService } from 'src/app/shared/services/dateService';
import { MetadataService } from 'src/app/core/metadata/metadata.service';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss'],
})
export class RatingsComponent implements OnInit {
  dataDate: Date = new Date();
  addressList: any[] = [];
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
  entitiesData: any[] = [];
  counterpartiesData: any[] = [];
  constructor(
    public ratingsService: RatingsService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    public metaDataService: MetadataService
  ) {}

  ngOnInit(): void {
    this.setMetaDataTable(['Outlook', 'Counterparty']);
    this.getRatings();
  }

  getRatings() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.ratingsService.getRatings().subscribe(
      (data: any) => {
        if (data.length === 0) {
          console.log('No Data found');
          this.entitiesData = [];
          this.counterpartiesData = [];
        } else {
          this.entitiesData = data.filter((item) => item.Counterparty == null);
          this.counterpartiesData = data.filter((item) => item.Entity == null);
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        this.toasterService.toast('Error occurred while fetching ratings');
        console.error('Error occurred while fetching ratings:', error);
      }
    );
  }

  saveRatings() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const combinedData = [...this.entitiesData, ...this.counterpartiesData];
    this.ratingsService.saveRatings(combinedData).subscribe(
      (data: any) => {
        console.log('Changes successfully saved');
        if (data) {
          this.toasterService.toast('Changes successfully saved');
          // Re-fetch the updated data after saving
          this.getRatings();
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        this.toasterService.toast('Error occurred while saving ratings');
        console.error('Error occurred while saving ratings:', error);
      }
    );
  }

  setMetaDataTable(names: string[]): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (!names) {
      names = this.metaDataTables;
    }
    this.ratingsService.setMetaDataTableList(names).subscribe((result: any) => {
      if (result) {
        this.MetaData = result;
        for (const key in result) {
          if (!this.MetaDataNames[key]) {
            this.MetaDataNames[key] = [];
          }
          for (const item of result[key]) {
            if (
              !this.MetaDataNames[key].some((x: any) => x.Name === item.Name)
            ) {
              this.MetaDataNames[key].push({ Name: item.Name });
            }
            this.spinner.hide();
          }
        }
        for (const name of names) {
          if (this.metaDataTables.includes(name) && this.MetaData[name]) {
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
            this.spinner.hide();
          }
        }
      } else {
        this.spinner.hide();
        this.MetaData = {};
        this.toasterService.toast(
          'Error occurred while fetching meta data tables'
        );
      }
    });
  }

  sendEmail() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let dataDate: any = new DateService().GetSpecficDateString(this.dataDate);
    console.log(this.addressList);
    this.ratingsService.sendEmail(this.addressList, dataDate).subscribe(
      (data) => {
        console.log(this.addressList, 'inside ');

        this.spinner.hide();
        this.toasterService.toast('Email sent successfully.');
      },
      (error) => {
        this.spinner.hide();
        this.toasterService.toast('Error sending email');
      }
    );
  }
}
