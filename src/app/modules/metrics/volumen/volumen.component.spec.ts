import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumenComponent } from './volumen.component';

describe('VolumenComponent', () => {
  let component: VolumenComponent;
  let fixture: ComponentFixture<VolumenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VolumenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
