import { IColumnPipeArgs } from "@infragistics/igniteui-angular";

export const TIMEZOME_LOCAL = 'local';
export const YEAR_MONTH_DAY_FORMAT = 'yyyy-MM-dd';
export const YEAR_MONTH_DAY_FORMAT_WITH_TIME = `${YEAR_MONTH_DAY_FORMAT} HH:mm:ss`;

export const YEAR_MONTH_DAY_PIPE: IColumnPipeArgs = {
  format: YEAR_MONTH_DAY_FORMAT,
  timezone: TIMEZOME_LOCAL
};
export const YEAR_MONTH_DAY_PIPE_WITH_TIME: IColumnPipeArgs = {
  format: YEAR_MONTH_DAY_FORMAT_WITH_TIME,
  timezone: TIMEZOME_LOCAL
};
export const EmailDialogConstants = {
    NoCPMailId: "No email id found"
 }
 export const MIRecepients="Subscribers.MonthlyInterest"
 export const EstimatedMovementRecipients="Subscribers.CashCollateralMovements"
 export const ESTIMATED_MOVEMENT_TAB="estimatedMovement"
 export const SourceMV_Internal="Internal Valuation"
 export const SourceMV_Counterparty="Counterparty MV"
 export const STATUS = {
  Terminated: 'Terminated'
};
export const POSITION = {
  Settlement: 'Settlement',
  Collateral: 'Collateral',
};

export const DEFAULT_ERROR_MESSAGE = 'Unknown error occurred. Failed to get data';

export const RULE_NAMES = {
  SecurityNameMap: 'SecurityNameMap'
};
export const COUPON_INTEREST_TAB="SecurityCoupon"