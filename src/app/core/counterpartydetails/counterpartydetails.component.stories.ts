import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { IgxExcelExporterService } from '@infragistics/igniteui-angular';
import { CounterpartydetailsComponent } from './counterpartydetails.component';
import { CounterpartydetailsModule } from './counterpartydetails.module';
import { CounterpartydetailsService } from './counterpartydetails.service';
import { RulesMetadataService } from '../metadata/tabs/rules-metadata/rules-metadata.service';
import { DateService } from 'src/app/shared/services/dateService';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';

const counterpartyServiceMock: Partial<CounterpartydetailsService> = {
  setMetaDataTableList: () =>
    of({
      Counterparty: [{ Name: 'BAC' }, { Name: 'NT' }],
      Party: [{ Name: 'Dealer' }],
      Country: [{ Name: 'US' }],
      Status: [{ Name: 'Active' }],
      AgreementType: [{ Name: 'ISDA' }],
      DocumentationLaw: [{ Name: 'NY' }],
      Currency: [{ Name: 'USD' }],
      DayCountConvention: [{ Name: '30/360' }],
      InterestBenchmark: [{ Name: 'SOFR' }],
      InterestCalculationMethod: [{ Name: 'Simple' }],
      MasterAgreementType: [{ Name: 'Master' }],
      ApplicableType: [{ Name: 'Applicable' }],
      IndexChangeType: [{ Name: 'IndexDisruption' }],
      DeterminingParty: [{ Name: 'Both' }],
      SettlementType: [{ Name: 'Cash' }],
      RepoType: [{ Name: 'Bilateral' }],
      CollateralType: [{ Name: 'Govt' }],
      Entity: [{ Name: 'SBLIC' }],
    }),
  getCounterpartySummary: () =>
    of([
      {
        Counterparty: 'BAC',
        Entity: 'SBLIC',
        Party: 'Dealer',
      },
    ]),
  getCounterpartyRating: () => of([{ Counterparty: 'BAC', SnPRating: 'A', MoodysRating: 'A2', FitchRating: 'A' }]),
  getCounterpartyDetails: () => of([{ Counterparty: 'BAC', Entity: 'SBLIC', Party: 'Dealer' }]),
  getAuthorizedProducts: () =>
    of([
      {
        Product: 'IRS',
        Name: 'USD-IRS',
        Underlyings: [{ MCA: true }],
      },
    ]),
  getDocument: () => of({ SignedDate: new Date().toISOString() }),
  getCounterpartyContacts: () => of([]),
  getDeliveryInstructions: () => of([]),
  getNotificationTimes: () => of([]),
  getEligibleAssets: () => of([]),
  getHaircut: () => of([]),
  getRatingsEvent: () => of({}),
  getRepoDetails: () => of([]),
};

const meta: Meta<CounterpartydetailsComponent> = {
  title: 'Core/Counterparty Details',
  component: CounterpartydetailsComponent,
  decorators: [
    moduleMetadata({
      imports: [CounterpartydetailsModule, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: CounterpartydetailsService, useValue: counterpartyServiceMock },
        { provide: RulesMetadataService, useValue: { getRules: () => of([]) } },
        DateService,
        DatePipe,
        DecimalPipe,
        PercentPipe,
        { provide: IgxExcelExporterService, useValue: { export: () => undefined } },
        { provide: SpinnerService, useValue: { show: () => undefined, hide: () => undefined } },
        {
          provide: CustomErrorHandler,
          useValue: {
            clearErrorList: () => undefined,
            handleErrorWithMessage: () => undefined,
          },
        },
        { provide: ToasterService, useValue: { toast: () => undefined } },
      ],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CounterpartydetailsComponent>;

export const Default: Story = {};