import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import {SharedModule} from '../shared/shared.module';
import {AuthService} from '../services/auth.service';
import {UserService} from '../services/user.service';
import { of } from 'rxjs';


describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  const authServiceStub = {logout: () => 'logout'};
  const userServiceStub = {getUsers: () => of([])};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminComponent ],
      imports: [SharedModule],
      providers: [{provide: AuthService, useValue: authServiceStub},
        {provide: UserService, useValue: userServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
