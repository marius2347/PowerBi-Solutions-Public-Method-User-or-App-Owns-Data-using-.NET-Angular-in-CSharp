import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-public-report',
  templateUrl: './public-report.component.html',
  styleUrl: './public-report.component.css'
})
export class PublicReportComponent implements OnInit{
  reportUrl?: SafeResourceUrl; // hold the sanitized URL for the Power BI report

  // insert your Power BI report URL here
  private readonly rawUrl: string = 'https://app.powerbi.com/view?r=eyJrIjoiM2IxOGVmYTgtZjAxOS00MjEwLWI0NDItMmQ4ZGJjMDZlODI1IiwidCI6ImQ4YmRlNjVhLTNkZWQtNDM0Ni05NTE4LTY3MDIwNGU2ZTE4NCIsImMiOjR9&pageName=ReportSection3';

  // create the constructor to inject the DomSanitizer service
  constructor(private sanitizer: DomSanitizer) { }

  // on init, sanitize the URL and assign it to the reportUrl property
  ngOnInit(): void {
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl);
  }
}

  /*
    No Authentication: "Publish to Web" does not support authentication. The report is fully public.

    Data Exposure: Anyone with the link can view the data. It should never be used for proprietary, confidential, or PII data.
  
    Search Indexing: Microsoft may index these reports, meaning they could potentially appear in public search results.

    Stakeholder Decision: Verify that the "dummy report" mentioned in the task does not contain real data before publishing.
  */
