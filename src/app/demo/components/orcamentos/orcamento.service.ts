import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
    AngularFirestore,
    AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class OrcamentoService {
    constructor(
        public afs: AngularFirestore, // Inject Firestore service
        public afAuth: AngularFireAuth, // Inject Firebase auth service
        public router: Router,
        public ngZone: NgZone // NgZone service to remove outside scope warning
    ) {
        /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    }

    SaveOrcamento(orcamento: any) {
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(
            `orcamentos/${orcamento.uid}`
        );
        this.afs
            .collection('orcamentos')
            .doc(orcamento.uid)
            .ref.get()
            .then((doc) => {
                return userRef.set(orcamento, {
                    merge: true,
                });
            })
            .catch((error) => console.error(error));
    }

    async GetOrcamento(uid: string) {
        this.afs
            .collection('orcamentos')
            .doc(uid)
            .ref.get()
            .then((doc) => {
                return doc.data();
            })
            .catch((error) => console.error(error));
    }
}
