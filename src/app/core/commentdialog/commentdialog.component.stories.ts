import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { EventEmitter } from '@angular/core';
import { CommentdialogComponent } from './commentdialog.component';
import { CommentdialogModule } from './commentdialog.module';

const meta: Meta<CommentdialogComponent> = {
  title: 'Core/Comment Dialog',
  component: CommentdialogComponent,
  decorators: [
    moduleMetadata({
      imports: [CommentdialogModule],
    }),
  ],
  tags: ['autodocs'],
  args: {
    commentData: {
      Comment: 'Review complete. Ready for the next approval step.',
    },
    save: new EventEmitter<any>(),
    close: new EventEmitter<any>(),
  },
};

export default meta;
type Story = StoryObj<CommentdialogComponent>;

export const Default: Story = {};

export const EmptyComment: Story = {
  args: {
    commentData: {
      Comment: '',
    },
  },
};
