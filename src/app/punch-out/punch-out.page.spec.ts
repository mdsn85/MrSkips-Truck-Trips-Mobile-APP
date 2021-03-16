import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchOutPage } from './punch-out.page';

describe('PunchOutPage', () => {
  let component: PunchOutPage;
  let fixture: ComponentFixture<PunchOutPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PunchOutPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PunchOutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
