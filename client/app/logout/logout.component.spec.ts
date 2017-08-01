import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutComponent } from './logout.component';
import {AuthService} from '../services/auth.service';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  const authServiceStub = {logout: () => 'logout'};
  let authService: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [{provide: AuthService, useValue: authServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    authService = fixture.debugElement.injector.get(AuthService);
  });

  it('should create', () => {
    const logout = jest.spyOn(authService,'logout');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(logout).toHaveBeenCalled();
  });
});
