import { Component, OnInit,ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { DefaultSortingStrategy, ISortingExpression, SortingDirection } from 'igniteui-angular';
import { IgxDialogComponent,IgxSelectComponent,IGridCellEventArgs,ISelectionEventArgs, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent, IgxToastComponent, IgxTreeGridComponent,IgxDatePickerComponent  } from '@infragistics/igniteui-angular';
import { DatePipe,DecimalPipe } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { DateService } from 'src/app/shared/services/dateService';
import { SubstitutionService } from './substitution.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup,FormControl,NgModel,Validators } from '@angular/forms';
import { substitutionDetails } from './substitutiondetails';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { IColumnPipeArgs} from '@infragistics/igniteui-angular';
import { YEAR_MONTH_DAY_PIPE,YEAR_MONTH_DAY_PIPE_WITH_TIME } from 'src/app/shared/constants';
@Component({
  selector: 'app-substitution',
  templateUrl: './substitution.component.html',
  styleUrls: ['./substitution.component.scss']
})
export class SubstitutionComponent implements OnInit {

  NewSecurity:any ={};
  NewSecurityForm!: FormGroup;
  CurrentSecurityForm!: FormGroup;
  SubstitutionForm!: FormGroup;
  decimalPipe: DecimalPipe = new DecimalPipe('en-US');
  contentTab = 'Securities';
  hasCash!:boolean;
  selectedDate!: Date;
  dtDate!: string;
  todayDate: Date = this.date_service.GetTodayDate();
  gridData!:any[];
  substitutionDetails!:substitutionDetails;
  securityData!:any[];
  currentSecurity: any={};
  currentSubstitutions: any =[];
  substitution !:any;
  newSecurity:any={};
  recentRequests !: any[];
  group!: ISortingExpression[];
  currentSecurities !: any [];
  securityList !:any [];
  cusipList!:any[];
  // list of currently checked CUSIPs (flat list)
  checkedCusipList: string[] = [];
  // Track last selected Counterparty/Entity for checkbox grouping
  lastSelectedCounterparty: string = '';
  lastSelectedEntity: string = '';
  exportButtonDisabled: boolean = false;
  mvCalculated: boolean = false;
  
  // CUSIP search functionality properties
  securitySearchTerms: { [index: number]: string } = {};
  showSecurityDropdowns: { [index: number]: boolean } = {};
  filteredSecurityLists: { [index: number]: any[] } = {};
  
  // Search terms for substitution section
  substitutionSearchTerms: { [index: number]: string } = {};
  showSubstitutionDropdowns: { [index: number]: boolean } = {};
  filteredSubstitutionLists: { [index: number]: any[] } = {};

  // Cache for filtered items to improve performance
  private cachedFilteredSecurityItems: { [index: number]: any[] } = {};
  private cachedFilteredSubstitutionItems: { [index: number]: any[] } = {};
  private lastFilterTimestamp: { [key: string]: number } = {};

  
  @ViewChild('grid') grid!: IgxGridComponent;
  @ViewChild('grid1') recentRequestsGrid!: IgxGridComponent;
  public datePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE;
  public dateTimePipeArgs: IColumnPipeArgs = YEAR_MONTH_DAY_PIPE_WITH_TIME;
  constructor(
    private date_service: DateService,
    private datepipe: DatePipe,
    private substitutionService: SubstitutionService,
    private formBuilder: FormBuilder,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    private cdr: ChangeDetectorRef
  ) {
    this.CurrentSecurityForm = this.formBuilder.group({});
    this.SubstitutionForm = this.formBuilder.group({});
    this.NewSecurityForm = this.formBuilder.group({});
    this.addCusipControl('Cusip');
  }

  addCusipControl(controlName: string) {
    this.NewSecurityForm.addControl(controlName, this.formBuilder.control('', Validators.required));
  }

  isSelectDisabled(security: any): boolean {
    return !security.ProduceTransactions; // Disable when ProduceTransactions is false
  }

  // Custom validator to check if par value is greater than or equal to minimum piece size
  minPieceSizeValidator(minPieceSize: number, cusip?: string) {
    return (control: any) => {
      if (!control.value || !minPieceSize) {
        return null; // Don't validate if no value or no min piece size
      }
      const value = parseFloat(control.value);
      // For non-cash CUSIPs, use absolute value for comparison
      const compareValue = cusip === 'CASH' ? value : Math.abs(value);
      return compareValue < minPieceSize ? { minPieceSize: { actualValue: value, requiredValue: minPieceSize } } : null;
    };
  }

  // Custom validator to check if par value is a multiple of minimum increment
  minIncrementValidator(minIncrement: number) {
    return (control: any) => {
      if (!control.value || !minIncrement) {
        return null; // Don't validate if no value or no min increment
      }
      const value = parseFloat(control.value);
      
      // Use division approach to avoid floating-point modulo issues
      const quotient = value / minIncrement;
      const roundedQuotient = Math.round(quotient);
      
      // Use a small tolerance for floating-point precision
      const tolerance = 0.0001;
      const isMultiple = Math.abs(quotient - roundedQuotient) < tolerance;
      
      return isMultiple ? null : { minIncrement: { actualValue: value, requiredIncrement: minIncrement } };
    };
  }

  // Custom validator to check if par value sign matches face/market value sign
  signMatchValidator(security: any) {
    return (control: any) => {
      if (!control.value) {
        return null; // Don't validate if no value
      }
      const parValue = parseFloat(control.value);
      
      // Get reference values (face value or market value)
      const faceValue = security.ParValue || 0;
      const marketValue = this.getMV(security) || 0;
      
      // Use face value as primary reference, fall back to market value
      const referenceValue = faceValue !== 0 ? faceValue : marketValue;
      
      if (referenceValue === 0) {
        return null; // Don't validate if no reference value
      }
      
      // Check if signs match
      const parValueSign = parValue >= 0 ? 1 : -1;
      const referenceSign = referenceValue >= 0 ? 1 : -1;
      
      return parValueSign === referenceSign ? null : { signMismatch: { parValue, referenceValue } };
    };
  }

  // Build form controls for substitutions with validators
  buildSubstitutionFormControls() {
    // Clear existing controls
    Object.keys(this.SubstitutionForm.controls).forEach(key => {
      if (key.startsWith('subParValue') || key.startsWith('substitutionCusip') || 
          key.startsWith('subCheck') || key.startsWith('subCollateralCheck')) {
        this.SubstitutionForm.removeControl(key);
      }
    });

    // Add controls for each substitution
    for (let i = 0; i < this.currentSubstitutions.length; i++) {
      this.SubstitutionForm.addControl('substitutionCusip' + i, this.formBuilder.control(''));
      this.SubstitutionForm.addControl('subCheck' + i, this.formBuilder.control(''));
      this.SubstitutionForm.addControl('subCollateralCheck' + i, this.formBuilder.control(''));
      
      // Add validators including minimum piece size and increment validation
      const validators = [Validators.required];
      if (this.currentSubstitutions[i].MinPieceSize) {
        validators.push(this.minPieceSizeValidator(this.currentSubstitutions[i].MinPieceSize,this.currentSubstitutions[i].Cusip));
      }
      if (this.currentSubstitutions[i].MinIncrement) {
        validators.push(this.minIncrementValidator(this.currentSubstitutions[i].MinIncrement));
      }
      this.SubstitutionForm.addControl('subParValue' + i, this.formBuilder.control('', validators));
      
      // Set initial values
      this.SubstitutionForm.controls['subParValue' + i]?.setValue(this.currentSubstitutions[i].SubstitutionParValue);
      this.SubstitutionForm.controls['subCheck' + i]?.setValue(this.currentSubstitutions[i].ProduceTransactions);
      this.SubstitutionForm.controls['subCollateralCheck' + i]?.setValue(this.currentSubstitutions[i].IsCollateralEligible);
      this.SubstitutionForm.controls['substitutionCusip' + i]?.setValue(this.currentSubstitutions[i].Cusip);
    }
  }
  
  // Build form controls for current securities with validators
  buildCurrentSecurityFormControls() {
    // Clear existing controls
    Object.keys(this.CurrentSecurityForm.controls).forEach(key => {
      if (key.startsWith('secParValue') || key.startsWith('securityCusip')) {
        this.CurrentSecurityForm.removeControl(key);
      }
    });

    // Add controls for each current security
    for (let i = 0; i < this.currentSecurities.length; i++) {
      this.CurrentSecurityForm.addControl('securityCusip' + i, this.formBuilder.control(''));
      
      // Add validators including minimum piece size, increment, and sign validation
      const validators = [Validators.required];
      if (this.currentSecurities[i].MinPieceSize) {
        validators.push(this.minPieceSizeValidator(this.currentSecurities[i].MinPieceSize, this.currentSecurities[i].Cusip));
      }
      if (this.currentSecurities[i].MinIncrement) {
        validators.push(this.minIncrementValidator(this.currentSecurities[i].MinIncrement));
      }
      // Add sign matching validator
      validators.push(this.signMatchValidator(this.currentSecurities[i]));
      this.CurrentSecurityForm.addControl('secParValue' + i, this.formBuilder.control('', validators));
      
      // Set initial values
      this.CurrentSecurityForm.controls['secParValue' + i]?.setValue(this.currentSecurities[i].SubstitutionParValue);
      this.CurrentSecurityForm.controls['securityCusip' + i]?.setValue(this.currentSecurities[i].Cusip);
    }
  }
  
  addDynamicControl(controlName: string,formname:string,validate:boolean) {
    const dynamicValidator = Validators.pattern(/^\-[0-9]+(\.[0-9]+)?$/);
    if(formname==='CurrentSecurityForm'){
      if(validate){
        this.CurrentSecurityForm = this.formBuilder.group({
          [controlName]: ['', [Validators.required,dynamicValidator]],
        });
      }
      else
        this.CurrentSecurityForm = this.formBuilder.group({[controlName]: [''],});
      //this.CurrentSecurityForm.addControl(controlName, new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]+)?$')]));
    }
    else{
      if(validate){
        this.SubstitutionForm = this.formBuilder.group({
          [controlName]: ['', [Validators.required,dynamicValidator]],
        });
      }
      else
        this.SubstitutionForm = this.formBuilder.group({[controlName]: [''],});
      //this.SubstitutionForm.addControl(controlName, new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]+)?$')]));   
    }
  }
  ngOnInit(): void {
    let sessionDate=this.getSelectedDate();
    this.selectedDate =sessionDate?sessionDate: new Date();
    // this.date_service.selectedDate$.subscribe(date => {
    //   this.selectedDate = date;
    // });
    this.dtDate = new DateService().GetSpecficDateString(this.selectedDate);
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    this.group = [
      {
        dir: SortingDirection.Asc, fieldName: 'Counterparty', ignoreCase: false,
        strategy: DefaultSortingStrategy.instance()
      }
    ];
    this.getData();
    this.refreshRequests();
  }
  getSelectedDate(): Date {
    const storedDate = sessionStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : null;
  }
  onDateChange() {
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    this.date_service.setDate(formattedDate);
    sessionStorage.setItem('selectedDate', this.selectedDate.toISOString());
  }

  onCheck(cell:any){
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    let cp=cell.row.data.Counterparty;
    let entity=cell.row.data.Entity;
    let cusip= cell.row.data.CUSIP;
    if(cell.row.data.Substitution)
    {
      cell.row.data.changed = 1;
    }
    
    cell.row.data.changed = cell.row.data.changed == 1 ? 0 : 1;
    this.newSecurity={};
    if(cell.row.data.changed) {
      // If checking a row with a different Counterparty/Entity than last time, uncheck all other rows
      if (cp !== this.lastSelectedCounterparty || entity !== this.lastSelectedEntity) {
        // Uncheck all rows in the grid using grid data
        if (this.grid && this.grid.data && this.grid.data.length > 0) {
          this.grid.data.forEach((row: any) => {
            if (row.changed === 1 && (row.Counterparty !== cp || row.Entity !== entity)) {
              row.Substitution = 0;
              row.changed = 0;
            }
          });
          this.cdr.detectChanges();
        }
        // Clear flat checked list
        this.checkedCusipList = [];
        this.lastSelectedCounterparty = cp;
        this.lastSelectedEntity = entity;
      }
      // add to flat checked list if not present
      if (this.checkedCusipList.indexOf(cusip) === -1) {
        this.checkedCusipList.push(cusip);
      }
      this.getCusips(cp, entity);
      this.setCurrentSecurity(cp, entity, this.checkedCusipList);
    } 
    else {
      // remove from flat checked list
      const idx = this.checkedCusipList.indexOf(cusip);
      if (idx !== -1) { this.checkedCusipList.splice(idx, 1); }
      this.getCusips(cp, entity);
      this.setCurrentSecurity(cp, entity, this.checkedCusipList);
    } 
    

  }

  setCurrentSecurity(cp:string, entity:string, cusipList :string[])
  {
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    this.hasCash = false;
    this.currentSecurity = {
        Counterparty: cp,
        Entity: entity,
        DataDate: formattedDate
    };
    this.substitutionService.getFullSubstitution(formattedDate,cp).subscribe((result: any) => {
      if(result){
        this.currentSecurities = result.CurrentSecurities || [];
        this.currentSubstitutions = result.CurrentSubstitutions || [];
        
        // Apply MV to existing current securities and collect existing CUSIPs
        const existingCusips: string[] = [];
        for (var i = 0; i < this.currentSecurities.length; i++) {
          this.currentSecurities[i] = this.applyMV(this.currentSecurities[i], this.currentSecurities);
          if (this.currentSecurities[i] && this.currentSecurities[i].Cusip) {
            existingCusips.push(this.currentSecurities[i].Cusip);
          }
        }

        // Determine which CUSIPs from the incoming list are missing for this Counterparty/Entity
        const missingCusips: string[] = [];
        if (cusipList && Array.isArray(cusipList) && cusipList.length > 0) {
          cusipList.forEach((c) => {
            if (!c) { return; }
            // Ensure the cusip belongs to this cp/entity in the grid
            const inGrid = (this.gridData || []).some((g: any) => g.CUSIP === c && g.Counterparty === cp && g.Entity === entity);
            if (!inGrid) { return; }
            if (existingCusips.indexOf(c) === -1) {
              missingCusips.push(c);
            }
          });
        }

        // Only add securities that are missing
        if (missingCusips.length > 0) {
          missingCusips.forEach((c) => {
            let addedSec: any = {};
            if (c === 'Cash') {
              addedSec = { Cusip: 'Cash', ProduceTransactions: false, LastPrice: 100, HaircutPercent: 0 };
            } else {
              addedSec = (this.securityList || []).find((sec: any) => sec.Cusip === c && sec.Counterparty === cp && sec.Entity === entity) || { Cusip: c };
            }
            addedSec.Counterparty = cp;
            addedSec.Entity = entity;
            addedSec.DataDate = formattedDate;

            // set ParValue if available from grid
            const gridRow = (this.gridData || []).find((g: any) => g.CUSIP === c && g.Counterparty === cp && g.Entity === entity);
            if (gridRow) { addedSec.ParValue = gridRow.ParValue; }

            this.currentSecurities.push(addedSec);
            
          });
        }

        for (var i = 0; i < this.currentSecurities.length; i++) {
          
         
            for (var j = 0; j < this.gridData.length; j++) {
                if (this.currentSecurities[i].Cusip == this.gridData[j].CUSIP &&
                  this.currentSecurities[i].Counterparty == this.gridData[j].Counterparty &&
                  this.currentSecurities[i].Entity == this.gridData[j].Entity) {
                    this.currentSecurities[i].ParValue = this.gridData[j].ParValue;
                    break;
                }
            }
        } 
        /* for (var i = 0; i < this.currentSubstitutions.length; i++) {
          
            for (var j = 0; j < this.gridData.length; j++) {
                if (this.currentSubstitutions[i].Cusip == this.gridData[j].CUSIP &&
                    this.currentSubstitutions[i].Counterparty == this.gridData[j].Counterparty &&
                    this.currentSubstitutions[i].Entity == this.gridData[j].Entity) {
                    this.currentSubstitutions[i].OriginalFace = this.gridData[j].ParValue;
                    break;
                }
            }
        }
         */
        // Create form controls for currentSecurities
        this.buildCurrentSecurityFormControls();
        
        //this.buildSubstitutionFormControls();
        this.mvCalculated = false; // Reset MV calculation flag when data changes
        this.setContent('Substitutions');
      }
      else
      {
        this.currentSubstitutions = [];
        this.currentSecurities = [];
        this.setContent('Substitutions');
      }
    });
    
        /* $scope.CurrentSubstitutions = [];
        $scope.CurrentSecurities = [];
        if (error.status != null && error.data != null && error.status == 500) {
            $scope.error = error.data.Message;
        }
        else if (error.data != null) {
            $scope.error = "Unknown error occured. Failed to get data"
        }
        else {
            $scope.error = "Data services may not be running, Please check!";
        } */
    
  }
  filterCurrentSecurities(selectedCusip: string): any[] {
    return this.cusipList.filter((item) => {
      const exists = this.substitution.CurrentSubstitutions.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== selectedCusip) ||
        this.substitution.CurrentSecurities.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== selectedCusip);

      const isCurrent = this.currentSecurities.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== selectedCusip);
      const isNew = this.currentSubstitutions.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== selectedCusip);

      return !(exists || isNew || isCurrent);
    });
  }
  setContent(tabName:string) {
    this.contentTab = tabName;
    // Set exportButtonDisabled based on the selected tab
    this.exportButtonDisabled = tabName === 'Substitutions' || tabName === 'NewSecurity';
    if (tabName == 'NewSecurity') {
      this.refreshRecentRequests();
    }
  }

  calculateMV(): boolean {
    // Sync form control values to model before calculation
    
    // Validate that we have consistent data - either both grids have data or both are empty
    const hasCurrentSecurities = this.currentSecurities && this.currentSecurities.length > 0;
    const hasCurrentSubstitutions = this.currentSubstitutions && this.currentSubstitutions.length > 0;
    
    if (hasCurrentSecurities && !hasCurrentSubstitutions) {
      alert('Current Positions found but no new substitutions. Cannot calculate Market Value.');
      return false;
    }
    
    if (!hasCurrentSecurities && hasCurrentSubstitutions) {
      alert('New Substitutions found but no Current Positions. Cannot calculate Market Value.');
      return false;
    }
    
    if (!hasCurrentSecurities && !hasCurrentSubstitutions) {
      alert('No data available to calculate Market Value.');
      this.mvCalculated = true;
      return true; // Not an error, just no data to process
    }
    
    // Validate LastPrice and HaircutPercent for all securities before calculation
    let hasValidationErrors = false;
    
    // Check currentSubstitutions
    for (let i = 0; i < this.currentSubstitutions.length; i++) {
      const data = this.currentSubstitutions[i];
      
      // Check for par value in form controls
      const parValueControl = this.SubstitutionForm.controls['subParValue' + i];
      const formValue = parValueControl?.value;
      
      if (!formValue || formValue === '' || isNaN(Number(formValue))) {
        alert(`Par Value is required for substitution security ${data.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
        hasValidationErrors = true;
      } else {
        // Check form control validation status
        if (parValueControl && parValueControl.invalid) {
          const errors = parValueControl.errors;
          if (errors?.['minPieceSize']) {
            alert(`Par Value ${formValue} is below minimum piece size ${errors['minPieceSize'].requiredValue} for substitution security ${data.Cusip || 'Unknown'}.`);
            hasValidationErrors = true;
          }
          if (errors?.['minIncrement']) {
            alert(`Par Value ${formValue} is not a multiple of minimum increment ${errors['minIncrement'].requiredIncrement} for substitution security ${data.Cusip || 'Unknown'}.`);
            hasValidationErrors = true;
          }
        }
      }
      
      if (data && data.Cusip !== "Cash") {
        // Check for null/undefined LastPrice
        if (data.LastPrice === null || data.LastPrice === undefined) {
          alert(`Last Price is missing for security ${data.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
          hasValidationErrors = true;
        }
        // Check for null/undefined HaircutPercent
        else if (data.HaircutPercent === null || data.HaircutPercent === undefined) {
          alert(`Haircut Percent is missing for security ${data.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
          hasValidationErrors = true;
        }
      }
    }
    
    // Check currentSecurities
    for (let i = 0; i < this.currentSecurities.length; i++) {
      const data = this.currentSecurities[i];
      
      // Check for par value in form controls
      const parValueControl = this.CurrentSecurityForm.controls['secParValue' + i];
      const formValue = parValueControl?.value;
      
      if (!formValue || formValue === '' || isNaN(Number(formValue))) {
        alert(`Par Value is required for current security ${data.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
        hasValidationErrors = true;
      } else {
        // Check form control validation status
        if (parValueControl && parValueControl.invalid) {
          const errors = parValueControl.errors;
          if (errors?.['minPieceSize']) {
            alert(`Par Value ${formValue} is below minimum piece size ${errors['minPieceSize'].requiredValue} for current security ${data.Cusip || 'Unknown'}.`);
            hasValidationErrors = true;
          }
          if (errors?.['minIncrement']) {
            alert(`Par Value ${formValue} is not a multiple of minimum increment ${errors['minIncrement'].requiredIncrement} for current security ${data.Cusip || 'Unknown'}.`);
            hasValidationErrors = true;
          }
          if (errors?.['signMismatch']) {
            alert(`Par Value ${formValue} sign does not match reference value for current security ${data.Cusip || 'Unknown'}.`);
            hasValidationErrors = true;
          }
        }
      }
      
      if (data && data.Cusip !== "Cash") {
        // Check for null/undefined LastPrice
        if (data.LastPrice === null || data.LastPrice === undefined) {
          alert(`Last Price is missing for security ${data.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
          hasValidationErrors = true;
        }
        // Check for null/undefined HaircutPercent
        else if (data.HaircutPercent === null || data.HaircutPercent === undefined) {
          alert(`Haircut Percent is missing for security ${data.Cusip || 'Unknown'}. Cannot calculate Market Value.`);
          hasValidationErrors = true;
        }
      }
    }
    
    // If validation errors exist, don't proceed with calculation
    if (hasValidationErrors) {
      alert('Cannot calculate Market Value due to validation errors.');
      return false;
    }
    
    // First, sync all current securities form values to model
    for (let i = 0; i < this.currentSubstitutions.length; i++) {
      const formValue = this.SubstitutionForm.controls['subParValue' + i]?.value;
      if (formValue !== null && formValue !== undefined && formValue !== '') {
        this.currentSubstitutions[i].SubstitutionParValue = Number(formValue);
      }
      this.currentSubstitutions[i] = this.applyMV(this.currentSubstitutions[i], this.currentSecurities);
      // Update the checkbox form control with the calculated value
      this.SubstitutionForm.controls['subCollateralCheck' + i]?.setValue(this.currentSubstitutions[i].IsCollateralEligible);
    }
    for (let i = 0; i < this.currentSecurities.length; i++) {
      const formValue = this.CurrentSecurityForm.controls['secParValue' + i]?.value;
      if (formValue !== null && formValue !== undefined && formValue !== '') {
        this.currentSecurities[i].SubstitutionParValue = Number(formValue);
      }
      this.currentSecurities[i] = this.applyMV(this.currentSecurities[i], this.currentSecurities);
    }
        
    this.mvCalculated = true;
    if (hasCurrentSecurities && hasCurrentSubstitutions) {
      alert("Market Values calculated based on Par Values entered.");
    }
    return true;
  }
  applyMV(data:any, currentSecurity:any) {
    // Check if data is valid before proceeding
    if (!data || data.LastPrice === undefined) {
      return data;
    }
    
    let lastPrice = data.LastPrice;
    if (data.Cusip === "Cash") {
      lastPrice = 100;
    }
  
    let par = 0;
    currentSecurity.forEach((sec:substitutionDetails) => {
      if (sec.SubstitutionParValue) {
        par += Number(sec.SubstitutionParValue);
      }
    });
  
    if (data.SubstitutionParValue) {
      data.MVHaircut = (lastPrice * Number(data.SubstitutionParValue)) / 100 * (1 - data.HaircutPercent);
      const isEligible = Math.abs(par) >= Math.abs(data.MVHaircut);
      data.IsCollateralEligible = isEligible;
    }
  
    return data;
  }
  getData() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);

    // Use forkJoin to handle multiple HTTP requests in parallel
    forkJoin([
      this.substitutionService.getData(formattedDate),
      this.substitutionService.getSecurities(formattedDate)
    ]).pipe(
      finalize(() => {
        this.spinner.hide();
      })
    ).subscribe(
      ([dataResult, securitiesResult]) => {
        if (dataResult && dataResult.length > 0) {
          this.gridData = dataResult;
        } else {
          this.gridData = [];
        }

        if (securitiesResult && securitiesResult.length > 0) {
          this.securityList = securitiesResult;
        } else {
          this.securityList = [];
        }

      },
      error => {
        // Handle any errors here if needed
        console.error('An error occurred:', error);
        this.errorHandler.handleHttpError(error);
      }
    );
    this.checkedCusipList = [];
    this.currentSecurity = {};
    this.currentSubstitutions = [];
    this.substitution = {
      CurrentSecurities: [],
      CurrentSubstitutions: []
    };
    
    this.currentSecurities = [];
    this.securityList = [];
  }
  getCusips(counterparty?: string, entity?: string) {
    this.errorHandler.clearErrorList();
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    this.substitutionService.getCUSIPS(formattedDate, counterparty, entity).subscribe((result: any) => {
      if (result && result.length > 0) {
        this.cusipList = result;
        this.cusipList.push({ Cusip: "Cash" });
        // Initialize filtered lists for search functionality
        this.initializeSearchStates();
      }
      else{
        this.cusipList = [];
        this.initializeSearchStates();
      }
    });
  }
  refreshRecentRequests(){
    this.errorHandler.clearErrorList();
    this.substitutionService.getRecentRequests().subscribe(
      (result: any) => {
        if (result && result.length > 0) {
          this.recentRequests = result;
        }
        else{
          this.recentRequests = [];
        }        
      },
      (error: any) => {
        this.errorHandler.handleHttpError(error);
      }
    );
  }
  refreshRequests(){ 
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.substitutionService.getRecentRequests().subscribe(
      (result: any) => {
        if (result && result.length > 0) {
          this.recentRequests = result;
        }
        else{
          this.recentRequests = [];
        }
        this.spinner.hide();
      },
      (error: any) => {
        this.errorHandler.handleHttpError(error);
        this.spinner.hide();
      }
    );
  }

  sendRequest(){
    this.errorHandler.clearErrorList();
    this.NewSecurity.Cusip=this.NewSecurityForm.controls['Cusip']?.value;
    let cusip = this.NewSecurity.Cusip;
    
    // Check if CUSIP is already in the recent requests grid with "In Progress" status
    if (this.recentRequests && this.recentRequests.length > 0) {
      const existingRequest = this.recentRequests.find(req => req.Cusip === cusip && req.Status === 'In Progress');
      if (existingRequest) {
        // Show message that it's already requested and in progress
        alert(`CUSIP ${cusip} is already requested and in progress`);
        return; // Exit without making new request
      }
    }
    
    // Add new request to grid with "In Progress" status BEFORE starting spinner
    const maxRequestId = this.recentRequests && this.recentRequests.length > 0 
      ? Math.max(...this.recentRequests.map(req => req.RequestId ?? 0))
      : 0;
    
    const newRequest = {
      RequestId: maxRequestId + 1,
      Cusip: cusip,
      RequestTime: new Date(),
      ResponseTime: null,
      Status: 'In Progress',
      Error: 'Processing request...'
    };
    
    // Add to the beginning of the array to show latest first
    if (!this.recentRequests) {
      this.recentRequests = [];
    }
    this.recentRequests = [newRequest, ...this.recentRequests];
    
    // Force immediate change detection
    this.cdr.detectChanges();
    

    this.substitutionService.requestNewSecurity(cusip).subscribe(
      (response: any) => {      
        
        this.NewSecurity ={};
        this.NewSecurityForm.controls['Cusip']?.setValue(this.NewSecurity.Cusip);          
        //this.NewSecurityForm.reset(); // Reset the form values
        this.NewSecurityForm.markAsPristine(); // Set the form to its pristine state
        this.NewSecurityForm.markAsUntouched();
        this.refreshRecentRequests();
      },
      (error: any) => {
         this.refreshRecentRequests();      
        this.errorHandler.handleHttpError(error);
      }
    );
  }

  newSecurityRequest(){
    this.NewSecurity ={};
    this.NewSecurityForm.reset(); // Reset the form values
    this.NewSecurityForm.markAsPristine(); // Set the form to its pristine state
    this.NewSecurityForm.markAsUntouched(); // Set the form to its untouched state
    this.setContent('NewSecurity');
  }

  addToRequestBuilder(cusip:string){
    this.errorHandler.clearErrorList();
   this.substitutionService.addToRequestBuilder(cusip).subscribe(() => {
      // this.toasterService.toast("Security successfully added to Request Builder");
      // this.spinner.hide();
    }, (err:any) => {
      this.errorHandler.handleHttpError(err);
      // let msg = (err.status == 0 ? "Server Error" : err.message ? err.error : err.message );
      // this.errorHandler.appendMessageToErrorList(msg);
      // this.errorHandler.setIsError(true);
      // this.spinner.hide();
    });
  }

  addSecurityToMaster(requestId:any){
    this.errorHandler.clearErrorList();
    this.substitutionService.addSecurityToMaster(requestId).subscribe(() => {
      // this.toasterService.toast("Security successfully saved to master");
      // this.spinner.hide();
    }, (err:any) => {
      this.errorHandler.handleHttpError(err);
      // let msg = (err.status == 0 ? "Server Error" : err.message ? err.error : err.message );
      // this.errorHandler.appendMessageToErrorList(msg);
      // this.errorHandler.setIsError(true);
      // this.spinner.hide();
    });
  }

  getSecurityPrice(cusip:string){
    this.errorHandler.clearErrorList();
    
    // Add new price request to grid with "In Progress" status
    const maxRequestId = this.recentRequests && this.recentRequests.length > 0 
      ? Math.max(...this.recentRequests.map(req => req.RequestId ?? 0))
      : 0;
    
    const newRequest = {
      RequestId: maxRequestId + 1,
      Cusip: cusip,
      RequestTime: new Date(),
      ResponseTime: null,
      Status: 'In Progress',
      Error: 'Retrieving security price...'
    };
    
    // Add to the beginning of the array to show latest first
    if (!this.recentRequests) {
      this.recentRequests = [];
    }
    this.recentRequests = [newRequest, ...this.recentRequests];
    
    // Force immediate change detection
    this.cdr.detectChanges();
   
    this.substitutionService.getSecurityPrice(cusip).subscribe(
      () => {
        // Refresh the grid to get latest data from server
        this.refreshRecentRequests();
        
      }, 
      (err:any) => {
        this.refreshRecentRequests();
        this.errorHandler.handleHttpError(err);
        
      }
    );
  }
  exportData(){
    var pathName = "Securities_" + this.date_service.FormatDateToISO(this.selectedDate);
    this.excelExportService.export(this.grid, new IgxExcelExporterOptions(pathName));

  }
  saveSubstitutions() {
    this.errorHandler.clearErrorList();
    
    // Check if Calculate MV has been clicked
    if (!this.mvCalculated) {
      alert('Please click "Calculate MV" and clear error messages before saving substitutions.');
      return;
    }
    
    this.spinner.show();
    const unproduced = this.currentSubstitutions.some((x:substitutionDetails) => x.ProduceTransactions !== true);
    let formattedDate: any = new DateService().GetSpecficDateString(this.selectedDate);
    if (unproduced) {
      const c = confirm(
        "Transactions that have not been produced will not be saved." +
        " Do you wish to continue?"
      );
  
      if (!c) {
        this.spinner.hide();
        return;
      }
    }  
    
    this.substitution.CurrentSecurities= this.currentSecurities;
    this.substitution.CurrentSubstitutions= this.currentSubstitutions;
    this.substitutionService.saveSubstitutions(this.substitution,formattedDate).subscribe(
      (response: any) => {     
        this.toasterService.toast("Changes successfully saved");
        
        this.getData();
        this.setContent('Securities');
        this.spinner.hide();
      
      },
      (error: any) => {
        this.spinner.hide();
        this.errorHandler.handleHttpError(error);
      }
    );
  }
  addNewSecurity(table:string) {
    const dynamicValidator = Validators.pattern(/^\-[0-9]+(\.[0-9]+)?$/);
    if (table === "Substitutions") {
      this.currentSubstitutions.push({});
      this.buildSubstitutionFormControls();
      // Initialize search state for new substitution row
      const newIndex = this.currentSubstitutions.length - 1;
      this.substitutionSearchTerms[newIndex] = '';
      this.showSubstitutionDropdowns[newIndex] = false;
      this.filteredSubstitutionLists[newIndex] = this.cusipList || [];
      this.mvCalculated = false; // Reset MV calculation flag when adding securities
    } else if (table === "Securities") {
      this.currentSecurities.push({IsAdding: true});      
      this.substitution.CurrentSecurities.push(this.currentSecurities[this.currentSecurities.length - 1]);
      // Rebuild all form controls to ensure proper indexing
      this.buildCurrentSecurityFormControls();
      // Initialize search state for new security row
      const newIndex = this.currentSecurities.length - 1;
      this.securitySearchTerms[newIndex] = '';
      this.showSecurityDropdowns[newIndex] = false;
      this.filteredSecurityLists[newIndex] = this.cusipList || [];
      this.mvCalculated = false; // Reset MV calculation flag when adding securities
    }
  }
  getSecurityTotal(column:string):number {
    let total = 0;
  
    if (column === "MV") {
      this.currentSecurities.forEach(security => {
        if (!security) return;
        total += Number(this.getMV(security));
      });
    } else {
      this.currentSecurities.forEach(security => {
        if (!security[column]) return;
        total += Number(security[column]);
      });
    }
  
    return total;
  }
  getMV(security:any) {
    const parPrice = ((security.LastPrice * security.ParValue) / 100) * (1 - security.HaircutPercent);
    return parPrice; 
  }
  getSubstitutionTotal(column: string): number {
    let total = 0;
  
    if (column === 'MV') {
      this.currentSubstitutions.forEach((substitution:substitutionDetails) => {
        if (!substitution) return;
        total += Number(this.getMV(substitution));
      });
    } else {
      this.currentSubstitutions.forEach((substitution:substitutionDetails) => {
        if (!substitution.hasOwnProperty(column)) return;
        total += Number(this.substitution[column]);
      });
    }
  
    return total;
  }
  deleteSecurityMovement(security: any): void {
    
    this.errorHandler.clearErrorList();
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to remove security ${security.Cusip || 'this item'}?`);
    if (!confirmed) {
      return;
    }
    
    if (security.Id == undefined) {
      const ind = this.currentSecurities.indexOf(security);
      if (ind !== -1) {
        this.currentSecurities.splice(ind, 1);
      }
  
      const newInd = this.substitution.CurrentSecurities.indexOf(security);
      if (newInd !== -1) {
        this.substitution.CurrentSecurities.splice(newInd, 1);
      }
      return;
    }
    this.substitutionService.deleteCollateralMovement(security).subscribe(()=> {
      const ind1 = this.currentSecurities.indexOf(security);
        if (ind1 !== -1) {
          this.currentSecurities.splice(ind1, 1);
        }
  
        const ind2 = this.substitution.CurrentSecurities.indexOf(security);
        if (ind2 !== -1) {
          this.substitution.CurrentSecurities.splice(ind2, 1);
        }
        this.mvCalculated = false; // Reset MV calculation flag when deleting securities
    });
    
  }
  deleteSubstitutionMovement(security: any, index?: number): void {
    this.errorHandler.clearErrorList();
    
    // Use index if provided, otherwise fall back to indexOf
    const securityIndex = index !== undefined ? index : this.currentSubstitutions.indexOf(security);
    
    if (security.Id == undefined) {
      // Delete from the main array using the reliable index
      if (securityIndex !== -1) {
        this.currentSubstitutions.splice(securityIndex, 1);
      }
      
      // Rebuild form controls after deletion to maintain correct indexing
      this.buildSubstitutionFormControls();
      
      // Clear and reinitialize all dropdown states for remaining rows
      this.substitutionSearchTerms = {};
      this.showSubstitutionDropdowns = {};
      this.filteredSubstitutionLists = {};
      
      // Reinitialize for remaining substitutions
      for (let i = 0; i < this.currentSubstitutions.length; i++) {
        this.substitutionSearchTerms[i] = this.currentSubstitutions[i].Cusip || '';
        this.showSubstitutionDropdowns[i] = false;
        this.filteredSubstitutionLists[i] = this.cusipList || [];
      }
      
      this.mvCalculated = false; // Reset MV calculation flag when deleting securities
      this.cdr.detectChanges(); // Force change detection to update the view
      return;
    }
  
    this.substitutionService.deleteCollateralMovement(security).subscribe(()=> {  
        // Delete from the main array using the reliable index
        if (securityIndex !== -1) {
          this.currentSubstitutions.splice(securityIndex, 1);
        }
        
        // Rebuild form controls after deletion to maintain correct indexing
        this.buildSubstitutionFormControls();
        
        // Clear and reinitialize all dropdown states for remaining rows
        this.substitutionSearchTerms = {};
        this.showSubstitutionDropdowns = {};
        this.filteredSubstitutionLists = {};
        
        // Reinitialize for remaining substitutions
        for (let i = 0; i < this.currentSubstitutions.length; i++) {
          this.substitutionSearchTerms[i] = this.currentSubstitutions[i].Cusip || '';
          this.showSubstitutionDropdowns[i] = false;
          this.filteredSubstitutionLists[i] = this.cusipList || [];
        }
        
        this.mvCalculated = false; // Reset MV calculation flag when deleting securities
        this.cdr.detectChanges(); // Force change detection to update the view
      });
  }
  setNewSubstitution(security: any,controlName:string) {
    security.Cusip=this.SubstitutionForm.get(controlName)?.value;
    const tempInd = this.currentSubstitutions.indexOf(security);
  
    if (security.Cusip === 'Cash') {
      this.currentSubstitutions[tempInd].ProduceTransactions = false;
      this.currentSubstitutions[tempInd].LastPrice = 100;
      this.currentSubstitutions[tempInd].HaircutPercent = 0;
      this.currentSubstitutions[tempInd].MinPieceSize = null;
      this.currentSubstitutions[tempInd].MinIncrement = null;
      this.currentSubstitutions[tempInd].ISIN = null;
      this.currentSubstitutions[tempInd].SecurityType = null;
      this.currentSubstitutions[tempInd].SecurityName = null;
      this.currentSubstitutions[tempInd].IssueDate = null;
      this.currentSubstitutions[tempInd].MaturityDate = null;
      this.currentSubstitutions[tempInd].CouponRate = null;     
    } else {
      for (let i = 0; i < this.securityList.length; i++) {
        if (this.securityList[i].Cusip === security.Cusip && 
            this.securityList[i].Counterparty === this.currentSecurity.Counterparty &&
            this.securityList[i].Entity === this.currentSecurity.Entity) {
              this.currentSubstitutions[tempInd] = { ...this.securityList[i] };
              break;
        }
      }
    }
  
    this.currentSubstitutions[tempInd].Counterparty = this.currentSecurity.Counterparty;
    this.currentSubstitutions[tempInd].Entity = this.currentSecurity.Entity;
    this.currentSubstitutions[tempInd].DataDate = this.currentSecurity.DataDate;

    // Update the par value form control with new validators including minimum piece size and increment
    const parValueControlName = 'subParValue' + tempInd;
    const validators = [Validators.required];
    if (this.currentSubstitutions[tempInd].MinPieceSize) {
      validators.push(this.minPieceSizeValidator(this.currentSubstitutions[tempInd].MinPieceSize,this.currentSubstitutions[tempInd].Cusip));
    }
    if (this.currentSubstitutions[tempInd].MinIncrement) {
      validators.push(this.minIncrementValidator(this.currentSubstitutions[tempInd].MinIncrement));
    }
    
    const currentValue = this.SubstitutionForm.get(parValueControlName)?.value;
    this.SubstitutionForm.removeControl(parValueControlName);
    this.SubstitutionForm.addControl(parValueControlName, this.formBuilder.control(currentValue || '', validators));
    this.SubstitutionForm.get(parValueControlName)?.enable(); // Enable the par value control
    this.mvCalculated = false; // Reset MV calculation flag when security changes
  }
  setNewSecurity(security: any,controlName:string) {
    security.Cusip=this.CurrentSecurityForm.get(controlName)?.value;
    const tempInd = this.currentSecurities.indexOf(security);
  
    if (security.Cusip === 'Cash') {
      this.currentSecurities[tempInd].ProduceTransactions = false;
      this.currentSecurities[tempInd].LastPrice = 100;
      this.currentSecurities[tempInd].HaircutPercent = 0;
    } else {
      for (let i = 0; i < this.securityList.length; i++) {
        if (this.securityList[i].Cusip === security.Cusip && 
            this.securityList[i].Counterparty === this.currentSecurity.Counterparty &&
            this.securityList[i].Entity === this.currentSecurity.Entity) {
              this.currentSecurities[tempInd] = { ...this.securityList[i] };
              break;
        }
      }
    }
  
    this.currentSecurities[tempInd].Counterparty = this.currentSecurity.Counterparty;
    this.currentSecurities[tempInd].Entity = this.currentSecurity.Entity;
    this.currentSecurities[tempInd].DataDate = this.currentSecurity.DataDate;

    // Update the par value form control with new validators including minimum piece size, increment, and sign
    const parValueControlName = 'secParValue' + tempInd;
    const validators = [Validators.required];
    if (this.currentSecurities[tempInd].MinPieceSize) {
        validators.push(this.minPieceSizeValidator(this.currentSecurities[tempInd].MinPieceSize, this.currentSecurities[tempInd].Cusip));

    }
    if (this.currentSecurities[tempInd].MinIncrement) {
      validators.push(this.minIncrementValidator(this.currentSecurities[tempInd].MinIncrement));
    }
    // Add sign matching validator
    validators.push(this.signMatchValidator(this.currentSecurities[tempInd]));
    
    const currentValue = this.CurrentSecurityForm.get(parValueControlName)?.value;
    this.CurrentSecurityForm.removeControl(parValueControlName);
    this.CurrentSecurityForm.addControl(parValueControlName, this.formBuilder.control(currentValue || '', validators));
    this.mvCalculated = false; // Reset MV calculation flag when security changes
  }
  produceTransaction(event: Event, security: any){
    event.preventDefault(); // Prevent default checkbox behavior

    const c = confirm("Are you sure you wish to produce this transaction?");
    if (!c) {
      const ind = this.currentSubstitutions.indexOf(security);
      security.ProduceTransactions = false;
      this.currentSubstitutions[ind].ProduceTransactions = false;
      
      // Update the form control to uncheck the checkbox
      if (ind !== -1) {
        this.SubstitutionForm.controls['subCheck' + ind]?.setValue(false);
      }
      
    } else {
      // Find the security index for form validation
      const securityIndex = this.currentSubstitutions.indexOf(security);
      
      // Validate par value from form controls first
      if (securityIndex !== -1) {
        const parValueControl = this.SubstitutionForm.controls['subParValue' + securityIndex];
        const formValue = parValueControl?.value;
        
        if (!formValue || formValue === '' || isNaN(Number(formValue))) {
          alert(`Par Value is required for substitution security ${security.Cusip || 'Unknown'}. Cannot produce transaction.`);
          // Update the form control to uncheck the checkbox
          if (securityIndex !== -1) {
            this.SubstitutionForm.controls['subCheck' + securityIndex]?.setValue(false);
          }
          return;
        }
        
        // Check form control validation status
        if (parValueControl && parValueControl.invalid) {
          const errors = parValueControl.errors;
          if (errors?.['minPieceSize']) {
            alert(`Par Value ${formValue} is below minimum piece size ${errors['minPieceSize'].requiredValue} for substitution security ${security.Cusip || 'Unknown'}.`);
            // Update the form control to uncheck the checkbox
            if (securityIndex !== -1) {
              this.SubstitutionForm.controls['subCheck' + securityIndex]?.setValue(false);
            }
            return;
          }
          if (errors?.['minIncrement']) {
            alert(`Par Value ${formValue} is not a multiple of minimum increment ${errors['minIncrement'].requiredIncrement} for substitution security ${security.Cusip || 'Unknown'}.`);
            // Update the form control to uncheck the checkbox
            if (securityIndex !== -1) {
              this.SubstitutionForm.controls['subCheck' + securityIndex]?.setValue(false);
            }
            return;
          }
        }
      }
      
      // Validate LastPrice and HaircutPercent before producing transaction
      if (security && security.Cusip !== "Cash") {
        // Check for null/undefined LastPrice
        if (security.LastPrice === null || security.LastPrice === undefined) {
          alert(`Last Price is missing for security ${security.Cusip || 'Unknown'}. Cannot produce transaction.`);
          // Update the form control to uncheck the checkbox
          if (securityIndex !== -1) {
            this.SubstitutionForm.controls['subCheck' + securityIndex]?.setValue(false);
          }
          return;
        }
        // Check for null/undefined HaircutPercent
        if (security.HaircutPercent === null || security.HaircutPercent === undefined) {
          alert(`Haircut Percent is missing for security ${security.Cusip || 'Unknown'}. Cannot produce transaction.`);
          // Update the form control to uncheck the checkbox
          if (securityIndex !== -1) {
            this.SubstitutionForm.controls['subCheck' + securityIndex]?.setValue(false);
          }
          return;
        }
      }

      security.ProduceTransactions = true;

      for (let i = 0; i < this.currentSubstitutions.length; i++) {
        if (
          this.currentSubstitutions[i].Counterparty === security.Counterparty &&
          this.currentSubstitutions[i].Cusip === security.Cusip
        ) {
          const securityIndex = this.substitution.CurrentSubstitutions.indexOf(
            this.currentSubstitutions[i]
          );
          if (securityIndex !== -1) {
            this.substitution.CurrentSubstitutions.splice(securityIndex, 1);
          }
          this.currentSubstitutions[i] = this.applyMV(
            this.currentSubstitutions[i],
            this.currentSecurities
          );
        }
      }
    }
  }

  // Initialize search states
  initializeSearchStates(): void {
    // Clear existing states
    this.securitySearchTerms = {};
    this.showSecurityDropdowns = {};
    this.filteredSecurityLists = {};
    this.substitutionSearchTerms = {};
    this.showSubstitutionDropdowns = {};
    this.filteredSubstitutionLists = {};
    
    // Initialize for current securities
    if (this.currentSecurities && this.currentSecurities.length > 0) {
      for (let i = 0; i < this.currentSecurities.length; i++) {
        this.securitySearchTerms[i] = '';
        this.showSecurityDropdowns[i] = false;
        this.filteredSecurityLists[i] = this.cusipList || [];
      }
    }
    
    // Initialize for substitutions
    if (this.currentSubstitutions && this.currentSubstitutions.length > 0) {
      for (let i = 0; i < this.currentSubstitutions.length; i++) {
        this.substitutionSearchTerms[i] = '';
        this.showSubstitutionDropdowns[i] = false;
        this.filteredSubstitutionLists[i] = this.cusipList || [];
      }
    }
  }

  // CUSIP search functionality methods
  getSecuritySearchTerm(index: number): string {
    return this.securitySearchTerms[index] || '';
  }

  onSecurityInput(event: any, index: number): void {
    if (!event || !event.target) {
      return;
    }
    const value = event.target.value;
    const searchTerm = (value || '').toLowerCase();
    this.securitySearchTerms[index] = value;
    
    if (!searchTerm) {
      this.filteredSecurityLists[index] = this.cusipList || [];
    } else {
      this.filteredSecurityLists[index] = (this.cusipList || []).filter(security =>
        (security.Cusip && security.Cusip.toLowerCase().includes(searchTerm)) ||
        (security.SecurityName && security.SecurityName.toLowerCase().includes(searchTerm))
      );
    }
    // Clear cache when filter changes
    delete this.cachedFilteredSecurityItems[index];
    this.showSecurityDropdowns[index] = true;
  }

  selectSecurity(cusip: string, index: number): void {
    const controlName = 'securityCusip' + index;
    this.CurrentSecurityForm.controls[controlName]?.setValue(cusip);
    this.securitySearchTerms[index] = cusip;
    this.showSecurityDropdowns[index] = false;
    
    // Clear cache when security changes
    delete this.cachedFilteredSecurityItems[index];
    
    // Find the security object and trigger the existing setNewSecurity method
    const security = this.currentSecurities[index];
    this.setNewSecurity(security, controlName);
  }

  getSubstitutionSearchTerm(index: number): string {
    return this.substitutionSearchTerms[index] || '';
  }

  onSubstitutionInput(event: any, index: number): void {
    if (!event || !event.target) {
      return;
    }
    const value = event.target.value;
    const searchTerm = (value || '').toLowerCase();
    this.substitutionSearchTerms[index] = value;
    
    if (!searchTerm) {
      this.filteredSubstitutionLists[index] = this.cusipList || [];
    } else {
      this.filteredSubstitutionLists[index] = (this.cusipList || []).filter(security =>
        (security.Cusip && security.Cusip.toLowerCase().includes(searchTerm)) ||
        (security.SecurityName && security.SecurityName.toLowerCase().includes(searchTerm))
      );
    }
    // Clear cache when filter changes
    delete this.cachedFilteredSubstitutionItems[index];
    this.showSubstitutionDropdowns[index] = true;
  }

  selectSubstitutionSecurity(cusip: string, index: number): void {
    const controlName = 'substitutionCusip' + index;
    this.SubstitutionForm.controls[controlName]?.setValue(cusip);
    this.substitutionSearchTerms[index] = cusip;
    this.showSubstitutionDropdowns[index] = false;
    
    // Clear cache when security changes
    delete this.cachedFilteredSubstitutionItems[index];
    
    // Find the security object and trigger the existing setNewSubstitution method
    const security = this.currentSubstitutions[index];
    this.setNewSubstitution(security, controlName);
  }

  shouldShowCashOption(index: number): boolean {
    const searchTerm = this.securitySearchTerms[index];
    const searchTermLower = (typeof searchTerm === 'string' ? searchTerm : '').toLowerCase();
    return !this.hasCash && (!searchTerm || 'cash'.includes(searchTermLower));
  }

  getFilteredSecurityItems(index: number): any[] {
    if (!this.filteredSecurityLists[index]) {
      return [];
    }
    
    const security = this.currentSecurities[index];
    if (!security) {
      return this.filteredSecurityLists[index];
    }

    // Check cache with timestamp
    const cacheKey = `sec_${index}_${security.Cusip}_${security.Counterparty}_${this.filteredSecurityLists[index].length}`;
    const now = Date.now();
    
    if (this.cachedFilteredSecurityItems[index] && 
        this.lastFilterTimestamp[cacheKey] && 
        (now - this.lastFilterTimestamp[cacheKey]) < 1000) {
      return this.cachedFilteredSecurityItems[index];
    }

    // Apply the same filtering logic as the filterSub pipe
    const currentSecurity = security.Cusip || '';
    const counterparty = security.Counterparty || this.currentSecurity.Counterparty;
    
    const filtered = this.filteredSecurityLists[index].filter(item => {
      let exists = (this.substitution?.CurrentSubstitutions && this.substitution.CurrentSubstitutions.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== currentSecurity))
        || (this.substitution?.CurrentSecurities && this.substitution.CurrentSecurities.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== currentSecurity));
      
      let isCurrent = this.currentSecurities && this.currentSecurities.some((x:any) => { return x.Cusip === item.Cusip && x.Cusip !== currentSecurity });
      let isNew = this.currentSubstitutions && this.currentSubstitutions.some((x:any) => { return x.Cusip === item.Cusip && x.Cusip !== currentSecurity });
      
      if (counterparty === '') {
        return !(exists || isNew || isCurrent);
      } else {
        let inGrid = this.gridData && this.gridData.some((x:any) => { return x.CUSIP === item.Cusip && x.Counterparty === counterparty });
        return !(exists || isNew || isCurrent) && inGrid;
      }
    });
    
    // Cache the result
    this.cachedFilteredSecurityItems[index] = filtered;
    this.lastFilterTimestamp[cacheKey] = now;
    
    return filtered;
  }

  getFilteredSubstitutionItems(index: number): any[] {
    if (!this.filteredSubstitutionLists[index]) {
      return [];
    }
    
    const security = this.currentSubstitutions[index];
    if (!security) {
      return this.filteredSubstitutionLists[index];
    }

    // Check cache with timestamp
    const cacheKey = `sub_${index}_${security.Cusip}_${this.filteredSubstitutionLists[index].length}`;
    const now = Date.now();
    
    if (this.cachedFilteredSubstitutionItems[index] && 
        this.lastFilterTimestamp[cacheKey] && 
        (now - this.lastFilterTimestamp[cacheKey]) < 1000) {
      return this.cachedFilteredSubstitutionItems[index];
    }

    // Apply the same filtering logic as the filterSub pipe
    const currentSecurity = security.Cusip || '';
    const counterparty = ''; // Empty counterparty for substitutions as per original pipe usage
    
    const filtered = this.filteredSubstitutionLists[index].filter(item => {
      let exists = (this.substitution?.CurrentSubstitutions && this.substitution.CurrentSubstitutions.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== currentSecurity))
        || (this.substitution?.CurrentSecurities && this.substitution.CurrentSecurities.some((x:any) => x.Cusip === item.Cusip && x.Cusip !== currentSecurity));
      
      let isCurrent = this.currentSecurities && this.currentSecurities.some((x:any) => { return x.Cusip === item.Cusip && x.Cusip !== currentSecurity });
      let isNew = this.currentSubstitutions && this.currentSubstitutions.some((x:any) => { return x.Cusip === item.Cusip && x.Cusip !== currentSecurity });
      
      if (counterparty === '') {
        return !(exists || isNew || isCurrent);
      } else {
        let inGrid = this.gridData && this.gridData.some((x:any) => { return x.CUSIP === item.Cusip && x.Counterparty === counterparty });
        return !(exists || isNew || isCurrent) && inGrid;
      }
    });
    
    // Cache the result
    this.cachedFilteredSubstitutionItems[index] = filtered;
    this.lastFilterTimestamp[cacheKey] = now;
    
    return filtered;
  }

  getSecurityDropdownHeight(index: number): string {
    const itemCount = this.getFilteredSecurityItems(index).length + (this.shouldShowCashOption(index) ? 1 : 0);
    return itemCount > 5 ? '80px' : 'auto';
  }

  getSecurityDropdownOverflow(index: number): string {
    const itemCount = this.getFilteredSecurityItems(index).length + (this.shouldShowCashOption(index) ? 1 : 0);
    return itemCount > 5 ? 'auto' : 'hidden';
  }

  getSubstitutionDropdownHeight(index: number): string {
    const itemCount = this.getFilteredSubstitutionItems(index).length;
    return itemCount > 5 ? '80px' : 'auto';
  }

  getSubstitutionDropdownOverflow(index: number): string {
    const itemCount = this.getFilteredSubstitutionItems(index).length;
    return itemCount > 5 ? 'auto' : 'hidden';
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!event || !event.target) {
      return;
    }
    const target = event.target as HTMLElement;
    
    // Check if click is outside any dropdown
    const isClickInsideDropdown = target.closest('.security-dropdown') || 
                                   target.closest('igx-input-group') ||
                                   target.closest('.security-item-hover');
    
    if (!isClickInsideDropdown) {
      // Close all security dropdowns
      Object.keys(this.showSecurityDropdowns).forEach(key => {
        this.showSecurityDropdowns[+key] = false;
      });
      
      // Close all substitution dropdowns
      Object.keys(this.showSubstitutionDropdowns).forEach(key => {
        this.showSubstitutionDropdowns[+key] = false;
      });
    }
  }
}
