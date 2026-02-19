import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedReportComponent } from './embedded-report.component';

describe('EmbeddedReportComponent', () => {
  let component: EmbeddedReportComponent;
  let fixture: ComponentFixture<EmbeddedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmbeddedReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmbeddedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
