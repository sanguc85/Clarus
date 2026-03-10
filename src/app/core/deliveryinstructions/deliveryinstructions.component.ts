import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IgxDialogComponent } from 'igniteui-angular';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { DeliveryinstructionsService } from './deliveryinstructions.service';
import { STATUS, POSITION } from 'src/app/shared/constants';

@Component({
  selector: 'app-deliveryinstructions',
  templateUrl: './deliveryinstructions.component.html',
  styleUrls: ['./deliveryinstructions.component.scss'],
})
export class DeliveryinstructionsComponent implements OnInit, OnChanges {
  @Input() selectedEntity: string;
  @Input() selectedCounterparty: string;
  public STATUS = STATUS;
  public POSITION = POSITION;
  MetaData: { [key: string]: any } = {};
  MetaDataTables: { [key: string]: any } = {};
  MetaDataNames: { [key: string]: any } = {};
  metaDataTables: string[] = [
    'AgreementType',
    'ApplicableType',
    'CollateralMovementType',
    'CollateralType',
    'Counterparty',
    'Country',
    'Currency',
    'DayCountConvention',
    'DeterminingParty',
    'DocumentationLaw',
    'Entity',
    'EntityAccountType',
    'IndexChangeType',
    'InterestBenchmark',
    'InterestCalculationMethod',
    'MasterAgreementType',
    'Outlook',
    'Party',
    'RatingSource',
    'RepoType',
    'RepoCollateralType',
    'SettlementType',
    'Status',
    'TransactionType',
    'ReportType',
  ];
  metaDataMiscMap: { [key: string]: any } = {
    Outlook: ['SnPOutlook', 'FitchOutlook', 'MoodysOutlook'],
    Counterparty: ['CounterpartyName', 'Description'],
    IndexChangeType: [
      'IndexCancellation',
      'IndexDisruption',
      'IndexModification',
    ],
  };
  tabData: any[] = [];
  currentAccounts: any[] = [];
  accounts: any[] = [];
  tabNames: string[] = [];
  subContentTab: number;
  subSubContentTab: number;
  fields: { label: string; value: string }[] = [];
  newPositionForm!: FormGroup;
  newAccountForm!: FormGroup;
  newDeliveryInstructionForm!: FormGroup;
  counterpartyInstructions: any[] = [];
  parsedInstructions: any[] = [];
  accountForm: FormGroup;
  cpInstructionForm: FormGroup;
  accountNumber: any[];
  currentPosition: any;
  filteredAccounts: any[] = [];
  PreformatCodeVersionText =
    'Please enter the version in this format: V1, V2, etc.';
  isDuplicatePreformatCodeVersion = false;
  @ViewChild('addNewTabDialog')
  addNewTabDialog!: IgxDialogComponent;
  @ViewChild('addNewPositionDialog')
  addNewPositionDialog!: IgxDialogComponent;
  @ViewChild('addNewAccountDialog')
  addNewAccountDialog!: IgxDialogComponent;
  selectedPosition: string;
  selectedAccount: string;
  selectedCurrency: string;
  selectedType: string;
  selectedParty: string;
  manualGroup: FormGroup<{
    key: FormControl<string>;
    value: FormControl<string>;
  }>;
  constructor(
    private deliveryinstructionsService: DeliveryinstructionsService,
    private fb: FormBuilder,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.handleEntityAndCounterpartySelected();
    this.setMetaDataTable(['Currency', 'Entity', 'Status','Party']);
    this.initForm();
    this.getSettlementPosition();
    this.getSettlementAccountByEntity();

    if (this.selectedCounterparty) {
      this.getSettlementDeliveryInstructionByCp(this.selectedCounterparty);
    }
  }

  ngOnChanges() {
    if (this.selectedEntity) {
      // Call the method to fetch settlement accounts by entity
      this.getSettlementAccountByEntity();
      // Check if accountNumber is defined and not empty before accessing its first element
      
    }
    if (this.selectedCounterparty) {
      this.getSettlementDeliveryInstructionByCp(this.selectedCounterparty);
    }
    if (this.newDeliveryInstructionForm) {
    this.newDeliveryInstructionForm.get('Type').updateValueAndValidity();
    this.updatePartyLabel(this.selectedPosition);
    
  }
  }

  initForm() {
    this.newDeliveryInstructionForm = this.fb.group({
      Entity: [
        { value: this.selectedEntity, disabled: true },
        Validators.required,
      ],
      Counterparty: [
        { value: this.selectedCounterparty, disabled: true },
        Validators.required,
      ],
      Position: ['', Validators.required],
      Account: ['', this.getAccountValidator()],
      Currency: ['', Validators.required],
      Type: [''],
      Party: ['', Validators.required],
      Label: [''],
      AccountName: [''],
      AccountNumber: [''],
      AgentBank: [''],
      Beneficiary: [''],
      ABA: [''],
      Swift: [''],
      SortCode: [''],
      PreformatCodeVersion: ['', Validators.required],
      Status: ['', Validators.required],
    });

    this.newDeliveryInstructionForm.get('Status')?.valueChanges.subscribe(status => {
  const ctrl = this.newDeliveryInstructionForm.get('PreformatCodeVersion');
  if (status === STATUS.Terminated) {
    ctrl.clearValidators();
  } else {
    ctrl.setValidators(Validators.required);
  }
  ctrl.updateValueAndValidity();
});

     this.newDeliveryInstructionForm.get('Type').valueChanges.subscribe(value => {
      this.onTypeChange(value);
    });
    this.newDeliveryInstructionForm.get('Party').valueChanges.subscribe(value => {
      this.onPartyChange(value);
    });

    // Dynamically add form controls for manual instructions based on the number of fields
    for (let i = 0; i < this.fields.length; i++) {
      this.newDeliveryInstructionForm.addControl(
        `label${i}`,
        new FormControl('')
      );
      this.newDeliveryInstructionForm.addControl(
        `value${i}`,
        new FormControl('')
      );
    }

    this.selectedPosition = '';
    this.selectedAccount = '';
    this.selectedCurrency = '';

    this.accountForm = this.fb.group({
      instructions: this.fb.array([]),
    });

    if (this.filteredAccounts && this.filteredAccounts.length > 0) {
      this.parsedInstructions = this.parseInstructions(this.filteredAccounts);
      this.parsedInstructions.forEach((instruction, index) => {
        const statusValue = this.filteredAccounts[index].Status; // Get the status value for the current instruction
        instruction.Status = statusValue; // Assign the status value to the instruction
        const instructionGroup = this.createInstructionGroup(instruction);
        this.instructionFormArray.push(instructionGroup);
      });
    }

    this.manualGroup = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });

    this.newPositionForm = this.fb.group({
      Name: ['', Validators.required],
      IsActive: [true], // IsActive is true by default
    });

    this.newAccountForm = this.fb.group({
      Number: ['', Validators.required],
      Entity: ['', Validators.required],
      Position: ['', Validators.required], // Position is required
      Description: [''],
      IsActive: [true], // IsActive is true by default
      IsDefault: [false], // IsDefault is false by default
    });

    //cpForm
    this.cpInstructionForm = this.fb.group({
      instructions: this.fb.array([]),
    });

    if (
      this.counterpartyInstructions &&
      this.counterpartyInstructions.length > 0
    ) {
      this.parsedInstructions = this.parseInstructions(
        this.counterpartyInstructions
      );
      this.parsedInstructions.forEach((instruction, index) => {
        const statusValue = this.counterpartyInstructions[index].Status; // Get the status value for the current instruction
        instruction.Status = statusValue; // Assign the status value to the instruction
        const instructionGroup = this.createInstructionGroup(instruction);
        this.cpInstructionFormArray.push(instructionGroup);
      });
    }
    this.disableAllEditControls(this.accountForm);
    this.disableAllEditControls(this.cpInstructionForm);
  }

  getAccountValidator(): Validators | null {
    if (this.selectedEntity) {
      return Validators.required;
    } else {
      return null; // If counterparty is selected, account field is not required
    }
  }

  handleEntityAndCounterpartySelected() {
    if (this.selectedEntity && !this.selectedCounterparty) {
      // Handle when selectedEntity is passed and selectedCounterparty is not passed
      this.selectedCounterparty = null;
    } else if (!this.selectedEntity && this.selectedCounterparty) {
      // Handle when selectedCounterparty is passed and selectedEntity is not passed
      this.selectedEntity = null;
    }
  }

  onTypeChange(type: string) {
  this.selectedType = type;
  this.updateLabel();
}
onPartyChange(party: string) {
  this.selectedParty = party;
  this.updateLabel();
}


  //update label for newDeliveryInstructionForm
  updateLabel() {
    let label = '';

    // Append selectedPosition
    if (this.selectedPosition) {
      label += `${this.selectedPosition} `;
    }

    //Append Counterparty
    if (this.selectedCounterparty) {
      label += `${this.selectedCounterparty} `;
    }

    // Append selectedAccount
    if (this.selectedAccount) {
      label += ` ${this.selectedAccount} `;
    }

    // Append selectedCurrency
    if (this.selectedCurrency) {
      label += ` ${this.selectedCurrency} `;
    }
    if (this.selectedType) {
      label += `${this.selectedType} `;
    }
  if (this.selectedParty) {
      label += `${this.selectedParty} `;
    }
    this.newDeliveryInstructionForm.get('Label').setValue(label.trim());
  }

  positionMap = {
    settlement: 'Please enter the version in this format: CF_V1, CF_V2, etc.',
    fx: 'Please enter the version in this format: V1, V2, etc.',
    ccs: 'Please enter the version in this format: CCS_V1, CCS_V2, etc.',
    collateral: 'Please enter the version in this format: CL_V1, CL_V2, etc.',
  };

  getPreformatCodeTooltip(position: string): string {
    if (!position) {
        return 'Please enter the version in this format: V1, V2, etc.';
    }
    const key = position.toLowerCase();
    return this.positionMap[key] || 'Please enter the version in this format: V1, V2, etc.';
}

  onPositionChange(positionName: string) {
    this.selectedPosition = positionName;
    this.updateLabel();
    this.PreformatCodeVersionText =
      this.positionMap[positionName.toLowerCase()] ||
      'Please enter the version in this format: V1, V2, etc.';
    this.newDeliveryInstructionForm.get('Type').updateValueAndValidity();
    this.updatePartyLabel(positionName);
    this.currentAccounts = this.accounts.filter(
    (account) =>
      account.Position?.trim().toLowerCase() === positionName.trim().toLowerCase() &&
      account.Entity?.trim().toLowerCase() === this.selectedEntity?.trim().toLowerCase()
  );
  }
  //updatevalue for party
  updatePartyLabel(positionName: string) {
    const partyControl = this.newDeliveryInstructionForm.get('Party');
    if (positionName === this.POSITION.Collateral) {
      partyControl?.setValidators([Validators.required]);
      partyControl?.enable();
    } else {
      partyControl?.clearValidators();
      partyControl?.setValue('');
      partyControl?.disable();
    }
    partyControl?.updateValueAndValidity();
    
  }
  onAccountChange(accountNumber: string) {
    this.selectedAccount = accountNumber;
    this.updateLabel();
  }

  onCurrencyChange(currency: string) {
    this.selectedCurrency = currency;
    this.updateLabel();
  }

  // Function to handle tab change in Positions
  onSubTabChange(tab: any): void {
    this.subContentTab = tab.Id;
    this.currentPosition = tab.Name;
    this.currentAccounts = this.accounts.filter(
            (account) => account.Position === this.currentPosition
          );
    this.accountNumber = this.accounts.map((tab: any) => tab.Number);
    if (this.accountNumber.length > 0) {
      // Set the ID of the first tab as the default selected tab
      this.subSubContentTab = this.currentAccounts[0].Id;
      // Call the method to get delivery instructions for the first account
      
      this.getSettlementDeliveryInstructionByAccount(
        this.selectedEntity,
        this.selectedCounterparty,
        this.currentAccounts[0].Number
      );
    }
    
    if (this.selectedCounterparty) {
      this.getSettlementDeliveryInstructionByCp(this.selectedCounterparty);
    }
    this.resetAccountTabs(tab);
  }

  resetAccountTabs(tab: any) {
    this.subSubContentTab = this.currentAccounts[0].Id; // Reset the selected account tab
  }

  // Function to handle tab change in Accounts
  onSubSubTabChange(tab: any): void {
    this.subSubContentTab = tab.Id;
    this.getSettlementDeliveryInstructionByAccount(
      this.selectedEntity,
      this.selectedCounterparty,
      tab.Number
    );
  }

  getSettlementPosition(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.deliveryinstructionsService.getSettlementPosition().subscribe(
      (tabs: any[]) => {
        this.tabData = tabs;
        this.tabNames = tabs.map((tab: { Name: string }) => tab.Name);
        const activeTabs = this.tabData.filter((tab) => tab.IsActive); // Filter active tabs
        if (activeTabs.length > 0) {
          // Find the first active tab
          const firstActiveTab = activeTabs.find(
            (tab) => tab.Name === this.currentPosition
          );
          if (firstActiveTab) {
            this.subContentTab = firstActiveTab.Id;
            this.currentPosition = firstActiveTab.Name;
          } else {
            // If the current position is not found among active tabs, default to the first active tab
            this.subContentTab = activeTabs[0].Id;
            this.currentPosition = activeTabs[0].Name;
          }
        } else if (this.tabData.length > 0) {
          // If no active tabs found, default to the first tab
          this.subContentTab = this.tabData[0].Id;
          this.currentPosition = this.tabData[0].Name;
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.error('Error loading tabs:', error);
      }
    );
  }

  //get Accounts based on Positions and Entity
  getSettlementAccountByEntity(): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.deliveryinstructionsService
      .getSettlementAccountByEntity(this.selectedEntity)
      .subscribe(
        (tabs: any[]) => {
          this.accounts= tabs;
          this.currentAccounts = tabs.filter(
            (account) => account.Position === this.currentPosition
          );
          this.accountNumber = tabs.map((tab: any) => tab.Number);
          if (this.accountNumber.length > 0) {
            // Set the ID of the first tab as the default selected tab
            this.subSubContentTab = this.currentAccounts[0].Id;
            // Call the method to get delivery instructions for the first account
            
            this.getSettlementDeliveryInstructionByAccount(
              this.selectedEntity,
              this.selectedCounterparty,
              this.currentAccounts[0].Number
            );
          }
          this.spinner.hide();
        },
        (error) => {
          this.spinner.hide();
          this.errorHandler.handleErrorWithMessage(error, 'Error getting Accounts');
        }
      );
  }

  //Add Delivery Instruction Dial Box
  openAddTabDialog() {
    //reset controls
    this.newDeliveryInstructionForm.get('Position').setValue('');
    this.newDeliveryInstructionForm.get('Account').setValue('');
    this.addNewTabDialog.open();
  }

  closeAddTabDialog() {
    this.selectedPosition = '';
    this.selectedAccount = '';
    this.selectedCurrency = '';
    this.newDeliveryInstructionForm.reset();
    this.newDeliveryInstructionForm
      .get('Entity')
      ?.setValue(this.selectedEntity);
    this.newDeliveryInstructionForm
      .get('Counterparty')
      ?.setValue(this.selectedCounterparty);
    this.addNewTabDialog.close();
  }

  openAddPositionDialog() {
    // Reinitialize the form group with updated values
    this.newPositionForm = this.fb.group({
      Name: ['', Validators.required],
      IsActive: [{ value: true, disabled: true }], // IsActive is true by default
    });
    this.addNewPositionDialog.open();
  }

  closeAddPositionDialog() {
    this.newPositionForm.reset();
    this.addNewPositionDialog.close();
  }

  saveNewPostion() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (this.newPositionForm.valid) {
      const newPositionData = {
        Name: this.newPositionForm.value.Name.trim(),
        IsActive: true,
      };
      this.deliveryinstructionsService
        .addNewPosition(newPositionData)
        .subscribe(
          (data) => {
            this.spinner.hide();
            this.toasterService.toast('New Position has been added');
            // Reset the form
            this.newPositionForm.reset();
            this.addNewPositionDialog.close();
            this.getSettlementPosition();
          },
          (error) => {
            this.spinner.hide();
            this.errorHandler.handleErrorWithMessage(error, 'Error adding new Position');
          }
        );
    }
  }

  openAddAccountDialog() {
    this.newAccountForm = this.fb.group({
      Number: ['', Validators.required],
      Entity: ['', Validators.required],
      Position: ['', Validators.required], // Position is required
      Description: [''],
      IsActive: [{ value: true, disabled: true }], // IsActive is true by default
      IsDefault: [{ value: false, disabled: true }], // IsDefault is false by default
    });
    this.addNewAccountDialog.open();
  }

  closeAddAccountDialog() {
    this.addNewAccountDialog.close();
    this.newAccountForm.reset();
  }

  saveNewAccount() {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    if (this.newAccountForm.valid) {
      const newAccountData = {
        Number: this.newAccountForm.value.Number.trim(),
        Entity: this.newAccountForm.value.Entity,
        Description: this.newAccountForm.value.Description,
        Position: this.newAccountForm.value.Position,
        IsActive: true,
        IsDefault: this.newAccountForm.value.IsDefault,
      };
      this.deliveryinstructionsService.addNewAccount(newAccountData).subscribe(
        (data) => {
          this.spinner.hide();
          console.log('Changes successfully saved:', data);
          this.toasterService.toast('New Account has been added');
          // Reset the form
          this.newAccountForm.reset();
          this.addNewAccountDialog.close();
          this.getSettlementAccountByEntity();
        },
        (error) => {
          this.spinner.hide();
          this.errorHandler.handleErrorWithMessage(error, 'Error adding new Account');
        }
      );
    }
  }

  // Function to add a new manual field in newDeliveryInstructionForm
  addSSIField() {
    // Push a new field object with default values to the fields array
    this.fields.push({ label: '', value: '' });

    // Dynamically add form controls to the FormGroup for the new field
    const index = this.fields.length - 1;
    this.newDeliveryInstructionForm.addControl(
      `label${index}`,
      new FormControl('')
    );
    this.newDeliveryInstructionForm.addControl(
      `value${index}`,
      new FormControl('')
    );
  }

  // Function to remove manual fields in newDeliveryInstructionForm
  removeSSIField(index: number) {
    // Remove the form controls for the deleted row
    this.newDeliveryInstructionForm.removeControl(`label${index}`);
    this.newDeliveryInstructionForm.removeControl(`value${index}`);
    // Reset the form controls for the deleted row
    this.newDeliveryInstructionForm.setControl(
      `label${index}`,
      new FormControl('')
    );
    this.newDeliveryInstructionForm.setControl(
      `value${index}`,
      new FormControl('')
    );
    // Remove the field at the specified index from the fields array
    this.fields.splice(index, 1);
  }

  //editing scenario for accountForm
  removeManualField(form: FormGroup, parentIndex: number, childIndex: number) {
    const manualFields = (form.get('instructions') as FormArray)
      .at(parentIndex)
      .get('Manual') as FormArray;
    manualFields.removeAt(childIndex);
  }
  //for accountForm
  addManualField(form: FormGroup, parentIndex: number, manual: any) {
    const manualFields = (form.get('instructions') as FormArray)
      .at(parentIndex)
      .get('Manual') as FormArray;
    manualFields.push(this.createManualGroup(manual || {}));
  }

  //for accountForm
  isManualFieldsValid(instructionIndex: number): boolean {
    const manualControls = this.getManualControls(instructionIndex).controls;
    return manualControls.every((manual) => {
      const keyControl = manual.get('key');
      // Check if key is not empty and if either value is provided
      return keyControl.value;
    });
  }

  //for accountForm
  isPreformatCodeVersionPresent(instructionIndex: number): boolean {
    const status = this.instructionFormArray.at(instructionIndex).get('Status')?.value;
    if (status === STATUS.Terminated){
      return true;
    }
 
    const ssiControls = this.getSsiControls(instructionIndex)?.controls;
    return ssiControls?.every((ssi) => {
      const preformatCodeVersion = ssi.get('PreformatCodeVersion');
      return preformatCodeVersion.value?.trim();
    });
  }

  //for Cpform
  isCpManualFieldsValid(instructionIndex: number): boolean {
    const manualControls = this.getCpManualControls(instructionIndex).controls;
    return manualControls.every((manual) => {
      const keyControl = manual.get('key');
      // Check if key is not empty and if either value is provided
      return keyControl.value;
    });
  }
  //for Cpform
  isCpPreformatCodeVersionPresent(instructionIndex: number): boolean {
  const status = this.cpInstructionFormArray.at(instructionIndex).get('Status')?.value;
  if (status === STATUS.Terminated){
    return true;
  }
  const ssiControls = this.getCpSsiControls(instructionIndex)?.controls;
  return ssiControls?.every((ssi) => {
    const preformatCodeVersion = ssi.get('PreformatCodeVersion');
    return !!preformatCodeVersion.value?.trim();
  });
}
//for Cpform
isCPPartyValid(instructionIndex: number): boolean {
  const partyControl = this.cpInstructionFormArray.at(instructionIndex).get('Party');
  
  // If the status is 'Terminated', the Party field is not required
  if (this.currentPosition !== POSITION.Collateral) {
    return true; // Party is not required when status is not 'Collateral'
    
  }
  else  {
    if (partyControl && partyControl.value) {
      return true; // Party is valid if it has a value
    } else {
      return false; // Party is invalid if it is empty
    }
  }

}
isPartyValid(instructionIndex: number): boolean {
  const partyControl = this.instructionFormArray.at(instructionIndex).get('Party');
  
  // If the status is 'Terminated', the Party field is not required
  if (this.currentPosition !== POSITION.Collateral) {
    return true; // Party is not required when status is not 'Collateral'
    
  }
  else  {
    if (partyControl && partyControl.value) {
      return true; // Party is valid if it has a value
    } else {
      return false; // Party is invalid if it is empty
    }
  }

}
  //for accountForm
  enableEdit(form: FormGroup, i: number): void {
    const instructionFormArray = form.get('instructions') as FormArray;
    const instructionGroup = instructionFormArray.at(i) as FormGroup;

    if (!instructionGroup.disabled) {
      instructionGroup.disable(); // Disable form controls if not disabled already
    } else {
      instructionGroup.enable(); // Enable form controls if disabled
    }
  }

  //for accountForm
  disableAllEditControls(form: FormGroup): void {
    const instructionFormArray = form.get('instructions') as FormArray;
    instructionFormArray.controls.forEach((instructionGroup: FormGroup) => {
      instructionGroup.disable(); // Disable each instruction group
    });
  }

  //for newDeliveryInstructionForm
  isLabelInvalid(index: number): boolean {
    const labelControl = this.newDeliveryInstructionForm.get(`label${index}`);
    const valueControl = this.newDeliveryInstructionForm.get(`value${index}`);
    return (
      (labelControl.invalid && labelControl.touched && valueControl.value) ||
      (!labelControl.value && valueControl.value && valueControl.touched)
    );
  }

  //for newDeliveryInstructionForm
  isValueInvalid(index: number): boolean {
    const valueControl = this.newDeliveryInstructionForm.get(`value${index}`);
    const labelControl = this.newDeliveryInstructionForm.get(`label${index}`);
    return (
      (valueControl.invalid && valueControl.touched && !labelControl.value) ||
      (!valueControl.value && labelControl.touched && labelControl.value)
    );
  }

  //for accountForm
  saveSettlementDeliveryInstructions(form: FormGroup, index: number): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.isDuplicatePreformatCodeVersion = false;
    const accountData = this.filteredAccounts[index];
    const cpInstructioData = this.counterpartyInstructions[index];
    const instructionsArray = form.get('instructions') as FormArray;

    const instruction = instructionsArray.at(index)?.value;
    const status = instruction.Status;
    let i: any;
    if (status !== STATUS.Terminated) {
    if (this.selectedEntity) {
      this.filteredAccounts.forEach((element) => {
        i = JSON.parse(element.Instructions)[0];
        if (
          i.Position === instruction.Position &&
          i.Currency === instruction.Currency &&
          i.Account === instruction.Account &&
          i.Type === instruction.Type &&
          i.Party === instruction.Party &&
          i.SSI[0]?.PreformatCodeVersion?.toUpperCase() ===
            instruction.SSI[0].PreformatCodeVersion.toUpperCase()
        ) {
          this.isDuplicatePreformatCodeVersion = true;
          return;
        }
      });
    }

    if (this.selectedCounterparty) {
      this.counterpartyInstructions.forEach((element) => {
        i = JSON.parse(element.Instructions)[0];
        if (
          i.Position === instruction.Position &&
          i.Currency === instruction.Currency &&
          i.Type === instruction.Type &&
          i.Party === instruction.Party &&
          i.SSI[0]?.PreformatCodeVersion?.toUpperCase() ===
            instruction.SSI[0].PreformatCodeVersion.toUpperCase()
        ) {
          this.isDuplicatePreformatCodeVersion = true;
          return;
        }
      });
    }

    if (this.isDuplicatePreformatCodeVersion) {
      this.spinner.hide();
      this.toasterService.toast('Preformat Code Version already exists');
      return;
    }
  }
    // Declare formattedData variable
    let formattedData: any;
    // Format the specific instruction data
    const formattedInstructions = {
      Position: instruction.Position,
      Account: instruction.Account,
      Currency: instruction.Currency,
      Type: instruction.Type ? instruction.Type.trim() : '',
      Party: instruction.Party,
      SSI: instruction.SSI.map((ssiItem: any) => ({
        AccNumber: ssiItem.AccNumber,
        AccName: ssiItem.AccName,
        AgentBank: ssiItem.AgentBank,
        Beneficiary: ssiItem.Beneficiary,
        ABA: ssiItem.ABA,
        Swift: ssiItem.Swift,
        SortCode: ssiItem.SortCode,
        PreformatCodeVersion: ssiItem.PreformatCodeVersion,
      })),
      Manual: instruction.Manual.map((manualItem: any) => ({
        key: manualItem.key,
        value: manualItem.value,
      })),
    };

    // Create an array to hold the formatted instructions
    const formattedInstructionsArray = [formattedInstructions];

    // Constructing the formatted data object
    if (accountData) {
      formattedData = {
        Id: accountData.Id, // Assuming accountData has an Id property
        Position: accountData.Position,
        Status: status,
        Counterparty: accountData.Counterparty,
        Entity: accountData.Entity,
        Type: instruction.Type ? instruction.Type.trim() : '',
        Party: instruction.Party,
        Instructions: JSON.stringify(formattedInstructionsArray),
      };
    } else if (cpInstructioData) {
      formattedData = {
        Id: cpInstructioData.Id, // Assuming cpInstructioData has an Id property
        Position: cpInstructioData.Position,
        Status: status,
        Counterparty: cpInstructioData.Counterparty,
        Entity: cpInstructioData.Entity,
        Type: instruction.Type ? instruction.Type.trim() : '',
        Party: instruction.Party,
        Instructions: JSON.stringify(formattedInstructionsArray),
      };
    }

    // Save the formatted data only if it's defined
    if (formattedData) {
      this.deliveryinstructionsService
        .saveSettlementDeliveryInstructions(formattedData.Id, formattedData)
        .subscribe(
          () => {
            this.spinner.hide();
            console.log(
              `Delivery instructions for Id ${formattedData.Id} saved successfully`
            );
            this.toasterService.toast(
              'Delivery instructions saved successfully'
            );
            if (accountData) {
              this.getSettlementDeliveryInstructionByAccount(
                this.selectedEntity,
                this.selectedCounterparty,
                instruction.Account
              );
            } else {
              this.getSettlementDeliveryInstructionByCp(
                this.selectedCounterparty
              );
            }
            this.closeAddTabDialog();
          },
          (error) => {
            this.spinner.hide();
            this.errorHandler.handleErrorWithMessage(error, 'Error saving Delivery Instructions');
            this.closeAddTabDialog();
          }
        );
    } else {
      // Hide the spinner if formattedData is not defined
      this.spinner.hide();
    }
  }

  //for newDeliveryInstructionForm
  isSaveDisabled(): boolean {
    for (let i = 0; i < this.fields.length; i++) {
      if (this.isLabelInvalid(i)) {
        return true; // Disable save button if any label is invalid
      }
    }
    return false; // Enable save button if all labels are valid
  }

  //for newDeliveryInstructionForm
  addNewSettlementDeliveryInstructions(data: any): void {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.isDuplicatePreformatCodeVersion = false;
    // Check form validity based on the data type
    if (data === this.newDeliveryInstructionForm.value) {
      if (this.newDeliveryInstructionForm.valid) {
        let i: any;
        if (this.selectedEntity) {
          this.filteredAccounts.forEach((element) => {
            i = JSON.parse(element.Instructions)[0];
            if (
              i.Position === data.Position &&
              i.Currency === data.Currency &&
              i.Account === data.Account &&
              i.SSI[0].PreformatCodeVersion === data.PreformatCodeVersion
            ) {
              this.isDuplicatePreformatCodeVersion = true;
              return;
            }
          });
        }
        if (this.selectedCounterparty) {
          this.counterpartyInstructions.forEach((element) => {
            i = JSON.parse(element.Instructions)[0];
            if (
              i.Position === data.Position &&
              i.Currency === data.Currency &&
              i.SSI[0].PreformatCodeVersion === data.PreformatCodeVersion
            ) {
              this.isDuplicatePreformatCodeVersion = true;
              return;
            }
          });
        }

        if (this.isDuplicatePreformatCodeVersion && data.Status !== STATUS.Terminated) {
          this.spinner.hide();
          this.toasterService.toast('Preformat Code Version already exists');
          return;
        }
        // Construct the manual section dynamically
        const Manual = [];
        for (let i = 0; i < this.fields.length; i++) {
          const labelControl = this.newDeliveryInstructionForm.get(`label${i}`);
          const valueControl = this.newDeliveryInstructionForm.get(`value${i}`);
          if (labelControl && valueControl && labelControl.value) {
            Manual.push({
              key: labelControl.value,
              value: valueControl.value,
            });
          }
        }

        // Transform the form data to match the expected structure
        const formattedData = {
          Position: data.Position,
          Status: data.Status,
          Entity: this.selectedEntity,
          Counterparty: this.selectedCounterparty,
          Type: data.Type ? data.Type.trim() : '',
          Party: data.Party,
          Instructions: JSON.stringify([
            {
              Position: data.Position,
              Account: data.Account,
              Currency: data.Currency,
              Type: data.Type ? data.Type.trim() : '',
              Party: data.Party,
              SSI: [
                {
                  AccNumber: data.AccountNumber,
                  AccName: data.AccountName,
                  AgentBank: data.AgentBank,
                  Beneficiary: data.Beneficiary,
                  ABA: data.ABA,
                  Swift: data.Swift,
                  SortCode: data.SortCode,
                  PreformatCodeVersion: data.PreformatCodeVersion,
                },
              ],
              Manual: Manual, // Add the dynamic manual fields
            },
          ]),
        };
        // Call endpoint with formatted delivery instruction data
        this.deliveryinstructionsService
          .addNewSettlementDeliveryInstructions(formattedData)
          .subscribe(
            () => {
              this.spinner.hide();
              this.newDeliveryInstructionForm.reset();
              this.fields = [];
              this.toasterService.toast(
                'Delivery instructions saved successfully'
              );
              this.closeAddTabDialog();
              if (data.Account) {
                this.getSettlementDeliveryInstructionByAccount(
                  this.selectedEntity,
                  this.selectedCounterparty,
                  data.Account
                );
              } else {
                this.getSettlementDeliveryInstructionByCp(
                  this.selectedCounterparty
                );
              }
            },
            (error) => {
              this.spinner.hide();
              console.error('Error:', error);
              this.newDeliveryInstructionForm.reset();
              this.fields = [];
              this.errorHandler.handleErrorWithMessage(error, 'Error saving Delivery Instructions');
              this.closeAddTabDialog();
            }
          );
      } else {
        this.spinner.hide();
        this.newDeliveryInstructionForm.reset();
        this.fields = [];
        this.closeAddTabDialog();
      }
    }
  }

  setMetaDataTable(names: string[]): void {
    if (!names) {
      names = this.metaDataTables;
    }
    this.deliveryinstructionsService
      .setMetaDataTableList(names)
      .subscribe((result: any) => {
        if (result) {
          this.MetaData = result;
          for (const key in result) {
            if (!this.MetaDataNames[key]) {
              this.MetaDataNames[key] = [];
            }
            for (const item of result[key]) {
              if (
                !this.MetaDataNames[key].some((x: any) => x.Name === item.Name)
              ) {
                this.MetaDataNames[key].push({ Name: item.Name });
              }
            }
          }
          for (const name of names) {
            if (this.metaDataTables.includes(name) && this.MetaData[name]) {
              this.MetaDataTables[name] = this.MetaData[name];
              this.MetaDataNames[name] = this.MetaDataNames[name];
            } else {
              for (const key in this.metaDataMiscMap) {
                if (
                  this.metaDataMiscMap[key].includes(name) &&
                  this.MetaData[key]
                ) {
                  this.MetaDataTables[name] = this.MetaData[key];
                  this.MetaDataNames[name] = this.MetaDataNames[key];
                }
              }
            }
          }
        } else {
          this.MetaData = {};
        }
      });
  }

  getSettlementDeliveryInstructionByAccount(
    entity: string | null,
    counterparty: string | null,
    accountNumber: string
  ): void {
    this.spinner.show();
    this.deliveryinstructionsService
      .getSettlementDeliveryInstructionByAccount(
        entity,
        counterparty,
        accountNumber
      )
      .subscribe(
        (response: any[]) => {
          this.filteredAccounts = response.filter(
            (account) => account.Position === this.currentPosition
          );
          this.initForm();
          this.spinner.hide();
        },
        (error) => {
          this.spinner.hide();
          this.errorHandler.handleErrorWithMessage(error, 'Error getting Delivery Instructions');
        }
      );
  }

  getSettlementDeliveryInstructionByCp(counterparty: string): void {
    this.spinner.show();
    this.deliveryinstructionsService
      .getSettlementDeliveryInstructionByCp(counterparty)
      .subscribe(
        (response: any[]) => {
          this.counterpartyInstructions = response.filter(
            (account) => account.Position === this.currentPosition
          );
          this.initForm();
          this.spinner.hide();
        },
        (error) => {
          this.spinner.hide();
          this.errorHandler.handleErrorWithMessage(error, 'Error getting Delivery Instructions');
        }
      );
  }
  get instructionFormArray(): FormArray {
    return this.accountForm.get('instructions') as FormArray;
  }

  get cpInstructionFormArray(): FormArray {
    return this.cpInstructionForm.get('instructions') as FormArray;
  }

  get manualControls(): FormArray {
    return this.accountForm.get('manual') as FormArray;
  }

  createInstructionGroup(instruction: any): FormGroup {
    const ssiArray = this.fb.array(
  instruction.SSI.map((ssi: any) =>
    this.createSsiGroup(ssi, instruction.Status)
  )
);

    const manualArray = this.fb.array(
      (instruction.Manual || []).map((manual: any) =>
        this.createManualGroup(manual)
      )
    );

    return this.fb.group({
      Position: [instruction.Position, Validators.required],
      Account: [instruction.Account, Validators.required],
      Currency: [instruction.Currency, Validators.required],
      Status: [instruction.Status, Validators.required],
      Type: [instruction.Type || ''],
      Party: [instruction.Party || ''],
      SSI: ssiArray,
      Manual: manualArray,
    });
  }

  createSsiGroup(ssi: any, status: string): FormGroup {
    const isTerminated = status === STATUS.Terminated;
    return this.fb.group({
      AccNumber: ssi.AccNumber,
      AccName: ssi.AccName,
      AgentBank: ssi.AgentBank,
      Beneficiary: ssi.Beneficiary,
      ABA: ssi.ABA,
      Swift: ssi.Swift,
      SortCode: ssi.SortCode,
      PreformatCodeVersion: [
      ssi.PreformatCodeVersion,
      isTerminated ? [] : Validators.required
    ],
    });
  }

  createManualGroup(manual: any): FormGroup {
    return this.fb.group({
      key: [manual.key, Validators.required],
      value: [
        manual.value !== undefined ? manual.value : '',
        Validators.required,
      ],
    });
  }

  getSsiControls(index: number): FormArray {
    return this.instructionFormArray.controls[index]?.get('SSI') as FormArray;
  }

  getManualControls(index: number): FormArray {
    return this.instructionFormArray.controls[index].get('Manual') as FormArray;
  }

  getCpSsiControls(index: number): FormArray {
    return this.cpInstructionFormArray.controls[index]?.get('SSI') as FormArray;
  }

  getCpManualControls(index: number): FormArray {
    return this.cpInstructionFormArray.controls[index].get(
      'Manual'
    ) as FormArray;
  }

  parseInstructions(instructions: any[]): any[] {
    return instructions.map((instruction) => {
      const parsedInstruction = JSON.parse(instruction.Instructions);
      const Manuals = parsedInstruction[0].Manual || []; // Handle cases where manual is null or not present
      return {
        ...parsedInstruction[0],
        Manual: Manuals,
      };
    });
  }
}
