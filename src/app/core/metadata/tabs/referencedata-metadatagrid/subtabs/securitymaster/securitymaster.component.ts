import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { SecuritymasterService } from './securitymaster.service';
import { NgForm } from '@angular/forms';
import { IgxDialogComponent, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent } from 'igniteui-angular';
import { SecuritypricesService } from '../securityprices/securityprices.service';
import { MetadataService } from 'src/app/core/metadata/metadata.service';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
import { DateService } from 'src/app/shared/services/dateService';
@Component({
  selector: 'app-securitymaster',
  templateUrl: './securitymaster.component.html',
  styleUrls: ['./securitymaster.component.scss'],
})
export class SecuritymasterComponent implements OnInit {
  currentSecurities: any[] = [];
  filteredSecurities: any[] = [];
  @ViewChild('securityMaster') securityMaster!: IgxGridComponent;
  @ViewChild('addOrRemoveSecurityMasterDialog')
  addOrRemoveSecurityMasterDialog!: IgxDialogComponent;
  @ViewChild('securityMasterForm') securityMasterForm: NgForm;
  selectedCouponPayments: any[] = [];
  selectedSecurityCusip: string = '';
  showCouponPanel: boolean = false;
  cusipSearch: string = '';
  securityMasterData: any[] = [];
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    private securityMasterService: SecuritymasterService,
    public securityPricesService: SecuritypricesService,
    private excelExportService: IgxExcelExporterService,
    public metaDataService: MetadataService,
    private dateService: DateService
  ) {}
  ngOnInit(): void {
    this.getSecurityMaster();
  }

  openCouponDialog(rowData: any) {
  if (!rowData) return;
  const couponPayments = rowData?.AdditionalDataObj?.CouponPayment || [];

  if (!couponPayments.length) {
    // Close the panel if it's currently open and user clicks on item with 0 payments
    this.showCouponPanel = false;
    return;
  }
  
  this.selectedCouponPayments = couponPayments;
  this.selectedSecurityCusip = rowData?.Cusip || '';
  this.showCouponPanel = true;
}

closeCouponPanel() {
  this.showCouponPanel = false;
}

  getSecurityMaster() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.securityMasterService.getSecurityMastersData().subscribe({
      next: (data: any) => {
        this.spinner.hide();
        const dateFields = ['IssueDate', 'MaturityDate', 'OriginalBuildDate'];
        const formattedData = this.formatDateFields(data, dateFields);
        this.securityMasterData = formattedData;
      },
      error: (err) => {
        this.securityMasterData = [];
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

  public openSecurityMasterDialog() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.securityPricesService.getAllSecurityMaster().subscribe(
      (data: any) => {
        if (data) {
          this.currentSecurities = data;
          this.filteredSecurities = [...this.currentSecurities];
        } else {
          this.currentSecurities = [];
          this.filteredSecurities = [];
        }
        this.spinner.hide();
        this.addOrRemoveSecurityMasterDialog.open();
      },
      (error: any) => {
        this.toasterService.toast(
          'Unknown error occurred.Failed to get current securitites'
        );
        this.spinner.hide();
        this.addOrRemoveSecurityMasterDialog.close();
        this.cusipSearch = '';
        this.currentSecurities = [];
      }
    );
  }

  // Add a function to handle filtering based on cusipSearch
  applyFilter() {
    const searchValue = this.cusipSearch.toLowerCase();
    this.filteredSecurities = this.currentSecurities.filter((item) =>
      item.Cusip.toLowerCase().includes(searchValue)
    );
  }

  closeSecurityMasterDialog() {
    this.addOrRemoveSecurityMasterDialog.close();
    this.cusipSearch = '';
    this.currentSecurities = [];
  }

  saveSecurityMaster() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    const confirmation = confirm(
      'Are you sure you wish to save these securities?'
    );
    if (!confirmation) {
      this.spinner.hide();
      return;
    }
    this.securityMasterService
      .saveSecurityMaster(this.currentSecurities)
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.getSecurityMaster();
          this.toasterService.toast('Security Master saved');
          // Reset the form
          this.cusipSearch = '';
          this.currentSecurities = [];
          this.addOrRemoveSecurityMasterDialog.close();
        },
        (error) => {
          this.spinner.hide();
          this.toasterService.toast('Error saving Security Master.');
          this.addOrRemoveSecurityMasterDialog.close();
          this.cusipSearch = '';
          this.currentSecurities = [];
        }
      );
  }

  exportToExcel() {
    const confirmation = confirm(
      'Exporting large amounts of data can take some time. Do you wish to continue?'
    );
    if (!confirmation) return;
    this.spinner.show();
    try {
      const visibleHeaders = this.getVisibleColumnHeaders();
      if (!visibleHeaders.length) {
      this.toasterService.toast('No visible columns to export.');
      return;
    }
      const exportData = this.securityMasterData.map(item => {
        const row: any = {};
        visibleHeaders.forEach(header => {
          const mapper = this.excelColumnMap[header];
          if (mapper) {
            row[header] = mapper(item);
          }
        });
        return row;
      });

      const fileName = `Security_Master_${this.dateService.getDateAsString(new Date())}`;

      const options = new IgxExcelExporterOptions(fileName);
      options.columnWidth = 25;

    this.excelExportService.exportData(exportData, options);

      this.toasterService.toast('File exported successfully.');
    } catch (e) {
      console.error(e);
      this.toasterService.toast('Export failed.');
    } finally {
      this.spinner.hide();
    }
  }
  private safeDate(value: any): string {
  return value ? this.dateService.getDateAsString(value) : '';
}

  private getVisibleColumnHeaders(): string[] {
  if (!this.securityMaster?.columns) {
    return [];
  }
  return this.securityMaster.columns
    .filter(col => !col.hidden && !!col.header && this.excelColumnMap[col.header])
    .map(col => col.header as string);
  }

  private excelColumnMap: Record<string, (item: any) => any> = {
    'Cusip': i => i.Cusip,
    'ISIN': i => i.ISIN,
    'Security': i => i.SecurityName,
    'Type': i => i.SecurityType,
    'Type 2': i => i.AdditionalDataObj?.SecurityType2 ?? '',
    'Issue Date': i => i.IssueDate,
    'Maturity': i => i.MaturityDate,
    'TotalPar': i => i.AdditionalDataObj?.TotalPar ?? '',
    'Coupon': i => i.CouponRate,
    'Previous Coupon Date': i => this.safeDate(i.AdditionalDataObj?.PrevCouponDate),
    'Next Coupon Date': i => this.safeDate(i.AdditionalDataObj?.NextCouponDate),
    'Day Convention': i => i.AdditionalDataObj?.DayConvention ?? '',
    'Issuer': i => i.AdditionalDataObj?.Issuer ?? '',
    'Security Desc': i => i.AdditionalDataObj?.SecurityDescription ?? '',
    'Market Sector': i => i.AdditionalDataObj?.MarketSector ?? '',
    'Min Increment': i => i.MinIncrement,
    'Min Piece Size': i => i.MinPieceSize,
    'Currently Pledged': i => i.CurrentlyPledgedAsset ? 'Yes' : 'No',
    'Build Date': i => i.OriginalBuildDate
  };
}
