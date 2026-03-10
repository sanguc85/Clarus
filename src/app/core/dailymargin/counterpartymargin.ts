export interface counterpartyMargin {
    Id?:number;
    DataDate:Date;
    AsOfDate:Date;
    Counterparty:string;
    Entity:string;
    Party:string;
    Portfolio:string;
    Exposure?:number;
    ThresholdAmount?:number;
    CollateralizedMTM?:number;
    CollateralValue ?:number;
    MinTransfer?:number;
    RoundingAmount?:number;
    MarginCalculation?:number;
    TotalMargin?:number;
}