import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OcioComponent } from './ocio.component';

describe('OcioComponent', () => {
  let component: OcioComponent;
  let fixture: ComponentFixture<OcioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OcioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OcioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
