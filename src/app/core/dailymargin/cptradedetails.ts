export interface cpTradeDetails{
    DataDate:Date;
    AsOfDate?:Date; 
    TradeId:string;
    Counterparty:string;
    Entity:string;
    MarketValue?:Number;
    TradeDate?:Date;
    MaturityDate?:Date;
    Notional?:Number;}