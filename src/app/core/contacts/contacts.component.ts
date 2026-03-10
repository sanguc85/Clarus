import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IgxDialogComponent, IgxGridComponent } from 'igniteui-angular';
import { ContactsService } from './contacts.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ContactsModel } from 'src/app/core/models/contactsmodel';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  @Input() public contacts;
  @Output() refreshContacts = new EventEmitter<void>();
  @ViewChild('gridContacts', { read: IgxGridComponent, static: true }) gridContacts: IgxGridComponent;
  @ViewChild('dialogAdd', { read: IgxDialogComponent, static: true }) addDialog: IgxDialogComponent;
  @ViewChild('confirmSaveDialog', { static: false }) confirmSaveDialog: IgxDialogComponent;
  contactsModel: ContactsModel = new ContactsModel();
  hasUnsavedChanges: boolean = false;
  selectedRow: any;
  contactsArray: ContactsModel[] = [];
  currentRowIndex: number = -1;
  lastEditedRow: any = null;
  isFirstEdit: boolean = true;
  contactForm: FormGroup;
  error: string = '';
  contactKeys: string[] = [];
  validationArray: any[] = [];
  counterparty: string;
  entity: string;
  newRowIndex: number = -1

  constructor(private contactService: ContactsService,
    private toasterService: ToasterService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {
    this.contactsModel = new ContactsModel();
  }

  ngOnInit(): void {
    this.initializeContacts();
  }

  ngOnChanges(): void {
    this.initializeContacts();
  }

  initializeContacts(): void {
    this.counterparty = this.contacts?.counterparty;
    this.entity = this.contacts?.entity;
    this.contactKeys = this.contacts?.keys?.filter(key => key !== 'Id' && key !== 'Counterparty');
    this.createForm();
  }

  createForm() {
    const formControls = this.contactKeys?.reduce((acc, key) => {
      acc[key] = ['', this.getValidatorsForKey(key)];
      return acc;
    }, {});
    this.contactForm = this.fb.group(formControls, { validators: this.validationService.atLeastOneFieldValidator() });
  }

  getValidatorsForKey(key: string) {
    switch (key) {
      case 'Email':
        return [Validators.required, this.validationService.customEmailValidator()];
      default:
        return [];
    }
  }

  addNewContacts() {
    this.contactForm.reset();
    this.addDialog.open();
  }

  public saveContacts(rowdata: any, isFromGrid: boolean = false, isFromConfirmDialog: boolean = false) {
    this.errorHandler.clearErrorList();
    this.contactsArray = [];
    this.validationArray = [];
    const contact = isFromGrid ? this.mapRowDataToContact(rowdata) : this.contactForm.value;
    if (isFromGrid && !this.validateContact(rowdata)) {
      return;
    }
    this.contactsArray.push(contact);
    if (!isFromConfirmDialog && confirm('Do you want to save this contact?')) {
      this.saveContactToService();
    } else if (isFromConfirmDialog) {
      this.saveContactToService();
    }
  }

  private saveContactToService() {
    this.spinner.show();
    this.contactService.saveContacts(this.contactsArray, this.counterparty, this.entity)
      .subscribe({
        next: response => {
          if (response) {
            this.toasterService.toast("Contact Saved successfully");
          }
          this.clearContact();
        },
        error: error => {
          this.errorHandler.handleErrorWithMessage(error, 'Failed to save contact');
          this.spinner.hide();
        }
      });
  }

  private mapRowDataToContact(rowdata: any): ContactsModel {
    const contact = new ContactsModel();
    contact.Id = rowdata.Id;
    contact.Position = rowdata.Position;
    contact.Name = rowdata.Name;
    contact.PhoneNumber = rowdata.PhoneNumber;
    contact.Email = rowdata.Email;
    contact.Comment = rowdata.Comment;
    return contact;
  }

  private validateContact(rowdata: any): boolean {
    if (!this.validationService.isAtLeastOneFieldNonEmpty(rowdata)) {
      this.validationArray.push('At least one field must be non-empty.');
    }

    else if (!this.validationService.validateEmail(rowdata.Email)) {
      this.validationArray.push('Email Id is invalid.');
    }

    if (this.validationArray.length > 0) {
      this.toasterService.toast(this.validationArray.join('\n'));
      return false;
    }
    return true;
  }


  public DeleteContacts(rowdata: any) {
    if (confirm('Do you want to delete this contact?')) {
      this.errorHandler.clearErrorList();
      this.spinner.show();
      this.contactService.deleteContacts(rowdata.Id)
        .subscribe({
          next: response => {
            if (response) {
              this.toasterService.toast("Contact Deleted successfully");
            }
            this.confirmSaveDialog.close();
            this.clearContact();
          },
          error: error => {
            this.errorHandler.handleErrorWithMessage(error, 'Failed to delete contact');
            this.spinner.hide();
            this.confirmSaveDialog.close();
            this.clearContact();
          }
        })
    }
  }

  clearContact() {
    this.spinner.hide();
    this.contactsArray = [];
    this.validationArray = [];
    this.refreshContacts.emit();
    this.addDialog.close();
  }

  onCellClick(event) {
    const newRowIndex = event.cell.row.index;
    if (this.currentRowIndex !== event.cell.row.index) {
      this.handleRowChange(newRowIndex, event);
    }
  }

  onCellEdit(event) {
    this.selectedRow = event.rowData;
    this.hasUnsavedChanges = true;
  }

  onCellEditExit(event) {
    const newRowIndex = event.cellID.rowIndex;
    const lastColumnIndex = this.contactKeys.length - 1;
    if (this.hasUnsavedChanges && event.cellID.columnID == lastColumnIndex) {
      this.handleRowChange(newRowIndex, event);
    }
  }

  handleRowChange(newRowIndex: number, event: any) {
    if (this.hasUnsavedChanges) {
      event.cancel = true; // Prevent the new row from being edited
      this.newRowIndex = newRowIndex; // Store the new row index
      this.confirmSaveDialog.open();
    }
    else {
      this.currentRowIndex = newRowIndex; // Update the current row index
      this.hasUnsavedChanges = false; // Reset the unsaved changes flag
    }
  }
  onSaveConfirm() {
    this.saveContacts(this.selectedRow, true, true);
    this.hasUnsavedChanges = false;
    this.confirmSaveDialog.close();
  }

  discardChanges() {
    this.hasUnsavedChanges = false;
    this.confirmSaveDialog.close();
    this.currentRowIndex = -1;
  }

  public cancel() {
    this.addDialog.close();
  }

  getContactCountByPosition(position: string): number {
    return this.contacts.contacts.filter(contact => contact.Position.trim() === position.trim()).length;
  }

}

