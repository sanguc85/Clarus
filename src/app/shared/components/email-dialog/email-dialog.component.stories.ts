import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { SharedComponentsModule } from '../../shared-components/shared-components.module';
import { EmailDialogComponent } from './email-dialog.component';

const meta: Meta<EmailDialogComponent> = {
  title: 'Shared/Email Dialog',
  component: EmailDialogComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedComponentsModule],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    cancel: { action: 'cancel' },
    submit: { action: 'submit' },
  },
  args: {
    title: 'Send Monthly Interest Report',
    recipients: [
      { email: 'ops.team@example.com' },
      { email: 'risk.reviewer@example.com' },
    ],
    noEmailMessage: '',
    visible: true,
    loading: false,
    commentsLabel: 'Comments',
    commentsMinLength: 5,
  },
};

export default meta;
type Story = StoryObj<EmailDialogComponent>;

export const Default: Story = {};

export const NoRecipientsMessage: Story = {
  args: {
    recipients: [],
    noEmailMessage: 'No recipient emails are available for this counterparty.',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
