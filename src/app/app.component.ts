import { AfterContentInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { useAnimation } from '@angular/animations';
import {
  fadeIn,
  fadeOut,
  GlobalPositionStrategy,
  HorizontalAlignment,
  IgxDialogComponent,
  IgxNavigationDrawerComponent,
  IgxToastComponent,
  OverlaySettings,
  PositionSettings,
  VerticalAlignment,
} from 'igniteui-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateService } from './shared/services/dateService';
import { CustomErrorHandler } from './shared/services/error-handler.service';
import { SpinnerService } from './shared/services/spinner.service';
import { ToasterService } from './shared/services/toaster.service';
import { AzureOidcCoreService } from './azure-oidc/azure-oidc-core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, AfterContentInit {
  @ViewChild('toaster', { static: true }) public toaster!: IgxToastComponent;
  @ViewChild('drawer', { static: true })
  public drawer!: IgxNavigationDrawerComponent;
  @ViewChild('alert', { static: true }) alertDialog!: IgxDialogComponent;

  title = 'clarus';
  spinner$ = this.spinner.spinner$;
  private destroy$ = new Subject<void>();
  defaultDate: Date;
  // tokenCheckInterval: any;
  // userActionTimeout: NodeJS.Timeout | undefined;

  constructor(
    public spinner: SpinnerService,
    private oAuthService: AzureOidcCoreService,
    readonly toasterService: ToasterService,
    readonly errorHandler: CustomErrorHandler,
    private date_service: DateService
  ) {
    this.defaultDate = new Date(
      date_service.AddNDays(this.date_service.GetTodayDate(), -2)
    );
    date_service.AdjustForWeekend(this.defaultDate);
    this.date_service.setDate(this.defaultDate);
  }
  public isError: boolean = false;
  public Errors: any[] = ['viewing errors'];

  public positionSettings: PositionSettings = {
    // horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Top,
    openAnimation: useAnimation(fadeIn),
    closeAnimation: useAnimation(fadeOut),
  };

  public customSettings: OverlaySettings = {
    positionStrategy: new GlobalPositionStrategy({
      horizontalDirection: HorizontalAlignment.Right,
      verticalDirection: VerticalAlignment.Top,
      openAnimation: useAnimation(fadeIn),
      closeAnimation: useAnimation(fadeOut),
    }),
    modal: true,
    closeOnOutsideClick: true,
  };

  /**
   * Subject used to parse toasting message.
   */
  //replace with this line while implementing the drawer
  // private toasterSubject = new Subject<void>();

  private toasterSubject = new Subject<string>();

  /**
   * Error message to display to user via dialog.
   */
  public isLoading: boolean = false;

  /**
   * Constructor
   * @param toasterService
   */

  /**
   * Called after the constructor, initializing input properties, and the first call to ngOnChanges,
   * subscribes to the error service after the component view is initialized.
   */
  public ngAfterContentInit(): void {
    this.toaster.open;
    this.toasterService
      .getMessage()
      .pipe(takeUntil(this.toasterSubject))
      .subscribe((message: any) => {
        this.toaster.open(message);
      });
    this.errorHandler.getIsError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: boolean) => {
        this.isError = result;
        this.Errors = this.errorHandler.getErrorList();
        if (this.isError && this.Errors.length > 0) {
          this.openErrorTray();
        }
      });
  
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }
  
  public toggleErrorTray(): void {
    const container = document.querySelector('.error-list-container');
    if (!container || !this.drawer) return;
  
    if (this.drawer.isOpen) {
      this.drawer.close();
      container.classList.add('closed');
      container.classList.remove('open');
    } else {
      container.classList.remove('closed');
      container.classList.add('open');
      this.drawer.open();
    }
  }
  
  public openErrorTray(): void {
    const container = document.querySelector('.error-list-container');
    if (container) {
      container.classList.remove('closed');
      container.classList.add('open');
    }
    if (this.drawer && !this.drawer.isOpen) {
      this.drawer.open();
    }
  }
  
  public closeTray(): void {
    this.drawer?.close();
    const container = document.querySelector('.error-list-container');
    container?.classList.add('closed');
  }
  
  public handleOutsideClick(event: Event): void {
    const drawerElement = document.querySelector('.error-list-container');
    const toggleBtn = document.querySelector('#notificationButton');
    if (
      this.drawer?.isOpen &&
      drawerElement &&
      !drawerElement.contains(event.target as Node) &&
      toggleBtn &&
      !toggleBtn.contains(event.target as Node)
    ) {
      this.drawer.close();
      drawerElement?.classList.add('closed');
    }
  }

  public clear() {
    this.errorHandler.clearErrorList();
    this.errorHandler.setIsError(false);
  }

  public ngOnDestroy(): void {
    this.toasterSubject.next('');
    this.toasterSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }
  showClearButton: boolean = false;

  public getErrorList(): void {
    if (this.drawer.isOpen) {
      this.drawer?.close();
      this.showClearButton = false;
    } else {
      this.drawer?.open();
      this.showClearButton = true;
    }
    this.Errors = this.errorHandler.getErrorList();
  }
}
