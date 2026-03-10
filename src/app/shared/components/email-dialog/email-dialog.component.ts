import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';

export interface EmailSubmitEvent {
  recipients: { email: string }[];
  comments: string;
}

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.scss']
})
export class EmailDialogComponent implements OnChanges {
  @Input() title: string = 'Email Recipients';
  @Input() recipients: any[] = [];
  @Input() noEmailMessage: string = '';
  @Input() visible: boolean = false;
  @Input() loading: boolean = false;
  @Input() commentsLabel: string = 'Comments';
  @Input() commentsMinLength: number = 5;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<EmailSubmitEvent>();

  emailDialogForm: FormGroup;
  removeRecipients: string[] = [];
  validEmails: any[] = [];

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipients'] && changes['recipients'].currentValue) {
      this.resetForm();
    }
    if (changes['visible'] && changes['visible'].currentValue) {
      this.resetForm();
    }
  }

  private initForm(): void {
    this.emailDialogForm = this.fb.group({
      emailList: this.fb.array([]),
      comments: ['', [
        Validators.minLength(this.commentsMinLength),
        this.validationService.noLeadingTrailingSpacesValidator(),
        Validators.pattern('^[a-zA-Z0-9 ]+(\\.[a-zA-Z0-9 ]+)*\\.?$')
      ]]
    });
  }

  /**
   * Resets the email dialog form to its initial state.
   * Clears all form arrays, resets validation state, and populates the form
   * with fresh recipient data from the component's recipients input.
   * Called when recipients change or dialog becomes visible.
   * 
   * @private Internal method for form state management
   */
  private resetForm(): void {
    try {
      // Reset internal state arrays
      this.removeRecipients = [];
      this.validEmails = [];
      
      const emailListArray = this.emailDialogForm.get('emailList') as FormArray;
      emailListArray.clear();
      
      // Validate and add recipient emails
      if (Array.isArray(this.recipients)) {
        this.recipients.forEach(recipient => {
          if (recipient?.email && typeof recipient.email === 'string') {
            const trimmedEmail = recipient.email.trim();
            if (trimmedEmail) {
              emailListArray.push(this.createEmailControl(trimmedEmail));
            }
          }
        });
      }
      
      // Reset comments field
      this.emailDialogForm.get('comments')?.setValue('');
      
      // Update form validation state
      this.emailDialogForm.updateValueAndValidity();
    } catch (error) {
      console.error('Error resetting email dialog form:', error);
    }
  }

  /**
   * Gets the email list FormArray from the main form.
   * Provides convenient access to the email controls for template binding
   * and programmatic form manipulation throughout the component.
   * 
   * @returns FormArray containing all email recipient controls
   */
  get emailListControls(): FormArray {
    return this.emailDialogForm.get('emailList') as FormArray;
  }

  /**
   * Creates a new FormGroup control for an email recipient with validation rules.
   * Sets up required validation and email format validation for the email field.
   * Used when adding new recipients to the email list FormArray.
   * 
   * @param email - The initial email address value (optional, defaults to empty string)
   * @returns FormGroup containing email control with validators applied
   */
  createEmailControl(email: string = ''): FormGroup {
    try {
      // Sanitize input email value
      const sanitizedEmail = email?.trim() || '';
      
      return this.fb.group({
        email: [
          sanitizedEmail, 
          [
            Validators.required, 
            Validators.email
          ]
        ]
      });
    } catch (error) {
      console.error('Error creating email form control:', error);
      // Return a basic control with empty value as fallback
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    }
  }

  /**
   * Adds a new email recipient control to the form's email list.
   * Creates a new form control with validation and adds it to the FormArray.
   * Also clears any existing "no email" message when recipients are added.
   * 
   * @param email - The initial email address value for the new control (optional, defaults to empty string)
   */
  addRecipient(email: string = ''): void {
    try {
      // Sanitize input email value
      const sanitizedEmail = email?.trim() || '';
      
      const emailListArray = this.emailDialogForm.get('emailList') as FormArray;
      
      // Add new email control to the form array
      emailListArray.push(this.createEmailControl(sanitizedEmail));
      
      // Clear the "no email" message since we now have recipients
      this.noEmailMessage = '';
      
      // Update form validation state
      this.onEmailChanged();
    } catch (error) {
      console.error('Error adding email recipient:', error);
    }
  }

  /**
   * Retrieves the email address value from a form control at the specified index.
   * Safely accesses the email form control and returns the current value.
   * Used throughout the component for getting email addresses from the FormArray.
   * 
   * @param index - The zero-based index of the email control in the FormArray
   * @returns The email address string, or empty string if not found or invalid index
   */
  getEmailAddress(index: number): string {
    try {
      // Validate index bounds before accessing FormArray
      const emailListArray = this.emailListControls;
      if (index < 0 || index >= emailListArray.length) {
        console.warn(`Invalid email address index: ${index}`);
        return '';
      }

      const emailControl = emailListArray.at(index)?.get('email');
      return emailControl?.value?.trim() || '';
    } catch (error) {
      console.error('Error retrieving email address:', error);
      return '';
    }
  }

  /**
   * Determines if an email recipient at the specified index is currently hidden/removed.
   * Checks if the email address at the given index exists in the removeRecipients list,
   * which tracks recipients that have been hidden by the user.
   * 
   * @param index - The zero-based index of the email control in the FormArray
   * @returns True if the recipient is hidden/removed, false if visible
   */
  notRecipientCondition(index: number): boolean {
    try {
      // Validate index bounds before proceeding
      const emailListArray = this.emailDialogForm.get('emailList') as FormArray;
      if (index < 0 || index >= emailListArray.length) {
        console.warn(`Invalid email recipient index: ${index}`);
        return false;
      }

      const recipientEmail = this.getEmailAddress(index);
      return this.removeRecipients.includes(recipientEmail);
    } catch (error) {
      console.error('Error checking recipient condition:', error);
      return false;
    }
  }

  /**
   * Toggles the visibility of an email recipient in the form.
   * For empty email addresses, removes the form control entirely.
   * For non-empty addresses, toggles between hidden (disabled) and visible (enabled) states.
   * Maintains a list of hidden recipients for state management.
   * 
   * @param index - The zero-based index of the email control in the FormArray
   */
  hideRecipient(index: number): void {
    try {
      const emailListArray = this.emailDialogForm.get('emailList') as FormArray;
      
      // Validate index bounds
      if (index < 0 || index >= emailListArray.length) {
        console.warn(`Invalid email recipient index: ${index}`);
        return;
      }

      const emailControl = emailListArray.at(index).get('email');
      const emailAddress = (emailControl?.value || '').trim();

      // Remove empty email rows entirely
      if (!emailAddress) {
        emailListArray.removeAt(index);
        this.onEmailChanged();
        return;
      }

      // Toggle visibility for non-empty emails
      const hiddenIndex = this.removeRecipients.indexOf(emailAddress);
      
      if (hiddenIndex > -1) {
        // Currently hidden → make visible (enable control)
        this.removeRecipients.splice(hiddenIndex, 1);
        emailControl?.enable({ emitEvent: false });
      } else {
        // Currently visible → hide (disable control)
        this.removeRecipients.push(emailAddress);
        emailControl?.disable({ emitEvent: false });
      }

      // Update form validation state
      this.onEmailChanged();
    } catch (error) {
      console.error('Error toggling email recipient visibility:', error);
    }
  }

/**
 * Checks if the email list is empty of valid, enabled email addresses.
 * A valid email must be enabled (not disabled/hidden), contain a non-empty value,
 * and pass form validation. Also updates the validEmails cache for use by other methods.
 * 
 * @returns True if no valid emails exist, false if at least one valid email is present
 */
isEmailListEmpty(): boolean {
  try {
    const arr = this.emailDialogForm.get('emailList') as FormArray;
    
    // Filter for enabled, valid, non-empty emails and cache the result
    this.validEmails = arr.controls.filter(c => {
      const emailControl = c.get('email');
      const emailValue = (emailControl?.value || '').trim();
      return emailControl?.enabled && !!emailValue && emailControl.valid;
    });

    return this.validEmails.length === 0;
  } catch (error) {
    console.error('Error checking email list state:', error);
    // Reset validEmails on error and assume list is empty for safety
    this.validEmails = [];
    return true;
  }
}

/**
 * Checks if any email controls in the form are currently visible (enabled) to the user.
 * Used to determine UI state for showing/hiding email-related elements and controls.
 * An email is considered visible if its form control is enabled (not disabled/hidden).
 * 
 * @returns True if at least one email control is enabled/visible, false if all are disabled/hidden
 */
isAnyEmailVisible(): boolean {
  try {
    const arr = this.emailDialogForm.get('emailList') as FormArray;
    return arr.controls.some(c => c.get('email')?.enabled);
  } catch (error) {
    console.error('Error checking email visibility state:', error);
    return false;
  }
}

  /**
   * Updates form validation state to keep UI controls (like disabled buttons) in sync.
   * Called when email list changes to refresh the validation state without triggering
   * value change events. This ensures the Submit button disabled state stays current.
   * 
   * @private Internal method used for form state management
   */
  onEmailChanged(): void {
    try {
      // Keep the disabled condition in sync with live typing by refreshing validation
      this.emailDialogForm.updateValueAndValidity({ emitEvent: false });
    } catch (error) {
      console.error('Error updating form validation state:', error);
    }
  }


  /**
   * Handles cancel action when user cancels the email dialog.
   * Resets the form state and notifies parent component of cancellation.
   * 
   * @emits cancel - Void event indicating dialog was cancelled
   */
  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  /**
   * Handles form submission when user clicks Send Mail button.
   * Validates form state, extracts valid email recipients and comments,
   * then emits the data to parent component.
   * 
   * @emits submit - EmailSubmitEvent containing recipients and comments
   */
  onSubmit(): void {
    // Validate form state before processing
    if (!this.isFormReadyForSubmission()) {
      return;
    }

    try {
      const submissionData = this.buildSubmissionData();
      this.submit.emit(submissionData);
    } catch (error) {
      console.error('Error preparing email submission data:', error);
      // Could emit an error event here if needed
    }
  }

  /**
   * Validates that the form is in a valid state for submission.
   * Checks form validity and ensures at least one valid email exists.
   * 
   * @returns True if form is ready for submission, false otherwise
   */
  private isFormReadyForSubmission(): boolean {
    return this.emailDialogForm.valid && 
           !this.isEmailListEmpty() && 
           this.validEmails.length > 0;
  }

  /**
   * Builds the submission data object from valid form values.
   * Uses pre-validated email list to avoid redundant filtering.
   * 
   * @returns EmailSubmitEvent object with recipients and comments
   */
  private buildSubmissionData(): EmailSubmitEvent {
    // Use already validated emails from isEmailListEmpty() call
    const recipients = this.validEmails.map(control => ({
      email: control.get('email')?.value?.trim() || ''
    }));

    const comments = this.emailDialogForm.get('comments')?.value?.trim() || '';

    return { recipients, comments };
  }
}