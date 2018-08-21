import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ChatService {

  constructor(private http: HttpClient) { }

  getChatByRoom(room) {
    return new Promise((resolve, reject) => {
      this.http.get('/api/chat/' + room).toPromise()
        .then(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  saveChat(data) {
    return new Promise((resolve, reject) => {
      this.http.post('/api/chat', data).toPromise()
        .then(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

}
