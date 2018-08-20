import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountComponent } from './account.component';
import {SharedModule} from "../shared/shared.module";
import {AuthService} from "../services/auth.service";
import {UserService} from "../services/user.service";
import { of } from "rxjs";

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  const authServiceStub = {logout: () => 'logout'};
  const userServiceStub = {getUser: () => of({})};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountComponent ],
      imports: [SharedModule],
      providers: [{provide: AuthService, useValue: authServiceStub},
        {provide: UserService, useValue: userServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
