import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EntitydetailsComponent } from './entitydetails.component';
import { EntitydetailsModule } from './entitydetails.module';
import { EntitydetailsService } from './entitydetails.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';

const entitydetailsServiceMock: Partial<EntitydetailsService> = {
  setMetaDataTableList: () =>
    of({
      Entity: [{ Name: 'SBLIC' }, { Name: 'PIASA' }],
      Counterparty: [{ Name: 'BAC' }, { Name: 'NT' }],
      EntityAccountType: [{ Name: 'Cash' }, { Name: 'Margin' }],
      SnPOutlook: [{ Name: 'Stable' }],
      FitchOutlook: [{ Name: 'Stable' }],
      MoodysOutlook: [{ Name: 'Stable' }],
    }),
  getEntitySummary: () =>
    of([
      {
        Id: 1,
        Entity: 'SBLIC',
        Counterparty: 'BAC',
        CounterpartyDescription: 'Bank of America',
        Guarantor: 'BAC',
        ISDAStatus: 'Active',
        DocumentationType: 'ISDA',
        LEI: '5493001KJTIIGC8Y1R12',
        SignedDate: new Date().toISOString(),
        CSAStatus: 'Active',
      },
    ]),
  getEntityDetails: () =>
    of({
      Id: 1,
      Entity: 'SBLIC',
      Counterparty: 'BAC',
      LEI: '5493001KJTIIGC8Y1R12',
      Account: 'ACC-100',
      Custodian: 'Custodian-A',
      AccountType: 'Cash',
    }),
  getRatingsTable: () =>
    of([
      {
        Guarantor: 'BAC',
        Entity: 'SBLIC',
        SnPRating: 'A',
        SnPOutlook: 'Stable',
        SnPAsOfDate: new Date().toISOString(),
        MoodysRating: 'A2',
        MoodysOutlook: 'Stable',
        MoodysAsOfDate: new Date().toISOString(),
        FitchRating: 'A',
        FitchOutlook: 'Stable',
        FitchAsOfDate: new Date().toISOString(),
      },
    ]),
  getDeliveryInstructions: () => of({ CashWireABA: '', Notes: 'Default instruction' }),
  getEntityContacts: () =>
    of([
      {
        Position: 'Ops',
        Name: 'Alex Doe',
        PhoneNumber: '555-1000',
        Email: 'alex@example.com',
        Comment: 'Primary contact',
      },
    ]),
  saveData: () => of({}),
  saveDeliveryInstructions: () => of({}),
  saveContacts: () => of({}),
};

const meta: Meta<EntitydetailsComponent> = {
  title: 'Core/Entity Details',
  component: EntitydetailsComponent,
  decorators: [
    moduleMetadata({
      imports: [EntitydetailsModule, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: EntitydetailsService, useValue: entitydetailsServiceMock },
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
type Story = StoryObj<EntitydetailsComponent>;

export const Default: Story = {};