import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollCreateComponent } from './poll-create.component';

describe('PollCreateComponent', () => {
  let component: PollCreateComponent;
  let fixture: ComponentFixture<PollCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PollCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
