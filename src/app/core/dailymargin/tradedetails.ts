export interface tradeDetails {
    ObservationDate:Date;
    InternalId:string;
    Tradetype:string;
    InstrumentType :string;
    Counterparty  :string;
    Entity  :string;
    TradeDate :Date;
    ExpirationDate :Date;
    BaseNotional: number;
    Units: number;
    InternalModel: number;
    CrossNotional : number;
    BaseCurrency :string;
    CrossCurrency :string;
    Price_BaseLeg: number;
    Price_CrossLeg: number;
  }