import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntualidadComponent } from './puntualidad.component';

describe('PuntualidadComponent', () => {
  let component: PuntualidadComponent;
  let fixture: ComponentFixture<PuntualidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PuntualidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PuntualidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
