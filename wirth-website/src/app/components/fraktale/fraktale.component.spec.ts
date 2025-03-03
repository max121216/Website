import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraktaleComponent } from './fraktale.component';

describe('FraktaleComponent', () => {
  let component: FraktaleComponent;
  let fixture: ComponentFixture<FraktaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraktaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraktaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
