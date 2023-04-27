import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
    AngularFirestore,
    AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    userData: any; // Save logged in user data
    constructor(
        public afs: AngularFirestore, // Inject Firestore service
        public afAuth: AngularFireAuth, // Inject Firebase auth service
        public router: Router,
        private messageService: MessageService // NgZone service to remove outside scope warning
    ) {
        /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
        this.afAuth.authState.subscribe((user) => {
            if (user) {
                this.afs
                    .collection('users')
                    .doc(user.uid)
                    .ref.get()
                    .then((doc) => {
                        if (doc.exists) {
                            this.userData = doc.data();
                            this.SetUserData(this.userData);
                        }
                    })
                    .catch((error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: error,
                        });
                    });
            } else {
                localStorage.setItem('user', 'null');
                JSON.parse(localStorage.getItem('user')!);
            }
        });
    }

    logar(email: string, password: string) {
        return this.afAuth
            .signInWithEmailAndPassword(email, password)
            .then((result) => {
                this.SetUserData(result.user);
                this.router.navigate(['/']);
            })
            .catch((error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error,
                });
            });
    }

    // Returns true when user is looged in and email is verified
    get isLogado(): boolean {
        const user = JSON.parse(localStorage.getItem('user')!);
        return user !== null && user.emailVerified !== false ? true : false;
    }

    SetUserData(user: any) {
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(
            `users/${user.uid}`
        );
        this.afs
            .collection('users')
            .doc(user.uid)
            .ref.get()
            .then((doc) => {
                if (doc.exists) {
                    this.userData = doc.data();
                    localStorage.setItem('user', JSON.stringify(this.userData));
                    JSON.parse(localStorage.getItem('user')!);
                    return userRef.set(this.userData, {
                        merge: true,
                    });
                } else {
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified,
                    };

                    return userRef.set(userData, {
                        merge: true,
                    });
                }
            })
            .catch((error) =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error,
                })
            );
    }
    // Sign out
    SignOut() {
        return this.afAuth.signOut().then(() => {
            localStorage.removeItem('user');
            this.router.navigate(['/auth/login']);
        });
    }

    get user() {
        return JSON.parse(localStorage.getItem('user')!);
    }
}
