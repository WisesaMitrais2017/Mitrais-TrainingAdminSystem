import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { User } from './user';
import { AddUser } from './user-add';
import { Office } from './office';

import { Observable } from 'rxjs/Rx';
import { UrlService } from '../services/url.service';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/throw';

@Injectable() 
 export class UserService {
     url: string;
     headers;

    constructor(private http: Http,
        private urlService: UrlService) { 
            this.headers = this.urlService.getHeaderSecurity();
        }

    public getDataUsers(): Observable<User[]>{
        this.url = this.urlService.getAllUserData();
        return this.http.get(this.url, {headers: this.headers})
            .map(this.extractData)
            .catch(this.handleError);
    }

    public createNewUser(userData: AddUser): Observable<boolean>{
        this.url = this.urlService.createNewUser();
        return this.http.post(this.url, userData, {headers: this.headers})
            .map(this.extractData)
            .catch(this.handleError);
    }

    public updateUser(userData: AddUser, idUser: string): Observable<boolean>{
        this.url = this.urlService.updateUser(idUser);
        return this.http.post(this.url, userData, {headers: this.headers})
            .map(this.extractData)
            .catch(this.handleError);
    }

    public getOfficeData(): Observable<Office[]>{
        this.url = this.urlService.getOfficeData();
        return this.http.get(this.url, {headers: this.headers})
            .map(this.extractData)
            .catch(this.handleError);
    }
    
    private extractData(res:Response) {
        let body = res.json();
        return body || [];
    }
    
    private handleError(error:any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
 }