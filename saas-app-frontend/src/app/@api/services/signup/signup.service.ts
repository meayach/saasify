import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSignUPDTO } from 'src/app/@shared/signup/dto/user-signup.dto';
import { SIGNUP_API_PATHS } from '../../api-paths/signup-api-paths';

@Injectable({ providedIn: 'root' })
export class SignupService {
  constructor(private httpClient: HttpClient) {}

  Signup(userSignUpDTO: UserSignUPDTO): Observable<void> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('client-id', 'YZ');
    headers = headers.set('realmId', 'devaktus');
    headers = headers.set(
      'client-secret',
      'lUtEauJyhk6bXbLdBPdvrAY7i2daeYNFW0kJm9T0Afu0MpCsN3G86O93dQTP9lM5 ',
    );

    // Determine the endpoint based on role
    let endpoint = '';
    switch (userSignUpDTO.role) {
      case 'admin':
        endpoint = 'http://localhost:3001/api/v1/admin/auth/signup';
        break;
      case 'manager':
        endpoint = 'http://localhost:3001/api/v1/manager/auth/signup';
        break;
      case 'customer':
      default:
        endpoint = `${SIGNUP_API_PATHS.ROOT}${SIGNUP_API_PATHS.SIGNUP}`;
        break;
    }

    return this.httpClient.post<void>(endpoint, userSignUpDTO, { headers });
  }
}
