import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(public authService: AuthService, public router: Router) {}
    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.isLogado !== true) {
            this.router.navigate(['/auth/login']);
        }
        return true;
    }
}
