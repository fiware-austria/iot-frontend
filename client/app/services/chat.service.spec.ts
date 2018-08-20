import { TestBed, inject } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ChatService } from './chat.service';

describe('ChatService', () => {

  const httpStub = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService,
        {provide: HttpClient, useValue: httpStub}]
    });
  });

  it('should be created', inject([ChatService], (service: ChatService) => {
    expect(service).toBeTruthy();
  }));
});
