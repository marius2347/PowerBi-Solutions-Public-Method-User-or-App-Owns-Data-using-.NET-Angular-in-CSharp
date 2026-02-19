import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { IReportEmbedConfiguration, models } from 'powerbi-client';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface PowerBIEmbedInfo {
  embedUrl: string;
  reportId: string;
  reportName: string;
  accessToken: string;
}

@Component({
  selector: 'app-org-report',
  standalone: true,
  imports: [CommonModule, PowerBIEmbedModule],
  templateUrl: './org-report.component.html',
  styleUrls: ['./org-report.component.css']
})
export class OrgReportComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isLoadingReport = false;
  errorMessage = '';
  private readonly _destroying$ = new Subject<void>();

  reportConfig: IReportEmbedConfiguration = {
    type: 'report',
    embedUrl: '',
    tokenType: models.TokenType.Aad,
    accessToken: undefined,
    settings: {
      panes: { filters: { expanded: false, visible: true } },
      background: models.BackgroundType.Transparent,
    }
  };

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private http: HttpClient
  ) {
    console.log('🔷 OrgReportComponent constructor');
  }

  async ngOnInit() {
    console.log('🔷 OrgReportComponent ngOnInit');

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        console.log('🔷 Interaction complete in org-report, checking login');
        this.checkLoginStatus();
      });

    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const accounts = this.authService.instance.getAllAccounts();
    console.log('🔷 Checking login - accounts:', accounts.length);

    if (accounts.length > 0) {
      const activeAccount = this.authService.instance.getActiveAccount();
      console.log('🔷 Active account:', activeAccount?.username);

      if (!activeAccount) {
        this.authService.instance.setActiveAccount(accounts[0]);
      }

      this.isLoggedIn = true;
      console.log('🔷 User is logged in, getting Power BI embed info...');
      this.getPowerBIEmbedInfo();
    } else {
      this.isLoggedIn = false;
      console.log('🔷 No accounts - user needs to login');
    }
  }

  login() {
    console.log('🔷 Login button clicked - starting redirect login');
    this.authService.loginRedirect({
      scopes: ['https://analysis.windows.net/powerbi/api/.default']  // Changed scope
    });
  }

  getPowerBIEmbedInfo() {
    const activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount) {
      console.error('🔷 ❌ No active account!');
      this.errorMessage = 'No active account found';
      return;
    }

    const request = {
      scopes: ['https://analysis.windows.net/powerbi/api/.default'],  // Changed scope
      account: activeAccount
    };

    console.log('🔷 Getting Power BI token for:', activeAccount.username);
    this.isLoadingReport = true;
    this.errorMessage = '';

    this.authService.acquireTokenSilent(request).subscribe({
      next: (result) => {
        console.log('🔷 ✅ Token acquired, fetching embed info from backend');
        console.log('🔷 Token audience:', result.account);  // Log to verify token

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${result.accessToken}`
        });

        this.http.get<PowerBIEmbedInfo>('/api/powerbi/embedinfo', { headers }).subscribe({
          next: (embedInfo) => {
            console.log('🔷 ✅ Embed info received:', embedInfo);

            this.reportConfig = {
              type: 'report',
              id: embedInfo.reportId,
              embedUrl: embedInfo.embedUrl,
              tokenType: models.TokenType.Aad,
              accessToken: embedInfo.accessToken,
              settings: {
                panes: {
                  filters: { expanded: false, visible: true }
                },
                background: models.BackgroundType.Transparent,
              }
            };

            this.isLoadingReport = false;
            console.log('🔷 Report config updated - report should render now');
          },
          error: (error) => {
            console.error('🔷 ❌ Error fetching embed info:', error);
            this.errorMessage = `Failed to get embed info: ${error.error?.error || error.message}`;
            this.isLoadingReport = false;
          }
        });
      },
      error: (error) => {
        console.error('🔷 ❌ Token acquisition failed:', error);
        this.errorMessage = 'Failed to acquire access token';
        this.isLoadingReport = false;
        this.authService.acquireTokenRedirect(request);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
