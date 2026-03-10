import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Documentation/Storybook Index',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => ({
    template: `
      <section style="font-family: Arial, sans-serif; padding: 16px; max-width: 720px;">
        <h2 style="margin: 0 0 12px;">ClarusUI Storybook</h2>
        <p style="margin: 0 0 16px; color: #444;">
          Component stories currently implemented for core screens.
        </p>
        <ul style="line-height: 1.9; margin: 0; padding-left: 20px;">
          <li><a href="?path=/story/core-entity-details--default">Entity Details</a></li>
          <li><a href="?path=/story/core-counterparty-details--default">Counterparty Details</a></li>
        </ul>
      </section>
    `,
  }),
};
