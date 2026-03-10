import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  
  transform(securities: any[], counterparty: any,CurrentSecuritiesHeld:any[],collateralBalances:any[],currentMarginFilter:any): any[] {
    if (!securities || !counterparty) {
      return securities;
    }

    return securities.filter((element: any): boolean => {
      const exists = CurrentSecuritiesHeld.some((x: any) => {
        return x.Cusip === element.Cusip;
      });

      

      let inCollateralBalance = collateralBalances.some((x: any) => {
        return (x.CUSIP === element.Cusip || x.CUSIP === element.ISIN)
          && x.Counterparty === counterparty;
      });

      if (currentMarginFilter > 0) {
        inCollateralBalance = true;
      }

      return exists === false && inCollateralBalance === true;
    });
  }
}

@Pipe({
  name: 'spaceSeparated'
})
export class SpaceSeparatedPipe implements PipeTransform {
  transform(value: string): string {
    // Handle special cases
    if (value.includes('_')) {
      return value.split('_').join(' - ');
    }

    // Handle "Tradetype" specifically
    if (value.toLowerCase() === 'tradetype') {
      return 'Trade Type';
    }
    
    // Split the input string by uppercase letters
    const words = value.split(/(?=[A-Z])/);

    // Capitalize the first letter of each word and join them with a space
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: number): string {
    // Check if the value is negative
    const isNegative = value < 0;

    // Remove the negative sign for formatting
    const absoluteValue = Math.abs(value);

    // Format the absolute value with commas for thousands separator, four decimal places, and remove trailing zeros
    const formattedValue = absoluteValue.toLocaleString('en-US', {
      currency: 'USD', // Replace with your desired currency
      minimumFractionDigits: 4, // Minimum decimal places (set to 4 for your requirement)
      maximumFractionDigits: 4, // Maximum decimal places (4 for your requirement)
    });

    // Remove trailing zeros and the decimal point if there are no decimal places left
    const trimmedValue = formattedValue.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1");

    // Add back the negative sign if it was negative
    return isNegative ? `-${trimmedValue}` : trimmedValue;
  }
}


@Pipe({
  name: 'formatDateString'
})
export class FormatDateStringPipe implements PipeTransform {
  transform(value: number): string {
    // Handle special cases
    if (value.toString()=='0') {
      return 'T';
    }
    else if (value>0){
      return 'T+'+value.toString();
    }
    else{
      return '';
    }
  }
}

@Pipe({
  name: 'formatNumberTo2dp',
})
export class formatNumberTo2dp implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (value === 0) {
      return '0';
    }
    const formattedValue = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formattedValue.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1");
  }
}
