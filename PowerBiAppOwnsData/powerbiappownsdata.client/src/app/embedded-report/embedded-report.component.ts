import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { IReportEmbedConfiguration, models } from 'powerbi-client';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';

interface EmbedParams {
  embedToken: string;
  embedUrl: string;
  reportId: string;
}

@Component({
  selector: 'app-embedded-report',
  standalone: true,
  imports: [CommonModule, PowerBIEmbedModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './embedded-report.component.html',
  styleUrls: ['./embedded-report.component.css']
})
export class EmbeddedReportComponent implements OnInit {
  isLoading = true;
  errorMessage = '';

  reportConfig: IReportEmbedConfiguration = {
    type: 'report',
    embedUrl: undefined,
    tokenType: models.TokenType.Embed,
    accessToken: undefined,
    settings: {
      panes: { filters: { expanded: false, visible: true } },
      background: models.BackgroundType.Transparent,
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const apiUrl = `${environment.apiUrl}/api/powerbi/token`;
    // calls the .NET Controller API
    this.http.get<EmbedParams>(apiUrl).subscribe({
      next: (data) => {
        this.reportConfig = {
          ...this.reportConfig,
          id: data.reportId,
          embedUrl: data.embedUrl,
          accessToken: data.embedToken
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = 'Failed to load report.';
        this.isLoading = false;
      }
    });
  }
}
