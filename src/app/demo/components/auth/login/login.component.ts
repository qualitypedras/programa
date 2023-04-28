import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/shared/service/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [MessageService],
    styles: [
        `
            :host ::ng-deep .pi-eye,
            :host ::ng-deep .pi-eye-slash {
                transform: scale(1.6);
                margin-right: 1rem;
                color: var(--primary-color) !important;
            }
        `,
    ],
})
export class LoginComponent {
    valCheck: string[] = ['remember'];

    senha!: string;

    email!: string;

    constructor(
        public layoutService: LayoutService,
        public loginService: AuthService,
        public router: Router
    ) {}

    async enviar() {
        if (!this.senha || !this.email) {
            return;
        }

        await this.loginService.logar(this.email, this.senha);
        this.router.navigate(['/']);
    }
}
