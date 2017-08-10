import { TestBed, inject } from '@angular/core/testing';
import { Http, Headers } from '@angular/http';
import { ChatService } from './chat.service';

describe('ChatService', () => {

  const httpStub = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService,
        {provide: Http, useValue: httpStub}]
    });
  });

  it('should be created', inject([ChatService], (service: ChatService) => {
    expect(service).toBeTruthy();
  }));
});
