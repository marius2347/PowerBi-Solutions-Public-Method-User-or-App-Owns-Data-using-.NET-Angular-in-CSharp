import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgReportComponent } from './org-report/org-report.component';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css',
  imports: [CommonModule, OrgReportComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PowerBiUserOwnsData';
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    console.log('AppComponent constructor');
  }

  async ngOnInit() {
    console.log('AppComponent ngOnInit - initializing MSAL');
    
    try {
      // initialize MSAL
      await this.authService.instance.initialize();
      console.log('MSAL initialized successfully');
      
      // handle redirect promise
      const result = await this.authService.instance.handleRedirectPromise();
      
      if (result) {
        console.log('✅ Redirect result received:', result);
        this.authService.instance.setActiveAccount(result.account);
        console.log('Active account set after redirect');
      } else {
        console.log('No redirect result - checking existing accounts');
        this.checkAndSetActiveAccount();
      }
    } catch (error) {
      console.error('❌ Error in MSAL initialization or redirect handling:', error);
    }

    // subscribe to MSAL events 
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => 
          msg.eventType === EventType.LOGIN_SUCCESS || 
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        console.log('📢 MSAL Event:', result.eventType, result);
        
        if (result.eventType === EventType.LOGIN_SUCCESS) {
          const payload = result.payload as AuthenticationResult;
          this.authService.instance.setActiveAccount(payload.account);
        }
      });

    // subscribe to interaction status
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        console.log('Interaction complete (status: None)');
        this.checkAndSetActiveAccount();
      });
  }

  checkAndSetActiveAccount() {
    const accounts = this.authService.instance.getAllAccounts();
    console.log('Available accounts:', accounts.length);
    
    if (accounts.length > 0) {
      const activeAccount = this.authService.instance.getActiveAccount();
      
      if (!activeAccount) {
        console.log('Setting first account as active:', accounts[0].username);
        this.authService.instance.setActiveAccount(accounts[0]);
      } else {
        console.log('Active account already set:', activeAccount.username);
      }
    } else {
      console.log('No accounts available');
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
