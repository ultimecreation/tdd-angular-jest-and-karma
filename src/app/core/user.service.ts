import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private httpClient: HttpClient) { }

    signUp(body: { username: string, email: string, password: string }) {
        return this.httpClient.post("/api/1.0/users", body)
    }

    isEmailTaken(value: string): Observable<ValidationErrors | null> {
        return this.httpClient.post("/api/1.0/user/email", { email: value })
    }
}