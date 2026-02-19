import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgReportComponent } from './org-report.component';

describe('OrgReportComponent', () => {
  let component: OrgReportComponent;
  let fixture: ComponentFixture<OrgReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
