import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfaccionComponent } from './satisfaccion.component';

describe('SatisfaccionComponent', () => {
  let component: SatisfaccionComponent;
  let fixture: ComponentFixture<SatisfaccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SatisfaccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SatisfaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
