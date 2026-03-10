import { Pipe, PipeTransform } from '@angular/core';
import { LegendItemBadgeMode } from 'igniteui-angular-core';

@Pipe({
  name: 'filterSub'
})
export class FilterSubPipe implements PipeTransform {
  transform(items: any[], security: any, counterparty: any,subCurrentSubstitutions:any[],subCurrentSecurities:any[],currentSecurities:any[],currentSubstitutions:any[],gridData:any[]): any[] {
    if (!items) {
      return items;
    }

    // Handle undefined/null security - treat as empty string for filtering
    const currentSecurity = security || '';

    let filteredItems = items.filter(item => {
      // Add null/undefined checks for arrays
      let exists = (subCurrentSubstitutions && subCurrentSubstitutions.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== currentSecurity))
        || (subCurrentSecurities && subCurrentSecurities.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== currentSecurity));
      
      let isCurrent = currentSecurities && currentSecurities.some((x:any) => { return x.Cusip === item.Cusip && x.Cusip !== currentSecurity });
      let isNew = currentSubstitutions && currentSubstitutions.some((x:any) => { return x.Cusip === item.Cusip && x.Cusip !== currentSecurity });
      
      if (counterparty==='') {
        return !(exists || isNew || isCurrent)
      }
      else{
        let inGrid = gridData && gridData.some((x:any) => { return x.CUSIP === item.Cusip && x.Counterparty === counterparty });
        
        return !(exists || isNew || isCurrent) && inGrid;
      }

    });

    return filteredItems;
  }

}
