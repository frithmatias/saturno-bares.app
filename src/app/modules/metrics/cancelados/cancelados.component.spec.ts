import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanceladosComponent } from './cancelados.component';

describe('CanceladosComponent', () => {
  let component: CanceladosComponent;
  let fixture: ComponentFixture<CanceladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanceladosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanceladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
